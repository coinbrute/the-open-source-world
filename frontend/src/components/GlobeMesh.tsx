import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlobeMesh: React.FC = () => {
  const globeRef = useRef<THREE.Mesh>(null!);

  // Rotate the globe slowly
  useFrame(() => {
    globeRef.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        color="#1a2b4c"
        wireframe
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

export default GlobeMesh;