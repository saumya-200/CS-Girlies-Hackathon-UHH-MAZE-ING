// src/components/game/MiniMap.tsx
/**
 * Mini-map component - Shows revealed areas and player position
 */

import { useGameStore } from "../../stores/gameStore";
import { TileType } from "../../types/game.types";

interface MiniMapProps {
  size?: number;
}

export function MiniMap({ size = 150 }: MiniMapProps) {
  const { maze, player, fog, path } = useGameStore();

  if (!maze || !maze.tiles) return null;

  const mazeHeight = maze.height;
  const mazeWidth = maze.width;

  const cellSize = Math.floor(size / Math.max(mazeWidth, mazeHeight));
  const actualWidth = mazeWidth * cellSize;
  const actualHeight = mazeHeight * cellSize;

  return (
    <div
      className="
        bg-white 
        border-4 border-black 
        rounded-xl 
        p-2 
        shadow-2xl
      "
      style={{ width: actualWidth + 16, height: actualHeight + 32 }}
    >
      <div className="text-xs font-bold text-[#ff008c] mb-1 text-center tracking-wide pixel-text">
        MAP
      </div>

      <svg
        width={actualWidth}
        height={actualHeight}
        className="border-2 border-black rounded bg-black"
      >
        {maze.tiles.map((row, y) =>
          row.map((tile, x) => {
            const key = `${x},${y}`;
            const isRevealed = fog.revealedTiles.has(key);
            const isVisited = path.visitedTiles.has(key);
            const isPlayer =
              player.position.x === x && player.position.y === y;

            if (!isRevealed) {
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#020617"
                />
              );
            }

            let fill = "#1f2937";

            if (tile.type === TileType.WALL) {
              fill = "#0f172a";
            } else if (tile.type === TileType.PATH) {
              fill = "#16a34a";
            } else if (tile.type === TileType.GOAL) {
              fill = "#fbbf24";
            } else if (tile.type === TileType.QUIZ) {
              if (tile.isAnswered) {
                fill = tile.answeredCorrectly ? "#10b981" : "#ef4444";
              } else {
                fill = "#f97316";
              }
            } else if (isVisited) {
              fill = "#6b7280";
            } else {
              fill = "#4b5563";
            }

            if (isPlayer) {
              fill = "#22d3ee";
            }

            return (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill={fill}
                stroke={isPlayer ? "#06b6d4" : "none"}
                strokeWidth={isPlayer ? 1 : 0}
              >
                {isPlayer && (
                  <animate
                    attributeName="opacity"
                    values="1;0.4;1"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </rect>
            );
          })
        )}

        {/* Player pulse */}
        <circle
          cx={player.position.x * cellSize + cellSize / 2}
          cy={player.position.y * cellSize + cellSize / 2}
          r={cellSize * 0.4}
          fill="#22d3ee"
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values={`${cellSize * 0.25};${cellSize * 0.5};${cellSize * 0.25}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Legend */}
      <div className="mt-1 text-[8px] text-gray-900 space-y-0.5 pixel-text">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-sm" />
          <span>Quiz</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-sm" />
          <span>Goal</span>
        </div>
      </div>
    </div>
  );
}
