import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
    location: {
      lat: number;
      lon: number;
    } | null;
  };
}

interface HotspotProps {
  position: [number, number, number];
  color: string;
  repo: Repo;
}

const Hotspot: React.FC<HotspotProps> = ({ position, color, repo }) => {
  const [hovered, setHovered] = useState(false);
  const hotspotRef = useRef<Mesh>(null!);

  // Animation for opacity using react-spring
  const { opacity } = useSpring({
    opacity: hovered ? 1.0 : 0.6,
    config: { tension: 300, friction: 20 },
  });

  // Function to handle tooltip persistence
  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  return (
    <a.mesh
      position={position}
      ref={hotspotRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      scale={hovered ? [1.2, 1.2, 1.2] : [1, 1, 1]}
    >
      {/* Thin cylinder representing a beam */}
      <cylinderGeometry args={[0.005, 0.005, 0.5, 8, 1, true]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent={true} // Enable transparency
        opacity={opacity.get()} // Animated opacity
        side={THREE.DoubleSide}
      />
      {hovered && (
        <Html
          distanceFactor={10}
          transform
          occlude
          style={{
            pointerEvents: 'auto',
            userSelect: 'none',
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <div className="tooltip">
            <strong>{repo.name}</strong>
            <p>{repo.description}</p>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </div>
        </Html>
      )}
    </a.mesh>
  );
};

export default Hotspot;