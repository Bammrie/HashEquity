import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { GameObjectCard } from './GameObjectCard';
import styles from './GameBoard.module.css';

const OBJECT_SIZE = 112;
const MIN_SPEED = 0.45;
const MAX_SPEED = 1.1;

type Bounds = { width: number; height: number };

type PositionState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

type PositionsMap = Record<string, PositionState>;

const createPositionState = ({ width, height }: Bounds): PositionState => {
  const size = OBJECT_SIZE;
  const maxX = Math.max(width - size, 0);
  const maxY = Math.max(height - size, 0);
  const angle = Math.random() * Math.PI * 2;
  const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  return {
    x: maxX > 0 ? Math.random() * maxX : 0,
    y: maxY > 0 ? Math.random() * maxY : 0,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
  };
};

export const GameBoard = () => {
  const objects = useGameStore((state) => state.objects);
  const boardRef = useRef<HTMLElement | null>(null);
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 });
  const [positions, setPositions] = useState<PositionsMap>({});

  useLayoutEffect(() => {
    const updateBounds = () => {
      if (!boardRef.current) {
        return;
      }
      const rect = boardRef.current.getBoundingClientRect();
      setBounds({ width: rect.width, height: rect.height });
    };

    updateBounds();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateBounds);
      if (boardRef.current) {
        observer.observe(boardRef.current);
      }
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateBounds);
    return () => {
      window.removeEventListener('resize', updateBounds);
    };
  }, []);

  useEffect(() => {
    if (!bounds.width || !bounds.height) {
      return;
    }
    setPositions((prev) => {
      const next: PositionsMap = { ...prev };
      for (const object of objects) {
        if (!next[object.id]) {
          next[object.id] = createPositionState(bounds);
        }
      }
      for (const key of Object.keys(next)) {
        if (!objects.find((object) => object.id === key)) {
          delete next[key];
        }
      }
      return next;
    });
  }, [objects, bounds]);

  useEffect(() => {
    if (!bounds.width || !bounds.height) {
      return;
    }

    let animationFrame: number;

    const step = () => {
      setPositions((prev) => {
        const next: PositionsMap = {};
        for (const object of objects) {
          const state = prev[object.id] ?? createPositionState(bounds);
          let { x, y, vx, vy, size } = state;

          x += vx;
          y += vy;

          if (bounds.width <= size) {
            x = Math.max((bounds.width - size) / 2, 0);
            vx = -vx;
          } else {
            if (x <= 0) {
              x = 0;
              vx = Math.abs(vx);
            } else if (x >= bounds.width - size) {
              x = bounds.width - size;
              vx = -Math.abs(vx);
            }
          }

          if (bounds.height <= size) {
            y = Math.max((bounds.height - size) / 2, 0);
            vy = -vy;
          } else {
            if (y <= 0) {
              y = 0;
              vy = Math.abs(vy);
            } else if (y >= bounds.height - size) {
              y = bounds.height - size;
              vy = -Math.abs(vy);
            }
          }

          next[object.id] = { x, y, vx, vy, size };
        }
        return next;
      });

      animationFrame = window.requestAnimationFrame(step);
    };

    animationFrame = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [objects, bounds]);

  const boardClassName = `${styles.board} ${styles.boardSurface}`;

  return (
    <section className={boardClassName} aria-label="Active game objects" ref={boardRef}>
      {objects.map((object) => {
        const state = positions[object.id];
        if (!state) {
          return null;
        }
        return (
          <GameObjectCard
            key={object.id}
            object={object}
            position={{ x: state.x, y: state.y }}
            size={state.size}
          />
        );
      })}
    </section>
  );
};
