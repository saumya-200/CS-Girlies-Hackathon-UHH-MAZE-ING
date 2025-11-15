/**
 * Mini-map component - Shows revealed areas and player position
 */

import { useGameStore } from '../../stores/gameStore';
import { TileType } from '../../types/game.types';

interface MiniMapProps {
  size?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function MiniMap({ size = 150, position = 'bottom-right' }: MiniMapProps) {
  const { maze, player, fog, path } = useGameStore();
  
  if (!maze || !maze.tiles) return null;
  
  const mazeHeight = maze.height;
  const mazeWidth = maze.width;
  
  // Calculate cell size for mini-map
  const cellSize = Math.floor(size / Math.max(mazeWidth, mazeHeight));
  const actualWidth = mazeWidth * cellSize;
  const actualHeight = mazeHeight * cellSize;
  
  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  };
  
  return (
    <div 
      className={`fixed ${positionClasses[position]} z-30 bg-gray-900/80 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 p-2 shadow-lg`}
      style={{ width: actualWidth + 16, height: actualHeight + 16 }}
    >
      <div className="text-xs text-cyan-400 mb-1 font-bold text-center">Map</div>
      <svg
        width={actualWidth}
        height={actualHeight}
        className="border border-gray-700 rounded"
      >
        {/* Render maze cells */}
        {maze.tiles.map((row, y) =>
          row.map((tile, x) => {
            const key = `${x},${y}`;
            const isRevealed = fog.revealedTiles.has(key);
            const isVisited = path.visitedTiles.has(key);
            const isPlayer = player.position.x === x && player.position.y === y;
            
            // Don't render unrevealed cells
            if (!isRevealed) {
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#1a1a1a"
                />
              );
            }
            
            // Determine cell color
            let fill = '#374151'; // Default gray for walls
            
            if (tile.type === TileType.WALL) {
              fill = '#374151';
            } else if (isPlayer) {
              fill = '#22d3ee'; // Cyan for player
            } else if (tile.type === TileType.GOAL) {
              fill = '#fbbf24'; // Yellow/gold for goal
            } else if (tile.type === TileType.QUIZ) {
              if (tile.isAnswered) {
                fill = tile.answeredCorrectly ? '#10b981' : '#ef4444'; // Green or red
              } else {
                fill = '#f97316'; // Orange for unanswered
              }
            } else if (isVisited) {
              fill = '#6b7280'; // Lighter gray for visited path
            } else {
              fill = '#4b5563'; // Medium gray for revealed but unvisited
            }
            
            return (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill={fill}
                stroke={isPlayer ? '#06b6d4' : 'none'}
                strokeWidth={isPlayer ? 1 : 0}
              >
                {isPlayer && (
                  <animate
                    attributeName="opacity"
                    values="1;0.5;1"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </rect>
            );
          })
        )}
        
        {/* Player indicator (pulsing dot) */}
        <circle
          cx={player.position.x * cellSize + cellSize / 2}
          cy={player.position.y * cellSize + cellSize / 2}
          r={cellSize * 0.4}
          fill="#22d3ee"
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values={`${cellSize * 0.3};${cellSize * 0.5};${cellSize * 0.3}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      
      {/* Legend */}
      <div className="mt-1 text-[8px] text-gray-400 space-y-0.5">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span>You</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
          <span>Quiz</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-sm"></div>
          <span>Goal</span>
        </div>
      </div>
    </div>
  );
}
