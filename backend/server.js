const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize caches
const userCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
let cachedRepos = [];

// Example route
app.get('/', (req, res) => {
  res.send('Open Source Globe Backend');
});

const fetchUserProfile = async (url, token) => {
  const cachedUser = userCache.get(url);
  if (cachedUser) {
    return cachedUser;
  }
  try {
    const userResponse = await axios.get(url, {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'Open-Source-Globe',
      },
    });
    // Cache the user profile
    userCache.set(url, userResponse.data);
    return userResponse.data;
  } catch (error) {
    console.error(`Error fetching user profile for ${url}:`, error.message);
    return { location: null };
  }
};

const fetchTopRepos = async () => {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    // Step 1: Fetch top repositories
    const repoResponse = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'stars:>1000',
        sort: 'stars',
        order: 'desc',
        per_page: 100, // Adjust as needed to manage rate limits
      },
      headers: {
        Authorization: `token ${githubToken}`,
        'User-Agent': 'Open-Source-Globe',
      },
    });

    const repositories = repoResponse.data.items;

    // Step 2: Fetch owner profiles with concurrency control
    const reposWithLocationPromises = repositories.map(async (repo) => {
        const ownerProfile = await fetchUserProfile(repo.owner.url, githubToken);
        return {
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
          html_url: repo.html_url,
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatar_url,
            html_url: repo.owner.html_url,
            location: ownerProfile.location,
          },
        };
    });

    const reposWithLocation = await Promise.all(reposWithLocationPromises);

    cachedRepos = reposWithLocation;
  } catch (error) {
    console.error('Error fetching top repositories:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

fetchTopRepos();

cron.schedule('0 * * * *', () => {
  fetchTopRepos();
});

app.get('/api/top-repos', (req, res) => {
  res.json(cachedRepos);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});