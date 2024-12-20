import React, { useEffect, useRef } from 'react';

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

interface TooltipProps {
  repo: Repo;
  onClose: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({ repo, onClose }) => {
  const tooltipRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Attach the listener to detect clicks outside the tooltip
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Clean up the listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="tooltip-modal">
      <div className="tooltip-content" ref={tooltipRef}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <strong>{repo.name}</strong>
        <p>{repo.description}</p>
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </div>
    </div>
  );
};

export default Tooltip;