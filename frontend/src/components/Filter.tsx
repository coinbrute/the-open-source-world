import React from 'react';

interface FiltersProps {
  languages: string[];
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  minStars: number;
  setMinStars: (stars: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  languages,
  selectedLanguage,
  setSelectedLanguage,
  minStars,
  setMinStars,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="filters">
      <label>
        Language:
        <select
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
        >
          <option value="">All</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </label>
      <label>
        Minimum Stars:
        <input
          type="number"
          value={minStars}
          onChange={e => setMinStars(parseInt(e.target.value))}
          min="0"
        />
      </label>
      <label>
        Search:
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Project name..."
        />
      </label>
    </div>
  );
};

export default Filters;