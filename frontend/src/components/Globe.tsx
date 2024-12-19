import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Filters from './Filter';
import GlobeMesh from './GlobeMesh';
import Hotspot from './Hotspot';
import axios from 'axios';

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
    const isInitialMount = useRef(true);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [minStars, setMinStars] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        // Prevent useEffect from running twice in Strict Mode
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchRepos();
        }
    }, []);

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

    const fetchRepos = async () => {
        try {
            const response = await axios.get<Repo[]>('/api/top-repos');
            setRepos(response.data);
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    };

    // Function to convert lat/lon to 3D coordinates
    const latLonToXYZ = (lat: number, lon: number, radius: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return [x, y, z] as [number, number, number];
    };

    const languages = Array.from(new Set(repos.map(repo => repo.language).filter(Boolean))) as string[];

    // Apply filters
    const filteredProjects = projectCoords.filter(project => {
        const matchesLanguage = selectedLanguage ? project.repo.language === selectedLanguage : true;
        const matchesStars = project.repo.stargazers_count >= minStars;
        const matchesSearch = searchTerm
            ? project.repo.name.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        return matchesLanguage && matchesStars && matchesSearch;
    });

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
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 3, 5]} intensity={1} />
                <GlobeMesh />
                {filteredProjects.map((project, _index) => {
                    if (!project.repo.owner.location) return null;

                    const { lat, lon } = project.repo.owner.location;
                    const position = latLonToXYZ(lat, lon, 1.51); // Slightly above the globe
                    const glowIntensity = Math.log(project.repo.stargazers_count + project.repo.forks_count + 1) * 0.05;
                    const color = `hsl(${(project.repo.stargazers_count % 360)}, 100%, 50%)`; // Color based on stars

                    return (
                        <Hotspot
                        key={project.repo.id}
                        position={position}
                        size={0.02 + glowIntensity}
                        color={color}
                        repo={project.repo}
                        />
                    );
                })}
                <OrbitControls enableZoom={true} />
                <Stars />
            </Canvas>
        </>
    );
};

export default Globe;