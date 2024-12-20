import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { Mesh } from 'three';
import { Html } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
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
  setActiveRepoId: (repo: Repo | null) => void;
}

const Hotspot: React.FC<HotspotProps> = ({
  position,
  color,
  repo,
  setActiveRepoId,
}) => {
  const [hovered, setHovered] = useState(false);
  const hotspotRef = useRef<Mesh>(null!);

  // Animation for opacity using react-spring
  const { opacity } = useSpring({
    opacity: hovered ? 1.0 : 0.6,
    config: { tension: 300, friction: 20 },
  });

  // Function to handle hover events
  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  // Function to handle click events
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation(); // Prevent event bubbling to Globe
    console.log(`Hotspot clicked: ${repo.name}`); // Debugging line
    setActiveRepoId(repo); // Set the active repository
  };

  return (
    <a.mesh
      position={position}
      ref={hotspotRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick} // Add onClick handler
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