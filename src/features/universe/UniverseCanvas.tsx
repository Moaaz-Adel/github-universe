"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { PlanetNode } from "@/features/universe/math";
import { useUniverseStore } from "@/features/universe/store";

export function UniverseCanvas({ planets }: { planets: PlanetNode[] }) {
  return (
    <Canvas
      camera={{ position: [0, 16, 34], fov: 54 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="absolute inset-0"
    >
      <color attach="background" args={["#070713"]} />
      <fog attach="fog" args={["#070713", 28, 72]} />
      <ambientLight intensity={0.58} />
      <pointLight position={[0, 8, 0]} intensity={90} color="#f6f4ef" />
      <pointLight position={[-16, 10, -12]} intensity={50} color="#7b61ff" />
      <Starfield />
      <OrbitalGrid />
      <group>
        {planets.map((planet) => (
          <Planet key={planet.repo.id} planet={planet} />
        ))}
      </group>
      <CameraControls />
    </Canvas>
  );
}

function CameraControls() {
  const { camera, gl } = useThree();
  const controls = useRef<ThreeOrbitControls | null>(null);

  useEffect(() => {
    const nextControls = new ThreeOrbitControls(camera, gl.domElement);
    camera.lookAt(0, 0, 0);
    nextControls.enablePan = true;
    nextControls.enableZoom = true;
    nextControls.enableRotate = true;
    nextControls.autoRotate = true;
    nextControls.autoRotateSpeed = 0.22;
    nextControls.minDistance = 12;
    nextControls.maxDistance = 68;
    nextControls.enableDamping = true;
    nextControls.dampingFactor = 0.06;
    controls.current = nextControls;

    return () => nextControls.dispose();
  }, [camera, gl.domElement]);

  useFrame(() => controls.current?.update());

  return null;
}

function Starfield() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(2800 * 3);

    for (let index = 0; index < 2800; index += 1) {
      const radius = 26 + seededNoise(index, 1) * 58;
      const theta = seededNoise(index, 2) * Math.PI * 2;
      const phi = Math.acos(2 * seededNoise(index, 3) - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi) * 0.7;
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    return nextGeometry;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#f6f4ef"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.72}
      />
    </points>
  );
}

function seededNoise(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

function Planet({ planet }: { planet: PlanetNode }) {
  const ref = useRef<THREE.Group>(null);
  const setSelectedRepo = useUniverseStore((state) => state.setSelectedRepo);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: planet.color,
        roughness: 0.48,
        metalness: 0.12,
        emissive: planet.color,
        emissiveIntensity: 0.08,
      }),
    [planet.color],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = clock.getElapsedTime();
    const angle = planet.initialAngle + time * planet.orbitSpeed;
    ref.current.position.x = Math.cos(angle) * planet.orbitRadius;
    ref.current.position.z = Math.sin(angle) * planet.orbitRadius;
    ref.current.rotation.y += 0.006;
  });

  return (
    <group ref={ref} position={planet.position}>
      <mesh
        material={material}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedRepo(planet.repo);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[planet.radius, 48, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.radius * 1.55, planet.radius * 1.62, 72]} />
        <meshBasicMaterial color={planet.color} transparent opacity={0.22} />
      </mesh>
      {Array.from({ length: planet.moons }).map((_, index) => {
        const angle = (index / Math.max(1, planet.moons)) * Math.PI * 2;
        const distance = planet.radius * (2.2 + index * 0.24);
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * distance,
              0,
              Math.sin(angle) * distance,
            ]}
          >
            <sphereGeometry
              args={[Math.max(0.06, planet.radius * 0.13), 16, 16]}
            />
            <meshStandardMaterial color="#d7dce8" roughness={0.6} />
          </mesh>
        );
      })}
      {planet.satellites > 0 ? (
        <mesh rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[planet.radius * 2.8, 0.01, 8, 96]} />
          <meshBasicMaterial color="#ffb84d" transparent opacity={0.32} />
        </mesh>
      ) : null}
    </group>
  );
}

function OrbitalGrid() {
  return (
    <group rotation={[0, 0, 0]}>
      {Array.from({ length: 9 }).map((_, index) => (
        <mesh key={index} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[6 + index * 3.1, 6 + index * 3.1 + 0.012, 160]}
          />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.09} />
        </mesh>
      ))}
    </group>
  );
}
