import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { Mesh } from 'three';
import { Html } from '@react-three/drei';
import { ThreeEvent, useThree } from '@react-three/fiber';
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
  setActiveRepo: (repo: Repo | null) => void;
  tooltipActive: boolean;
}

const Hotspot: React.FC<HotspotProps> = ({
  position,
  color,
  repo,
  setActiveRepo,
  tooltipActive,
}) => {
  const [hovered, setHovered] = useState(false);
  const hotspotRef = useRef<Mesh>(null!);
  const tooltipRef = useRef<HTMLDivElement>(null!);
  const { gl } = useThree();

  // Animation for opacity using react-spring
  const { opacity, scale } = useSpring({
    opacity: hovered ? 1.0 : 0.6,
    scale: hovered ? 1.2 : 1,
    config: { tension: 300, friction: 20 },
  });

  // Function to handle hover events
  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    gl.domElement.classList.add('canvas-hovered');
    gl.domElement.classList.remove('canvas-default');
  };
  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
    gl.domElement.classList.add('canvas-default');
    gl.domElement.classList.remove('canvas-hovered');
  };

  // Function to handle click events
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation(); // Prevent event bubbling to Globe
    console.log(`Hotspot clicked: ${repo.name}`); // Debugging line
    setActiveRepo(repo); // Set the active repository
  };

  return (
    <a.mesh
      position={position}
      ref={hotspotRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick} // Add onClick handler
      scale={scale.to((s) => [s, s, s])}
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
      {(hovered.valueOf() && !tooltipActive.valueOf()) && (
        <Html
        >
          <div style={{
            pointerEvents: 'auto',
            userSelect: 'none',
            position: 'absolute',
            top: '5px',
            left: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: '10px',
            borderRadius: '8px',
            zIndex: '1000',
            maxWidth: '300px',
            minWidth: '300px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}>
            <div ref={tooltipRef}>
              <strong>{repo.name}</strong>
              <p>{repo.description}</p>
              <p>Click to learn more!</p>
            </div>
          </div>
        </Html>
      )}
    </a.mesh>
  );
};

export default Hotspot;