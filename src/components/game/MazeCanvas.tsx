// Main maze rendering component using Canvas

import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { GAME_CONFIG, TILE_COLORS, PATH } from '../../utils/constants';
import { TileType } from '../../types/game.types';

export function MazeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { maze, player, fog, path } = useGameStore();

  // Resize canvas to fill container
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = Math.min(container.clientWidth, 1200); // Max width
          canvasRef.current.height = Math.min(container.clientHeight || 600, 800); // Max height
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !maze) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#111827'; // gray-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tileSize = GAME_CONFIG.tileSize;

    // Calculate visible area around player
    const viewportTilesX = Math.floor(canvas.width / tileSize);
    const viewportTilesY = Math.floor(canvas.height / tileSize);
    const centerX = Math.floor(viewportTilesX / 2);
    const centerY = Math.floor(viewportTilesY / 2);

    const startX = Math.max(0, player.position.x - centerX);
    const startY = Math.max(0, player.position.y - centerY);
    const endX = Math.min(maze.width, startX + viewportTilesX);
    const endY = Math.min(maze.height, startY + viewportTilesY);

    // Draw tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const screenX = (x - startX) * tileSize;
        const screenY = (y - startY) * tileSize;
        const tile = maze.tiles[y][x];
        const key = `${x},${y}`;

        // Determine tile color
        let color = TILE_COLORS.WALL;
        switch (tile.type) {
          case TileType.WALL:
            color = TILE_COLORS.WALL;
            break;
          case TileType.PATH:
            color = TILE_COLORS.PATH;
            break;
          case TileType.QUIZ:
            // Use new isAnswered property
            if (tile.isAnswered && tile.answeredCorrectly) {
              color = TILE_COLORS.QUIZ_CORRECT;
            } else if (tile.isAnswered && !tile.answeredCorrectly) {
              color = TILE_COLORS.QUIZ_INCORRECT;
            } else {
              color = TILE_COLORS.QUIZ;
            }
            break;
          case TileType.START:
            color = TILE_COLORS.START;
            break;
          case TileType.GOAL:
            color = TILE_COLORS.GOAL;
            break;
          case TileType.STREAM_ENDPOINT:
            color = '#8b5cf6'; // purple
            break;
          case TileType.LEVEL_CHECKPOINT:
            color = '#10b981'; // green - unlocked
            break;
          case TileType.LOCKED_CHECKPOINT:
            color = '#6b7280'; // gray - locked
            break;
        }

        // Draw tile
        ctx.fillStyle = color;
        ctx.fillRect(screenX, screenY, tileSize, tileSize);

        // Draw grid lines
        ctx.strokeStyle = '#1f2937';
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);

        // Draw fog of war
        if (!fog.revealedTiles.has(key)) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        } else {
          const opacity = fog.fogOpacity[key] || 0;
          if (opacity > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
          }
          
          // Draw quiz tile icons (only if revealed and fog is clear)
          if (tile.type === TileType.QUIZ && opacity < 0.3) {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (tile.isAnswered) {
              // Draw checkmark or X
              const icon = tile.answeredCorrectly ? '✓' : '✗';
              ctx.fillText(icon, screenX + tileSize / 2, screenY + tileSize / 2);
            } else {
              // Draw question mark
              ctx.fillText('?', screenX + tileSize / 2, screenY + tileSize / 2);
            }
            ctx.restore();
          }
          
          // Draw lock/unlock icon on goal tile (only if revealed)
          if (tile.type === TileType.GOAL && opacity < 0.3) {
            ctx.save();
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const requiredKeys = 3;
            const hasEnoughKeys = player.keysCollected >= requiredKeys;
            
            if (hasEnoughKeys) {
              // Unlocked - show open lock or checkmark
              ctx.fillStyle = '#10b981'; // green
              ctx.fillText('🔓', screenX + tileSize / 2, screenY + tileSize / 2);
            } else {
              // Locked - show closed lock
              ctx.fillStyle = '#ffffff';
              ctx.fillText('🔒', screenX + tileSize / 2, screenY + tileSize / 2);
              
              // Show required keys text
              ctx.font = 'bold 14px sans-serif';
              ctx.fillStyle = '#fbbf24'; // yellow
              ctx.fillText(`${player.keysCollected}/${requiredKeys}`, screenX + tileSize / 2, screenY + tileSize - 8);
            }
            ctx.restore();
          }
          
          // Draw stream endpoint labels
          if (tile.type === TileType.STREAM_ENDPOINT && opacity < 0.3) {
            ctx.save();
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            
            // Extract icon from label (first emoji)
            const icon = tile.label?.split(' ')[0] || '📚';
            ctx.fillText(icon, screenX + tileSize / 2, screenY + tileSize / 2);
            ctx.restore();
          }
          
          // Draw checkpoint labels
          if ((tile.type === TileType.LEVEL_CHECKPOINT || tile.type === TileType.LOCKED_CHECKPOINT) && opacity < 0.3) {
            ctx.save();
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (tile.isLocked) {
              // Locked checkpoint
              ctx.fillStyle = '#ffffff';
              ctx.fillText('🔒', screenX + tileSize / 2, screenY + tileSize / 2);
              
              // Show label below
              ctx.font = 'bold 12px sans-serif';
              ctx.fillStyle = '#9ca3af'; // gray
              const labelText = tile.label?.split(' ')[1] || tile.difficulty || '';
              ctx.fillText(labelText, screenX + tileSize / 2, screenY + tileSize - 6);
            } else {
              // Unlocked checkpoint
              ctx.fillStyle = '#ffffff';
              const icon = tile.label?.split(' ')[0] || '✓';
              ctx.fillText(icon, screenX + tileSize / 2, screenY + tileSize / 2);
              
              // Show label below
              ctx.font = 'bold 12px sans-serif';
              ctx.fillStyle = '#d1fae5'; // light green
              const labelText = tile.label?.split(' ')[1] || tile.difficulty || '';
              ctx.fillText(labelText, screenX + tileSize / 2, screenY + tileSize - 6);
            }
            ctx.restore();
          }
        }
      }
    }

    // Draw path memory trail
    if (path.visitedPath.length > 1) {
      ctx.strokeStyle = PATH.TRAIL_COLOR;
      ctx.lineWidth = PATH.TRAIL_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const firstPoint = path.visitedPath[0];
      const firstScreenX = (firstPoint.x - startX) * tileSize + tileSize / 2;
      const firstScreenY = (firstPoint.y - startY) * tileSize + tileSize / 2;
      ctx.moveTo(firstScreenX, firstScreenY);

      for (let i = 1; i < path.visitedPath.length; i++) {
        const point = path.visitedPath[i];
        const screenX = (point.x - startX) * tileSize + tileSize / 2;
        const screenY = (point.y - startY) * tileSize + tileSize / 2;
        ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();
    }

    // Draw player
    const playerScreenX = (player.position.x - startX) * tileSize;
    const playerScreenY = (player.position.y - startY) * tileSize;
    const playerSize = tileSize * 0.7;

    ctx.fillStyle = '#3b82f6'; // blue-500
    ctx.beginPath();
    ctx.arc(
      playerScreenX + tileSize / 2,
      playerScreenY + tileSize / 2,
      playerSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw player direction indicator
    ctx.fillStyle = '#60a5fa'; // blue-400
    const indicatorSize = playerSize / 4;
    let indicatorX = playerScreenX + tileSize / 2;
    let indicatorY = playerScreenY + tileSize / 2;

    switch (player.direction) {
      case 'up':
        indicatorY -= playerSize / 3;
        break;
      case 'down':
        indicatorY += playerSize / 3;
        break;
      case 'left':
        indicatorX -= playerSize / 3;
        break;
      case 'right':
        indicatorX += playerSize / 3;
        break;
    }

    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorSize, 0, Math.PI * 2);
    ctx.fill();
  }, [maze, player, fog, path]);

  if (!maze) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading maze...</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border-2 border-gray-700 rounded-lg"
    />
  );
}
