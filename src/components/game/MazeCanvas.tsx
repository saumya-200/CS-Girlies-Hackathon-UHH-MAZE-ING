// src/components/game/MazeCanvas.tsx
// Main maze rendering component using Canvas

import { useEffect, useRef } from "react";
import { useGameStore } from "../../stores/gameStore";
import { TILE_COLORS, PATH } from "../../utils/constants";
import { TileType } from "../../types/game.types";

// TEXTURES
import groundTile from "../../assets/ground/floor.png";
import waterTile from "../../assets/water/water.png";
import playerSprite from "../../assets/player/character.png";

export function MazeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { maze, player, fog, path } = useGameStore();

  const groundImageRef = useRef<HTMLImageElement | null>(null);
  const waterImageRef = useRef<HTMLImageElement | null>(null);
  const playerImageRef = useRef<HTMLImageElement | null>(null);

  // Load textures once
  useEffect(() => {
    const groundImg = new Image();
    groundImg.src = groundTile;
    groundImg.onload = () => (groundImageRef.current = groundImg);

    const waterImg = new Image();
    waterImg.src = waterTile;
    waterImg.onload = () => (waterImageRef.current = waterImg);

    const playerImg = new Image();
    playerImg.src = playerSprite;
    playerImg.onload = () => (playerImageRef.current = playerImg);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !maze) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // match canvas pixels to CSS size * dpr for crisp rendering
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // work in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;

    // PERFECT FULL-FIT VIEWPORT — NO BLACK GAPS
const VIEW_TILES_X = 14;   // smaller = more zoom
const VIEW_TILES_Y = 10;

let tileSize = Math.floor(
  Math.min(width / VIEW_TILES_X, height / VIEW_TILES_Y)
);

// hard fail-safe: prevent dividing by zero
if (tileSize < 1) tileSize = 1;

// clear maze area
ctx.clearRect(0, 0, width, height);
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, width, height);

// ==== CAMERA FOLLOW (clamped) ====
const halfX = Math.floor(VIEW_TILES_X / 2);
const halfY = Math.floor(VIEW_TILES_Y / 2);

let startX = player.position.x - halfX;
let startY = player.position.y - halfY;

startX = Math.max(0, Math.min(startX, maze.width - VIEW_TILES_X));
startY = Math.max(0, Math.min(startY, maze.height - VIEW_TILES_Y));

const endX = Math.min(maze.width, startX + VIEW_TILES_X);
const endY = Math.min(maze.height, startY + VIEW_TILES_Y);

const tilesWide = endX - startX;
const tilesHigh = endY - startY;

// ==== FULL CENTERING (Fixes empty space problem) ====
const gridWidthPx = tilesWide * tileSize;
const gridHeightPx = tilesHigh * tileSize;

const offsetX = (width - gridWidthPx) / 2;   // centers horizontally
const offsetY = (height - gridHeightPx) / 2; // centers vertically

// ==== DRAW TILES — ALL positions adjusted by offsets ====
const groundImg = groundImageRef.current;
const waterImg = waterImageRef.current;

for (let y = startY; y < endY; y++) {
  for (let x = startX; x < endX; x++) {

    const screenX = offsetX + (x - startX) * tileSize;
    const screenY = offsetY + (y - startY) * tileSize;

    const tile = maze.tiles[y][x];
    const key = `${x},${y}`;

    // Determine tile color logic (same as your current logic)
    let color = TILE_COLORS.WALL;
    switch (tile.type) {
      case TileType.PATH:
        color = TILE_COLORS.PATH;
        break;
      case TileType.QUIZ:
        if (tile.isAnswered && tile.answeredCorrectly) color = TILE_COLORS.QUIZ_CORRECT;
        else if (tile.isAnswered) color = TILE_COLORS.QUIZ_INCORRECT;
        else color = TILE_COLORS.QUIZ;
        break;
      case TileType.START:
        color = TILE_COLORS.START;
        break;
      case TileType.GOAL:
        color = TILE_COLORS.GOAL;
        break;
    }

    // ===== TEXTURE DRAW =====
    if (tile.type === TileType.PATH && groundImg?.complete) {
      ctx.drawImage(groundImg, screenX, screenY, tileSize, tileSize);
    } else if (tile.type === TileType.WALL && waterImg?.complete) {
      ctx.drawImage(waterImg, screenX, screenY, tileSize, tileSize);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
    }

    // grid line
    ctx.strokeStyle = "#1f2937";
    ctx.strokeRect(screenX, screenY, tileSize, tileSize);

    // ===== FOG (same logic) =====
    if (!fog.revealedTiles.has(key)) {
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      continue;
    }

    const fogAlpha = fog.fogOpacity[key] ?? 0;
    if (fogAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${fogAlpha})`;
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
    }

  }
}

    // ===== DRAW TILES =====
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const screenX = (x - startX) * tileSize;
        const screenY = (y - startY) * tileSize;

        const tile = maze.tiles[y][x];
        const key = `${x},${y}`;

        let color = TILE_COLORS.WALL;
        switch (tile.type) {
          case TileType.WALL:
            color = TILE_COLORS.WALL;
            break;
          case TileType.PATH:
            color = TILE_COLORS.PATH;
            break;
          case TileType.QUIZ:
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
            color = "#8b5cf6";
            break;
          case TileType.LEVEL_CHECKPOINT:
            color = "#10b981";
            break;
          case TileType.LOCKED_CHECKPOINT:
            color = "#6b7280";
            break;
        }

        if (tile.type === TileType.PATH && groundImg && groundImg.complete) {
          ctx.drawImage(groundImg, screenX, screenY, tileSize, tileSize);
        } else if (tile.type === TileType.WALL && waterImg && waterImg.complete) {
          ctx.drawImage(waterImg, screenX, screenY, tileSize, tileSize);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        }

        // grid lines
        ctx.strokeStyle = "#1f2937";
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);

        // ===== FOG =====
        if (!fog.revealedTiles.has(key)) {
          ctx.fillStyle = "rgba(0,0,0,1)";
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        } else {
          const opacity = fog.fogOpacity[key] ?? 0;
          if (opacity > 0) {
            ctx.fillStyle = `rgba(0,0,0,${opacity})`;
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
          }

          if (opacity < 0.3) {
            if (tile.type === TileType.QUIZ) {
              ctx.save();
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 24px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              const icon = tile.isAnswered
                ? tile.answeredCorrectly
                  ? "✓"
                  : "✗"
                : "?";
              ctx.fillText(icon, screenX + tileSize / 2, screenY + tileSize / 2);
              ctx.restore();
            }

            if (tile.type === TileType.GOAL) {
              ctx.save();
              ctx.font = "bold 28px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const requiredKeys = 3;
              const hasEnoughKeys = player.keysCollected >= requiredKeys;

              if (hasEnoughKeys) {
                ctx.fillStyle = "#10b981";
                ctx.fillText("🔓", screenX + tileSize / 2, screenY + tileSize / 2);
              } else {
                ctx.fillStyle = "#ffffff";
                ctx.fillText("🔒", screenX + tileSize / 2, screenY + tileSize / 2);
                ctx.font = "bold 14px sans-serif";
                ctx.fillStyle = "#fbbf24";
                ctx.fillText(
                  `${player.keysCollected}/${requiredKeys}`,
                  screenX + tileSize / 2,
                  screenY + tileSize - 8
                );
              }
              ctx.restore();
            }

            if (tile.type === TileType.STREAM_ENDPOINT) {
              ctx.save();
              ctx.font = "bold 32px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#ffffff";
              const icon = tile.label?.split(" ")[0] || "📚";
              ctx.fillText(icon, screenX + tileSize / 2, screenY + tileSize / 2);
              ctx.restore();
            }
          }
        }
      }
    }

    // ===== PATH TRAIL (clipped to maze grid) =====
    if (path.visitedPath.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, gridWidthPx, gridHeightPx);
      ctx.clip();

      ctx.lineWidth = PATH.TRAIL_WIDTH * (tileSize / 40);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const first = path.visitedPath[0];
      const firstX = (first.x - startX) * tileSize + tileSize / 2;
      const firstY = (first.y - startY) * tileSize + tileSize / 2;

      const last = path.visitedPath[path.visitedPath.length - 1];
      const lastX = (last.x - startX) * tileSize + tileSize / 2;
      const lastY = (last.y - startY) * tileSize + tileSize / 2;

      const gradient = ctx.createLinearGradient(firstX, firstY, lastX, lastY);
      gradient.addColorStop(0, "#3b82f6");
      gradient.addColorStop(1, "#f9a8d4");
      ctx.strokeStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(firstX, firstY);
      for (let i = 1; i < path.visitedPath.length; i++) {
        const p = path.visitedPath[i];
        const sx = (p.x - startX) * tileSize + tileSize / 2;
        const sy = (p.y - startY) * tileSize + tileSize / 2;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      for (let i = 0; i < path.visitedPath.length; i += 2) {
        const p = path.visitedPath[i];
        const sx = (p.x - startX) * tileSize + tileSize / 2;
        const sy = (p.y - startY) * tileSize + tileSize / 2;

        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.shadowColor = "rgba(255,255,255,0.95)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sx, sy, tileSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    // ===== PLAYER SPRITE =====
    const playerImg = playerImageRef.current;
    const playerSize = tileSize * 0.8;
    const playerScreenX =
      (player.position.x - startX) * tileSize + (tileSize - playerSize) / 2;
    const playerScreenY =
      (player.position.y - startY) * tileSize + (tileSize - playerSize) / 2;

    if (playerImg && playerImg.complete) {
      ctx.drawImage(playerImg, playerScreenX, playerScreenY, playerSize, playerSize);
    } else {
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(
        playerScreenX + playerSize / 2,
        playerScreenY + playerSize / 2,
        playerSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // direction glow
    const centerX = playerScreenX + playerSize / 2;
    const centerY = playerScreenY + playerSize / 2;
    let glowX = centerX;
    let glowY = centerY;
    const offset = playerSize / 3;

    switch (player.direction) {
      case "up":
        glowY -= offset;
        break;
      case "down":
        glowY += offset;
        break;
      case "left":
        glowX -= offset;
        break;
      case "right":
        glowX += offset;
        break;
    }

    ctx.save();
    ctx.fillStyle = "rgba(248,250,252,0.95)";
    ctx.shadowColor = "rgba(251,113,133,0.8)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(glowX, glowY, playerSize * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [maze, player, fog, path]);

  if (!maze) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading maze...</p>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
