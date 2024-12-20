import React, { useEffect, useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber';
import Hotspot from './Hotspot';
import ClusterHotspot from './ClusterHotspot';
import { createCluster } from '../utils/cluster';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

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

interface ProjectCoord {
  lat: number;
  lon: number;
  repo: Repo;
}

interface GlobeContentProps {
  projectCoords: ProjectCoord[];
  selectedLanguage: string;
  minStars: number;
  searchTerm: string;
  orbitControlsRef: React.RefObject<OrbitControlsImpl>;
  setZoom: (distance: number) => void;
  setActiveRepo: (repo: Repo | null) => void;
}

const GlobeContent: React.FC<GlobeContentProps> = ({
  projectCoords,
  selectedLanguage,
  minStars,
  searchTerm,
  orbitControlsRef,
  setZoom,
  setActiveRepo,
}) => {
  const [activeRepoId, setActiveRepoId] = useState<number | null>(null);
  const { camera } = useThree();

  // Apply filters
  const filteredProjects = useMemo(
    () =>
      projectCoords.filter((project) => {
        const matchesLanguage = selectedLanguage
          ? project.repo.language === selectedLanguage
          : true;
        const matchesStars = project.repo.stargazers_count >= minStars;
        const matchesSearch = searchTerm
          ? project.repo.name.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        return matchesLanguage && matchesStars && matchesSearch;
      }),
    [projectCoords, selectedLanguage, minStars, searchTerm]
  );

  // Create clusters based on current zoom
  const clusters = useMemo(() => {
    const currentZoom = Math.floor(camera.position.length() * 2); // Simplistic zoom calculation
    return createCluster(filteredProjects.map((p) => p.repo), currentZoom);
  }, [filteredProjects, camera.position]);

  // Update zoom state based on controls' change event
  useEffect(() => {
    const handleControlsChange = () => {
      const distance = camera.position.length();
      setZoom(distance);
    };

    if (orbitControlsRef.current) {
      orbitControlsRef.current.addEventListener('change', handleControlsChange);
    }

    return () => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.removeEventListener('change', handleControlsChange);
      }
    };
  }, [camera, orbitControlsRef, setZoom]);

  // Function to convert lat/lon to 3D coordinates
  const latLonToXYZ = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return [x, y, z] as [number, number, number];
  };

  return (
    <>
      {clusters.map((cluster) => {
        const [lat, lon] = [
          cluster.geometry.coordinates[1],
          cluster.geometry.coordinates[0],
        ];
        const [x, y, z] = latLonToXYZ(lat, lon, 1.51); // Adjust radius as needed

        if (cluster.properties.cluster) {
          return (
            <ClusterHotspot
              key={`cluster-${cluster.properties.cluster_id}`}
              position={[x, y, z]}
              count={cluster.properties.point_count}
              orbitControlsRef={orbitControlsRef}
            />
          );
        }

        const repo: Repo = cluster.properties.repo;
        const color = `hsl(${(repo.stargazers_count % 360)}, 100%, 50%)`;
        return <Hotspot
          key={repo.id}
          position={[x, y, z]}
          color={color}
          repo={repo}
          setActiveRepoId={setActiveRepo}
        />;
      })}
    </>
  );
};

export default GlobeContent;