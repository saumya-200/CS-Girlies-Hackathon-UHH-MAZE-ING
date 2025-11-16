// Hook for handling keyboard input for player movement

import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { KEYS, GAME_CONFIG } from '../utils/constants';

export function useInputHandler() {
  const { movePlayer, isPaused, isGameOver } = useGameStore();
  const lastMoveTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // CRITICAL FIX: Don't process movement if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable;
      
      if (isTyping) {
        // User is typing - don't intercept keys
        return;
      }

      // Don't process input if game is paused or over
      if (isPaused || isGameOver) return;

      // Throttle movement to prevent too-rapid moves
      const now = Date.now();
      if (now - lastMoveTime.current < GAME_CONFIG.movementSpeed) {
        return;
      }

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      // Check which key was pressed
      if (KEYS.UP.includes(event.key)) {
        direction = 'up';
        event.preventDefault();
      } else if (KEYS.DOWN.includes(event.key)) {
        direction = 'down';
        event.preventDefault();
      } else if (KEYS.LEFT.includes(event.key)) {
        direction = 'left';
        event.preventDefault();
      } else if (KEYS.RIGHT.includes(event.key)) {
        direction = 'right';
        event.preventDefault();
      }

      // Move player if valid direction
      if (direction) {
        movePlayer(direction);
        lastMoveTime.current = now;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movePlayer, isPaused, isGameOver]);
}
