'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { RefreshCw, Brain, Sparkles } from 'lucide-react';
import * as THREE from 'three';
import { RobotState } from '@/lib/types';

interface Robot3DCanvasProps {
  state: RobotState;
  audioLevel?: number; // 0.0 to 1.0 for audio reactivity
  lowPowerMode?: boolean;
  reducedMotion?: boolean;
}

export const Robot3DCanvas: React.FC<Robot3DCanvasProps> = ({
  state,
  audioLevel = 0,
  lowPowerMode = false,
  reducedMotion = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  const [viewMode, setViewMode] = useState<'photo' | '3d'>('photo');

  // References for animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const leftEyeRef = useRef<THREE.Mesh | null>(null);
  const rightEyeRef = useRef<THREE.Mesh | null>(null);
  const visorMeshRef = useRef<THREE.Mesh | null>(null);
  const mouthBarRef = useRef<THREE.Mesh | null>(null);
  const haloRingRef = useRef<THREE.Mesh | null>(null);
  const soundWaveRingsRef = useRef<THREE.Mesh[]>([]);
  const particleGroupRef = useRef<THREE.Points | null>(null);

  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  // Handle mouse / touch position tracking for head tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mousePos.current.x = (e.clientX / innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (lowPowerMode) return;

    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    const isSoftwareGl = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (e) {
        return true;
      }
    })();

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0f172a, 0.12);

    // 2. Camera Setup
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);
    cameraRef.current = camera;

    // 3. Renderer Setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (err) {
      console.warn('WebGL initialization failed, using 2D fallback:', err);
      setTimeout(() => setWebglSupported(false), 0);
      return;
    }

    // 4. Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const blueFillLight = new THREE.DirectionalLight(0x3b82f6, 1.8);
    blueFillLight.position.set(-4, -1, 3);
    scene.add(blueFillLight);

    const goldRimLight = new THREE.DirectionalLight(0xf59e0b, 1.6);
    goldRimLight.position.set(0, 3, -4);
    scene.add(goldRimLight);

    const ambientLight = new THREE.HemisphereLight(0x1e293b, 0x0f172a, 0.8);
    scene.add(ambientLight);

    // 5. Construct Procedural GIRMAIC 3D Humanoid Robot
    const robotGroup = new THREE.Group();
    robotGroupRef.current = robotGroup;

    // A. Head Shell (Porcelain Titanium Ceramic)
    const headGeo = new THREE.SphereGeometry(0.75, 48, 36);
    headGeo.scale(1, 1.15, 0.95);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.85,
      roughness: 0.18,
      envMapIntensity: 1.2,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    robotGroup.add(headMesh);

    // B. Titanium Jaw & Neck Collar
    const jawGeo = new THREE.CylinderGeometry(0.55, 0.42, 0.4, 32);
    const jawMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.25,
    });
    const jawMesh = new THREE.Mesh(jawGeo, jawMat);
    jawMesh.position.set(0, -0.65, 0.05);
    robotGroup.add(jawMesh);

    // C. Sleek Dark Visor / Face Shield
    const visorGeo = new THREE.SphereGeometry(0.68, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.45);
    visorGeo.scale(0.96, 0.75, 0.88);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.08,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.08, 0.12);
    visorMesh.rotation.x = 0.2;
    visorMeshRef.current = visorMesh;
    robotGroup.add(visorMesh);

    // D. Intelligent Glowing Blue/Cyan Eyes
    const eyeGeo = new THREE.SphereGeometry(0.1, 24, 24);
    const eyeMatLeft = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eyeMatRight = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMatLeft);
    leftEye.position.set(-0.24, 0.12, 0.62);
    leftEye.scale.set(1.2, 0.8, 0.5);
    leftEyeRef.current = leftEye;
    robotGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMatRight);
    rightEye.position.set(0.24, 0.12, 0.62);
    rightEye.scale.set(1.2, 0.8, 0.5);
    rightEyeRef.current = rightEye;
    robotGroup.add(rightEye);

    // E. Mouth Speech Spectrum Bar (Reactivity for speaking)
    const mouthGeo = new THREE.BoxGeometry(0.32, 0.04, 0.04);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.position.set(0, -0.22, 0.66);
    mouthBarRef.current = mouthMesh;
    robotGroup.add(mouthMesh);

    // F. African-Inspired Gold Trim Collar & Geometric Shoulder Plate
    const collarGeo = new THREE.TorusGeometry(0.68, 0.04, 16, 48);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.2,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.set(0, -0.68, 0.02);
    collarMesh.rotation.x = Math.PI / 2;
    robotGroup.add(collarMesh);

    // Chest/Shoulder Plate (Bust)
    const chestGeo = new THREE.CylinderGeometry(0.7, 0.95, 0.7, 32);
    const chestMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.2,
    });
    const chestMesh = new THREE.Mesh(chestGeo, chestMat);
    chestMesh.position.set(0, -1.15, 0);
    robotGroup.add(chestMesh);

    // GIRMAIC Gold Emblem Disc on Chest
    const emblemGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 32);
    const emblemMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.15,
    });
    const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
    emblemMesh.position.set(0, -1.02, 0.62);
    emblemMesh.rotation.x = Math.PI / 2.2;
    robotGroup.add(emblemMesh);

    // G. Thinking Halo Ring (Floats around head during THINKING state)
    const haloGeo = new THREE.TorusGeometry(0.9, 0.02, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.6,
    });
    const haloRing = new THREE.Mesh(haloGeo, haloMat);
    haloRing.position.set(0, 0.85, 0);
    haloRing.rotation.x = Math.PI / 2.5;
    haloRingRef.current = haloRing;
    robotGroup.add(haloRing);

    // H. Sound Wave Rings (Radiate during LISTENING state)
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const waveGeo = new THREE.TorusGeometry(1.0 + i * 0.25, 0.015, 12, 64);
      const waveMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
      });
      const waveMesh = new THREE.Mesh(waveGeo, waveMat);
      waveMesh.rotation.x = Math.PI / 2;
      robotGroup.add(waveMesh);
      rings.push(waveMesh);
    }
    soundWaveRingsRef.current = rings;

    // I. Ambient Floating Data Particles
    const particleCount = 70;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.04,
      transparent: true,
      opacity: 0.45,
    });
    const particleGroup = new THREE.Points(particleGeo, particleMat);
    particleGroupRef.current = particleGroup;
    scene.add(particleGroup);

    scene.add(robotGroup);

    // 6. Animation Loop
    let clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Head Tracking toward mouse
      if (!reducedMotion && robotGroupRef.current) {
        targetRotation.current.y = mousePos.current.x * 0.25;
        targetRotation.current.x = -mousePos.current.y * 0.15;

        robotGroupRef.current.rotation.y +=
          (targetRotation.current.y - robotGroupRef.current.rotation.y) * (delta * 3);
        robotGroupRef.current.rotation.x +=
          (targetRotation.current.x - robotGroupRef.current.rotation.x) * (delta * 3);

        // Breathing / Floating
        robotGroupRef.current.position.y = Math.sin(time * 1.5) * 0.04 - 0.1;
      }

      // Rotate ambient particles
      if (particleGroupRef.current) {
        particleGroupRef.current.rotation.y = time * 0.05;
      }

      // State Driven Visual Effects
      const eyeMatL = leftEyeRef.current?.material as THREE.MeshBasicMaterial;
      const eyeMatR = rightEyeRef.current?.material as THREE.MeshBasicMaterial;
      const mouthMat = mouthBarRef.current?.material as THREE.MeshBasicMaterial;

      if (state === 'idle') {
        // Soft blue eye pulsation
        const pulse = 0.8 + Math.sin(time * 3) * 0.2;
        if (eyeMatL) eyeMatL.color.setHex(0x38bdf8).multiplyScalar(pulse);
        if (eyeMatR) eyeMatR.color.setHex(0x38bdf8).multiplyScalar(pulse);
        if (mouthBarRef.current) mouthBarRef.current.scale.set(1, 0.5, 1);
        if (haloRingRef.current) haloRingRef.current.visible = false;

        // Hide sound rings
        soundWaveRingsRef.current.forEach((r) => {
          (r.material as THREE.MeshBasicMaterial).opacity = 0;
        });
      } else if (state === 'listening') {
        // Bright cyan glowing eyes
        if (eyeMatL) eyeMatL.color.setHex(0x06b6d4);
        if (eyeMatR) eyeMatR.color.setHex(0x06b6d4);
        if (haloRingRef.current) haloRingRef.current.visible = false;

        // Pulsing soundwave rings
        soundWaveRingsRef.current.forEach((r, idx) => {
          const progress = (time * 1.8 + idx * 0.5) % 2;
          const scale = 0.8 + progress * 0.6;
          r.scale.set(scale, scale, scale);
          (r.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress / 2);
        });

        if (mouthBarRef.current) {
          mouthBarRef.current.scale.set(1 + Math.sin(time * 8) * 0.3, 0.8, 1);
        }
      } else if (state === 'thinking') {
        // Amber gold glowing eyes & spinning halo
        if (eyeMatL) eyeMatL.color.setHex(0xf59e0b);
        if (eyeMatR) eyeMatR.color.setHex(0xf59e0b);

        if (haloRingRef.current) {
          haloRingRef.current.visible = true;
          haloRingRef.current.rotation.z = time * 2.5;
        }

        soundWaveRingsRef.current.forEach((r) => {
          (r.material as THREE.MeshBasicMaterial).opacity = 0;
        });

        if (mouthBarRef.current) mouthBarRef.current.scale.set(0.6, 0.5, 1);
      } else if (state === 'speaking') {
        // Electric Blue / White synced to speech audio level
        const speakFactor = Math.max(0.2, audioLevel || Math.abs(Math.sin(time * 12)));
        if (eyeMatL) eyeMatL.color.setHex(0x60a5fa).multiplyScalar(1 + speakFactor * 0.5);
        if (eyeMatR) eyeMatR.color.setHex(0x60a5fa).multiplyScalar(1 + speakFactor * 0.5);

        if (mouthBarRef.current) {
          mouthBarRef.current.scale.set(1 + speakFactor * 1.2, 1 + speakFactor * 2.5, 1);
          if (mouthMat) mouthMat.color.setHex(0x38bdf8);
        }

        if (haloRingRef.current) haloRingRef.current.visible = false;

        soundWaveRingsRef.current.forEach((r) => {
          (r.material as THREE.MeshBasicMaterial).opacity = 0;
        });
      } else if (state === 'error') {
        // Warm Red Warning
        if (eyeMatL) eyeMatL.color.setHex(0xef4444);
        if (eyeMatR) eyeMatR.color.setHex(0xef4444);
        if (mouthBarRef.current) mouthBarRef.current.scale.set(0.4, 0.4, 1);
        if (haloRingRef.current) haloRingRef.current.visible = false;
        soundWaveRingsRef.current.forEach((r) => {
          (r.material as THREE.MeshBasicMaterial).opacity = 0;
        });
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [state, lowPowerMode, reducedMotion, audioLevel]);

  // If low power mode or WebGL un-supported, render 2D Animated SVG Avatar
  if (lowPowerMode || !webglSupported) {
    return (
      <div className="relative w-full h-[340px] flex items-center justify-center overflow-hidden rounded-2xl glass-panel p-4">
        <div className="relative flex flex-col items-center justify-center">
          {/* Animated sound rings for 2D fallback */}
          {state === 'listening' && (
            <div className="absolute w-64 h-64 rounded-full border-2 border-cyan-400/40 animate-wave-ring pointer-events-none" />
          )}

          {/* Avatar Face */}
          <div className="relative w-44 h-52 bg-slate-900 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col items-center justify-around p-4">
            {/* Glowing Visor */}
            <div className="w-36 h-20 bg-slate-950 border border-slate-700 rounded-2xl flex items-center justify-around px-4">
              <div
                className={`w-8 h-4 rounded-full transition-all duration-300 ${
                  state === 'listening'
                    ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]'
                    : state === 'thinking'
                    ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
                    : state === 'speaking'
                    ? 'bg-blue-400 shadow-[0_0_16px_#60a5fa] scale-125'
                    : state === 'error'
                    ? 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                    : 'bg-sky-400 shadow-[0_0_8px_#38bdf8]'
                }`}
              />
              <div
                className={`w-8 h-4 rounded-full transition-all duration-300 ${
                  state === 'listening'
                    ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]'
                    : state === 'thinking'
                    ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
                    : state === 'speaking'
                    ? 'bg-blue-400 shadow-[0_0_16px_#60a5fa] scale-125'
                    : state === 'error'
                    ? 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                    : 'bg-sky-400 shadow-[0_0_8px_#38bdf8]'
                }`}
              />
            </div>

            {/* Mouth Bar */}
            <div
              className={`w-16 h-1.5 rounded-full transition-all duration-200 ${
                state === 'speaking' ? 'bg-cyan-400 h-3 animate-pulse' : 'bg-slate-700'
              }`}
            />

            {/* Collar Trim */}
            <div className="w-24 h-2 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full" />
          </div>
          <span className="mt-3 text-xs text-slate-400 font-mono">GIRMAIC 2D Avatar Mode</span>
        </div>
      </div>
    );
  }

  const activeGlowColor =
    state === 'listening'
      ? 'rgba(6, 182, 212,'
      : state === 'thinking'
      ? 'rgba(245, 158, 11,'
      : state === 'speaking'
      ? 'rgba(59, 130, 246,'
      : 'rgba(6, 182, 212,';

  const glowIntensity = Math.min(1.0, Math.max(0.15, audioLevel * 1.5));
  const glowBlurRadius = Math.round(15 + audioLevel * 65);
  const glowSpreadRadius = Math.round(2 + audioLevel * 25);

  return (
    <div className="relative w-full transition-all duration-100">
      {/* Background Ambient Audio-Reactive Radial Aura Glow */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-100 pointer-events-none blur-3xl -z-10"
        style={{
          background: `radial-gradient(circle, ${activeGlowColor}${glowIntensity * 0.7}) 0%, transparent 70%)`,
          transform: `scale(${1 + audioLevel * 0.06})`,
        }}
      />

      <div
        className="relative w-full h-[360px] sm:h-[420px] rounded-2xl glass-panel overflow-hidden flex items-center justify-center bg-slate-950 border border-slate-800 transition-all duration-100"
        style={{
          boxShadow: `0 0 ${glowBlurRadius}px ${glowSpreadRadius}px ${activeGlowColor}${glowIntensity * 0.5})`,
          transform: `scale(${1 + audioLevel * 0.015})`,
        }}
      >
        {viewMode === 'photo' || !webglSupported ? (
          /* Official GIRMAIC Female Humanoid Robot Visual Identity Photo Mode */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden group">
            <Image
              src="/assets/aistudio/IMG_20261110_020235_716_a7b35e2f.jpg"
              alt="GIRMAIC AI Official Humanoid Agent"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              referrerPolicy="no-referrer"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

            {/* Futuristic Gradient & Cyber Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />

            {/* Interactive Audio-Reactive Dynamic Pulse Ring Overlay */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-75 border-2"
              style={{
                borderColor: `${activeGlowColor}${Math.max(0.3, glowIntensity)})`,
                boxShadow: `inset 0 0 ${Math.round(20 + audioLevel * 60)}px ${activeGlowColor}${glowIntensity * 0.8})`,
              }}
            />

            {/* Interactive State Glow Overlay */}
            {state === 'listening' && (
              <div className="absolute inset-0 border-4 border-cyan-400/60 rounded-2xl animate-pulse pointer-events-none shadow-[inset_0_0_50px_rgba(6,182,212,0.5)]" />
            )}
            {state === 'thinking' && (
              <div className="absolute inset-0 border-4 border-amber-400/60 rounded-2xl animate-pulse pointer-events-none shadow-[inset_0_0_50px_rgba(245,158,11,0.5)]" />
            )}
            {state === 'speaking' && (
              <div className="absolute inset-0 border-4 border-blue-500/60 rounded-2xl animate-pulse pointer-events-none shadow-[inset_0_0_60px_rgba(59,130,246,0.6)]" />
            )}

            {/* Equalizer Audio Meter Overlay when Speaking / Listening */}
            {(state === 'speaking' || state === 'listening') && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1.5 rounded-full bg-slate-950/80 border border-cyan-400/40 backdrop-blur-md">
                {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((factor, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-cyan-400 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(6, (audioLevel || 0.5) * 32 * factor)}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Three.js 3D WebGL Canvas Mode */
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        )}

      {/* Floating 'Thinking...' HUD Indicator Overlay */}
      {state === 'thinking' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/95 border border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.6)] backdrop-blur-md animate-bounce">
          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="text-xs font-mono font-extrabold tracking-widest text-amber-300 uppercase">
            Thinking...
          </span>
          <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>
      )}

      {/* Top Left: State Status Badge Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            state === 'listening'
              ? 'bg-cyan-400 animate-ping'
              : state === 'thinking'
              ? 'bg-amber-400 animate-spin'
              : state === 'speaking'
              ? 'bg-blue-400 animate-pulse'
              : state === 'error'
              ? 'bg-red-500'
              : 'bg-emerald-400'
          }`}
        />
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
          {state === 'idle'
            ? 'IDLE · ONLINE'
            : state === 'listening'
            ? 'LISTENING...'
            : state === 'thinking'
            ? 'THINKING...'
            : state === 'speaking'
            ? 'SPEAKING...'
            : 'CONNECTION ERROR'}
        </span>
      </div>

      {/* Top Right: Visual Identity Toggle (Official Photo vs 3D Interactive) */}
      <div className="absolute top-4 right-4 z-10 flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 backdrop-blur-md shadow-lg">
        <button
          onClick={() => setViewMode('photo')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            viewMode === 'photo'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Official Photo
        </button>
        <button
          onClick={() => setViewMode('3d')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            viewMode === '3d'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          3D Model
        </button>
      </div>

      {/* Bottom Right: Official Identity Watermark */}
      <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-md bg-slate-950/80 border border-amber-500/30 text-[10px] font-mono tracking-widest text-amber-300">
        GIRMAIC AI · HUMAN VISION
      </div>
    </div>
    </div>
  );
};
