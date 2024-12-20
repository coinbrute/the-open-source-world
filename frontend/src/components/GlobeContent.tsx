import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import Hotspot from './Hotspot';
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
  minForks: number;
  activeRepo: Repo | null;
}

const GlobeContent: React.FC<GlobeContentProps> = ({
  projectCoords,
  selectedLanguage,
  minStars,
  searchTerm,
  orbitControlsRef,
  setZoom,
  setActiveRepo,
  minForks,
  activeRepo,
}) => {
  const { camera } = useThree();
  

  // Apply filters
  const filteredProjects = React.useMemo(
    () =>
      projectCoords.filter((project) => {
        const matchesLanguage = selectedLanguage
          ? project.repo.language === selectedLanguage
          : true;
        const matchesStars = project.repo.stargazers_count >= minStars;
        const matchesForks = project.repo.forks_count >= minForks;
        const matchesSearch = searchTerm
          ? project.repo.name.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        return (
          matchesLanguage &&
          matchesStars &&
          matchesForks &&
          matchesSearch
        );
      }),
    [projectCoords, selectedLanguage, minStars, minForks, searchTerm]
  );


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
      {filteredProjects.map((project) => {
        const { lat, lon } = project;
        const [x, y, z] = latLonToXYZ(lat, lon, 1.51); // Adjust radius as needed
        const color = `hsl(${(project.repo.stargazers_count % 360)}, 100%, 50%)`;

        return (
          <Hotspot
            key={project.repo.id}
            position={[x, y, z]}
            color={color}
            repo={project.repo}
            setActiveRepo={setActiveRepo}
            tooltipActive={activeRepo !== null}
          />
        );
      })}
    </>
  );
};

export default GlobeContent;