import React, { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const GlobeMesh: React.FC = () => {
  const globeRef = useRef<THREE.Mesh>(null!);

  const [colorMap, bumpMap, specularMap] = useLoader(THREE.TextureLoader, [
    '/images/earth/earth_diffuse.png',
    '/images/earth/earth_bump.png',
    '/images/earth/earth_specular.png', 
  ]);

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshPhongMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.05}
        specularMap={specularMap}
        specular={'grey'}
      />
    </mesh>
  );
};

export default GlobeMesh;