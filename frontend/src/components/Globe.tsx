import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Filters from './Filter';
import GlobeMesh from './GlobeMesh';
import GlobeContent from './GlobeContent';
import axios from 'axios';
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

const Globe: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [projectCoords, setProjectCoords] = useState<ProjectCoord[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [minStars, setMinStars] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null!);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const response = await axios.get<Repo[]>('/api/top-repos');
      setRepos(response.data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      const newProjectCoords: ProjectCoord[] = [];

      for (const repo of repos) {
        const location = repo.owner.location;
        if (location) {
          newProjectCoords.push({ lat: location.lat, lon: location.lon, repo });
        }
      }

      setProjectCoords(newProjectCoords);
    };

    if (repos.length > 0) {
      fetchLocations();
    }
  }, [repos]);

  const languages = Array.from(
    new Set(repos.map((repo) => repo.language).filter(Boolean))
  ) as string[];

  return (
    <>
      <Filters
        languages={languages}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        minStars={minStars}
        setMinStars={setMinStars}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <pointLight position={[0, 0, 5]} intensity={1} />

        <GlobeMesh />
        <GlobeContent
          projectCoords={projectCoords}
          selectedLanguage={selectedLanguage}
          minStars={minStars}
          searchTerm={searchTerm}
          orbitControlsRef={orbitControlsRef}
          setZoom={setZoom}
        />
        <OrbitControls ref={orbitControlsRef} enableZoom={true} />
        <Stars />
      </Canvas>
    </>
  );
};

export default Globe;