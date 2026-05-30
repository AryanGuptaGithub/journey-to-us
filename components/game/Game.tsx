"use client";
import React, { useEffect, useReducer, useRef, useCallback } from "react";

import { gameReducer, initialState } from "./engine/gameReducer";
import { useGameLoop } from "./engine/useGameLoop";
import { useInput } from "./engine/useInput";
import { updateCamera, applyCameraTransform, restoreCamera } from "./engine/Camera";
import { Renderer } from "./engine/Renderer";
import { audioManager } from "./engine/AudioManager";

import { createPlayer, updatePlayer, applySlowdown } from "./entities/Player";
import { createPartner, updatePartner } from "./entities/Partner";
import { createObstacles, updateObstacles, OBSTACLE_SIZE } from "./entities/Obstacle";
import { createHearts, updateHearts } from "./entities/HeartCollectible";
import { createMemoryCards } from "./entities/MemoryCard";

import {
  createTitleScene, updateTitleScene, drawTitleScene,
} from "./scenes/TitleScene";
import {
  createChapterCard, updateChapterCard, drawChapterCard,
} from "./scenes/ChapterCard";
import {
  createWorldScene, updateWorldScene, drawWorldScene,
} from "./scenes/WorldScene";
import {
  createReunionScene, updateReunionScene, drawReunionScene,
} from "./scenes/ReunionScene";
import {
  createWalkingScene, updateWalkingScene, drawWalkingScene,
} from "./scenes/WalkingScene";
import {
  createSunsetScene, updateSunsetScene, drawSunsetScene,
} from "./scenes/SunsetScene";
import {
  createEndCredits, updateEndCredits, drawEndCredits,
} from "./scenes/EndCreditsScene";

import { HUD } from "./ui/HUD";
import { MobileJoystick } from "./ui/MobileJoystick";
import { MusicToggle } from "./ui/MusicToggle";
import { MemoryPopup } from "./ui/MemoryPopup";

import { WORLDS } from "@/config/worlds";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorldRuntime {
  player: ReturnType<typeof createPlayer>;
  partner: ReturnType<typeof createPartner>;
  obstacles: ReturnType<typeof createObstacles>;
  hearts: ReturnType<typeof createHearts>;
  memCards: ReturnType<typeof createMemoryCards>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { inputRef, setJoystick, setJump, clearJustPressed } = useInput();

  // Mutable scene-local state (doesn't need React re-renders)
  const titleRef    = useRef(createTitleScene(800, 500));
  const chapterRef  = useRef(createChapterCard());
  const worldRef    = useRef(createWorldScene(800, 500));
  const reunionRef  = useRef(createReunionScene(800));
  const walkingRef  = useRef(createWalkingScene(800));
  const sunsetRef   = useRef(createSunsetScene(800));
  const creditsRef  = useRef(createEndCredits());
  const runtimeRef  = useRef<WorldRuntime | null>(null);
  const camRef      = useRef(state.camera);
  const sceneRef    = useRef(state.scene);
  const worldIdRef  = useRef(state.currentWorld);

  // Keep refs synced with reducer state
  camRef.current    = state.camera;
  sceneRef.current  = state.scene;
  worldIdRef.current = state.currentWorld;

  // ─── Resize ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d")!;
      rendererRef.current = new Renderer(ctx, canvas.width, canvas.height);
      // Re-init title scene clouds etc
      titleRef.current = createTitleScene(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ─── Music ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    audioManager.setEnabled(state.musicOn);
  }, [state.musicOn]);

  // ─── Scene transitions ──────────────────────────────────────────────────────
  const goToChapter = useCallback((worldId: number) => {
    const canvas = canvasRef.current!;
    const w = canvas.width, h = canvas.height;
    chapterRef.current = createChapterCard();
    worldRef.current   = createWorldScene(w, h);
    dispatch({ type: "CHANGE_SCENE", scene: "chapter_card" });
    audioManager.play(WORLDS[worldId - 1]?.musicTrack?.replace(".mp3", "") ?? "sakura");
  }, []);

  const startWorld = useCallback((worldId: number) => {
    const canvas = canvasRef.current!;
    const w = canvas.width, h = canvas.height;
    const world = WORLDS[worldId - 1];
    const groundY = world.groundY * h;
    runtimeRef.current = {
      player:    createPlayer(60, groundY - 48),
      partner:   { ...createPartner(world.levelWidth - 120, groundY - 48), visible: true },
      obstacles: createObstacles(world.obstacles),
      hearts:    createHearts(world.levelWidth, groundY, world.heartDensity),
      memCards:  createMemoryCards(worldId, world.levelWidth, groundY),
    };
    dispatch({ type: "CHANGE_SCENE", scene: "world" });
  }, []);

  // Any key on title → go to chapter 1
  useEffect(() => {
    const onKey = () => {
      if (sceneRef.current === "title") goToChapter(1);
      if (sceneRef.current === "credits") {
        dispatch({ type: "CHANGE_SCENE", scene: "title" });
        titleRef.current = createTitleScene(canvasRef.current!.width, canvasRef.current!.height);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onKey);
    };
  }, [goToChapter]);

  // Music on mount
  useEffect(() => {
    audioManager.play("title");
  }, []);

  // ─── Game Loop ───────────────────────────────────────────────────────────────
  useGameLoop(useCallback((dt: number, _time: number) => {
    const canvas = canvasRef.current;
    const r = rendererRef.current;
    if (!canvas || !r) return;
    const W = canvas.width, H = canvas.height;
    const ctx = r.ctx;
    r.resize(W, H);

    dispatch({ type: "TICK", dt });

    const scene   = sceneRef.current;
    const worldId = worldIdRef.current;
    const world   = WORLDS[worldId - 1];
    const cam     = camRef.current;
    const input   = inputRef.current;

    // ── Title ──────────────────────────────────────────────────────────────
    if (scene === "title") {
      titleRef.current = updateTitleScene(titleRef.current, dt, W, H);
      drawTitleScene(r, titleRef.current, W, H);

      // Start prompt
      const blink = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
      r.drawPixelText(
        "Press any key to begin",
        W / 2, H * 0.78, 7, "#ffd5ee", "center", blink
      );
      clearJustPressed();
      return;
    }

    // ── Chapter Card ───────────────────────────────────────────────────────
    if (scene === "chapter_card") {
      chapterRef.current = updateChapterCard(
        chapterRef.current, dt, W, H,
        () => startWorld(worldId)
      );
      drawChapterCard(r, chapterRef.current, world, W, H);
      clearJustPressed();
      return;
    }

    // ── World ──────────────────────────────────────────────────────────────
    if (scene === "world" && runtimeRef.current) {
      const rt = runtimeRef.current;
      const groundY = world.groundY * H;

      // Update player
      rt.player = updatePlayer(rt.player, input, dt, groundY - 48, world.levelWidth, world.hasWind);

      // Update partner
      rt.partner = updatePartner(rt.partner, dt);

      // Update obstacles
      rt.obstacles = updateObstacles(rt.obstacles, dt);

      // Update hearts
      rt.hearts = updateHearts(rt.hearts, dt);

      // Collision: obstacles
      for (const obs of rt.obstacles) {
        if (obs.hitCooldown > 0) continue;
        const px = rt.player.x + 6, py = rt.player.y;
        const ox = obs.x, oy = groundY - 60;
        if (
          px < ox + OBSTACLE_SIZE && px + 24 > ox &&
          py < oy + OBSTACLE_SIZE && py + 48 > oy
        ) {
          rt.player = applySlowdown(rt.player, obs.slowAmount);
          obs.hitCooldown = 1.5;
          obs.flash = 0.3;
          dispatch({ type: "SCREEN_SHAKE", intensity: 8 });
        }
      }

      // Collision: hearts
      for (const h of rt.hearts) {
        if (h.collected) continue;
        const dx = (rt.player.x + 18) - h.x;
        const dy = (rt.player.y + 24) - h.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          h.collected = true;
          dispatch({ type: "COLLECT_HEART", message: h.message });
          setTimeout(() => dispatch({ type: "CLEAR_HEART_MESSAGE" }), 2000);
        }
      }

      // Collision: memory cards
      for (const mc of rt.memCards) {
        if (mc.triggered) continue;
        if (Math.abs((rt.player.x + 18) - mc.x) < 35) {
          mc.triggered = true;
          dispatch({ type: "TRIGGER_MEMORY", memoryId: mc.id });
        }
      }

      // Camera follow
      const newCam = updateCamera(
        {
          ...cam,
          targetX: Math.max(0, Math.min(
            world.levelWidth - W,
            rt.player.x - W * 0.35
          )),
          targetY: 0,
        },
        dt
      );
      dispatch({ type: "SET_CAMERA", camera: newCam });

      // Update world scene visuals
      worldRef.current = updateWorldScene(worldRef.current, dt, world, W, H);

      // Check level end
      if (rt.player.x >= world.levelWidth - 140 && rt.partner.visible) {
        reunionRef.current = createReunionScene(W);
        dispatch({ type: "CHANGE_SCENE", scene: "reunion" });
        audioManager.play("reunion");
      }

      // Draw
      drawWorldScene(
        r, worldRef.current, world,
        rt.player, rt.partner, rt.obstacles, rt.hearts, rt.memCards,
        newCam, W, H
      );

      // Draw transition overlay
      r.drawTransitionOverlay(cam.shake > 0 ? 0 : 0, "fade-black");

      clearJustPressed();
      return;
    }

    // ── Reunion ────────────────────────────────────────────────────────────
    if (scene === "reunion") {
      reunionRef.current = updateReunionScene(
        reunionRef.current, dt, W, H,
        () => {
          walkingRef.current = createWalkingScene(W);
          dispatch({ type: "CHANGE_SCENE", scene: "walking" });
        }
      );
      drawReunionScene(r, reunionRef.current, world, W, H);
      clearJustPressed();
      return;
    }

    // ── Walking ────────────────────────────────────────────────────────────
    if (scene === "walking") {
      walkingRef.current = updateWalkingScene(
        walkingRef.current, dt, W, H,
        () => {
          if (worldId < 5) {
            dispatch({ type: "ADVANCE_WORLD" });
            setTimeout(() => goToChapter(worldId + 1), 50);
          } else {
            sunsetRef.current = createSunsetScene(W);
            dispatch({ type: "CHANGE_SCENE", scene: "sunset" });
            audioManager.play("sunset");
          }
        }
      );
      drawWalkingScene(r, walkingRef.current, world, W, H);
      clearJustPressed();
      return;
    }

    // ── Sunset ─────────────────────────────────────────────────────────────
    if (scene === "sunset") {
      sunsetRef.current = updateSunsetScene(
        sunsetRef.current, dt, W, H,
        () => {
          creditsRef.current = createEndCredits();
          dispatch({ type: "CHANGE_SCENE", scene: "credits" });
        }
      );
      drawSunsetScene(r, sunsetRef.current, W, H);
      clearJustPressed();
      return;
    }

    // ── Credits ────────────────────────────────────────────────────────────
    if (scene === "credits") {
      creditsRef.current = updateEndCredits(creditsRef.current, dt, W, H);
      drawEndCredits(r, creditsRef.current, W, H);
      clearJustPressed();
      return;
    }

    // ── Transition overlay (always on top) ─────────────────────────────────
    if (state.transition.active) {
      r.drawTransitionOverlay(state.transition.progress, state.transition.type);
    }

  }, [goToChapter, startWorld, clearJustPressed, inputRef]));

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* HUD */}
      {(state.scene === "world") && (
        <HUD
          hearts={state.heartsCollected}
          worldName={WORLDS[state.currentWorld - 1]?.name ?? ""}
          worldId={state.currentWorld}
          totalWorlds={5}
          heartMessage={state.showHeartMessage}
          musicOn={state.musicOn}
        />
      )}

      {/* Memory popup */}
      {state.showMemoryId && (
        <MemoryPopup
          memoryId={state.showMemoryId}
          onClose={() => dispatch({ type: "CLEAR_MEMORY" })}
        />
      )}

      {/* Music toggle */}
      <MusicToggle
        on={state.musicOn}
        onToggle={() => dispatch({ type: "TOGGLE_MUSIC" })}
      />

      {/* Mobile controls */}
      {isMobile && state.scene === "world" && (
        <MobileJoystick setJoystick={setJoystick} setJump={setJump} />
      )}
    </div>
  );
}