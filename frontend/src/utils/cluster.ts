import Supercluster from 'supercluster';

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

interface GeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    repo: Repo;
  };
}

export const createCluster = (repos: Repo[], zoom: number) => {
  const points: GeoFeature[] = repos.map((repo) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [repo.owner.location!.lon, repo.owner.location!.lat],
    },
    properties: {
      cluster: false,
      repo,
    },
  }));

  const supercluster = new Supercluster({
    radius: 60, // Cluster radius in pixels (adjust as needed)
    maxZoom: 16, // Max zoom level to cluster
  });

  supercluster.load(points);

  const clusters = supercluster.getClusters([-180, -90, 180, 90], zoom);

  return clusters;
};