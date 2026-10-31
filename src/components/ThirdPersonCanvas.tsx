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
  Shield,
  Eye
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
  
  // Lighting Mode: 'daylight' (100% claro), 'torchlit'
  const [lightingMode, setLightingMode] = useState<'daylight' | 'torchlit'>('daylight');

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
  const [isMobileSneakActive, setIsMobileSneakActive] = useState<boolean>(false);

  // Rising Embers Particles
  const embersRef = useRef<EmberParticle[]>([]);

  // Input states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchMovement = useRef<Vector2D>({ x: 0, y: 0 });

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if ((e.code === 'KeyE' || e.code === 'Space') && !activeDialogue) {
        e.preventDefault();
        triggerNearestInteraction();
      }

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

      const isSneaking = !!(keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight'] || isMobileSneakActive);
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
            actionPrompt: `Falar com ${npc.name}`,
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
            actionPrompt: 'Aquecer as mãos',
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
            actionPrompt: 'Sair para o sepulcro',
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
  }, [player, npcs, activeDialogue, worldData, lightingMode, isMobileSneakActive]);

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

  // Rendering Scene
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
    ctx.translate(-camX, -camY);

    // 1. Draw Courtyard Floor: BRIGHT Warm Jerusalem Sandstone
    const isDaylight = lightingMode === 'daylight';
    const baseStone = isDaylight ? '#e8dcbf' : '#d4c7a5';
    const altStone = isDaylight ? '#f2e8cf' : '#decfae';
    const mortarColor = isDaylight ? '#a8987d' : '#8c7d63';

    ctx.fillStyle = baseStone;
    ctx.fillRect(0, 0, worldData.width, worldData.height);

    const tileSize = 60;
    for (let x = 0; x < worldData.width; x += tileSize) {
      for (let y = 0; y < worldData.height; y += tileSize) {
        const hash = (x * 73856093 ^ y * 19349663) % 10;
        ctx.fillStyle = hash > 4 ? altStone : baseStone;
        ctx.fillRect(x + 1.5, y + 1.5, tileSize - 3, tileSize - 3);

        ctx.strokeStyle = mortarColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, tileSize, tileSize);

        ctx.strokeStyle = '#fff8e7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + tileSize - 3);
        ctx.lineTo(x + 2, y + 2);
        ctx.lineTo(x + tileSize - 3, y + 2);
        ctx.stroke();
      }
    }

    // 2. Draw Walls & Colonnades
    worldData.walls.forEach((w) => {
      ctx.fillStyle = 'rgba(70, 60, 45, 0.45)';
      ctx.fillRect(w.x + 8, w.y + 10, w.width, w.height);

      const wallGrad = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.height);
      wallGrad.addColorStop(0, '#f5efe0');
      wallGrad.addColorStop(0.3, '#dfd3bc');
      wallGrad.addColorStop(1, '#ab9b82');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(w.x, w.y, w.width, w.height);

      ctx.strokeStyle = '#6e5e47';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(w.x, w.y, w.width, w.height);
    });

    // Columns
    [
      { x: 268, y: 338 }, { x: 468, y: 338 }, { x: 868, y: 338 }, { x: 1068, y: 338 },
      { x: 268, y: 638 }, { x: 468, y: 638 }, { x: 868, y: 638 }, { x: 1068, y: 638 }
    ].forEach((col) => {
      ctx.fillStyle = 'rgba(70, 60, 45, 0.4)';
      ctx.beginPath();
      ctx.ellipse(col.x + 8, col.y + 12, 24, 14, 0, 0, Math.PI * 2);
      ctx.fill();

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

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(col.x, col.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw Props
    worldData.props.forEach((prop) => {
      if (prop.type === 'brazier') {
        const cx = prop.x + prop.width / 2;
        const cy = prop.y + prop.height / 2;

        ctx.fillStyle = 'rgba(70, 60, 45, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx + 6, cy + 24, 36, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3.5;
        ctx.stroke();

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

    // Embers
    embersRef.current.forEach((emb) => {
      ctx.fillStyle = `rgba(234, 88, 12, ${emb.alpha})`;
      ctx.beginPath();
      ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw NPCs
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

      if (npc.barkText) {
        ctx.font = 'bold italic 11px Inter, sans-serif';
        ctx.fillStyle = '#854d0e';
        ctx.textAlign = 'center';
        ctx.fillText(`"${npc.barkText}"`, npc.x, npc.y - 54);
      }
    });

    // 5. Draw Player Character
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

    // 6. Optional Lighting Overlay
    if (lightingMode === 'torchlit') {
      ctx.save();
      ctx.fillStyle = 'rgba(120, 80, 40, 0.12)';
      ctx.fillRect(0, 0, worldData.width, worldData.height);

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

  // Helper: Draw Character
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

    ctx.fillStyle = 'rgba(70, 60, 45, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 18, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = isMoving ? Math.sin(walkCycle) * 8 : 0;

    // Halos
    if (iconography === 'peter' || iconography === 'paul') {
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
      const cHaloGrad = ctx.createRadialGradient(x, y - 24, 10, x, y - 24, 34);
      cHaloGrad.addColorStop(0, '#ffffff');
      cHaloGrad.addColorStop(0.6, '#facc15');
      cHaloGrad.addColorStop(1, 'rgba(202, 138, 4, 0)');
      ctx.fillStyle = cHaloGrad;
      ctx.beginPath();
      ctx.arc(x, y - 24, 34, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 3.5, y - 56, 7, 32);
      ctx.fillRect(x - 20, y - 27.5, 40, 7);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y - 24, 32, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sandals
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x - 10, y + 14 + legOffset, 8, 9);
    ctx.fillRect(x + 2, y + 14 - legOffset, 8, 9);

    // Robes
    if (iconography === 'peter') {
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.roundRect(x - 16, y - 14, 32, 30, 7);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

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

      // Keys of St. Peter
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
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x - 16, y - 14, 32, 30, 7);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(x - 7, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 8);
      ctx.lineTo(x + 8, y + 8);
      ctx.stroke();
    } else if (iconography === 'malchus_kin') {
      ctx.fillStyle = '#5c2c16';
      ctx.beginPath();
      ctx.roundRect(x - 15, y - 14, 30, 30, 6);
      ctx.fill();
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (iconography === 'roman_soldier') {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x - 16, y - 12, 32, 28);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 14, y - 10, 28, 20);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 14, y - 10, 28, 20);
    } else if (iconography === 'temple_guard') {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x - 15, y - 12, 30, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 5, y - 12, 10, 28);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 15, y - 12, 30, 28);
    } else if (iconography === 'servant_girl') {
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

    // Head
    const skinTone = iconography === 'christ' ? '#fde8cd' : '#f0c8a0';
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(x, y - 18, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (iconography === 'peter') {
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(x, y - 22, 15, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y - 16, 14, 0, Math.PI);
      ctx.fill();
    } else if (iconography === 'christ') {
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(x - 16, y - 26, 7, 24);
      ctx.fillRect(x + 9, y - 26, 7, 24);
      ctx.beginPath();
      ctx.arc(x, y - 15, 13, 0, Math.PI);
      ctx.fill();
    } else if (iconography === 'malchus_kin') {
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(x, y - 16, 14, 0, Math.PI);
      ctx.fill();

      // Bandaged Ear
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 9, y - 22, 7, 12);
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y - 19, 4, 6);
    } else if (iconography === 'roman_soldier') {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(x, y - 20, 15, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 4, y - 36, 8, 16);
    } else if (iconography === 'temple_guard') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, y - 24, 15, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (iconography === 'servant_girl') {
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

    // Spear
    if (iconography === 'temple_guard' || iconography === 'roman_soldier') {
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 18, y + 20);
      ctx.lineTo(x + 18, y - 44);
      ctx.stroke();

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

    // Overhead Label
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

  // Virtual Touch Direction Handlers with preventDefault
  const handleTouchDir = (e: React.TouchEvent | React.MouseEvent, dx: number, dy: number) => {
    e.preventDefault();
    touchMovement.current = { x: dx, y: dy };
  };

  const handleTouchStop = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    touchMovement.current = { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-500 shadow-2xl bg-stone-900 select-none touch-none">
      
      {/* Top HUD Overlay (Responsive for Mobile Phones) */}
      <div className="absolute top-2 left-2 right-2 z-30 flex items-center justify-between pointer-events-none gap-1.5">
        
        {/* Location & Year Badge */}
        <div className="bg-stone-900/95 backdrop-blur border-2 border-amber-600/70 rounded-xl px-2.5 py-1.5 pointer-events-auto flex items-center gap-2 shadow-xl max-w-[50%]">
          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <div className="truncate">
            <h4 className="font-serif font-bold text-[11px] md:text-xs text-amber-100 tracking-wider truncate">
              {worldData.name}
            </h4>
            <p className="text-[9px] md:text-[10px] text-stone-300 font-serif truncate">
              {worldData.region}
            </p>
          </div>
        </div>

        {/* Center: Heartbeat & Light Toggle */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Heartbeat Badge */}
          <div className="bg-stone-900/95 backdrop-blur border border-red-700 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-xl">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-ping" />
            <span className="font-mono font-bold text-red-300 text-[11px] md:text-xs">
              {Math.round(tensionBpm)}
            </span>
          </div>

          {/* Quick Light Toggle Button */}
          <button
            onClick={() => setLightingMode((prev) => (prev === 'daylight' ? 'torchlit' : 'daylight'))}
            className="bg-amber-500 text-stone-950 border-2 border-amber-300 rounded-xl p-1.5 md:px-2.5 md:py-1 text-xs font-serif font-bold flex items-center gap-1 shadow-lg active:scale-95"
            title="Alternar Iluminação"
          >
            <Sun className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Luz Plena</span>
          </button>
        </div>

        {/* Mini-Map Radar (Top Right) */}
        <div
          onClick={() => setShowFullMap(true)}
          className="bg-stone-900/95 backdrop-blur border-2 border-amber-500 rounded-xl p-1 pointer-events-auto cursor-pointer hover:border-amber-300 shadow-2xl transition group flex-shrink-0"
          title="Abrir Planta Completa [M]"
        >
          <div className="relative w-20 h-14 md:w-24 md:h-16 bg-stone-950 rounded border border-stone-800 overflow-hidden">
            {/* Player Blip */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-white -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(player.x / worldData.width) * 100}%`,
                top: `${(player.y / worldData.height) * 100}%`,
              }}
            />

            {/* Brazier Blip */}
            <div
              className="absolute w-2 h-2 rounded-full bg-orange-500 animate-pulse -translate-x-1/2 -translate-y-1/2"
              style={{ left: '46%', top: '50%' }}
            />

            {/* Christ Blip */}
            <div
              className="absolute w-2 h-2 rounded-full bg-yellow-300 -translate-x-1/2 -translate-y-1/2"
              style={{ left: '49%', top: '8%' }}
            />

            {/* Exit Gate Blip */}
            <div
              className="absolute w-3 h-1.5 bg-amber-400 -translate-x-1/2"
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

      {/* Main Third-Person Render Canvas with Mobile Height */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-[52vh] sm:h-[58vh] md:h-[560px] object-cover block cursor-crosshair touch-none"
      />

      {/* DUAL-THUMB MOBILE CONTROLS (Ergonomia Completa para Celular) */}
      
      {/* 1. LEFT THUMB: Virtual D-Pad for Directional Movement */}
      <div className="absolute bottom-3 left-3 z-30 select-none touch-none">
        <div className="grid grid-cols-3 gap-1 bg-stone-950/90 p-2 rounded-2xl border-2 border-amber-600/70 backdrop-blur shadow-2xl">
          <div />
          <button
            onMouseDown={(e) => handleTouchDir(e, 0, -1)}
            onMouseUp={handleTouchStop}
            onTouchStart={(e) => handleTouchDir(e, 0, -1)}
            onTouchEnd={handleTouchStop}
            className="w-12 h-12 rounded-xl bg-stone-800 hover:bg-amber-800 active:bg-amber-500 text-stone-100 flex items-center justify-center font-bold shadow-lg border border-stone-700 active:scale-95"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div />

          <button
            onMouseDown={(e) => handleTouchDir(e, -1, 0)}
            onMouseUp={handleTouchStop}
            onTouchStart={(e) => handleTouchDir(e, -1, 0)}
            onTouchEnd={handleTouchStop}
            className="w-12 h-12 rounded-xl bg-stone-800 hover:bg-amber-800 active:bg-amber-500 text-stone-100 flex items-center justify-center font-bold shadow-lg border border-stone-700 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center text-[10px] font-mono text-amber-400 font-bold">
            ANDAR
          </div>
          <button
            onMouseDown={(e) => handleTouchDir(e, 1, 0)}
            onMouseUp={handleTouchStop}
            onTouchStart={(e) => handleTouchDir(e, 1, 0)}
            onTouchEnd={handleTouchStop}
            className="w-12 h-12 rounded-xl bg-stone-800 hover:bg-amber-800 active:bg-amber-500 text-stone-100 flex items-center justify-center font-bold shadow-lg border border-stone-700 active:scale-95"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <div />
          <button
            onMouseDown={(e) => handleTouchDir(e, 0, 1)}
            onMouseUp={handleTouchStop}
            onTouchStart={(e) => handleTouchDir(e, 0, 1)}
            onTouchEnd={handleTouchStop}
            className="w-12 h-12 rounded-xl bg-stone-800 hover:bg-amber-800 active:bg-amber-500 text-stone-100 flex items-center justify-center font-bold shadow-lg border border-stone-700 active:scale-95"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <div />
        </div>
      </div>

      {/* 2. RIGHT THUMB: Big Action Button + Mobile Sneak Toggle */}
      <div className="absolute bottom-3 right-3 z-30 flex flex-col items-end gap-2 select-none touch-none">
        
        {/* Sneak Mode Toggle Button */}
        <button
          onClick={() => setIsMobileSneakActive((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-serif font-bold flex items-center gap-1.5 shadow-xl transition active:scale-95 ${
            isMobileSneakActive
              ? 'bg-emerald-600 text-white border-emerald-300'
              : 'bg-stone-900/90 text-stone-300 border-stone-700 hover:border-amber-400'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{isMobileSneakActive ? 'Furtivo ATIVO' : 'Furtivo (Passo Lento)'}</span>
        </button>

        {/* Big Ergonomic Action Button (Touch Target) */}
        {nearestInteractable ? (
          <button
            onClick={triggerNearestInteraction}
            className="h-16 px-6 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-stone-950 font-serif font-black text-sm border-2 border-white shadow-2xl flex items-center justify-center gap-2 active:scale-90 animate-bounce"
          >
            <Hand className="w-6 h-6" />
            <span className="uppercase">{nearestInteractable.actionPrompt}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowFullMap(true)}
            className="h-14 px-4 rounded-2xl bg-stone-900/90 border border-amber-600/70 text-amber-200 font-serif text-xs flex items-center justify-center gap-1.5 shadow-xl active:scale-95"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Ver Planta</span>
          </button>
        )}
      </div>

      {/* Desktop Controls Legend (Hidden on Mobile) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 hidden lg:flex items-center gap-2 bg-stone-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-amber-600/50 text-[11px] font-serif text-stone-200 shadow-xl pointer-events-none">
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">W,A,S,D</kbd> Mover</span>
        <span>•</span>
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">SHIFT</kbd> Furtividade</span>
        <span>•</span>
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">E / Espaço</kbd> Interagir</span>
      </div>

      {/* DIALOGUE MODAL OVERLAY (Mobile-Optimized Touch Bottom Sheet) */}
      {activeDialogue && (
        <div className="absolute inset-x-2 bottom-2 z-50 bg-stone-900/98 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-fade-in space-y-3 max-h-[75vh] overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-amber-400 flex-shrink-0"
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
              className="text-stone-400 hover:text-stone-200 p-1.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="font-serif text-sm md:text-base text-stone-100 leading-relaxed italic bg-stone-950 p-3 rounded-xl border border-stone-800">
            "{activeDialogue.text}"
          </p>

          <div className="space-y-2 pt-1">
            {activeDialogue.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDialogueOption(opt)}
                className="w-full text-left p-3 rounded-xl bg-stone-950 hover:bg-amber-950 active:bg-amber-800 border border-stone-800 hover:border-amber-400 text-amber-100 text-xs font-serif transition flex flex-col gap-0.5 shadow active:scale-98"
              >
                <span className="font-bold text-amber-300">
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

      {/* FULL MAP MODAL OVERLAY (Mobile-Optimized) */}
      {showFullMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stonebg-950/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-stonebg-900 border-2 border-amber-500 rounded-2xl max-w-2xl w-full p-4 md:p-6 shadow-2xl space-y-3 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-amber-900 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base md:text-lg text-amber-200">
                  Planta: {worldData.name}
                </h3>
              </div>
              <button
                onClick={() => setShowFullMap(false)}
                className="text-stone-400 hover:text-amber-200 p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-64 md:h-80 bg-stone-950 rounded-xl border border-stone-800 p-3 overflow-hidden">
              <div className="absolute inset-3 border-2 border-stone-700 rounded-lg">
                
                {/* Upper Balcony */}
                <div className="absolute top-2 left-1/4 right-1/4 h-10 bg-stone-800 border-2 border-amber-500/80 flex items-center justify-center text-[9px] font-serif text-amber-300 font-bold text-center px-1">
                  Jesus Cristo (Nimbo Cruciforme)
                </div>

                {/* Central Brazier */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-950 border-2 border-orange-500 flex items-center justify-center text-[8px] font-serif text-orange-200 text-center font-bold shadow-lg">
                  Fogo
                </div>

                {/* Lower Entry Gate */}
                <div className="absolute bottom-0 left-1/3 right-1/3 h-6 bg-amber-950 border-t-2 border-dashed border-amber-400 flex items-center justify-center text-[9px] font-serif text-amber-200 font-bold">
                  Portão
                </div>

                {/* Player Indicator */}
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
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-[8px] font-serif flex flex-col items-center"
                    style={{
                      left: `${(n.x / worldData.width) * 100}%`,
                      top: `${(n.y / worldData.height) * 100}%`,
                    }}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${n.role.includes('Guarda') ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
                    <span className="text-stone-300 text-[8px] whitespace-nowrap hidden sm:inline">{n.name}</span>
                  </div>
                ))}

              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-300 pt-1">
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Você (Pedro)
                </span>
                <span className="flex items-center gap-1 text-yellow-300">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Pessoas
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Guardas
                </span>
              </div>
              <button
                onClick={() => setShowFullMap(false)}
                className="w-full sm:w-auto bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif py-2 px-5 rounded-lg border border-amber-500 transition text-center"
              >
                Voltar ao Jogo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
