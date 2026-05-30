import { useEffect, useRef } from "react";

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  joystickX: number;
  joystickY: number;
}

const defaultInput = (): InputState => ({
  left: false, right: false, jump: false,
  jumpJustPressed: false,
  joystickX: 0, joystickY: 0,
});

export function useInput() {
  const inputRef = useRef<InputState>(defaultInput());

  useEffect(() => {
    const keys = new Set<string>();
    let prevJump = false;

    const onKey = (e: KeyboardEvent, down: boolean) => {
      // Prevent arrow-key page scroll
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)) {
        e.preventDefault();
      }
      if (down) keys.add(e.key); else keys.delete(e.key);

      const left  = keys.has("ArrowLeft")  || keys.has("a") || keys.has("A");
      const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
      const jump  = keys.has("ArrowUp") || keys.has("w") || keys.has("W") || keys.has(" ");

      inputRef.current = {
        ...inputRef.current,
        left, right, jump,
        jumpJustPressed: jump && !prevJump,
      };
      prevJump = jump;
    };

    window.addEventListener("keydown", e => onKey(e, true));
    window.addEventListener("keyup",   e => onKey(e, false));
    return () => {
      window.removeEventListener("keydown", e => onKey(e, true));
      window.removeEventListener("keyup",   e => onKey(e, false));
    };
  }, []);

  // Called from MobileJoystick
  const setJoystick = (x: number, y: number) => {
    inputRef.current = {
      ...inputRef.current,
      joystickX: x,
      joystickY: y,
      left:  x < -0.3,
      right: x >  0.3,
      jump: y < -0.5 || inputRef.current.jump,
    };
  };

  const setJump = (down: boolean) => {
    const prev = inputRef.current.jump;
    inputRef.current = {
      ...inputRef.current,
      jump: down,
      jumpJustPressed: down && !prev,
    };
  };

  const clearJustPressed = () => {
    inputRef.current.jumpJustPressed = false;
  };

  return { inputRef, setJoystick, setJump, clearJustPressed };
}