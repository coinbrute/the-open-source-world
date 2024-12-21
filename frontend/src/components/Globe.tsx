import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Filters from './Filter';
import GlobeMesh from './GlobeMesh';
import GlobeContent from './GlobeContent';
import axios from 'axios';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Tooltip from './Tooltip';

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

// interface GlobeProps {
//   setActiveRepo: (repo: Repo | null) => void;
// }

// const Globe: React.FC<GlobeProps> = ({ setActiveRepo }) => {
const Globe: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [projectCoords, setProjectCoords] = useState<ProjectCoord[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [minStars, setMinStars] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minForks, setMinForks] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null!);
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null);

  
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
        minForks={minForks}
        setMinForks={setMinForks}
      />
      {activeRepo && (
        <Tooltip repo={activeRepo} onClose={() => setActiveRepo(null)} />
      )}
      <Canvas className="canvas-default" camera={{ position: [0, 0, 5] }}>
        {/* Enhanced Lighting */}
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[0, 0, 0]} intensity={1.5} />

        <GlobeMesh />
        <GlobeContent
          projectCoords={projectCoords}
          selectedLanguage={selectedLanguage}
          minStars={minStars}
          searchTerm={searchTerm}
          orbitControlsRef={orbitControlsRef}
          setActiveRepo={setActiveRepo}
          minForks={minForks}
          setZoom={setZoom}
          activeRepo={activeRepo}
          />
        <OrbitControls 
          ref={orbitControlsRef} 
          enableZoom={true}
          maxDistance={10} // Upper limit for zooming out
          minDistance={2}  // Lower limit for zooming in
          enablePan={false} // Disable panning for focused control
          enableDamping={true} // Enable damping for smoother transitions
          dampingFactor={0.1} // Damping factor
        />
        <Stars />
      </Canvas>
    </>
  );
};

export default Globe;