import confetti from 'canvas-confetti';
import { useStore } from '../store/useStore';

// Immediate reward — the dopamine hit that reinforces a habit loop.
// Respects the user's reduce-motion preference (skips confetti, keeps it calm).
function motionOk() {
  try {
    return !useStore.getState().reduceMotion;
  } catch {
    return true;
  }
}

// A small burst, e.g. when finishing a task.
export function celebrate() {
  if (!motionOk()) return;
  confetti({
    particleCount: 70,
    spread: 65,
    startVelocity: 38,
    origin: { y: 0.7 },
    scalar: 0.9,
    ticks: 120,
    disableForReducedMotion: true,
  });
}

// A bigger, layered burst for milestones (streaks, all-habits-done).
export function bigCelebrate() {
  if (!motionOk()) return;
  const fire = (particleRatio: number, opts: confetti.Options) =>
    confetti({
      origin: { y: 0.65 },
      disableForReducedMotion: true,
      particleCount: Math.floor(220 * particleRatio),
      ...opts,
    });
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}
