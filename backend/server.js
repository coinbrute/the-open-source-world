const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');
const cron = require('node-cron');
const mongoose = require('mongoose');
const pLimit = require('p-limit');
require('dotenv').config();

const Geocode = require('./models/Geocode');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize caches
const userCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
let cachedRepos = [];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

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
      console.error('GitHub token not configured');
      return;
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
    const limit = pLimit(5); // Limit to 5 concurrent requests

    const reposWithLocationPromises = repositories.map(repo => limit(async () => {
      const ownerUrl = repo.owner.url;
      const cachedUser = userCache.get(ownerUrl);
      let ownerProfile;

      if (cachedUser) {
        ownerProfile = cachedUser;
      } else {
        try {
          const userResponse = await axios.get(ownerUrl, {
            headers: {
              Authorization: `token ${githubToken}`,
              'User-Agent': 'Open-Source-Globe',
            },
          });
          ownerProfile = userResponse.data;
          userCache.set(ownerUrl, ownerProfile);
        } catch (error) {
          console.error(`Error fetching user profile for ${ownerUrl}:`, error.message);
          ownerProfile = { location: null };
        }
      }

      // Geocode the location
      let lat = null;
      let lon = null;

      if (ownerProfile.location) {
        // Check persistent cache
        const geocodeEntry = await Geocode.findOne({ location: ownerProfile.location });

        if (geocodeEntry) {
          lat = geocodeEntry.lat;
          lon = geocodeEntry.lon;
        } else {
          // Geocode and store in database
          try {
            const geoResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
              params: {
                q: ownerProfile.location,
                format: 'json',
                limit: 1,
              },
            });

            if (geoResponse.data && geoResponse.data.length > 0) {
              lat = parseFloat(geoResponse.data[0].lat);
              lon = parseFloat(geoResponse.data[0].lon);

              // Save to database
              const newGeocode = new Geocode({
                location: ownerProfile.location,
                lat,
                lon,
              });

              await newGeocode.save();
            } else {
              console.warn(`No geocoding result for location: ${ownerProfile.location}`);
            }
          } catch (error) {
            console.error(`Geocoding error for ${ownerProfile.location}:`, error.message);
          }
        }
      }

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
          location: lat && lon ? { lat, lon } : null,
        },
      };
    }));

    const reposWithLocation = await Promise.all(reposWithLocationPromises);

    // Filter out repositories without valid location
    let validRepos = reposWithLocation.filter(repo => repo.owner.location !== null);

    // Detect and offset overlapping locations
    const locationMap = {};

    validRepos = validRepos.map(repo => {
      const key = `${repo.owner.location.lat.toFixed(2)},${repo.owner.location.lon.toFixed(2)}`;
      if (locationMap[key]) {
        // Offset by a small angle
        const offset = locationMap[key] * 0.5; // 0.5 degrees per overlap
        locationMap[key] += 1;
        return {
          ...repo,
          owner: {
            ...repo.owner,
            location: {
              lat: repo.owner.location.lat + offset,
              lon: repo.owner.location.lon + offset,
            },
          },
        };
      } else {
        locationMap[key] = 1;
        return repo;
      }
    });

    cachedRepos = validRepos;

    console.log('Fetched and cached top repositories with locations and offsets');
  } catch (error) {
    console.error('Error fetching top repositories:', error.message);
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