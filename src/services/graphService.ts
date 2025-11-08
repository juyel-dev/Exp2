import { db, storage } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Graph } from '../features/GraphGrid.feature';

export const graphService = {
  async getGraphs(): Promise<Graph[]> {
    const querySnapshot = await getDocs(collection(db, 'graphs'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Graph[];
  },

  async incrementViews(graphId: string): Promise<void> {
    const graphRef = doc(db, 'graphs', graphId);
    await updateDoc(graphRef, {
      views: increment(1)
    });
  },

  async downloadGraph(graphId: string): Promise<void> {
    const graph = await this.getGraphById(graphId);
    if (!graph?.imageUrl) throw new Error('No image available');
    
    const link = document.createElement('a');
    link.href = graph.imageUrl;
    link.download = `${graph.name.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async addFavorite(graphId: string): Promise<void> {
    // Implementation for adding to user's favorites
  },

  async removeFavorite(graphId: string): Promise<void> {
    // Implementation for removing from user's favorites
  },

  async getGraphById(graphId: string): Promise<Graph | null> {
    // Implementation for getting single graph
    return null;
  }
};
