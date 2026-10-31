import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  MapWorldData, 
  CharacterEntity, 
  Vector2D, 
  FacingDirection, 
  DialogueNode,
  CharacterIconographyType 
} from '../game/types';
import { soundEngine } from '../audio/soundEngine';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Heart, 
  Eye, 
  Maximize2, 
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Hand,
  Sun,
  Moon
} from 'lucide-react';

interface ThirdPersonCanvasProps {
  worldData: MapWorldData;
  playerRole: string;
  playerName: string;
  playerColor: string;
  playerRobeColor: string;
  playerCloakColor: string;
  playerIconography?: CharacterIconographyType;
  hasBeard?: boolean;
  onDenialEvent?: (denialNumber: number) => void;
  onRoosterEvent?: () => void;
  onEscapeEvent?: () => void;
  tensionBpm: number;
  setTensionBpm: React.Dispatch<React.SetStateAction<number>>;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

export const ThirdPersonCanvas: React.FC<ThirdPersonCanvasProps> = ({
  worldData,
  playerRole,
  playerName,
  playerColor,
  playerRobeColor,
  playerCloakColor,
  playerIconography = 'peter',
  hasBeard = true,
  onDenialEvent,
  onRoosterEvent,
  onEscapeEvent,
  tensionBpm,
  setTensionBpm
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Brightness Control: 1 = Noite Enluarada Clara (padrão com alta visibilidade), 2 = Alvorada Dourada, 0 = Noite Clássica
  const [brightnessPreset, setBrightnessPreset] = useState<'luminous' | 'dawn' | 'dramatic'>('luminous');

  // Player State
  const [player, setPlayer] = useState<{
    x: number;
    y: number;
    radius: number;
    speed: number;
    facing: FacingDirection;
    isMoving: boolean;
    walkCycle: number;
    isSneaking: boolean;
  }>({
    x: worldData.spawnPoint.x,
    y: worldData.spawnPoint.y,
    radius: 18,
    speed: 3.4,
    facing: 'up',
    isMoving: false,
    walkCycle: 0,
    isSneaking: false,
  });

  const [npcs, setNpcs] = useState<CharacterEntity[]>(worldData.npcs);
  const [activeDialogue, setActiveDialogue] = useState<DialogueNode | null>(null);
  const [nearestInteractable, setNearestInteractable] = useState<{
    name: string;
    actionPrompt: string;
    entity: CharacterEntity | null;
  } | null>(null);
  const [showFullMap, setShowFullMap] = useState<boolean>(false);
  const [flameFlicker, setFlameFlicker] = useState<number>(1.0);

  // Rising Embers Particles for Brazier
  const embersRef = useRef<EmberParticle[]>([]);

  // Input states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchMovement = useRef<Vector2D>({ x: 0, y: 0 });

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // Handle interaction key
      if ((e.code === 'KeyE' || e.code === 'Space') && !activeDialogue) {
        e.preventDefault();
        triggerNearestInteraction();
      }

      // Handle Map toggle
      if (e.code === 'KeyM') {
        setShowFullMap((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeDialogue, nearestInteractable]);

  // Trigger Interaction with nearest NPC or Prop
  const triggerNearestInteraction = useCallback(() => {
    if (!nearestInteractable) return;
    soundEngine.playParchmentClick();

    if (nearestInteractable.entity && nearestInteractable.entity.dialogueId) {
      const dialogue = worldData.dialogues[nearestInteractable.entity.dialogueId];
      if (dialogue) {
        setActiveDialogue(dialogue);
      }
    } else if (nearestInteractable.name === 'Braseiro de Carvão') {
      soundEngine.playBrazierCrackle();
      setTensionBpm((prev) => Math.max(75, prev - 15));
      const servant = npcs.find((n) => n.id === 'servant_girl');
      if (servant && servant.dialogueId) {
        const dialogue = worldData.dialogues[servant.dialogueId];
        if (dialogue) {
          setActiveDialogue(dialogue);
        }
      }
    } else if (nearestInteractable.name.includes('Portão')) {
      if (onEscapeEvent) {
        onEscapeEvent();
      }
    }
  }, [nearestInteractable, worldData, npcs, onEscapeEvent, setTensionBpm]);

  // Dialogue Selection Handler
  const handleSelectDialogueOption = (option: {
    label: string;
    nextDialogueId?: string;
    triggerAction?: string;
  }) => {
    soundEngine.playParchmentClick();

    if (option.triggerAction === 'denial_one_committed') {
      setTensionBpm(105);
      if (onDenialEvent) onDenialEvent(1);
    } else if (option.triggerAction === 'denial_two_committed') {
      setTensionBpm(130);
      if (onDenialEvent) onDenialEvent(2);
    } else if (option.triggerAction === 'denial_three_and_rooster') {
      setTensionBpm(160);
      soundEngine.playRoosterCrow();
      if (onDenialEvent) onDenialEvent(3);
      if (onRoosterEvent) onRoosterEvent();
    } else if (option.triggerAction === 'escape_to_empty_tomb') {
      setActiveDialogue(null);
      if (onEscapeEvent) onEscapeEvent();
      return;
    }

    if (option.nextDialogueId) {
      const nextNode = worldData.dialogues[option.nextDialogueId];
      if (nextNode) {
        setActiveDialogue(nextNode);
      } else {
        setActiveDialogue(null);
      }
    } else {
      setActiveDialogue(null);
    }
  };

  // Main 60fps Game & Render Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // 1. Update flame flicker & rising embers
      setFlameFlicker(0.94 + Math.sin(currentTime * 0.009) * 0.06 + Math.random() * 0.03);

      const brazier = worldData.props.find((p) => p.id === 'brazier_central');
      if (brazier && Math.random() < 0.35) {
        embersRef.current.push({
          x: brazier.x + brazier.width / 2 + (Math.random() * 24 - 12),
          y: brazier.y + brazier.height / 2 + (Math.random() * 12 - 6),
          vx: (Math.random() - 0.5) * 18,
          vy: -30 - Math.random() * 40,
          alpha: 1.0,
          size: 2 + Math.random() * 2.5
        });
      }

      embersRef.current.forEach((emb) => {
        emb.x += emb.vx * dt;
        emb.y += emb.vy * dt;
        emb.alpha -= dt * 0.8;
      });
      embersRef.current = embersRef.current.filter((e) => e.alpha > 0);

      // 2. Compute Player Movement
      let moveX = 0;
      let moveY = 0;

      if (!activeDialogue) {
        if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) moveY -= 1;
        if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) moveY += 1;
        if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) moveX -= 1;
        if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) moveX += 1;

        if (touchMovement.current.x !== 0 || touchMovement.current.y !== 0) {
          moveX = touchMovement.current.x;
          moveY = touchMovement.current.y;
        }
      }

      const isSneaking = !!(keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight']);
      const currentSpeed = isSneaking ? 1.8 : 3.4;

      let isMoving = false;
      let newFacing = player.facing;

      if (moveX !== 0 || moveY !== 0) {
        isMoving = true;
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        const normX = (moveX / length) * currentSpeed;
        const normY = (moveY / length) * currentSpeed;

        if (Math.abs(moveX) > Math.abs(moveY)) {
          newFacing = moveX > 0 ? 'right' : 'left';
        } else {
          newFacing = moveY > 0 ? 'down' : 'up';
        }

        // Sliding collision resolution
        const nextX = player.x + normX;
        const nextY = player.y + normY;

        if (!checkCollision(nextX, player.y, player.radius)) {
          player.x = nextX;
        }
        if (!checkCollision(player.x, nextY, player.radius)) {
          player.y = nextY;
        }

        player.walkCycle = (player.walkCycle + dt * 11) % (Math.PI * 2);
      }

      player.isMoving = isMoving;
      player.facing = newFacing;
      player.isSneaking = isSneaking;

      // 3. Update NPC Patrols
      npcs.forEach((npc) => {
        if (npc.isPatrolling && npc.patrolPoints && npc.patrolPoints.length > 1) {
          const target = npc.patrolPoints[npc.currentPatrolIndex || 0];
          const dx = target.x - npc.x;
          const dy = target.y - npc.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 4) {
            npc.currentPatrolIndex = ((npc.currentPatrolIndex || 0) + 1) % npc.patrolPoints.length;
          } else {
            const step = (npc.speed * dt * 42);
            npc.x += (dx / dist) * Math.min(step, dist);
            npc.y += (dy / dist) * Math.min(step, dist);

            if (Math.abs(dx) > Math.abs(dy)) {
              npc.facing = dx > 0 ? 'right' : 'left';
            } else {
              npc.facing = dy > 0 ? 'down' : 'up';
            }
          }
        }
      });

      // 4. Check Nearest Interactable
      let closestInteractable: {
        name: string;
        actionPrompt: string;
        entity: CharacterEntity | null;
      } | null = null;
      let minDistance = 85;

      npcs.forEach((npc) => {
        const dx = npc.x - player.x;
        const dy = npc.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < npc.interactionRadius && dist < minDistance) {
          minDistance = dist;
          closestInteractable = {
            name: npc.name,
            actionPrompt: `Falar com ${npc.name} [E]`,
            entity: npc,
          };
        }

        if (npc.detectionRadius && dist < npc.detectionRadius) {
          if (isMoving && !isSneaking && npc.role.includes('Guarda')) {
            setTensionBpm((bpm) => Math.min(160, bpm + 0.12));
          }
        }
      });

      if (brazier) {
        const dx = (brazier.x + brazier.width / 2) - player.x;
        const dy = (brazier.y + brazier.height / 2) - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 && dist < minDistance) {
          minDistance = dist;
          closestInteractable = {
            name: 'Braseiro de Carvão',
            actionPrompt: 'Aquecer as mãos no braseiro [E]',
            entity: null,
          };
        }
      }

      const gate = worldData.props.find((p) => p.id === 'entry_gate');
      if (gate) {
        const dx = (gate.x + gate.width / 2) - player.x;
        const dy = (gate.y + gate.height / 2) - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 95 && dist < minDistance) {
          minDistance = dist;
          closestInteractable = {
            name: 'Portão de Saída',
            actionPrompt: 'Sair para o sepulcro [E]',
            entity: null,
          };
        }
      }

      setNearestInteractable(closestInteractable);

      // 5. Render Scene
      renderScene();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [player, npcs, activeDialogue, worldData, brightnessPreset]);

  // Circle vs Rect Collision
  const checkCollision = (cx: number, cy: number, cradius: number): boolean => {
    if (
      cx - cradius < worldData.cameraBounds.minX + 50 ||
      cx + cradius > worldData.cameraBounds.maxX - 50 ||
      cy - cradius < worldData.cameraBounds.minY + 50 ||
      cy + cradius > worldData.cameraBounds.maxY - 50
    ) {
      return true;
    }

    for (const wall of worldData.walls) {
      const closestX = Math.max(wall.x, Math.min(cx, wall.x + wall.width));
      const closestY = Math.max(wall.y, Math.min(cy, wall.y + wall.height));
      const distanceX = cx - closestX;
      const distanceY = cy - closestY;
      if (distanceX * distanceX + distanceY * distanceY < cradius * cradius) {
        return true;
      }
    }

    for (const prop of worldData.props) {
      if (!prop.solid) continue;
      const closestX = Math.max(prop.x, Math.min(cx, prop.x + prop.width));
      const closestY = Math.max(prop.y, Math.min(cy, prop.y + prop.height));
      const distanceX = cx - closestX;
      const distanceY = cy - closestY;
      if (distanceX * distanceX + distanceY * distanceY < cradius * cradius) {
        return true;
      }
    }

    return false;
  };

  // Rendering Function with Vibrant Contrast & Catholic Iconography
  const renderScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewportW = canvas.width;
    const viewportH = canvas.height;

    // Smooth Camera Follow
    const targetCamX = player.x - viewportW / 2;
    const targetCamY = player.y - viewportH / 2;
    const camX = Math.max(
      worldData.cameraBounds.minX,
      Math.min(targetCamX, worldData.cameraBounds.maxX - viewportW)
    );
    const camY = Math.max(
      worldData.cameraBounds.minY,
      Math.min(targetCamY, worldData.cameraBounds.maxY - viewportH)
    );

    ctx.save();
    ctx.clearRect(0, 0, viewportW, viewportH);
    ctx.translate(-camX, -camY);

    // 1. Draw Courtyard Stone Paver Floor (Warm Jerusalem Limestone, NOT dark pitch black!)
    const floorGrad = ctx.createLinearGradient(0, 0, worldData.width, worldData.height);
    if (brightnessPreset === 'dawn') {
      floorGrad.addColorStop(0, '#574134');
      floorGrad.addColorStop(1, '#6b5443');
    } else {
      floorGrad.addColorStop(0, '#36322e');
      floorGrad.addColorStop(1, '#443e39');
    }
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 0, worldData.width, worldData.height);

    // Detailed Tile Grid with Beveled Stones
    const tileSize = 60;
    for (let x = 0; x < worldData.width; x += tileSize) {
      for (let y = 0; y < worldData.height; y += tileSize) {
        // Tile Face with variation
        const hash = (x * 73856093 ^ y * 19349663) % 10;
        ctx.fillStyle = hash > 5 ? '#3f3a34' : '#39342f';
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Mortar lines
        ctx.strokeStyle = '#221e1a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, tileSize, tileSize);

        // Subtle stone bevel highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(x + 2, y + tileSize - 2);
        ctx.lineTo(x + 2, y + 2);
        ctx.lineTo(x + tileSize - 2, y + 2);
        ctx.stroke();
      }
    }

    // 2. Draw Walls & Colonnades with 3D Architectural Relief
    worldData.walls.forEach((w) => {
      // Wall Shadow on Ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(w.x + 8, w.y + 10, w.width, w.height);

      // Limestone Wall Face with Gradient
      const wallGrad = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.height);
      wallGrad.addColorStop(0, '#857e74');
      wallGrad.addColorStop(0.2, '#6b645b');
      wallGrad.addColorStop(1, '#443e37');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(w.x, w.y, w.width, w.height);

      // Wall Edge Trim & Cornice
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(w.x, w.y, w.width, w.height);
    });

    // Draw Classical Columns (Corinthian style circle with shadow)
    [
      { x: 268, y: 338 }, { x: 468, y: 338 }, { x: 868, y: 338 }, { x: 1068, y: 338 },
      { x: 268, y: 638 }, { x: 468, y: 638 }, { x: 868, y: 638 }, { x: 1068, y: 638 }
    ].forEach((col) => {
      // Column Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(col.x + 8, col.y + 10, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Column Shaft
      const cGrad = ctx.createRadialGradient(col.x - 4, col.y - 4, 3, col.x, col.y, 20);
      cGrad.addColorStop(0, '#e7e5e4');
      cGrad.addColorStop(0.7, '#a8a29e');
      cGrad.addColorStop(1, '#57534e');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(col.x, col.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 3. Draw Props (Brazier, Benches, Upper Loggia)
    worldData.props.forEach((prop) => {
      if (prop.type === 'brazier') {
        const cx = prop.x + prop.width / 2;
        const cy = prop.y + prop.height / 2;

        // Tripod Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(cx + 4, cy + 24, 34, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bronze Brazier Outer Lip
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Glowing Fiery Embers Interior
        const emberGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 24);
        emberGrad.addColorStop(0, '#ffffff');
        emberGrad.addColorStop(0.2, '#fef08a');
        emberGrad.addColorStop(0.5, '#f59e0b');
        emberGrad.addColorStop(0.85, '#dc2626');
        emberGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();

        // Animated Flame Tongues
        ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2 + flameFlicker * 0.5;
          const fx = cx + Math.cos(angle) * 8;
          const fy = cy + Math.sin(angle) * 8 - 4;
          ctx.beginPath();
          ctx.arc(fx, fy, 6 * flameFlicker, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (prop.type === 'bench') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(prop.x + 6, prop.y + 8, prop.width, prop.height);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
        ctx.strokeStyle = '#d6d3d1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
      } else if (prop.type === 'gate') {
        ctx.fillStyle = 'rgba(180, 83, 9, 0.2)';
        ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
        ctx.setLineDash([]);
      }
    });

    // Draw Rising Flame Embers Particles
    embersRef.current.forEach((emb) => {
      ctx.fillStyle = `rgba(254, 215, 170, ${emb.alpha})`;
      ctx.beginPath();
      ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw NPCs with Catholic Iconography
    npcs.forEach((npc) => {
      drawIconographicCharacter(
        ctx,
        npc.x,
        npc.y,
        npc.facing,
        npc.iconographyType,
        npc.name,
        npc.role,
        false
      );

      // Speech Bark Bubble
      if (npc.barkText) {
        ctx.font = 'italic 11px Inter, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText(`"${npc.barkText}"`, npc.x, npc.y - 48);
      }
    });

    // 5. Draw Player Character (São Pedro with Catholic Iconography)
    drawIconographicCharacter(
      ctx,
      player.x,
      player.y,
      player.facing,
      playerIconography,
      `${playerName} (Você)`,
      playerRole,
      player.isMoving,
      player.walkCycle
    );

    // 6. Dynamic Lighting & Torchlight Radial Mask
    // In 'luminous' mode, ambient darkness is subtle so everything remains visible and crisp!
    ctx.save();
    let ambientAlpha = 0.38;
    if (brightnessPreset === 'dawn') ambientAlpha = 0.20;
    if (brightnessPreset === 'dramatic') ambientAlpha = 0.65;

    ctx.fillStyle = `rgba(10, 16, 30, ${ambientAlpha})`;
    ctx.fillRect(0, 0, worldData.width, worldData.height);

    // Cutout torchlight & fire radiance using 'destination-out'
    ctx.globalCompositeOperation = 'destination-out';

    // Central Brazier Radiant Glow
    const brazier = worldData.props.find((p) => p.id === 'brazier_central');
    if (brazier && brazier.lightRadius) {
      const radius = brazier.lightRadius * flameFlicker;
      const bRad = ctx.createRadialGradient(
        brazier.x + brazier.width / 2,
        brazier.y + brazier.height / 2,
        15,
        brazier.x + brazier.width / 2,
        brazier.y + brazier.height / 2,
        radius
      );
      bRad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      bRad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
      bRad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bRad;
      ctx.beginPath();
      ctx.arc(
        brazier.x + brazier.width / 2,
        brazier.y + brazier.height / 2,
        radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Wall Torches Radiant Halos
    worldData.props
      .filter((p) => p.type === 'brazier' && p.id !== 'brazier_central')
      .forEach((t) => {
        const radius = (t.lightRadius || 180) * flameFlicker;
        const grad = ctx.createRadialGradient(t.x + 10, t.y + 10, 8, t.x + 10, t.y + 10, radius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.5)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(t.x + 10, t.y + 10, radius, 0, Math.PI * 2);
        ctx.fill();
      });

    // Player Radiant Sacred Aura
    const pGrad = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, 110);
    pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    pGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.45)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore darkness composite

    // 7. Interactive Floating Prompt Pill
    if (nearestInteractable) {
      let targetX = player.x;
      let targetY = player.y - 64;

      if (nearestInteractable.entity) {
        targetX = nearestInteractable.entity.x;
        targetY = nearestInteractable.entity.y - 64;
      }

      ctx.font = 'bold 12px Cinzel, serif';
      const promptWidth = ctx.measureText(nearestInteractable.actionPrompt).width + 28;

      ctx.fillStyle = 'rgba(12, 10, 9, 0.95)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(targetX - promptWidth / 2, targetY - 14, promptWidth, 28, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText(nearestInteractable.actionPrompt, targetX, targetY + 5);
    }

    ctx.restore(); // Restore camera translation
  };

  // Helper: Draw Character with Specific Catholic Iconography
  const drawIconographicCharacter = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: FacingDirection,
    iconography: CharacterIconographyType,
    name: string,
    role: string,
    isMoving: boolean = false,
    walkCycle: number = 0
  ) => {
    ctx.save();

    // 1. Drop Shadow on Ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Walking leg offset
    const legOffset = isMoving ? Math.sin(walkCycle) * 7 : 0;

    // 2. Catholic Iconographic Halos (Nimbo Sagrado)
    if (iconography === 'peter' || iconography === 'paul') {
      // Golden Halo of the Apostle
      const haloGrad = ctx.createRadialGradient(x, y - 20, 8, x, y - 20, 26);
      haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      haloGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.7)');
      haloGrad.addColorStop(1, 'rgba(161, 98, 7, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(x, y - 20, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (iconography === 'christ') {
      // CRUCIFORM HALO OF CHRIST (NIMBO CRUCIFORME)
      const cHaloGrad = ctx.createRadialGradient(x, y - 20, 10, x, y - 20, 30);
      cHaloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      cHaloGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.85)');
      cHaloGrad.addColorStop(1, 'rgba(202, 138, 4, 0)');
      ctx.fillStyle = cHaloGrad;
      ctx.beginPath();
      ctx.arc(x, y - 20, 30, 0, Math.PI * 2);
      ctx.fill();

      // Inscribed Red Greek Cross inside the Nimbus
      ctx.fillStyle = '#dc2626';
      // Vertical bar
      ctx.fillRect(x - 3, y - 48, 6, 28);
      // Horizontal bar
      ctx.fillRect(x - 17, y - 23, 34, 6);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y - 20, 28, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Sandals & Legs
    ctx.fillStyle = '#451a03'; // Brown leather sandals
    ctx.fillRect(x - 9, y + 12 + legOffset, 7, 8);
    ctx.fillRect(x + 2, y + 12 - legOffset, 7, 8);

    // 4. Robes and Mantle by Iconographic Type
    if (iconography === 'peter') {
      // São Pedro: Cobalt Blue Tunic + Golden Ochre Mantle (Tradição Católica)
      ctx.fillStyle = '#1e3a8a'; // Blue tunic
      ctx.beginPath();
      ctx.roundRect(x - 14, y - 12, 28, 26, 6);
      ctx.fill();

      // Golden Yellow Mantle draped over left shoulder
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(x - 14, y - 12);
      ctx.lineTo(x + 8, y - 12);
      ctx.lineTo(x + 14, y + 14);
      ctx.lineTo(x - 12, y + 14);
      ctx.closePath();
      ctx.fill();

      // Golden & Silver Keys of St. Peter (Duae Claves Regni) at hip
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 13, y + 6, 3, 0, Math.PI * 2);
      ctx.moveTo(x + 13, y + 9);
      ctx.lineTo(x + 13, y + 18);
      ctx.moveTo(x + 13, y + 14);
      ctx.lineTo(x + 16, y + 14);
      ctx.stroke();
    } else if (iconography === 'christ') {
      // Jesus: Seamless Holy White Tunic + Crimson Mantle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x - 14, y - 12, 28, 26, 6);
      ctx.fill();

      // Sacred Crimson Red Mantle
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(x - 6, y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Bound wrists with hemp rope
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 6);
      ctx.lineTo(x + 6, y + 6);
      ctx.stroke();
    } else if (iconography === 'malchus_kin') {
      // Kinsman of Malchus: Dark Levantine Tunic + Bandaged Right Ear!
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(x - 13, y - 12, 26, 26, 5);
      ctx.fill();
    } else if (iconography === 'roman_soldier') {
      // Roman Legionnaire: Lorica Segmentata + Red Tunic
      ctx.fillStyle = '#991b1b'; // Red tunic
      ctx.fillRect(x - 14, y - 10, 28, 25);

      // Silver Segmented Plate Armor (Lorica)
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x - 12, y - 8, 24, 18);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 12, y - 8, 24, 18);
    } else if (iconography === 'temple_guard') {
      // Levitical Temple Guard: Blue & White Priestly Stripes
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x - 13, y - 10, 26, 25);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 4, y - 10, 8, 25);
    } else if (iconography === 'servant_girl') {
      // Maidservant: Terracotta Dress
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(x - 12, y - 10, 24, 25, 6);
      ctx.fill();
    } else {
      // Default Robe
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(x - 13, y - 10, 26, 25, 5);
      ctx.fill();
    }

    // 5. Head & Facial Features by Iconography
    const skinTone = iconography === 'christ' ? '#fde8cd' : '#f0c8a0';
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(x, y - 16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Specific Hair, Beard and Headwear
    if (iconography === 'peter') {
      // St. Peter: Short curly silver-white hair and rounded grey beard with tonsure
      ctx.fillStyle = '#e2e8f0'; // White / silver hair
      // Curly hair ring
      ctx.beginPath();
      ctx.arc(x, y - 20, 13, Math.PI, Math.PI * 2);
      ctx.fill();
      // Round curly white beard
      ctx.beginPath();
      ctx.arc(x, y - 14, 12, 0, Math.PI);
      ctx.fill();
    } else if (iconography === 'christ') {
      // Jesus: Long wavy chestnut-brown hair parted in the middle falling to shoulders
      ctx.fillStyle = '#5c2c16';
      // Left and right parted shoulder locks
      ctx.fillRect(x - 14, y - 24, 6, 20);
      ctx.fillRect(x + 8, y - 24, 6, 20);
      // Trimmed chestnut beard
      ctx.beginPath();
      ctx.arc(x, y - 13, 11, 0, Math.PI);
      ctx.fill();
    } else if (iconography === 'malchus_kin') {
      // Dark beard
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(x, y - 14, 12, 0, Math.PI);
      ctx.fill();

      // BANDAGED RIGHT EAR (ICONIC DETAIL OF MALCHUS' EAR STRUCK IN GETHSEMANE!)
      ctx.fillStyle = '#ffffff'; // White linen bandage wrap
      ctx.fillRect(x + 8, y - 20, 6, 10);
      ctx.fillStyle = '#ef4444'; // Bloodstain on bandage
      ctx.fillRect(x + 10, y - 17, 3, 4);
    } else if (iconography === 'roman_soldier') {
      // Roman Brass Helmet (Galea) with Red Horsehair Crest
      ctx.fillStyle = '#d97706'; // Brass helmet
      ctx.beginPath();
      ctx.arc(x, y - 18, 13, Math.PI, Math.PI * 2);
      ctx.fill();
      // Red Imperial Crest
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 3, y - 32, 6, 14);
    } else if (iconography === 'temple_guard') {
      // Levitical White Turban (Migbahat)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(x, y - 22, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (iconography === 'servant_girl') {
      // Jewish Modesty Head-veil (Mitpachat)
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.ellipse(x, y - 20, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 13, y - 20, 6, 16);
      ctx.fillRect(x + 7, y - 20, 6, 16);
    }

    // Directional Eyes
    ctx.fillStyle = '#1c1917';
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    if (facing === 'left') eyeOffsetX = -3.5;
    if (facing === 'right') eyeOffsetX = 3.5;
    if (facing === 'up') eyeOffsetY = -2.5;
    if (facing === 'down') eyeOffsetY = 2.5;

    if (facing !== 'up') {
      ctx.fillRect(x - 4 + eyeOffsetX, y - 18 + eyeOffsetY, 3, 3);
      ctx.fillRect(x + 2 + eyeOffsetX, y - 18 + eyeOffsetY, 3, 3);
    }

    // Spear for Guards
    if (iconography === 'temple_guard' || iconography === 'roman_soldier') {
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 18);
      ctx.lineTo(x + 16, y - 40);
      ctx.stroke();

      // Spear tip
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(x + 16, y - 50);
      ctx.lineTo(x + 11, y - 40);
      ctx.lineTo(x + 21, y - 40);
      ctx.closePath();
      ctx.fill();
    }

    // 6. Overhead Name Label
    ctx.font = 'bold 12px Cinzel, serif';
    ctx.textAlign = 'center';
    if (iconography === 'christ') {
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6;
    } else if (iconography === 'peter') {
      ctx.fillStyle = '#67e8f9';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 4;
    } else {
      ctx.fillStyle = '#fde68a';
      ctx.shadowBlur = 0;
    }
    ctx.fillText(name, x, y - 34);
    ctx.shadowBlur = 0; // Reset shadow

    ctx.restore();
  };

  // Virtual Touch Direction Handlers
  const handleTouchDir = (dx: number, dy: number) => {
    touchMovement.current = { x: dx, y: dy };
  };

  const handleTouchStop = () => {
    touchMovement.current = { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-600/70 shadow-2xl bg-stonebg-950 select-none">
      
      {/* Top HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        
        {/* Location & Year Badge */}
        <div className="bg-stone-950/90 backdrop-blur border border-amber-700/60 rounded-xl px-4 py-2 pointer-events-auto flex items-center gap-3 shadow-xl">
          <MapPin className="w-4 h-4 text-amber-400" />
          <div>
            <h4 className="font-serif font-bold text-xs text-amber-100 tracking-wider">
              {worldData.name}
            </h4>
            <p className="text-[10px] text-stone-300 font-serif">
              {worldData.region} • {worldData.year}
            </p>
          </div>
        </div>

        {/* Center: Heartbeat & Quick Brightness Preset Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Heartbeat & Tension Indicator */}
          <div className="bg-stone-950/90 backdrop-blur border border-red-800/70 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-xl">
            <Heart className="w-4 h-4 text-red-500 fill-current animate-ping" />
            <div className="flex flex-col">
              <span className="text-[9px] font-serif text-stone-400 uppercase">Tensão</span>
              <span className="font-mono font-bold text-red-300 text-xs">{Math.round(tensionBpm)} BPM</span>
            </div>
          </div>

          {/* Quick Brightness Toggle Button */}
          <button
            onClick={() => {
              if (brightnessPreset === 'luminous') setBrightnessPreset('dawn');
              else if (brightnessPreset === 'dawn') setBrightnessPreset('dramatic');
              else setBrightnessPreset('luminous');
            }}
            className="bg-stone-950/90 backdrop-blur border border-amber-600/60 hover:border-amber-400 rounded-xl px-3 py-2 text-[10px] font-serif text-amber-200 flex items-center gap-1.5 shadow-lg transition"
            title="Alternar Modo de Iluminação (Visibilidade Alta)"
          >
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">
              Luz: {brightnessPreset === 'luminous' ? 'Enluarada (Alta)' : brightnessPreset === 'dawn' ? 'Alvorada' : 'Contraste'}
            </span>
          </button>
        </div>

        {/* Mini-Map Radar (Top Right) */}
        <div
          onClick={() => setShowFullMap(true)}
          className="bg-stone-950/90 backdrop-blur border-2 border-amber-500 rounded-xl p-2 pointer-events-auto cursor-pointer hover:border-amber-300 shadow-2xl transition group"
          title="Clique para abrir o Mapa Completo [M]"
        >
          <div className="flex items-center justify-between text-[10px] font-serif text-amber-400 mb-1 px-1">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> Radar
            </span>
            <Maximize2 className="w-3 h-3 text-stone-400 group-hover:text-amber-300" />
          </div>

          {/* Canvas Radar Graphic */}
          <div className="relative w-28 h-20 bg-stone-900 rounded border border-stone-800 overflow-hidden">
            {/* Player Blip */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-200/50 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(player.x / worldData.width) * 100}%`,
                top: `${(player.y / worldData.height) * 100}%`,
              }}
            />

            {/* Brazier Blip */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse -translate-x-1/2 -translate-y-1/2"
              style={{ left: '46%', top: '50%' }}
            />

            {/* Christ Blip on Balcony */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-yellow-300 -translate-x-1/2 -translate-y-1/2"
              style={{ left: '49%', top: '8%' }}
            />

            {/* Exit Gate Blip */}
            <div
              className="absolute w-3.5 h-1.5 bg-amber-400 -translate-x-1/2"
              style={{ left: '42%', top: '90%' }}
            />

            {/* NPCs Blips */}
            {npcs.map((n) => (
              <div
                key={n.id}
                className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                  n.role.includes('Guarda') ? 'bg-red-400' : 'bg-yellow-300'
                }`}
                style={{
                  left: `${(n.x / worldData.width) * 100}%`,
                  top: `${(n.y / worldData.height) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Main Third-Person Render Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-[540px] md:h-[580px] object-cover block cursor-crosshair"
      />

      {/* On-Screen Touch D-Pad / Mobile Virtual Controls */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 select-none">
        <div className="grid grid-cols-3 gap-1 bg-stone-950/85 p-2 rounded-2xl border border-stone-800 backdrop-blur shadow-2xl">
          <div />
          <button
            onMouseDown={() => handleTouchDir(0, -1)}
            onMouseUp={handleTouchStop}
            onTouchStart={() => handleTouchDir(0, -1)}
            onTouchEnd={handleTouchStop}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-amber-900 active:bg-amber-600 text-stone-200 flex items-center justify-center font-bold"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onMouseDown={() => handleTouchDir(-1, 0)}
            onMouseUp={handleTouchStop}
            onTouchStart={() => handleTouchDir(-1, 0)}
            onTouchEnd={handleTouchStop}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-amber-900 active:bg-amber-600 text-stone-200 flex items-center justify-center font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-lg bg-stone-900/60 flex items-center justify-center text-[10px] font-mono text-stone-400">
            WASD
          </div>
          <button
            onMouseDown={() => handleTouchDir(1, 0)}
            onMouseUp={handleTouchStop}
            onTouchStart={() => handleTouchDir(1, 0)}
            onTouchEnd={handleTouchStop}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-amber-900 active:bg-amber-600 text-stone-200 flex items-center justify-center font-bold"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            onMouseDown={() => handleTouchDir(0, 1)}
            onMouseUp={handleTouchStop}
            onTouchStart={() => handleTouchDir(0, 1)}
            onTouchEnd={handleTouchStop}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-amber-900 active:bg-amber-600 text-stone-200 flex items-center justify-center font-bold"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        {/* Interact Action Button */}
        {nearestInteractable && (
          <button
            onClick={triggerNearestInteraction}
            className="h-20 px-5 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-100 font-serif font-bold text-sm border-2 border-amber-300 shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 animate-pulse"
          >
            <Hand className="w-6 h-6" />
            <span>INTERAGIR [E]</span>
          </button>
        )}
      </div>

      {/* Controls Legend (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center gap-2 bg-stone-950/90 backdrop-blur px-3 py-1.5 rounded-lg border border-amber-900/50 text-[11px] font-serif text-stone-300 shadow-xl">
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">W,A,S,D</kbd> Mover</span>
        <span>•</span>
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">SHIFT</kbd> Furtividade</span>
        <span>•</span>
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">E / Espaço</kbd> Interagir</span>
        <span>•</span>
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">M</kbd> Planta</span>
      </div>

      {/* DIALOGUE MODAL OVERLAY */}
      {activeDialogue && (
        <div className="absolute bottom-4 left-4 right-4 z-50 bg-stonebg-950/95 border-2 border-amber-500 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-fade-in space-y-3">
          
          {/* Speaker Header */}
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-amber-400"
                style={{ backgroundColor: activeDialogue.speakerColor, color: '#0c0a09' }}
              >
                {activeDialogue.speaker[0]}
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-amber-100">
                  {activeDialogue.speaker}
                </h4>
                <p className="text-[10px] text-amber-300 font-serif italic">
                  {activeDialogue.speakerRole}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveDialogue(null)}
              className="text-stone-400 hover:text-stone-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dialogue Text */}
          <p className="font-serif text-base text-stone-100 leading-relaxed italic bg-stone-900/80 p-3.5 rounded-lg border border-stone-800">
            "{activeDialogue.text}"
          </p>

          {/* Choices Options */}
          <div className="space-y-2 pt-1">
            {activeDialogue.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDialogueOption(opt)}
                className="w-full text-left p-3 rounded-xl bg-stone-900 hover:bg-amber-950 border border-stone-800 hover:border-amber-400 text-amber-100 text-xs font-serif transition flex flex-col gap-0.5 group shadow"
              >
                <span className="font-bold text-amber-300 group-hover:text-amber-200">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-[10px] text-stone-400 italic">
                    {opt.description}
                  </span>
                )}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* FULL MAP MODAL OVERLAY */}
      {showFullMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stonebg-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stonebg-900 border-2 border-amber-500 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-amber-900 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-lg text-amber-200">
                  Planta Arquitetônica: {worldData.name}
                </h3>
              </div>
              <button
                onClick={() => setShowFullMap(false)}
                className="text-stone-400 hover:text-amber-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-80 bg-stone-950 rounded-xl border border-stone-800 p-4 overflow-hidden">
              <div className="absolute inset-4 border-2 border-stone-700 rounded-lg">
                
                {/* Upper Balcony / Sanhedrin Loggia */}
                <div className="absolute top-2 left-1/4 right-1/4 h-12 bg-stone-800 border-2 border-amber-500/80 flex items-center justify-center text-[10px] font-serif text-amber-300 font-bold">
                  Galeria Superior: Jesus Cristo (Nimbo Cruciforme)
                </div>

                {/* Central Charcoal Brazier */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-amber-950 border-2 border-orange-500 flex items-center justify-center text-[9px] font-serif text-orange-200 text-center font-bold shadow-lg">
                  Braseiro Central
                </div>

                {/* Lower Entry Gate */}
                <div className="absolute bottom-0 left-1/3 right-1/3 h-7 bg-amber-950 border-t-2 border-dashed border-amber-400 flex items-center justify-center text-[10px] font-serif text-amber-200 font-bold">
                  Portão do Pátio (Fuga ao Sepulcro)
                </div>

                {/* Real-time Player Position Indicator */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-cyan-400 border-2 border-white -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg"
                  style={{
                    left: `${(player.x / worldData.width) * 100}%`,
                    top: `${(player.y / worldData.height) * 100}%`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-950"></span>
                </div>

                {/* NPCs Locations */}
                {npcs.map((n) => (
                  <div
                    key={n.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-serif flex flex-col items-center"
                    style={{
                      left: `${(n.x / worldData.width) * 100}%`,
                      top: `${(n.y / worldData.height) * 100}%`,
                    }}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${n.role.includes('Guarda') ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
                    <span className="text-stone-300 text-[8px] whitespace-nowrap">{n.name}</span>
                  </div>
                ))}

              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-300 pt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Sua Posição (Pedro)
                </span>
                <span className="flex items-center gap-1.5 text-yellow-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Testemunhas
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Guardas do Templo
                </span>
              </div>
              <button
                onClick={() => setShowFullMap(false)}
                className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif px-4 py-1.5 rounded-lg border border-amber-500 transition"
              >
                Voltar à Exploração
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
