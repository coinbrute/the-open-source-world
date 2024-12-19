import React, { useState } from 'react';
import { Html } from '@react-three/drei';

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
        location: string | null;
    };
}

interface HotspotProps {
  position: [number, number, number];
  size: number;
  color: string;
  repo: Repo; // Pass the repository data
}

const Hotspot: React.FC<HotspotProps> = ({ position, size, color, repo }) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <mesh
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      {hovered && (
        <Html distanceFactor={10}>
          <div className="tooltip">
            <strong>{repo.name}</strong>
            <p>{repo.description}</p>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </div>
        </Html>
      )}
    </mesh>
  );
};

export default Hotspot;