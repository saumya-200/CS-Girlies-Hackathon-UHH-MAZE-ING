// Game state management using Zustand

import { create } from 'zustand';
import type { GameState, MazeGrid, Coordinate } from '../types/game.types';
import { TileType } from '../types/game.types';
import { GAME_CONFIG } from '../utils/constants';

interface GameActions {
  // Character operations
  setCharacterName: (name: string) => void;

  // Maze operations
  setMaze: (maze: MazeGrid | null) => void;

  // Player operations
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  setPlayerPosition: (position: Coordinate) => void;
  updateScore: (points: number) => void;
  updateLives: (lives: number) => void;
  loseLife: () => void;
  collectKey: () => void;
  answerQuizTile: (x: number, y: number, correct: boolean) => void;

  // Loading operations
  setLoadingContent: (isLoading: boolean, message?: string) => void;
  setLoadingQuestions: (isLoading: boolean, message?: string) => void;

  // Fog operations
  revealTile: (coord: Coordinate) => void;
  updateFogOpacity: (coord: Coordinate, opacity: number) => void;

  // Path operations
  addToPath: (coord: Coordinate) => void;
  clearPath: () => void;

  // Game flow
  startLevel: (levelId: string) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
}

const initialPlayerState = {
  position: { x: 0, y: 0 },
  direction: 'down' as const,
  currentLevel: 1,
  lives: GAME_CONFIG.initialLives,
  score: 0,
  keysCollected: 0,
};

const initialState: GameState = {
  currentLevelId: '',
  characterName: localStorage.getItem('characterName') || null,
  player: initialPlayerState,
  maze: null,
  fog: {
    revealedTiles: new Set<string>(),
    fogOpacity: {},
  },
  path: {
    visitedPath: [],
    visitedTiles: new Set<string>(),
  },
  loading: {
    isLoadingContent: false,
    isLoadingQuestions: false,
    loadingMessage: '',
  },
  isPaused: false,
  isGameOver: false,
  levelStartTime: Date.now(),
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  // Character operations
  setCharacterName: (name: string) => {
    localStorage.setItem('characterName', name);
    set({ characterName: name });
  },

  // Maze operations
  setMaze: (maze) => set({ maze }),

  // Player operations
  movePlayer: (direction) => {
    const state = get();
    if (!state.maze || state.isPaused || state.isGameOver) return;

    const { position } = state.player;
    const newPosition = { ...position };

    // Calculate new position based on direction
    switch (direction) {
      case 'up':
        newPosition.y -= 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
    }

    // Check bounds
    if (
      newPosition.x < 0 ||
      newPosition.x >= state.maze.width ||
      newPosition.y < 0 ||
      newPosition.y >= state.maze.height
    ) {
      return;
    }

    // Check if tile is walkable (not a wall)
    const tile = state.maze.tiles[newPosition.y][newPosition.x];
    if (tile.type === 'WALL') {
      return;
    }

    // Check if tile is the goal and player has enough keys
    if (tile.type === TileType.GOAL) {
      const requiredKeys = 3; // Require 3 correct answers to win
      if (state.player.keysCollected < requiredKeys) {
        // Don't allow movement to goal yet
        return;
      }
    }

    // Update player position and direction
    set({
      player: {
        ...state.player,
        position: newPosition,
        direction,
      },
    });

    // Reveal tiles around new position
    get().revealTile(newPosition);
    
    // Add to path
    get().addToPath(newPosition);
  },

  setPlayerPosition: (position) =>
    set((state) => ({
      player: { ...state.player, position },
    })),

  updateScore: (points) =>
    set((state) => ({
      player: { ...state.player, score: state.player.score + points },
    })),

  updateLives: (lives) =>
    set((state) => ({
      player: { ...state.player, lives },
      isGameOver: lives <= 0,
    })),

  collectKey: () =>
    set((state) => ({
      player: { ...state.player, keysCollected: state.player.keysCollected + 1 },
    })),

  loseLife: () =>
    set((state) => {
      const newLives = state.player.lives - 1;
      return {
        player: { ...state.player, lives: newLives },
        isGameOver: newLives <= 0,
      };
    }),

  answerQuizTile: (x, y, correct) =>
    set((state) => {
      if (!state.maze) return state;

      const tile = state.maze.tiles[y]?.[x];
      if (!tile || tile.type !== TileType.QUIZ || !tile.questionId) return state;

      // Mark tile as answered
      const updatedTiles = state.maze.tiles.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === y && colIndex === x
            ? { ...cell, isAnswered: true, answeredCorrectly: correct }
            : cell
        )
      );

      return {
        maze: { ...state.maze, tiles: updatedTiles },
      };
    }),

  // Fog operations
  revealTile: (coord) => {
    const state = get();
    const radius = GAME_CONFIG.fogRevealRadius;
    const newRevealed = new Set(state.fog.revealedTiles);
    const newOpacity = { ...state.fog.fogOpacity };

    // Reveal tiles in a circular pattern
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const x = coord.x + dx;
          const y = coord.y + dy;
          const key = `${x},${y}`;
          
          if (x >= 0 && x < (state.maze?.width || 0) &&
              y >= 0 && y < (state.maze?.height || 0)) {
            newRevealed.add(key);
            newOpacity[key] = 0; // Fully revealed
          }
        }
      }
    }

    set({
      fog: {
        revealedTiles: newRevealed,
        fogOpacity: newOpacity,
      },
    });
  },

  updateFogOpacity: (coord, opacity) =>
    set((state) => ({
      fog: {
        ...state.fog,
        fogOpacity: {
          ...state.fog.fogOpacity,
          [`${coord.x},${coord.y}`]: opacity,
        },
      },
    })),

  // Path operations
  addToPath: (coord) =>
    set((state) => {
      const key = `${coord.x},${coord.y}`;
      const newVisitedTiles = new Set(state.path.visitedTiles);
      newVisitedTiles.add(key);

      return {
        path: {
          visitedPath: [...state.path.visitedPath, coord],
          visitedTiles: newVisitedTiles,
        },
      };
    }),

  clearPath: () =>
    set({
      path: {
        visitedPath: [],
        visitedTiles: new Set<string>(),
      },
    }),

  // Game flow
  startLevel: (levelId) =>
    set({
      currentLevelId: levelId,
      levelStartTime: Date.now(),
      isPaused: false,
      isGameOver: false,
    }),

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => set({ isPaused: false }),

  // Loading operations
  setLoadingContent: (isLoading, message = 'Loading content...') =>
    set((state) => ({
      loading: {
        ...state.loading,
        isLoadingContent: isLoading,
        loadingMessage: isLoading ? message : '',
      },
    })),

  setLoadingQuestions: (isLoading, message = 'Loading questions...') =>
    set((state) => ({
      loading: {
        ...state.loading,
        isLoadingQuestions: isLoading,
        loadingMessage: isLoading ? message : '',
      },
    })),

  endGame: () => set({ isGameOver: true }),

  resetGame: () => set(initialState),
}));
