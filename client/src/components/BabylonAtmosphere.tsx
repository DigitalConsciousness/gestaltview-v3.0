import React from "react";
import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import { cn } from "@/lib/utils";
import { useActiveDI } from "@/hooks/useActiveDI";

type BabylonAtmosphereMode = "sanctuary" | "inner-world" | "blackboard";

type ModeConfig = {
  orbDiameter: number;
  orbAlpha: number;
  shellAlpha: number;
  ringAlpha: number;
  cameraRadius: number;
  cameraOrbitSpeed: number;
  fogDensity: number;
  ambientIntensity: number;
  pointIntensity: number;
  particleCount: number;
  particleEmitRate: number;
  particleSpread: number;
  particleHeight: number;
  particleMinSize: number;
  particleMaxSize: number;
  particleMinLife: number;
  particleMaxLife: number;
  particleMinPower: number;
  particleMaxPower: number;
  particleUpdateSpeed: number;
  pulsingOrbScale: number;
  fieldLift: number;
  haloOpacity: number;
  ribbonOpacity: number;
  beamOpacity: number;
};

const MODE_CONFIG: Record<BabylonAtmosphereMode, ModeConfig> = {
  sanctuary: {
    orbDiameter: 4.8,
    orbAlpha: 0.92,
    shellAlpha: 0.18,
    ringAlpha: 0.58,
    cameraRadius: 13.4,
    cameraOrbitSpeed: 0.004,
    fogDensity: 0.014,
    ambientIntensity: 0.96,
    pointIntensity: 1.8,
    particleCount: 220,
    particleEmitRate: 72,
    particleSpread: 8.5,
    particleHeight: 4.2,
    particleMinSize: 0.05,
    particleMaxSize: 0.16,
    particleMinLife: 2.8,
    particleMaxLife: 6.4,
    particleMinPower: 0.12,
    particleMaxPower: 0.58,
    particleUpdateSpeed: 0.009,
    pulsingOrbScale: 1.08,
    fieldLift: 0.25,
    haloOpacity: 0.66,
    ribbonOpacity: 0.42,
    beamOpacity: 0.28,
  },
  "inner-world": {
    orbDiameter: 3.6,
    orbAlpha: 0.84,
    shellAlpha: 0.14,
    ringAlpha: 0.42,
    cameraRadius: 15.6,
    cameraOrbitSpeed: 0.0028,
    fogDensity: 0.02,
    ambientIntensity: 0.72,
    pointIntensity: 1.3,
    particleCount: 140,
    particleEmitRate: 44,
    particleSpread: 7.2,
    particleHeight: 3.8,
    particleMinSize: 0.045,
    particleMaxSize: 0.13,
    particleMinLife: 3.2,
    particleMaxLife: 7.2,
    particleMinPower: 0.08,
    particleMaxPower: 0.48,
    particleUpdateSpeed: 0.008,
    pulsingOrbScale: 1.04,
    fieldLift: 0.16,
    haloOpacity: 0.58,
    ribbonOpacity: 0.36,
    beamOpacity: 0.22,
  },
  blackboard: {
    orbDiameter: 2.05,
    orbAlpha: 0.34,
    shellAlpha: 0.06,
    ringAlpha: 0.16,
    cameraRadius: 19.4,
    cameraOrbitSpeed: 0.00045,
    fogDensity: 0.024,
    ambientIntensity: 0.34,
    pointIntensity: 0.52,
    particleCount: 24,
    particleEmitRate: 10,
    particleSpread: 3.8,
    particleHeight: 1.6,
    particleMinSize: 0.03,
    particleMaxSize: 0.08,
    particleMinLife: 2.2,
    particleMaxLife: 4.2,
    particleMinPower: 0.04,
    particleMaxPower: 0.16,
    particleUpdateSpeed: 0.004,
    pulsingOrbScale: 1.005,
    fieldLift: 0.04,
    haloOpacity: 0.34,
    ribbonOpacity: 0.18,
    beamOpacity: 0.12,
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "").trim();
  const normalized = cleaned.length === 3
    ? cleaned
        .split("")
        .map((value) => `${value}${value}`)
        .join("")
    : cleaned.padEnd(6, "0").slice(0, 6);
  const parsed = Number.parseInt(normalized, 16);

  return {
    r: ((parsed >> 16) & 255) / 255,
    g: ((parsed >> 8) & 255) / 255,
    b: (parsed & 255) / 255,
  };
}

function hexToColor3(hex: string): Color3 {
  const { r, g, b } = hexToRgb(hex);
  return new Color3(r, g, b);
}

function hexToColor4(hex: string, alpha = 1): Color4 {
  const { r, g, b } = hexToRgb(hex);
  return new Color4(r, g, b, alpha);
}

function makeParticleTexture(scene: Scene): Texture {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 64;
  textureCanvas.height = 64;
  const context = textureCanvas.getContext("2d");

  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.28, "rgba(255,255,255,0.82)");
    gradient.addColorStop(0.72, "rgba(255,255,255,0.24)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }

  const texture = new Texture(textureCanvas.toDataURL("image/png"), scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  texture.hasAlpha = true;
  return texture;
}

function buildFallbackBackground(accent: string, mode: BabylonAtmosphereMode): string {
  const accentWeak = `${accent}22`;
  const accentFaint = `${accent}10`;
  const centerStop = mode === "blackboard" ? 18 : mode === "inner-world" ? 24 : 30;
  const edgeStop = mode === "blackboard" ? 68 : 58;

  return `radial-gradient(circle at 50% ${centerStop}%, ${accentWeak} 0%, transparent ${edgeStop}%), radial-gradient(circle at 18% 78%, ${accentFaint} 0%, transparent 24%), radial-gradient(circle at 82% 24%, ${accentFaint} 0%, transparent 18%), linear-gradient(180deg, rgba(3,4,10,0.16), rgba(3,4,10,0.92))`;
}

type BabylonAtmosphereProps = {
  mode?: BabylonAtmosphereMode;
  className?: string;
};

export default function BabylonAtmosphere({ mode = "sanctuary", className }: BabylonAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const orbRef = useRef<Mesh | null>(null);
  const shellRef = useRef<Mesh | null>(null);
  const ringRef = useRef<Mesh | null>(null);
  const orbMaterialRef = useRef<StandardMaterial | null>(null);
  const shellMaterialRef = useRef<StandardMaterial | null>(null);
  const ringMaterialRef = useRef<StandardMaterial | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const pulseRef = useRef(0);
  const currentAccentRef = useRef<Color3 | null>(null);
  const timeRef = useRef(0);
  const { presenceColor } = useActiveDI();
  const config = useMemo(() => MODE_CONFIG[mode], [mode]);
  const backgroundStyle = useMemo(() => buildFallbackBackground(presenceColor, mode), [mode, presenceColor]);

  const syncAccent = (accentHex: string) => {
    const accent = hexToColor3(accentHex);
    currentAccentRef.current = accent;
    const currentOrbMaterial = orbMaterialRef.current;
    const currentShellMaterial = shellMaterialRef.current;
    const currentRingMaterial = ringMaterialRef.current;
    const currentParticles = particleSystemRef.current;

    if (currentOrbMaterial) {
      currentOrbMaterial.emissiveColor = accent.scale(0.92);
      currentOrbMaterial.diffuseColor = accent.scale(0.2);
    }

    if (currentShellMaterial) {
      currentShellMaterial.emissiveColor = accent.scale(0.55);
      currentShellMaterial.diffuseColor = accent.scale(0.12);
    }

    if (currentRingMaterial) {
      currentRingMaterial.emissiveColor = accent.scale(0.75);
      currentRingMaterial.diffuseColor = accent.scale(0.18);
    }

    if (currentParticles) {
      currentParticles.color1 = hexToColor4(accentHex, mode === "blackboard" ? 0.72 : 0.88);
      currentParticles.color2 = hexToColor4(accentHex, mode === "blackboard" ? 0.38 : 0.56);
    }

    pulseRef.current = 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") {
      return;
    }

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: false,
      disableWebGL2Support: false,
    }, true);
    const scene = new Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new Color4(0, 0, 0, 0);
    scene.fogMode = Scene.FOGMODE_EXP;
    scene.fogDensity = config.fogDensity;

    const activeColor = hexToColor3(presenceColor);
    currentAccentRef.current = activeColor;
    scene.fogColor = hexToColor3("#05070b");

    const camera = new ArcRotateCamera(
      "atmosphereCamera",
      Math.PI / 2,
      Math.PI / 2.35,
      config.cameraRadius,
      Vector3.Zero(),
      scene,
    );
    camera.setTarget(Vector3.Zero());
    camera.lowerRadiusLimit = config.cameraRadius;
    camera.upperRadiusLimit = config.cameraRadius;
    camera.lowerBetaLimit = 0.85;
    camera.upperBetaLimit = 2.4;
    camera.wheelPrecision = 999999;
    camera.panningSensibility = 0;
    camera.inertia = 0.88;
    camera.detachControl();

    const ambientLight = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
    ambientLight.intensity = config.ambientIntensity;
    ambientLight.diffuse = activeColor.scale(0.22);
    ambientLight.groundColor = hexToColor3("#03040a");

    const orbLight = new PointLight("orbLight", new Vector3(0, 0, 0), scene);
    orbLight.intensity = config.pointIntensity;
    orbLight.diffuse = activeColor;
    orbLight.specular = hexToColor3("#ffffff");

    const orb = MeshBuilder.CreateSphere("activeOrb", { diameter: config.orbDiameter, segments: 48 }, scene);
    const orbMaterial = new StandardMaterial("orbMaterial", scene);
    orbMaterial.emissiveColor = activeColor.scale(0.92);
    orbMaterial.diffuseColor = activeColor.scale(0.2);
    orbMaterial.specularColor = hexToColor3("#ffffff");
    orbMaterial.alpha = config.orbAlpha;
    orb.material = orbMaterial;
    orbRef.current = orb;
    orbMaterialRef.current = orbMaterial;

    const shell = MeshBuilder.CreateSphere("orbShell", { diameter: config.orbDiameter * 1.34, segments: 42 }, scene);
    const shellMaterial = new StandardMaterial("shellMaterial", scene);
    shellMaterial.emissiveColor = activeColor.scale(0.55);
    shellMaterial.diffuseColor = activeColor.scale(0.12);
    shellMaterial.specularColor = hexToColor3("#ffffff");
    shellMaterial.alpha = config.shellAlpha;
    shell.material = shellMaterial;
    shellRef.current = shell;
    shellMaterialRef.current = shellMaterial;

    const ring = MeshBuilder.CreateTorus(
      "orbRing",
      {
        diameter: config.orbDiameter * 2.2,
        thickness: Math.max(0.08, config.orbDiameter * 0.03),
        tessellation: 96,
      },
      scene,
    );
    const ringMaterial = new StandardMaterial("ringMaterial", scene);
    ringMaterial.emissiveColor = activeColor.scale(0.75);
    ringMaterial.diffuseColor = activeColor.scale(0.18);
    ringMaterial.specularColor = hexToColor3("#ffffff");
    ringMaterial.alpha = config.ringAlpha;
    ring.material = ringMaterial;
    ring.rotation.x = Math.PI / 2.7;
    ring.rotation.z = Math.PI / 4.2;
    ringRef.current = ring;
    ringMaterialRef.current = ringMaterial;

    const particleSystem = new ParticleSystem("atmosphereParticles", config.particleCount, scene);
    particleSystem.particleTexture = makeParticleTexture(scene);
    particleSystem.emitter = Vector3.Zero();
    particleSystem.createSphereEmitter(config.particleSpread, 0.82);
    particleSystem.minEmitBox = new Vector3(-config.particleSpread, -config.particleHeight, -config.particleSpread);
    particleSystem.maxEmitBox = new Vector3(config.particleSpread, config.particleHeight, config.particleSpread);
    particleSystem.color1 = hexToColor4(presenceColor, mode === "blackboard" ? 0.72 : 0.88);
    particleSystem.color2 = hexToColor4(presenceColor, mode === "blackboard" ? 0.38 : 0.56);
    particleSystem.colorDead = new Color4(0, 0, 0, 0);
    particleSystem.minSize = config.particleMinSize;
    particleSystem.maxSize = config.particleMaxSize;
    particleSystem.minLifeTime = config.particleMinLife;
    particleSystem.maxLifeTime = config.particleMaxLife;
    particleSystem.emitRate = config.particleEmitRate;
    particleSystem.gravity = new Vector3(0, config.fieldLift, 0);
    particleSystem.direction1 = new Vector3(-0.15, 0.22, -0.15);
    particleSystem.direction2 = new Vector3(0.15, 0.78, 0.15);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI * 0.8;
    particleSystem.minEmitPower = config.particleMinPower;
    particleSystem.maxEmitPower = config.particleMaxPower;
    particleSystem.updateSpeed = config.particleUpdateSpeed;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.start();
    particleSystemRef.current = particleSystem;

    const resize = () => {
      const container = wrapperRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        engine.setSize(rect.width, rect.height);
      } else {
        engine.resize();
      }
    };

    const mediaQuery = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const isMobile = mediaQuery.matches;
    engine.setHardwareScalingLevel(isMobile ? 1.6 : Math.min(window.devicePixelRatio || 1, 1.35));
    resize();
    window.addEventListener("resize", resize);

    const updateScene = () => {
      const currentOrb = orbRef.current;
      const currentShell = shellRef.current;
      const currentRing = ringRef.current;
      const currentOrbMaterial = orbMaterialRef.current;
      const currentShellMaterial = shellMaterialRef.current;
    const currentRingMaterial = ringMaterialRef.current;
    const currentParticles = particleSystemRef.current;
    const accent = currentAccentRef.current ?? activeColor;
    const pulse = pulseRef.current;
    const motionFactor = mode === "blackboard" ? 0.22 : 1;
    const pulseScale = 1 + pulse * (mode === "blackboard" ? 0.03 : 0.08);
    const tint = Color3.Lerp(accent, hexToColor3("#ffffff"), pulse * 0.2);
    timeRef.current += scene.getEngine().getDeltaTime();

    if (currentOrb) {
      currentOrb.rotation.y += config.cameraOrbitSpeed * 20 * motionFactor;
      currentOrb.rotation.x += config.cameraOrbitSpeed * 4.5 * motionFactor;
      currentOrb.scaling.setAll(config.pulsingOrbScale * pulseScale);
    }

    if (currentShell) {
      currentShell.rotation.y -= config.cameraOrbitSpeed * 10 * motionFactor;
      currentShell.rotation.z += config.cameraOrbitSpeed * 6 * motionFactor;
      currentShell.scaling.setAll(1 + pulse * (mode === "blackboard" ? 0.02 : 0.05));
    }

    if (currentRing) {
      currentRing.rotation.z += config.cameraOrbitSpeed * 4 * motionFactor;
      currentRing.rotation.x = Math.PI / 2.7 + Math.sin(timeRef.current * 0.0016) * (0.05 * motionFactor);
    }

      if (currentOrbMaterial) {
        currentOrbMaterial.emissiveColor = tint.scale(0.94);
        currentOrbMaterial.diffuseColor = accent.scale(0.24);
        currentOrbMaterial.alpha = config.orbAlpha + pulse * 0.06;
      }

      if (currentShellMaterial) {
        currentShellMaterial.emissiveColor = tint.scale(0.56);
        currentShellMaterial.diffuseColor = accent.scale(0.14);
        currentShellMaterial.alpha = config.shellAlpha + pulse * 0.04;
      }

      if (currentRingMaterial) {
        currentRingMaterial.emissiveColor = tint.scale(0.8);
        currentRingMaterial.diffuseColor = accent.scale(0.22);
        currentRingMaterial.alpha = config.ringAlpha + pulse * 0.06;
      }

    if (currentParticles) {
      currentParticles.color1 = hexToColor4(presenceColor, mode === "blackboard" ? 0.5 + pulse * 0.08 : 0.8 + pulse * 0.12);
      currentParticles.color2 = hexToColor4(presenceColor, mode === "blackboard" ? 0.18 + pulse * 0.05 : 0.42 + pulse * 0.14);
      currentParticles.emitRate = config.particleEmitRate + pulse * config.particleEmitRate * (0.34 * motionFactor);
    }

    ambientLight.intensity = config.ambientIntensity + pulse * (0.18 * motionFactor);
    ambientLight.diffuse = tint.scale(0.24 + pulse * 0.1);
    orbLight.intensity = config.pointIntensity + pulse * (0.45 * motionFactor);
    orbLight.diffuse = tint;
    scene.fogDensity = config.fogDensity - pulse * (0.002 * motionFactor);
    scene.fogColor = Color3.Lerp(hexToColor3("#03040a"), accent, pulse * 0.16);

    pulseRef.current = Math.max(0, pulse - 0.016 * motionFactor);
  };

    scene.registerBeforeRender(updateScene);

    engine.runRenderLoop(() => {
      if (!scene.isDisposed) {
        scene.render();
      }
    });

    return () => {
      window.removeEventListener("resize", resize);
      engine.stopRenderLoop();
      particleSystem.dispose();
      scene.dispose();
      engine.dispose();
      sceneRef.current = null;
      orbRef.current = null;
      shellRef.current = null;
      ringRef.current = null;
      orbMaterialRef.current = null;
      shellMaterialRef.current = null;
      ringMaterialRef.current = null;
      particleSystemRef.current = null;
    };
  }, [config, mode]);

  useEffect(() => {
    syncAccent(presenceColor);
  }, [presenceColor, mode]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="absolute inset-0"
        style={{
          background: backgroundStyle,
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-[-12%] mix-blend-screen"
        animate={mode === "blackboard" ? { rotate: [0, 4, 0], scale: [1, 1.02, 1] } : { rotate: [0, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: mode === "blackboard" ? 38 : 26, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            `radial-gradient(circle at 50% 34%, rgba(255,255,255,${config.haloOpacity}), transparent 18%), ` +
            `conic-gradient(from 220deg at 50% 56%, rgba(18,214,255,${config.ribbonOpacity}) 0deg, rgba(191,0,255,${config.beamOpacity}) 110deg, rgba(255,184,107,${config.beamOpacity * 0.75}) 190deg, rgba(18,214,255,0) 360deg)`,
          filter: "blur(36px)",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-[8%] top-[14%] h-[48%] rounded-full mix-blend-screen"
        animate={mode === "blackboard" ? { x: ["-2%", "2%", "-2%"], y: [0, "1%", 0] } : { x: ["-4%", "4%", "-4%"], y: [0, "2%", 0] }}
        transition={{ duration: mode === "blackboard" ? 26 : 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            `radial-gradient(circle at 50% 50%, rgba(18,214,255,${config.beamOpacity}), transparent 55%), ` +
            `radial-gradient(circle at 22% 30%, rgba(255,255,255,${config.beamOpacity * 0.8}), transparent 18%), ` +
            `radial-gradient(circle at 78% 26%, rgba(255,84,89,${config.beamOpacity * 0.7}), transparent 20%)`,
          filter: "blur(54px)",
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          pointerEvents: "none",
          touchAction: "none",
          mixBlendMode: mode === "blackboard" ? "screen" : "normal",
        }}
      />
    </div>
  );
}
