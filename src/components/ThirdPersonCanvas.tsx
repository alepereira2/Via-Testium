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
  Heart, 
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
  
  // Brightness Control: 'daylight' (padrão absoluto: 100% claro, sem nenhuma opacidade escura), 'torchlit' (noite clara e dourada)
  const [lightingMode, setLightingMode] = useState<'daylight' | 'torchlit'>('daylight');
  const [brightnessLevel, setBrightnessLevel] = useState<number>(100); // 50% to 150%

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
    radius: 22,
    speed: 3.6,
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

  // Rising Embers Particles
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

      setFlameFlicker(0.95 + Math.sin(currentTime * 0.01) * 0.05 + Math.random() * 0.03);

      const brazier = worldData.props.find((p) => p.id === 'brazier_central');
      if (brazier && Math.random() < 0.4) {
        embersRef.current.push({
          x: brazier.x + brazier.width / 2 + (Math.random() * 26 - 13),
          y: brazier.y + brazier.height / 2 + (Math.random() * 12 - 6),
          vx: (Math.random() - 0.5) * 20,
          vy: -35 - Math.random() * 45,
          alpha: 1.0,
          size: 2.5 + Math.random() * 3
        });
      }

      embersRef.current.forEach((emb) => {
        emb.x += emb.vx * dt;
        emb.y += emb.vy * dt;
        emb.alpha -= dt * 0.8;
      });
      embersRef.current = embersRef.current.filter((e) => e.alpha > 0);

      // Player Movement
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
      const currentSpeed = isSneaking ? 2.0 : 3.6;

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

      // Update NPC Patrols
      npcs.forEach((npc) => {
        if (npc.isPatrolling && npc.patrolPoints && npc.patrolPoints.length > 1) {
          const target = npc.patrolPoints[npc.currentPatrolIndex || 0];
          const dx = target.x - npc.x;
          const dy = target.y - npc.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 4) {
            npc.currentPatrolIndex = ((npc.currentPatrolIndex || 0) + 1) % npc.patrolPoints.length;
          } else {
            const step = (npc.speed * dt * 44);
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

      // Check Nearest Interactable
      let closestInteractable: {
        name: string;
        actionPrompt: string;
        entity: CharacterEntity | null;
      } | null = null;
      let minDistance = 90;

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
            setTensionBpm((bpm) => Math.min(160, bpm + 0.1));
          }
        }
      });

      if (brazier) {
        const dx = (brazier.x + brazier.width / 2) - player.x;
        const dy = (brazier.y + brazier.height / 2) - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 95 && dist < minDistance) {
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
        if (dist < 100 && dist < minDistance) {
          minDistance = dist;
          closestInteractable = {
            name: 'Portão de Saída',
            actionPrompt: 'Sair para o sepulcro [E]',
            entity: null,
          };
        }
      }

      setNearestInteractable(closestInteractable);

      // Render Frame
      renderScene();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [player, npcs, activeDialogue, worldData, lightingMode, brightnessLevel]);

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

  // Rendering Function: 100% Crisp, Bright, High-Contrast & Catholic Iconography
  const renderScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewportW = canvas.width;
    const viewportH = canvas.height;

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

    // Apply brightness filter if adjusted
    if (brightnessLevel !== 100) {
      ctx.filter = `brightness(${brightnessLevel}%)`;
    }

    ctx.translate(-camX, -camY);

    // 1. Draw Courtyard Floor: BRIGHT Warm Jerusalem Sandstone (Pedra de Jerusalém Dourada e Areia Clara)
    // NEVER dark or muddy! Pure bright Mediterranean limestone flagstones.
    const isDaylight = lightingMode === 'daylight';
    const baseStone = isDaylight ? '#e8dcbf' : '#d4c7a5';
    const altStone = isDaylight ? '#f2e8cf' : '#decfae';
    const mortarColor = isDaylight ? '#a8987d' : '#8c7d63';

    ctx.fillStyle = baseStone;
    ctx.fillRect(0, 0, worldData.width, worldData.height);

    // Stone Tiles Grid with Crisp Clean Borders
    const tileSize = 60;
    for (let x = 0; x < worldData.width; x += tileSize) {
      for (let y = 0; y < worldData.height; y += tileSize) {
        const hash = (x * 73856093 ^ y * 19349663) % 10;
        ctx.fillStyle = hash > 4 ? altStone : baseStone;
        ctx.fillRect(x + 1.5, y + 1.5, tileSize - 3, tileSize - 3);

        // Crisp beveled border
        ctx.strokeStyle = mortarColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, tileSize, tileSize);

        // Light bevel highlight on top and left edge of tile
        ctx.strokeStyle = '#fff8e7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + tileSize - 3);
        ctx.lineTo(x + 2, y + 2);
        ctx.lineTo(x + tileSize - 3, y + 2);
        ctx.stroke();
      }
    }

    // 2. Draw Walls & Colonnades with Bright Golden-Sandstone Relief
    worldData.walls.forEach((w) => {
      // Wall Shadow on Ground
      ctx.fillStyle = 'rgba(70, 60, 45, 0.45)';
      ctx.fillRect(w.x + 8, w.y + 10, w.width, w.height);

      // Chiseled Jerusalem Stone Wall Face (Warm Cream/Sand)
      const wallGrad = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.height);
      wallGrad.addColorStop(0, '#f5efe0');
      wallGrad.addColorStop(0.3, '#dfd3bc');
      wallGrad.addColorStop(1, '#ab9b82');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(w.x, w.y, w.width, w.height);

      // High-contrast Wall Edge Trim & Cornice
      ctx.strokeStyle = '#6e5e47';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(w.x, w.y, w.width, w.height);
    });

    // Draw Classical White Marble Columns with Golden Capitals
    [
      { x: 268, y: 338 }, { x: 468, y: 338 }, { x: 868, y: 338 }, { x: 1068, y: 338 },
      { x: 268, y: 638 }, { x: 468, y: 638 }, { x: 868, y: 638 }, { x: 1068, y: 638 }
    ].forEach((col) => {
      // Column Shadow
      ctx.fillStyle = 'rgba(70, 60, 45, 0.4)';
      ctx.beginPath();
      ctx.ellipse(col.x + 8, col.y + 12, 24, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // White-Cream Marble Shaft
      const cGrad = ctx.createRadialGradient(col.x - 5, col.y - 5, 4, col.x, col.y, 22);
      cGrad.addColorStop(0, '#ffffff');
      cGrad.addColorStop(0.6, '#f3ece0');
      cGrad.addColorStop(1, '#b5a489');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(col.x, col.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#857356';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Golden Corinthian Capital Ring
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(col.x, col.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw Props (Brazier, Benches, Upper Loggia)
    worldData.props.forEach((prop) => {
      if (prop.type === 'brazier') {
        const cx = prop.x + prop.width / 2;
        const cy = prop.y + prop.height / 2;

        // Tripod Shadow
        ctx.fillStyle = 'rgba(70, 60, 45, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx + 6, cy + 24, 36, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bronze Brazier Bowl
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Glowing Fiery Core
        const emberGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 26);
        emberGrad.addColorStop(0, '#ffffff');
        emberGrad.addColorStop(0.2, '#fef08a');
        emberGrad.addColorStop(0.5, '#f59e0b');
        emberGrad.addColorStop(0.85, '#dc2626');
        emberGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.fill();

        // Animated Flame Tongues
        ctx.fillStyle = '#fef08a';
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2 + flameFlicker * 0.5;
          const fx = cx + Math.cos(angle) * 9;
          const fy = cy + Math.sin(angle) * 9 - 4;
          ctx.beginPath();
          ctx.arc(fx, fy, 7 * flameFlicker, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (prop.type === 'bench') {
        ctx.fillStyle = 'rgba(70, 60, 45, 0.35)';
        ctx.fillRect(prop.x + 6, prop.y + 8, prop.width, prop.height);
        ctx.fillStyle = '#d4c7a5';
        ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
        ctx.strokeStyle = '#6e5e47';
        ctx.lineWidth = 2;
        ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
      } else if (prop.type === 'gate') {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
        ctx.setLineDash([]);
      }
    });

    // Rising Flame Embers Particles
    embersRef.current.forEach((emb) => {
      ctx.fillStyle = `rgba(234, 88, 12, ${emb.alpha})`;
      ctx.beginPath();
      ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw NPCs with Catholic Iconography & Clear Dark Outlines
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
        ctx.font = 'bold italic 11px Inter, sans-serif';
        ctx.fillStyle = '#854d0e';
        ctx.textAlign = 'center';
        ctx.fillText(`"${npc.barkText}"`, npc.x, npc.y - 54);
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

    // 6. Optional Lighting Overlay (Zero opacity in 'daylight' mode = 100% visibility!)
    if (lightingMode === 'torchlit') {
      ctx.save();
      // Very gentle warm golden evening tint, NEVER opaque dark mud!
      ctx.fillStyle = 'rgba(120, 80, 40, 0.12)';
      ctx.fillRect(0, 0, worldData.width, worldData.height);

      // Warm radial fires
      const brazier = worldData.props.find((p) => p.id === 'brazier_central');
      if (brazier && brazier.lightRadius) {
        const radius = brazier.lightRadius * flameFlicker;
        const bRad = ctx.createRadialGradient(
          brazier.x + brazier.width / 2,
          brazier.y + brazier.height / 2,
          20,
          brazier.x + brazier.width / 2,
          brazier.y + brazier.height / 2,
          radius
        );
        bRad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        bRad.addColorStop(1, 'rgba(254, 240, 138, 0)');
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
      ctx.restore();
    }

    // 7. Interactive Floating Prompt Pill
    if (nearestInteractable) {
      let targetX = player.x;
      let targetY = player.y - 70;

      if (nearestInteractable.entity) {
        targetX = nearestInteractable.entity.x;
        targetY = nearestInteractable.entity.y - 70;
      }

      ctx.font = 'bold 13px Cinzel, serif';
      const promptWidth = ctx.measureText(nearestInteractable.actionPrompt).width + 32;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(targetX - promptWidth / 2, targetY - 16, promptWidth, 32, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText(nearestInteractable.actionPrompt, targetX, targetY + 6);
    }

    ctx.restore();
  };

  // Helper: Draw Character with Authentic Catholic Iconography
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
    ctx.fillStyle = 'rgba(70, 60, 45, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 18, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = isMoving ? Math.sin(walkCycle) * 8 : 0;

    // 2. Catholic Iconographic Halos (Nimbo Sagrado)
    if (iconography === 'peter' || iconography === 'paul') {
      // Golden Halo of the Apostle
      const haloGrad = ctx.createRadialGradient(x, y - 24, 10, x, y - 24, 30);
      haloGrad.addColorStop(0, '#fef08a');
      haloGrad.addColorStop(0.7, '#eab308');
      haloGrad.addColorStop(1, 'rgba(202, 138, 4, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(x, y - 24, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (iconography === 'christ') {
      // CRUCIFORM HALO OF CHRIST (NIMBO CRUCIFORME)
      const cHaloGrad = ctx.createRadialGradient(x, y - 24, 10, x, y - 24, 34);
      cHaloGrad.addColorStop(0, '#ffffff');
      cHaloGrad.addColorStop(0.6, '#facc15');
      cHaloGrad.addColorStop(1, 'rgba(202, 138, 4, 0)');
      ctx.fillStyle = cHaloGrad;
      ctx.beginPath();
      ctx.arc(x, y - 24, 34, 0, Math.PI * 2);
      ctx.fill();

      // Red Greek Cross inside the Nimbus
      ctx.fillStyle = '#dc2626';
      // Vertical bar
      ctx.fillRect(x - 3.5, y - 56, 7, 32);
      // Horizontal bar
      ctx.fillRect(x - 20, y - 27.5, 40, 7);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y - 24, 32, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Sandals & Legs
    ctx.fillStyle = '#451a03'; // Leather sandals
    ctx.fillRect(x - 10, y + 14 + legOffset, 8, 9);
    ctx.fillRect(x + 2, y + 14 - legOffset, 8, 9);

    // 4. Robes and Mantle by Iconographic Type
    if (iconography === 'peter') {
      // SÃO PEDRO: Cobalt Blue Tunic + Golden Ochre Mantle (Tradição Católica)
      ctx.fillStyle = '#1d4ed8'; // Vibrant Blue tunic
      ctx.beginPath();
      ctx.roundRect(x - 16, y - 14, 32, 30, 7);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Golden Yellow Mantle draped over shoulder
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x - 16, y - 14);
      ctx.lineTo(x + 10, y - 14);
      ctx.lineTo(x + 16, y + 16);
      ctx.lineTo(x - 14, y + 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Golden & Silver Keys of St. Peter (Duae Claves Regni) at hip
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x + 15, y + 6, 4, 0, Math.PI * 2);
      ctx.moveTo(x + 15, y + 10);
      ctx.lineTo(x + 15, y + 20);
      ctx.moveTo(x + 15, y + 16);
      ctx.lineTo(x + 19, y + 16);
      ctx.stroke();
    } else if (iconography === 'christ') {
      // JESUS CRISTO: Seamless Pure White Tunic + Crimson Mantle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x - 16, y - 14, 32, 30, 7);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sacred Crimson Red Mantle
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(x - 7, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bound wrists with rope
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 8);
      ctx.lineTo(x + 8, y + 8);
      ctx.stroke();
    } else if (iconography === 'malchus_kin') {
      // PARENTE DE MALCO: Dark Levantine Tunic + Bandaged Right Ear
      ctx.fillStyle = '#5c2c16';
      ctx.beginPath();
      ctx.roundRect(x - 15, y - 14, 30, 30, 6);
      ctx.fill();
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (iconography === 'roman_soldier') {
      // ROMAN LEGIONNAIRE: Imperial Red Tunic + Lorica Segmentata
      ctx.fillStyle = '#b91c1c'; // Red tunic
      ctx.fillRect(x - 16, y - 12, 32, 28);

      // Silver Segmented Plate Armor (Lorica)
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 14, y - 10, 28, 20);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 14, y - 10, 28, 20);
    } else if (iconography === 'temple_guard') {
      // LEVITICAL TEMPLE GUARD: Blue & White Priestly Stripes
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x - 15, y - 12, 30, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 5, y - 12, 10, 28);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 15, y - 12, 30, 28);
    } else if (iconography === 'servant_girl') {
      // MAIDSERVANT: Terracotta Dress + Modest Veil
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.roundRect(x - 14, y - 12, 28, 28, 7);
      ctx.fill();
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(x - 15, y - 12, 30, 28, 6);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 5. Head & Facial Features by Iconography
    const skinTone = iconography === 'christ' ? '#fde8cd' : '#f0c8a0';
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(x, y - 18, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Specific Hair, Beard and Headwear
    if (iconography === 'peter') {
      // St. Peter: Short curly silver-white hair and rounded grey beard with tonsure
      ctx.fillStyle = '#e2e8f0'; // White / silver hair
      ctx.beginPath();
      ctx.arc(x, y - 22, 15, Math.PI, Math.PI * 2);
      ctx.fill();
      // Round curly white beard
      ctx.beginPath();
      ctx.arc(x, y - 16, 14, 0, Math.PI);
      ctx.fill();
    } else if (iconography === 'christ') {
      // Jesus: Long wavy chestnut-brown hair parted in the middle falling to shoulders
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(x - 16, y - 26, 7, 24);
      ctx.fillRect(x + 9, y - 26, 7, 24);
      // Trimmed chestnut beard
      ctx.beginPath();
      ctx.arc(x, y - 15, 13, 0, Math.PI);
      ctx.fill();
    } else if (iconography === 'malchus_kin') {
      // Dark beard
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(x, y - 16, 14, 0, Math.PI);
      ctx.fill();

      // BANDAGED RIGHT EAR (ICONIC DETAIL OF MALCHUS' EAR STRUCK IN GETHSEMANE!)
      ctx.fillStyle = '#ffffff'; // White linen bandage wrap
      ctx.fillRect(x + 9, y - 22, 7, 12);
      ctx.strokeStyle = '#b91c1c'; // Bloodstain
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y - 19, 4, 6);
    } else if (iconography === 'roman_soldier') {
      // Roman Brass Helmet (Galea) with Red Horsehair Crest
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(x, y - 20, 15, Math.PI, Math.PI * 2);
      ctx.fill();
      // Red Imperial Crest
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 4, y - 36, 8, 16);
    } else if (iconography === 'temple_guard') {
      // Levitical White Turban (Migbahat)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, y - 24, 15, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (iconography === 'servant_girl') {
      // Jewish Modesty Head-veil (Mitpachat)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, y - 22, 15, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 15, y - 22, 7, 18);
      ctx.fillRect(x + 8, y - 22, 7, 18);
    }

    // Directional Eyes
    ctx.fillStyle = '#0f172a';
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    if (facing === 'left') eyeOffsetX = -4;
    if (facing === 'right') eyeOffsetX = 4;
    if (facing === 'up') eyeOffsetY = -3;
    if (facing === 'down') eyeOffsetY = 3;

    if (facing !== 'up') {
      ctx.fillRect(x - 5 + eyeOffsetX, y - 20 + eyeOffsetY, 3.5, 3.5);
      ctx.fillRect(x + 2 + eyeOffsetX, y - 20 + eyeOffsetY, 3.5, 3.5);
    }

    // Spear for Guards
    if (iconography === 'temple_guard' || iconography === 'roman_soldier') {
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 18, y + 20);
      ctx.lineTo(x + 18, y - 44);
      ctx.stroke();

      // Spear tip
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(x + 18, y - 56);
      ctx.lineTo(x + 12, y - 44);
      ctx.lineTo(x + 24, y - 44);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 6. Overhead Name Label with Solid High-Contrast Badge
    ctx.font = 'bold 12px Cinzel, serif';
    const textWidth = ctx.measureText(name).width;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.roundRect(x - textWidth / 2 - 6, y - 48, textWidth + 12, 18, 5);
    ctx.fill();
    ctx.strokeStyle = iconography === 'christ' ? '#eab308' : '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = iconography === 'christ' ? '#fef08a' : '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y - 35);

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
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-500 shadow-2xl bg-stone-900 select-none">
      
      {/* Top HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        
        {/* Location & Year Badge */}
        <div className="bg-stone-900/95 backdrop-blur border-2 border-amber-600/70 rounded-xl px-4 py-2 pointer-events-auto flex items-center gap-3 shadow-xl">
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

        {/* Center: Heartbeat & Instant Lighting Mode Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Heartbeat & Tension Indicator */}
          <div className="bg-stone-900/95 backdrop-blur border border-red-700 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-xl">
            <Heart className="w-4 h-4 text-red-500 fill-current animate-ping" />
            <div className="flex flex-col">
              <span className="text-[9px] font-serif text-stone-400 uppercase">Tensão Cardíaca</span>
              <span className="font-mono font-bold text-red-300 text-xs">{Math.round(tensionBpm)} BPM</span>
            </div>
          </div>

          {/* Daylight / Full Visibility Button */}
          <button
            onClick={() => setLightingMode((prev) => (prev === 'daylight' ? 'torchlit' : 'daylight'))}
            className={`px-3 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 shadow-xl border-2 transition ${
              lightingMode === 'daylight'
                ? 'bg-amber-500 text-stone-950 border-amber-300'
                : 'bg-stone-900 text-amber-200 border-amber-600/70 hover:border-amber-400'
            }`}
            title="Alternar Iluminação: Luz Plena ou Noite Iluminada"
          >
            <Sun className="w-4 h-4 fill-current" />
            <span>{lightingMode === 'daylight' ? 'Luz Plena (100% Claro)' : 'Noite Iluminada'}</span>
          </button>
        </div>

        {/* Mini-Map Radar (Top Right) */}
        <div
          onClick={() => setShowFullMap(true)}
          className="bg-stone-900/95 backdrop-blur border-2 border-amber-500 rounded-xl p-2 pointer-events-auto cursor-pointer hover:border-amber-300 shadow-2xl transition group"
          title="Clique para abrir a Planta Completa [M]"
        >
          <div className="flex items-center justify-between text-[10px] font-serif text-amber-400 mb-1 px-1">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> Radar
            </span>
            <Maximize2 className="w-3 h-3 text-stone-300 group-hover:text-amber-300" />
          </div>

          {/* Canvas Radar Graphic */}
          <div className="relative w-28 h-20 bg-stone-950 rounded border border-stone-800 overflow-hidden">
            {/* Player Blip */}
            <div
              className="absolute w-3 h-3 rounded-full bg-cyan-400 ring-2 ring-white -translate-x-1/2 -translate-y-1/2"
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

            {/* Christ Blip */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-yellow-300 -translate-x-1/2 -translate-y-1/2"
              style={{ left: '49%', top: '8%' }}
            />

            {/* Exit Gate Blip */}
            <div
              className="absolute w-4 h-2 bg-amber-400 -translate-x-1/2"
              style={{ left: '42%', top: '90%' }}
            />

            {/* NPCs Blips */}
            {npcs.map((n) => (
              <div
                key={n.id}
                className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ${
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
        <div className="grid grid-cols-3 gap-1 bg-stone-900/90 p-2 rounded-2xl border-2 border-amber-600/60 backdrop-blur shadow-2xl">
          <div />
          <button
            onMouseDown={() => handleTouchDir(0, -1)}
            onMouseUp={handleTouchStop}
            onTouchStart={() => handleTouchDir(0, -1)}
            onTouchEnd={handleTouchStop}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-amber-800 active:bg-amber-600 text-stone-200 flex items-center justify-center font-bold shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onMouseDown={() => handleTouchDir(-1, 0)}
            onMouseUp={handleTouchStop}
            onTouchStart={() => handleTouchDir(-1, 0)}
            onTouchEnd={handleTouchStop}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-amber-800 active:bg-amber-600 text-stone-200 flex items-center justify-center font-bold shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-lg bg-stone-950 flex items-center justify-center text-[10px] font-mono text-amber-400 font-bold">
            WASD
          </div>
          <button
            onMouseDown={() => handleTouchDir(1, 0)}
            onMouseUp={handleTouchStop}
            onTouchStart={() => handleTouchDir(1, 0)}
            onTouchEnd={handleTouchStop}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-amber-800 active:bg-amber-600 text-stone-200 flex items-center justify-center font-bold shadow"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            onMouseDown={() => handleTouchDir(0, 1)}
            onMouseUp={handleTouchStop}
            onTouchStart={() => handleTouchDir(0, 1)}
            onTouchEnd={handleTouchStop}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-amber-800 active:bg-amber-600 text-stone-200 flex items-center justify-center font-bold shadow"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        {/* Interact Action Button */}
        {nearestInteractable && (
          <button
            onClick={triggerNearestInteraction}
            className="h-20 px-5 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-stone-950 font-serif font-black text-sm border-2 border-amber-200 shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 animate-pulse"
          >
            <Hand className="w-6 h-6" />
            <span>INTERAGIR [E]</span>
          </button>
        )}
      </div>

      {/* Controls Legend (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center gap-2 bg-stone-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-amber-600/50 text-[11px] font-serif text-stone-200 shadow-xl">
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
        <div className="absolute bottom-4 left-4 right-4 z-50 bg-stone-900/98 border-2 border-amber-500 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-fade-in space-y-3">
          
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

          <p className="font-serif text-base text-stone-100 leading-relaxed italic bg-stone-950 p-3.5 rounded-lg border border-stone-800">
            "{activeDialogue.text}"
          </p>

          <div className="space-y-2 pt-1">
            {activeDialogue.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDialogueOption(opt)}
                className="w-full text-left p-3 rounded-xl bg-stone-950 hover:bg-amber-950 border border-stone-800 hover:border-amber-400 text-amber-100 text-xs font-serif transition flex flex-col gap-0.5 group shadow"
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
