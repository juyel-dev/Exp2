import { useState, useEffect } from 'react';
import { GraphCard } from '../ui/Card/GraphCard';
import { graphService } from '../services/graphService';
import { useAuth } from '../modules/auth/AuthContext';

export interface Graph {
  id: string;
  name: string;
  description: string;
  subject: string;
  imageUrl?: string;
  views: number;
  tags: string[];
  createdAt: Date;
}

export const GraphGrid: React.FC = () => {
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    loadGraphs();
  }, []);

  const loadGraphs = async () => {
    try {
      const graphData = await graphService.getGraphs();
      setGraphs(graphData);
    } catch (error) {
      console.error('Error loading graphs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewGraph = (graphId: string) => {
    graphService.incrementViews(graphId);
    // Open graph modal logic here
  };

  const handleDownloadGraph = async (graphId: string) => {
    try {
      await graphService.downloadGraph(graphId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleFavorite = async (graphId: string) => {
    if (!user) return;
    
    try {
      if (favorites.has(graphId)) {
        await graphService.removeFavorite(graphId);
        setFavorites(prev => {
          const newFavs = new Set(prev);
          newFavs.delete(graphId);
          return newFavs;
        });
      } else {
        await graphService.addFavorite(graphId);
        setFavorites(prev => new Set(prev).add(graphId));
      }
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {graphs.map(graph => (
        <GraphCard
          key={graph.id}
          {...graph}
          onView={handleViewGraph}
          onDownload={handleDownloadGraph}
          onFavorite={user ? handleFavorite : undefined}
          isFavorite={favorites.has(graph.id)}
        />
      ))}
    </div>
  );
};
