export type Scene =
  | "title"
  | "chapter_card"
  | "world"
  | "reunion"
  | "walking"
  | "sunset"
  | "credits";

export interface Camera {
  x: number;
  y: number;
  scale: number;
  targetX: number;
  targetY: number;
  targetScale: number;
  shake: number;
  shakeDecay: number;
}

export interface TransitionState {
  active: boolean;
  type: "fade-black" | "fade-white";
  progress: number; // 0→1→0
  phase: "in" | "hold" | "out";
  duration: number;
  elapsed: number;
  onMidpoint?: () => void;
  midpointFired: boolean;
}

export interface GameState {
  scene: Scene;
  currentWorld: number;
  heartsCollected: number;
  memoriesFound: string[];
  musicOn: boolean;
  transition: TransitionState;
  camera: Camera;
  showMemoryId: string | null;
  showHeartMessage: string | null;
  reunionPhase:
    | "approach"
    | "slowdown"
    | "meet"
    | "hug"
    | "kiss"
    | "done"
    | null;
  sceneTime: number; // seconds elapsed in current scene
  screenShake: number;
}

export type GameAction =
  | { type: "TICK"; dt: number }
  | { type: "CHANGE_SCENE"; scene: Scene }
  | { type: "COLLECT_HEART"; message: string }
  | { type: "CLEAR_HEART_MESSAGE" }
  | { type: "TRIGGER_MEMORY"; memoryId: string }
  | { type: "CLEAR_MEMORY" }
  | { type: "ADVANCE_WORLD" }
  | { type: "TOGGLE_MUSIC" }
  | { type: "SET_CAMERA"; camera: Partial<Camera> }
  | { type: "SCREEN_SHAKE"; intensity: number }
  | { type: "SET_REUNION_PHASE"; phase: GameState["reunionPhase"] }
  | { type: "START_TRANSITION"; transitionType: "fade-black" | "fade-white"; onMidpoint?: () => void };

export const initialCamera: Camera = {
  x: 0, y: 0, scale: 1,
  targetX: 0, targetY: 0, targetScale: 1,
  shake: 0, shakeDecay: 0.85,
};

export const initialState: GameState = {
  scene: "title",
  currentWorld: 1,
  heartsCollected: 0,
  memoriesFound: [],
  musicOn: true,
  transition: {
    active: false,
    type: "fade-black",
    progress: 0,
    phase: "in",
    duration: 600,
    elapsed: 0,
    midpointFired: false,
  },
  camera: initialCamera,
  showMemoryId: null,
  showHeartMessage: null,
  reunionPhase: null,
  sceneTime: 0,
  screenShake: 0,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "TICK":
      return {
        ...state,
        sceneTime: state.sceneTime + action.dt,
        screenShake: state.screenShake * 0.85,
      };

    case "CHANGE_SCENE":
      return { ...state, scene: action.scene, sceneTime: 0 };

    case "COLLECT_HEART":
      return {
        ...state,
        heartsCollected: state.heartsCollected + 1,
        showHeartMessage: action.message,
      };

    case "CLEAR_HEART_MESSAGE":
      return { ...state, showHeartMessage: null };

    case "TRIGGER_MEMORY":
      return {
        ...state,
        memoriesFound: [...state.memoriesFound, action.memoryId],
        showMemoryId: action.memoryId,
      };

    case "CLEAR_MEMORY":
      return { ...state, showMemoryId: null };

    case "ADVANCE_WORLD":
      return {
        ...state,
        currentWorld: Math.min(state.currentWorld + 1, 5),
        sceneTime: 0,
      };

    case "TOGGLE_MUSIC":
      return { ...state, musicOn: !state.musicOn };

    case "SET_CAMERA":
      return { ...state, camera: { ...state.camera, ...action.camera } };

    case "SCREEN_SHAKE":
      return { ...state, screenShake: action.intensity };

    case "SET_REUNION_PHASE":
      return { ...state, reunionPhase: action.phase };

    case "START_TRANSITION":
      return {
        ...state,
        transition: {
          active: true,
          type: action.transitionType,
          progress: 0,
          phase: "in",
          duration: 600,
          elapsed: 0,
          onMidpoint: action.onMidpoint,
          midpointFired: false,
        },
      };

    default:
      return state;
  }
}