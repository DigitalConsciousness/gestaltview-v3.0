import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { ThreeMuseumSceneItem } from "./buildThreeMuseumSceneItems";

type BrowserThreeMuseumSceneProps = {
  items: ThreeMuseumSceneItem[];
  reducedMotion: boolean;
};

function MuseumBeacon({ item, reducedMotion }: { item: ThreeMuseumSceneItem; reducedMotion: boolean }) {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = item.rotationY + elapsed * (item.active ? 0.24 : 0.12);
      meshRef.current.position.y = item.position[1] + Math.sin(elapsed * 0.8 + item.position[0]) * (item.active ? 0.08 : 0.04);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = elapsed * 0.18;
    }
  });

  return (
    <group position={item.position} scale={item.scale}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.95, 1.2, 0.12]} />
        <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={item.active ? 0.42 : 0.18} roughness={0.36} metalness={0.22} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.012, 8, 48]} />
        <meshStandardMaterial color={item.active ? "#fef9c3" : "#67e8f9"} emissive={item.active ? "#facc15" : "#0891b2"} emissiveIntensity={0.34} />
      </mesh>
      <pointLight color={item.color} intensity={item.active ? 1.4 : 0.54} distance={item.active ? 9 : 5} />
    </group>
  );
}

export default function BrowserThreeMuseumScene({ items, reducedMotion }: BrowserThreeMuseumSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 2.8, 12], fov: 46 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={["#030712"]} />
      <fog attach="fog" args={["#030712", 9, 24]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 6]} intensity={1.2} color="#e0f2fe" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, -2]}>
        <planeGeometry args={[16, 26, 1, 1]} />
        <meshStandardMaterial color="#07111d" emissive="#083344" emissiveIntensity={0.18} roughness={0.85} />
      </mesh>
      {items.map((item) => (
        <MuseumBeacon key={item.id} item={item} reducedMotion={reducedMotion} />
      ))}
    </Canvas>
  );
}
