import React from 'react';
import { Mesh } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSpring, a } from '@react-spring/three';

interface ClusterHotspotProps {
  position: [number, number, number];
  count: number;
  orbitControlsRef: React.RefObject<OrbitControlsImpl>;
}

const ClusterHotspot: React.FC<ClusterHotspotProps> = ({
  position,
  count,
  orbitControlsRef,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const hotspotRef = React.useRef<Mesh>(null!);
  const { camera } = useThree();

  // Animation for scaling using react-spring
  const { scale } = useSpring({
    scale: hovered ? 1.2 : 1,
    config: { tension: 300, friction: 20 },
  });

  // Smooth camera transition function
  const handleClick = () => {
    if (orbitControlsRef.current) {
      // Calculate the new camera position (e.g., double the cluster position)
      const targetPosition = position.map((coord) => coord * 2) as [number, number, number];
      const newPosition = new THREE.Vector3(...targetPosition);
      const newTarget = new THREE.Vector3(...position);

      // Animate camera position using react-spring
      useSpring({
        from: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        to: { x: newPosition.x, y: newPosition.y, z: newPosition.z },
        config: { tension: 300, friction: 20 },
        onChange: (result) => {
          camera.position.set(result.value.x, result.value.y, result.value.z);
        },
        onRest: () => {
          // Animate controls target using react-spring
          useSpring({
            from: { x: orbitControlsRef.current?.target.x, y: orbitControlsRef.current?.target.y, z: orbitControlsRef.current?.target.z },
            to: { x: newTarget.x, y: newTarget.y, z: newTarget.z },
            config: { tension: 300, friction: 20 },
            onChange: (res) => {
              orbitControlsRef.current?.target.set(res.value.x, res.value.y, res.value.z);
              orbitControlsRef.current?.update();
            },
          });
        },
      });
    }
  };

  return (
    <a.mesh
      position={position}
      ref={hotspotRef}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Sphere representing the cluster */}
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshStandardMaterial
        color="#ff4500"
        emissive="#ff4500"
        emissiveIntensity={0.5}
        transparent={true}
        opacity={0.8}
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
            <strong>{count} Projects</strong>
            <p>Click to zoom in</p>
          </div>
        </Html>
      )}
    </a.mesh>
  );
};

export default ClusterHotspot;