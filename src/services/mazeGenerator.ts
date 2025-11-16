// Maze generation service using recursive backtracking algorithm

import type { MazeGrid, MazeTile, Coordinate } from '../types/game.types';
import { TileType, TileState } from '../types/game.types';

interface Direction {
  dx: number;
  dy: number;
}

const DIRECTIONS: Direction[] = [
  { dx: 0, dy: -1 }, // Up
  { dx: 1, dy: 0 },  // Right
  { dx: 0, dy: 1 },  // Down
  { dx: -1, dy: 0 }, // Left
];

/**
 * Shuffle array in place using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Recursive backtracking algorithm to carve paths through the maze
 */
function carveMaze(
  x: number,
  y: number,
  maze: number[][],
  width: number,
  height: number
): void {
  const directions = shuffleArray(DIRECTIONS);

  for (const { dx, dy } of directions) {
    const nx = x + dx * 2;
    const ny = y + dy * 2;

    // Check if the new position is within bounds and unvisited
    if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 1) {
      // Carve path to new cell
      maze[ny][nx] = 0;
      // Carve path between cells
      maze[y + dy][x + dx] = 0;
      // Recursively carve from new cell
      carveMaze(nx, ny, maze, width, height);
    }
  }
}

/**
 * Generate a perfect maze (one solution path) using recursive backtracking
 */
export function generateMaze(width: number, height: number): MazeGrid {
  // Ensure odd dimensions for proper maze generation
  const mazeWidth = width % 2 === 0 ? width + 1 : width;
  const mazeHeight = height % 2 === 0 ? height + 1 : height;

  // Initialize maze with all walls
  const rawMaze: number[][] = Array(mazeHeight)
    .fill(0)
    .map(() => Array(mazeWidth).fill(1));

  // Start carving from position (1, 1)
  rawMaze[1][1] = 0;
  carveMaze(1, 1, rawMaze, mazeWidth, mazeHeight);

  // Convert raw maze to MazeTile structure
  const tiles: MazeTile[][] = rawMaze.map((row, y) =>
    row.map((cell, x) => ({
      type: cell === 1 ? TileType.WALL : TileType.PATH,
      state: TileState.UNANSWERED,
      coordinate: { x, y },
    }))
  );

  // Set start and goal positions
  tiles[mazeHeight - 2][mazeWidth - 2] = {
    type: TileType.START,
    coordinate: { x: mazeWidth - 2, y: mazeHeight - 2 },
  };

  tiles[1][1] = {
    type: TileType.GOAL,
    coordinate: { x: 1, y: 1 },
  };

  return {
    width: mazeWidth,
    height: mazeHeight,
    tiles,
  };
}

/**
 * Place quiz tiles strategically in the maze
 */
export function placeQuizTiles(
  maze: MazeGrid,
  questionIds: string[],
  count: number
): MazeGrid {
  const pathTiles: Coordinate[] = [];

  // Find all path tiles (excluding start and goal)
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const tile = maze.tiles[y][x];
      if (tile.type === TileType.PATH) {
        pathTiles.push({ x, y });
      }
    }
  }

  // Shuffle and select tiles for quizzes
  const shuffledPaths = shuffleArray(pathTiles);
  const selectedTiles = shuffledPaths.slice(0, Math.min(count, pathTiles.length));

  // Place quiz tiles
  selectedTiles.forEach((coord, index) => {
    if (index < questionIds.length) {
      maze.tiles[coord.y][coord.x] = {
        type: TileType.QUIZ,
        state: TileState.UNANSWERED,
        questionId: questionIds[index],
        coordinate: coord,
      };
    }
  });

  return maze;
}

/**
 * Find the solution path using A* algorithm (for validation/hints)
 */
export function solveMaze(maze: MazeGrid, start: Coordinate, goal: Coordinate): Coordinate[] {
  const openSet: Array<{ coord: Coordinate; f: number; g: number }> = [];
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, Coordinate>();

  const coordKey = (c: Coordinate) => `${c.x},${c.y}`;
  const heuristic = (a: Coordinate, b: Coordinate) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  openSet.push({ coord: start, f: heuristic(start, goal), g: 0 });

  while (openSet.length > 0) {
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    if (current.coord.x === goal.x && current.coord.y === goal.y) {
      // Reconstruct path
      const path: Coordinate[] = [goal];
      let currentCoord = goal;

      while (coordKey(currentCoord) !== coordKey(start)) {
        const prev = cameFrom.get(coordKey(currentCoord));
        if (!prev) break;
        path.unshift(prev);
        currentCoord = prev;
      }

      return path;
    }

    closedSet.add(coordKey(current.coord));

    // Check neighbors
    for (const { dx, dy } of DIRECTIONS) {
      const neighbor: Coordinate = {
        x: current.coord.x + dx,
        y: current.coord.y + dy,
      };

      // Check bounds
      if (
        neighbor.x < 0 ||
        neighbor.x >= maze.width ||
        neighbor.y < 0 ||
        neighbor.y >= maze.height
      ) {
        continue;
      }

      // Check if walkable
      const tile = maze.tiles[neighbor.y][neighbor.x];
      if (tile.type === TileType.WALL) {
        continue;
      }

      const key = coordKey(neighbor);
      if (closedSet.has(key)) {
        continue;
      }

      const g = current.g + 1;
      const h = heuristic(neighbor, goal);
      const f = g + h;

      const existing = openSet.find((n) => coordKey(n.coord) === key);
      if (!existing || g < existing.g) {
        if (existing) {
          existing.g = g;
          existing.f = f;
        } else {
          openSet.push({ coord: neighbor, f, g });
        }
        cameFrom.set(key, current.coord);
      }
    }
  }

  // No solution found
  return [];
}

/**
 * Validate that the maze is solvable
 */
export function validateMaze(maze: MazeGrid): boolean {
  const start = { x: maze.width - 2, y: maze.height - 2 };
  const goal = { x: 1, y: 1 };
  const solution = solveMaze(maze, start, goal);
  return solution.length > 0;
}

/**
 * Generate a topic selection maze - SIMPLE CROSS DESIGN
 * 4 cardinal directions + 2 L-shaped paths for ML topics
 */
export function generateTopicSelectionMaze(
  topics: Array<{ id: string; name: string; icon: string; color: string }>
): MazeGrid {
  const width = 41;
  const height = 31;
  
  // Initialize with all walls
  const tiles: MazeTile[][] = Array(height)
    .fill(0)
    .map((_, y) =>
      Array(width)
        .fill(0)
        .map((_, x) => ({
          type: TileType.WALL,
          coordinate: { x, y },
        }))
    );
  
  const centerX = 20;
  const centerY = 15;
  
  // Helper to create rectangular path
  const makePath = (startX: number, startY: number, endX: number, endY: number, thickness: number = 3) => {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        // Add thickness
        for (let ty = -Math.floor((thickness-1)/2); ty <= Math.floor(thickness/2); ty++) {
          for (let tx = -Math.floor((thickness-1)/2); tx <= Math.floor(thickness/2); tx++) {
            const px = x + tx;
            const py = y + ty;
            if (px > 0 && px < width - 1 && py > 0 && py < height - 1) {
              tiles[py][px] = {
                type: TileType.PATH,
                coordinate: { x: px, y: py },
              };
            }
          }
        }
      }
    }
  };
  
  // Create central hub (5x5)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      tiles[centerY + dy][centerX + dx] = {
        type: TileType.PATH,
        coordinate: { x: centerX + dx, y: centerY + dy },
      };
    }
  }
  
  // PATH 1: UP (Science) 🔬
  makePath(centerX, centerY - 2, centerX, 3, 3);
  const ep1 = { x: centerX, y: 3 };
  
  // PATH 2: RIGHT (Math) 📐
  makePath(centerX + 2, centerY, width - 4, centerY, 3);
  const ep2 = { x: width - 4, y: centerY };
  
  // PATH 3: DOWN (Geography) 🌍
  makePath(centerX, centerY + 2, centerX, height - 4, 3);
  const ep3 = { x: centerX, y: height - 4 };
  
  // PATH 4: LEFT (Literature) 📚
  makePath(3, centerY, centerX - 2, centerY, 3);
  const ep4 = { x: 3, y: centerY };
  
  // PATH 5: UP+RIGHT (Programming) 💻
  // Vertical part from center up
  makePath(centerX + 4, centerY, centerX + 4, centerY - 8,  3);
  // Horizontal part going right
  makePath(centerX + 4, centerY - 8, centerX + 14, centerY - 8, 3);
  const ep5 = { x: centerX + 14, y: centerY - 8 };
  
  // PATH 6: DOWN+LEFT (History) 📜
  // Vertical part from center down
  makePath(centerX - 4, centerY, centerX - 4, centerY + 8, 3);
  // Horizontal part going left
  makePath(3, centerY + 8, centerX - 4, centerY + 8, 3);
  const ep6 = { x: 3, y: centerY + 8 };
  
  // Place endpoints
  const endpoints = [ep1, ep2, ep3, ep4, ep5, ep6];
  
  endpoints.forEach((ep, i) => {
    if (i < topics.length) {
      tiles[ep.y][ep.x] = {
        type: TileType.STREAM_ENDPOINT,
        coordinate: { x: ep.x, y: ep.y },
        streamId: topics[i].id,
        label: `${topics[i].icon} ${topics[i].name}`,
      };
    }
  });
  
  // Player start at center
  tiles[centerY][centerX] = {
    type: TileType.START,
    coordinate: { x: centerX, y: centerY },
  };
  
  return { width, height, tiles };
}

/**
 * Generate a level progression maze with checkpoints for difficulties
 */
export function generateLevelProgressionMaze(
  streamId: string,
  unlockedLevels: { easy: boolean; medium: boolean; hard: boolean }
): MazeGrid {
  // Create a linear maze for level progression
  const width = 25;
  const height = 13;
  
  // Create a simple corridor-style maze
  const tiles: MazeTile[][] = Array(height)
    .fill(0)
    .map((_, y) =>
      Array(width)
        .fill(0)
        .map((_, x) => ({
          type: TileType.WALL,
          coordinate: { x, y },
        }))
    );
  
  // Create a main path through the middle
  const pathY = Math.floor(height / 2);
  for (let x = 1; x < width - 1; x++) {
    tiles[pathY][x] = {
      type: TileType.PATH,
      coordinate: { x, y: pathY },
    };
    // Add some vertical space
    if (pathY > 0) {
      tiles[pathY - 1][x] = {
        type: TileType.PATH,
        coordinate: { x, y: pathY - 1 },
      };
    }
    if (pathY < height - 1) {
      tiles[pathY + 1][x] = {
        type: TileType.PATH,
        coordinate: { x, y: pathY + 1 },
      };
    }
  }
  
  // Set start position (left side)
  const startX = 2;
  tiles[pathY][startX] = {
    type: TileType.START,
    coordinate: { x: startX, y: pathY },
  };
  
  // Position checkpoints along the path
  const checkpoint1X = 7;
  const checkpoint2X = 13;
  const checkpoint3X = 19;
  
  // Checkpoint 1 - Easy (always unlocked)
  tiles[pathY][checkpoint1X] = {
    type: TileType.LEVEL_CHECKPOINT,
    coordinate: { x: checkpoint1X, y: pathY },
    difficulty: 'easy',
    streamId,
    isLocked: false,
    label: '1️⃣ Easy',
  };
  
  // Checkpoint 2 - Medium
  tiles[pathY][checkpoint2X] = {
    type: unlockedLevels.medium ? TileType.LEVEL_CHECKPOINT : TileType.LOCKED_CHECKPOINT,
    coordinate: { x: checkpoint2X, y: pathY },
    difficulty: 'medium',
    streamId,
    isLocked: !unlockedLevels.medium,
    label: '2️⃣ Medium',
  };
  
  // Checkpoint 3 - Hard
  tiles[pathY][checkpoint3X] = {
    type: unlockedLevels.hard ? TileType.LEVEL_CHECKPOINT : TileType.LOCKED_CHECKPOINT,
    coordinate: { x: checkpoint3X, y: pathY },
    difficulty: 'hard',
    streamId,
    isLocked: !unlockedLevels.hard,
    label: '3️⃣ Hard',
  };
  
  // Add a finish/exit at the end
  tiles[pathY][width - 2] = {
    type: TileType.GOAL,
    coordinate: { x: width - 2, y: pathY },
    label: '🏁 Complete',
  };
  
  return {
    width,
    height,
    tiles,
  };
}
