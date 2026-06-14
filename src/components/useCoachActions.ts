import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { CoachAction } from '../lib/coach';

// Maps a coach suggestion's action to a concrete effect (navigate / mutate store).
export function useCoachActions() {
  const navigate = useNavigate();
  const toggleLogDay = useStore((s) => s.toggleLogDay);
  const addTaskFromRoadmap = useStore((s) => s.addTaskFromRoadmap);

  return (action: CoachAction) => {
    switch (action.kind) {
      case 'logDay':
        toggleLogDay('minimum');
        break;
      case 'navigate':
        navigate(action.to);
        break;
      case 'addRoadmap':
        addTaskFromRoadmap(action.ref.phaseId, action.ref.weekId, action.ref.taskId);
        navigate('/tasks');
        break;
    }
  };
}
