import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GLView } from 'expo-gl';
import type { ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';

interface SacredSceneProps {
  isSpeaking: boolean;
  isStreaming: boolean;
}

const GOLD = 0xffd700;
const SAFFRON = 0xff6b00;
const PARTICLE_COUNT = 1200;

export function SacredScene({ isSpeaking, isStreaming }: SacredSceneProps) {
  const animFrameRef = useRef<number>(0);
  // Share live state into the animation closure via ref
  const stateRef = useRef({ isSpeaking: false, isStreaming: false });

  useEffect(() => {
    stateRef.current = { isSpeaking, isStreaming };
  }, [isSpeaking, isStreaming]);

  // Cancel animation frame on unmount
  useEffect(() => {
    return () => { cancelAnimationFrame(animFrameRef.current); };
  }, []);

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    const W = gl.drawingBufferWidth;
    const H = gl.drawingBufferHeight;

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas: {
        width: W,
        height: H,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: H,
        getContext: () => gl,
      } as unknown as HTMLCanvasElement,
      context: gl as unknown as WebGLRenderingContext,
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0); // fully transparent — gradient shows behind

    // ── Scene + Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 7;

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x1a0500, 1.5));

    const goldLight = new THREE.PointLight(GOLD, 3.5, 12);
    goldLight.position.set(0, 0, 3);
    scene.add(goldLight);

    const saffronLight = new THREE.PointLight(SAFFRON, 2.5, 10);
    saffronLight.position.set(3, 2, -1);
    scene.add(saffronLight);

    const backLight = new THREE.PointLight(0x3d0a00, 1.5, 8);
    backLight.position.set(-3, -2, -2);
    scene.add(backLight);

    // ── Center divine sphere ──────────────────────────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: GOLD,
      emissive: SAFFRON,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.95,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Inner glow sphere
    const glowGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    // ── Shatkona — sacred six-pointed star ────────────────────────────────────
    function makeTriangleLoop(size: number, color: number, opacity: number): THREE.LineLoop {
      const h = (size * Math.sqrt(3)) / 2;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        'position',
        new THREE.BufferAttribute(
          new Float32Array([0, (h * 2) / 3, 0, -size / 2, -h / 3, 0, size / 2, -h / 3, 0]),
          3
        )
      );
      return new THREE.LineLoop(
        geo,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }

    const triUp = makeTriangleLoop(2.4, GOLD, 0.55);
    const triDown = makeTriangleLoop(2.4, SAFFRON, 0.55);
    triDown.rotation.z = Math.PI;
    scene.add(triUp);
    scene.add(triDown);

    // ── Mandala circles ───────────────────────────────────────────────────────
    const CIRCLE_SIZES = [1.0, 1.5, 2.0, 2.6, 3.1];
    const circleObjects: THREE.LineLoop[] = [];

    CIRCLE_SIZES.forEach((r, i) => {
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 80; j++) {
        const a = (j / 80) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const color = i % 2 === 0 ? GOLD : SAFFRON;
      const loop = new THREE.LineLoop(
        geo,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 - i * 0.04 })
      );
      scene.add(loop);
      circleObjects.push(loop);
    });

    // ── 3D torus rings ────────────────────────────────────────────────────────
    const RING_CONFIGS = [
      { r: 1.2, tube: 0.013, color: GOLD,    rx: 0.5,          ry: 0,            rz: 0 },
      { r: 1.7, tube: 0.011, color: SAFFRON,  rx: Math.PI / 2,  ry: 0.4,          rz: 0 },
      { r: 2.2, tube: 0.009, color: GOLD,    rx: Math.PI / 4,  ry: Math.PI / 4,  rz: 0 },
      { r: 2.7, tube: 0.007, color: SAFFRON,  rx: 1.1,          ry: 0.6,          rz: 0.3 },
      { r: 3.2, tube: 0.005, color: GOLD,    rx: Math.PI / 6,  ry: Math.PI / 3,  rz: 0.5 },
    ];

    const rings = RING_CONFIGS.map(({ r, tube, color, rx, ry, rz }) => {
      const geo = new THREE.TorusGeometry(r, tube, 8, 80);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        roughness: 0.4,
        metalness: 0.9,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.set(rx, ry, rz);
      scene.add(ring);
      return ring;
    });

    // ── Particle system ───────────────────────────────────────────────────────
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 0.6 + Math.random() * 3.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      velocities[i] = 0.003 + Math.random() * 0.005;
    }

    const particleGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    particleGeo.setAttribute('position', posAttr);

    const particleMat = new THREE.PointsMaterial({
      size: 0.028,
      color: GOLD,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ── Animation loop ────────────────────────────────────────────────────────
    let time = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const { isSpeaking, isStreaming } = stateRef.current;
      const speed = isSpeaking ? 2.8 : isStreaming ? 1.6 : 1.0;

      time += 0.016;
      const t = time * speed;

      // Center sphere — pulse scale + emissive
      const beat = isSpeaking ? 0.1 : 0.04;
      sphere.scale.setScalar(1 + Math.sin(t * 2.5) * beat);
      sphereMat.emissiveIntensity = 0.7 + Math.sin(t * 3) * (isSpeaking ? 0.5 : 0.2);

      // Shatkona counter-rotation
      triUp.rotation.z += 0.003 * speed;
      triDown.rotation.z -= 0.003 * speed;

      // Mandala circle rotation alternating directions
      circleObjects.forEach((c, i) => {
        c.rotation.z += (i % 2 === 0 ? 0.0015 : -0.0015) * speed;
      });

      // Torus rings — each axis slightly different for organic 3D feel
      rings.forEach((ring, i) => {
        ring.rotation.y += (0.004 + i * 0.0008) * speed;
        ring.rotation.x += (0.002 + i * 0.0005) * speed;
        const mat = ring.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.35 + Math.sin(t * 1.8 + i * 1.2) * (isSpeaking ? 0.35 : 0.12);
      });

      // Light intensity pulsing
      goldLight.intensity = 3.0 + Math.sin(t * 2.2) * (isSpeaking ? 2.0 : 0.6);
      saffronLight.intensity = 2.0 + Math.cos(t * 1.8) * (isSpeaking ? 1.5 : 0.4);
      goldLight.position.y = Math.sin(t * 0.6) * 0.8;
      saffronLight.position.x = 3 + Math.cos(t * 0.4) * 0.5;

      // Particle drift upward — wrap at top
      const pSpeed = isSpeaking ? 2.0 : isStreaming ? 1.3 : 1.0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 1] += velocities[i] * pSpeed;
        if (positions[i * 3 + 1] > 4) positions[i * 3 + 1] = -4;
      }
      posAttr.needsUpdate = true;

      // Slow whole-scene Y rotation
      scene.rotation.y += 0.0015 * speed;

      renderer.render(scene, camera);
      (gl as ExpoWebGLRenderingContext).endFrameEXP();
    };

    animate();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
    </View>
  );
}
