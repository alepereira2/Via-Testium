import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapWorldData, CharacterEntity, Vector2D, FacingDirection, DialogueNode } from '../game/types';
import { soundEngine } from '../audio/soundEngine';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Heart, 
  Eye, 
  Maximize2, 
  Volume2, 
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Hand
} from 'lucide-react';

interface ThirdPersonCanvasProps {
  worldData: MapWorldData;
  playerRole: string;
  playerName: string;
  playerColor: string;
  playerRobeColor: string;
  playerCloakColor: string;
  hasBeard?: boolean;
  onDenialEvent?: (denialNumber: number) => void;
  onRoosterEvent?: () => void;
  onEscapeEvent?: () => void;
  tensionBpm: number;
  setTensionBpm: React.Dispatch<React.SetStateAction<number>>;
}

export const ThirdPersonCanvas: React.FC<ThirdPersonCanvasProps> = ({
  worldData,
  playerRole,
  playerName,
  playerColor,
  playerRobeColor,
  playerCloakColor,
  hasBeard = true,
  onDenialEvent,
  onRoosterEvent,
  onEscapeEvent,
  tensionBpm,
  setTensionBpm
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game State
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
    radius: 16,
    speed: 3.2,
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
      // Warming hands heals / stabilizes tension
      setTensionBpm((prev) => Math.max(75, prev - 10));
      // Trigger servant girl approaching if denial 1 not completed
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

    // Handle special narrative triggers
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

      // 1. Update flame flicker oscillation
      setFlameFlicker(0.92 + Math.sin(currentTime * 0.008) * 0.08 + Math.random() * 0.04);

      // 2. Compute Player Movement
      let moveX = 0;
      let moveY = 0;

      if (!activeDialogue) {
        if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) moveY -= 1;
        if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) moveY += 1;
        if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) moveX -= 1;
        if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) moveX += 1;

        // Apply touch joystick movement if present
        if (touchMovement.current.x !== 0 || touchMovement.current.y !== 0) {
          moveX = touchMovement.current.x;
          moveY = touchMovement.current.y;
        }
      }

      const isSneaking = !!(keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight']);
      const currentSpeed = isSneaking ? 1.8 : 3.2;

      let isMoving = false;
      let newFacing = player.facing;

      if (moveX !== 0 || moveY !== 0) {
        isMoving = true;
        // Normalize diagonal speed
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        const normX = (moveX / length) * currentSpeed;
        const normY = (moveY / length) * currentSpeed;

        // Update Facing direction
        if (Math.abs(moveX) > Math.abs(moveY)) {
          newFacing = moveX > 0 ? 'right' : 'left';
        } else {
          newFacing = moveY > 0 ? 'down' : 'up';
        }

        // Collision Check & Resolution (Sliding along walls)
        let nextX = player.x + normX;
        let nextY = player.y + normY;

        // Check horizontal movement collision
        const collidesH = checkCollision(nextX, player.y, player.radius);
        if (!collidesH) {
          player.x = nextX;
        }

        // Check vertical movement collision
        const collidesV = checkCollision(player.x, nextY, player.radius);
        if (!collidesV) {
          player.y = nextY;
        }

        // Walk cycle increment
        player.walkCycle = (player.walkCycle + dt * 10) % (Math.PI * 2);
      }

      player.isMoving = isMoving;
      player.facing = newFacing;
      player.isSneaking = isSneaking;

      // 3. Update NPC Patrols & Barks
      npcs.forEach((npc) => {
        if (npc.isPatrolling && npc.patrolPoints && npc.patrolPoints.length > 1) {
          const target = npc.patrolPoints[npc.currentPatrolIndex || 0];
          const dx = target.x - npc.x;
          const dy = target.y - npc.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 4) {
            // Next patrol point
            npc.currentPatrolIndex = ((npc.currentPatrolIndex || 0) + 1) % npc.patrolPoints.length;
          } else {
            const step = (npc.speed * dt * 40);
            npc.x += (dx / dist) * Math.min(step, dist);
            npc.y += (dy / dist) * Math.min(step, dist);

            // Update facing
            if (Math.abs(dx) > Math.abs(dy)) {
              npc.facing = dx > 0 ? 'right' : 'left';
            } else {
              npc.facing = dy > 0 ? 'down' : 'up';
            }
          }
        }
      });

      // 4. Check Nearest Interactable & Stealth Vision Cones
      let closestInteractable: {
        name: string;
        actionPrompt: string;
        entity: CharacterEntity | null;
      } | null = null;
      let minDistance = 75;

      // Check NPCs
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

        // Check vision cone alert
        if (npc.detectionRadius && dist < npc.detectionRadius) {
          // If player is running near guards, pulse heartbeat faster
          if (isMoving && !isSneaking && npc.role.includes('Guarda')) {
            setTensionBpm((bpm) => Math.min(160, bpm + 0.1));
          }
        }
      });

      // Check Brazier
      const brazier = worldData.props.find((p) => p.id === 'brazier_central');
      if (brazier) {
        const dx = (brazier.x + brazier.width / 2) - player.x;
        const dy = (brazier.y + brazier.height / 2) - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist < minDistance) {
          minDistance = dist;
          closestInteractable = {
            name: 'Braseiro de Carvão',
            actionPrompt: 'Aquecer as mãos no braseiro [E]',
            entity: null,
          };
        }
      }

      // Check Exit Gate
      const gate = worldData.props.find((p) => p.id === 'entry_gate');
      if (gate) {
        const dx = (gate.x + gate.width / 2) - player.x;
        const dy = (gate.y + gate.height / 2) - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 && dist < minDistance) {
          minDistance = dist;
          closestInteractable = {
            name: 'Portão de Saída',
            actionPrompt: 'Sair para o sepulcro [E]',
            entity: null,
          };
        }
      }

      setNearestInteractable(closestInteractable);

      // 5. Render Canvas Frame
      renderScene();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [player, npcs, activeDialogue, worldData]);

  // Circle vs Rect Collision Function
  const checkCollision = (cx: number, cy: number, cradius: number): boolean => {
    // 1. Boundary check
    if (
      cx - cradius < worldData.cameraBounds.minX + 50 ||
      cx + cradius > worldData.cameraBounds.maxX - 50 ||
      cy - cradius < worldData.cameraBounds.minY + 50 ||
      cy + cradius > worldData.cameraBounds.maxY - 50
    ) {
      return true;
    }

    // 2. Wall Rectangles
    for (const wall of worldData.walls) {
      const closestX = Math.max(wall.x, Math.min(cx, wall.x + wall.width));
      const closestY = Math.max(wall.y, Math.min(cy, wall.y + wall.height));
      const distanceX = cx - closestX;
      const distanceY = cy - closestY;
      if (distanceX * distanceX + distanceY * distanceY < cradius * cradius) {
        return true;
      }
    }

    // 3. Solid Props
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

  // Rendering Function
  const renderScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewportW = canvas.width;
    const viewportH = canvas.height;

    // Smooth Camera Follow Lerp
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

    // Apply Camera translation
    ctx.translate(-camX, -camY);

    // 1. Draw Courtyard Stone Paver Floor (Jerusalem Flagstones)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, worldData.width, worldData.height);

    // Detailed Stone Tiles Pattern
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1.5;
    const tileSize = 60;
    for (let x = 0; x < worldData.width; x += tileSize) {
      for (let y = 0; y < worldData.height; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
        // Subtle crack texture
        if ((x + y) % 180 === 0) {
          ctx.beginPath();
          ctx.moveTo(x + 10, y + 15);
          ctx.lineTo(x + 35, y + 40);
          ctx.strokeStyle = '#181514';
          ctx.stroke();
        }
      }
    }

    // 2. Draw Walls & Colonnades
    worldData.walls.forEach((w) => {
      // Wall Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(w.x + 8, w.y + 8, w.width, w.height);

      // Limestone Wall Face
      const wallGrad = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.height);
      wallGrad.addColorStop(0, '#57534e');
      wallGrad.addColorStop(1, '#292524');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(w.x, w.y, w.width, w.height);

      // Border highlight
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x, w.y, w.width, w.height);
    });

    // 3. Draw Props (Brazier, Benches, Upper Loggia)
    worldData.props.forEach((prop) => {
      if (prop.type === 'brazier') {
        // Brazier Tripod Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(prop.x + 22, prop.y + 36, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bronze Brazier Bowl
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.arc(prop.x + 22, prop.y + 22, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glowing Embers
        const emberGrad = ctx.createRadialGradient(
          prop.x + 22,
          prop.y + 22,
          2,
          prop.x + 22,
          prop.y + 22,
          18
        );
        emberGrad.addColorStop(0, '#fffbeb');
        emberGrad.addColorStop(0.3, '#f59e0b');
        emberGrad.addColorStop(0.8, '#b45309');
        emberGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.arc(prop.x + 22, prop.y + 22, 16, 0, Math.PI * 2);
        ctx.fill();
      } else if (prop.type === 'bench') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(prop.x + 4, prop.y + 6, prop.width, prop.height);
        ctx.fillStyle = '#44403c';
        ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
        ctx.strokeStyle = '#6b7280';
        ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
      } else if (prop.type === 'gate') {
        // Exit Archway
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
        ctx.setLineDash([]);
      }
    });

    // 4. Draw NPCs
    npcs.forEach((npc) => {
      drawCharacter(ctx, npc.x, npc.y, npc.facing, npc.color, npc.robeColor, npc.cloakColor, npc.hasBeard, npc.hasSpear);

      // Name & Role Tag above NPC
      ctx.font = 'bold 11px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde68a';
      ctx.fillText(npc.name, npc.x, npc.y - 28);

      // Idle Bark Speech Bubble if active
      if (npc.barkText) {
        ctx.font = 'italic 10px Inter, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(npc.barkText, npc.x, npc.y - 42);
      }
    });

    // 5. Draw Player Character (Pedro)
    drawCharacter(
      ctx,
      player.x,
      player.y,
      player.facing,
      playerColor,
      playerRobeColor,
      playerCloakColor,
      hasBeard,
      false,
      player.isMoving,
      player.walkCycle
    );

    // Player Marker Tag
    ctx.font = 'bold 12px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(`${playerName} (Você)`, player.x, player.y - 32);

    // 6. Dynamic Darkness & Lighting Mask
    // Create an offscreen darkness layer with cutouts for fires
    ctx.save();
    ctx.fillStyle = worldData.ambientLight;
    ctx.fillRect(0, 0, worldData.width, worldData.height);

    // Cut out light radii with 'destination-out'
    ctx.globalCompositeOperation = 'destination-out';

    // Central Brazier Warm Radial Light
    const brazier = worldData.props.find((p) => p.id === 'brazier_central');
    if (brazier && brazier.lightRadius) {
      const radius = brazier.lightRadius * flameFlicker;
      const bRad = ctx.createRadialGradient(
        brazier.x + 22,
        brazier.y + 22,
        10,
        brazier.x + 22,
        brazier.y + 22,
        radius
      );
      bRad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      bRad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
      bRad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bRad;
      ctx.beginPath();
      ctx.arc(brazier.x + 22, brazier.y + 22, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Torches light cutouts
    worldData.props.filter((p) => p.type === 'brazier' && p.id !== 'brazier_central').forEach((t) => {
      const radius = (t.lightRadius || 120) * flameFlicker;
      const grad = ctx.createRadialGradient(t.x + 10, t.y + 10, 5, t.x + 10, t.y + 10, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(t.x + 10, t.y + 10, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player subtle ambient aura
    const pGrad = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, 65);
    pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore darkness composite

    // 7. Interactive Prompt Pill (Floating in World)
    if (nearestInteractable) {
      let targetX = player.x;
      let targetY = player.y - 56;

      if (nearestInteractable.entity) {
        targetX = nearestInteractable.entity.x;
        targetY = nearestInteractable.entity.y - 56;
      }

      ctx.font = 'bold 12px Cinzel, serif';
      const promptWidth = ctx.measureText(nearestInteractable.actionPrompt).width + 24;

      ctx.fillStyle = 'rgba(12, 10, 9, 0.9)';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(targetX - promptWidth / 2, targetY - 14, promptWidth, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.fillText(nearestInteractable.actionPrompt, targetX, targetY + 4);
    }

    ctx.restore(); // Restore camera translation
  };

  // Helper: Draw Procedural Animated 3rd-Person Sprite
  const drawCharacter = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: FacingDirection,
    skinColor: string,
    robeColor: string,
    cloakColor: string = '#78350f',
    beard: boolean = false,
    spear: boolean = false,
    isMoving: boolean = false,
    walkCycle: number = 0
  ) => {
    ctx.save();

    // 1. Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 14, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Animated Feet (Walking Cycle)
    const legOffset = isMoving ? Math.sin(walkCycle) * 6 : 0;
    ctx.fillStyle = '#451a03'; // Leather sandals
    ctx.fillRect(x - 8, y + 10 + legOffset, 6, 6);
    ctx.fillRect(x + 2, y + 10 - legOffset, 6, 6);

    // 3. Tunic Body
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.roundRect(x - 12, y - 10, 24, 22, 5);
    ctx.fill();

    // Cloak over shoulder
    ctx.fillStyle = cloakColor;
    ctx.beginPath();
    ctx.arc(x - 4, y, 10, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(x, y - 14, 10, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Beard
    if (beard) {
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.arc(x, y - 12, 11, 0, Math.PI);
      ctx.fill();
    }

    // Directional Eyes
    ctx.fillStyle = '#1c1917';
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    if (facing === 'left') eyeOffsetX = -3;
    if (facing === 'right') eyeOffsetX = 3;
    if (facing === 'up') eyeOffsetY = -2;
    if (facing === 'down') eyeOffsetY = 2;

    if (facing !== 'up') {
      ctx.fillRect(x - 4 + eyeOffsetX, y - 16 + eyeOffsetY, 2.5, 2.5);
      ctx.fillRect(x + 2 + eyeOffsetX, y - 16 + eyeOffsetY, 2.5, 2.5);
    }

    // Spear Prop
    if (spear) {
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 16);
      ctx.lineTo(x + 14, y - 36);
      ctx.stroke();

      // Spear tip
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(x + 14, y - 44);
      ctx.lineTo(x + 10, y - 36);
      ctx.lineTo(x + 18, y - 36);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  };

  // Virtual Touch Direction Handlers for Mobile/Touch
  const handleTouchDir = (dx: number, dy: number) => {
    touchMovement.current = { x: dx, y: dy };
  };

  const handleTouchStop = () => {
    touchMovement.current = { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-900/60 shadow-2xl bg-stonebg-950 select-none">
      
      {/* Top HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        
        {/* Location & Year Badge */}
        <div className="bg-stone-950/85 backdrop-blur border border-amber-900/50 rounded-xl px-4 py-2 pointer-events-auto flex items-center gap-3 shadow-lg">
          <MapPin className="w-4 h-4 text-amber-400" />
          <div>
            <h4 className="font-serif font-bold text-xs text-amber-100 tracking-wider">
              {worldData.name}
            </h4>
            <p className="text-[10px] text-stone-400 font-serif">
              {worldData.region} • {worldData.year}
            </p>
          </div>
        </div>

        {/* Heartbeat & Tension Indicator */}
        <div className="bg-stone-950/85 backdrop-blur border border-red-900/60 rounded-xl px-4 py-2 pointer-events-auto flex items-center gap-2.5 shadow-lg">
          <Heart className="w-4 h-4 text-red-500 fill-current animate-ping" />
          <div className="flex flex-col">
            <span className="text-[10px] font-serif text-stone-400 uppercase">Tensão Cardíaca</span>
            <span className="font-mono font-bold text-red-300 text-xs">{Math.round(tensionBpm)} BPM</span>
          </div>
        </div>

        {/* Mini-Map Radar (Top Right) */}
        <div
          onClick={() => setShowFullMap(true)}
          className="bg-stone-950/90 backdrop-blur border-2 border-amber-600/70 rounded-xl p-2 pointer-events-auto cursor-pointer hover:border-amber-400 shadow-2xl transition group"
          title="Clique para abrir o Mapa Completo [M]"
        >
          <div className="flex items-center justify-between text-[10px] font-serif text-amber-400 mb-1 px-1">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> Radar
            </span>
            <Maximize2 className="w-3 h-3 text-stone-400 group-hover:text-amber-300" />
          </div>

          {/* Canvas Radar Graphic */}
          <div className="relative w-28 h-20 bg-stone-900/90 rounded border border-stone-800 overflow-hidden">
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
              className="absolute w-2 h-2 rounded-full bg-orange-500 animate-pulse -translate-x-1/2 -translate-y-1/2"
              style={{ left: '46%', top: '50%' }}
            />

            {/* Exit Gate Blip */}
            <div
              className="absolute w-3 h-1 bg-amber-400 -translate-x-1/2"
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
        className="w-full h-[520px] md:h-[560px] object-cover block cursor-crosshair"
      />

      {/* On-Screen Touch D-Pad / Mobile Virtual Controls */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 select-none">
        <div className="grid grid-cols-3 gap-1 bg-stone-950/80 p-2 rounded-2xl border border-stone-800 backdrop-blur">
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
          <div className="w-10 h-10 rounded-lg bg-stone-900/60 flex items-center justify-center text-[10px] font-mono text-stone-500">
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
            className="h-20 px-5 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 text-amber-100 font-serif font-bold text-sm border-2 border-amber-300 shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 animate-pulse"
          >
            <Hand className="w-6 h-6" />
            <span>INTERAGIR [E]</span>
          </button>
        )}
      </div>

      {/* Controls Legend (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center gap-2 bg-stone-950/85 backdrop-blur px-3 py-1.5 rounded-lg border border-stone-800 text-[11px] font-serif text-stone-400">
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">W,A,S,D</kbd> / Setas Mover</span>
        <span>•</span>
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">SHIFT</kbd> Furtividade</span>
        <span>•</span>
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">E / Espaço</kbd> Interagir</span>
        <span>•</span>
        <span><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300">M</kbd> Mapa</span>
      </div>

      {/* DIALOGUE MODAL OVERLAY */}
      {activeDialogue && (
        <div className="absolute bottom-4 left-4 right-4 z-50 bg-stonebg-950/95 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-fade-in space-y-3">
          
          {/* Speaker Header */}
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md border"
                style={{ backgroundColor: activeDialogue.speakerColor, color: '#0c0a09' }}
              >
                {activeDialogue.speaker[0]}
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-amber-100">
                  {activeDialogue.speaker}
                </h4>
                <p className="text-[10px] text-amber-400/80 font-serif italic">
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
          <p className="font-serif text-base text-stone-200 leading-relaxed italic bg-stone-900/50 p-3 rounded-lg border border-stone-800">
            "{activeDialogue.text}"
          </p>

          {/* Choices Options */}
          <div className="space-y-2 pt-1">
            {activeDialogue.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDialogueOption(opt)}
                className="w-full text-left p-3 rounded-xl bg-stone-900 hover:bg-amber-950/70 border border-stone-800 hover:border-amber-500/80 text-amber-100 text-xs font-serif transition flex flex-col gap-0.5 group"
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
              {/* Architectural Layout Render */}
              <div className="absolute inset-4 border-2 border-stone-700 rounded-lg">
                
                {/* Upper Balcony / Sanhedrin Loggia */}
                <div className="absolute top-2 left-1/4 right-1/4 h-12 bg-stone-800 border border-amber-600/60 flex items-center justify-center text-[10px] font-serif text-amber-300 font-bold">
                  Galeria Superior: Jesus perante o Conselho
                </div>

                {/* Central Charcoal Brazier */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-950 border-2 border-orange-500 flex items-center justify-center text-[9px] font-serif text-orange-200 text-center font-bold">
                  Braseiro Central
                </div>

                {/* Lower Entry Gate */}
                <div className="absolute bottom-0 left-1/3 right-1/3 h-6 bg-amber-950 border-t-2 border-dashed border-amber-400 flex items-center justify-center text-[10px] font-serif text-amber-200 font-bold">
                  Portão do Pátio (Saída)
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

            <div className="flex items-center justify-between text-xs text-stone-400 pt-2">
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
