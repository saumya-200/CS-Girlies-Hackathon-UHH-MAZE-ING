// Core game types for the educational maze game

export interface Coordinate {
  x: number;
  y: number;
}

export enum TileType {
  WALL = 'WALL',
  PATH = 'PATH',
  QUIZ = 'QUIZ',
  START = 'START',
  GOAL = 'GOAL',
  DECORATIVE = 'DECORATIVE',
  STREAM_ENDPOINT = 'STREAM_ENDPOINT',
  LEVEL_CHECKPOINT = 'LEVEL_CHECKPOINT',
  LOCKED_CHECKPOINT = 'LOCKED_CHECKPOINT',
}

export enum TileState {
  UNANSWERED = 'UNANSWERED',
  CORRECT = 'CORRECT',
  INCORRECT = 'INCORRECT',
  LOCKED = 'LOCKED',
}

export interface MazeTile {
  type: TileType;
  state?: TileState;
  questionId?: string;
  coordinate: Coordinate;
  isAnswered?: boolean;
  answeredCorrectly?: boolean;
  // For navigation mazes
  streamId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isLocked?: boolean;
  label?: string;
}

export interface MazeGrid {
  width: number;
  height: number;
  tiles: MazeTile[][];
}

export interface PlayerState {
  position: Coordinate;
  direction: 'up' | 'down' | 'left' | 'right';
  currentLevel: number;
  lives: number;
  score: number;
  keysCollected: number;
}

export interface FogState {
  revealedTiles: Set<string>; // "x,y" format
  fogOpacity: Record<string, number>; // "x,y" -> opacity
}

export interface PathMemory {
  visitedPath: Coordinate[];
  visitedTiles: Set<string>; // "x,y" format
}

export interface LoadingState {
  isLoadingContent: boolean;
  isLoadingQuestions: boolean;
  loadingMessage: string;
}

export interface GameState {
  currentLevelId: string;
  characterName: string | null;
  player: PlayerState;
  maze: MazeGrid | null;
  fog: FogState;
  path: PathMemory;
  loading: LoadingState;
  isPaused: boolean;
  isGameOver: boolean;
  levelStartTime: number;
}

export interface LevelBlueprint {
  id: string;
  levelNumber: number;
  topic: string;
  complexityScore: number;
  mazeSize: { width: number; height: number };
  questionTileCount: number;
  requiredCorrectAnswers: number;
  lessonId: string;
  questionIds: string[];
}

export interface GameConfig {
  tileSize: number;
  fogRevealRadius: number;
  fogDecayRate: number;
  movementSpeed: number;
  initialLives: number;
}
