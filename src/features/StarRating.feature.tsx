import { useState, useEffect } from 'react';
import { useAuth } from '../modules/auth/AuthContext';
import { graphService } from '../services/graphService';

interface StarRatingProps {
  graphId: string;
  currentRating: number; // Average rating
  totalRatings: number;
  userRating?: number; // Current user's rating
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  graphId,
  currentRating,
  totalRatings,
  userRating = 0,
  onRatingChange,
  size = 'md',
  showStats = true
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const handleRating = async (rating: number) => {
    if (!user) return;

    setLoading(true);
    try {
      await graphService.setRating(graphId, rating, user.uid);
      onRatingChange?.(rating);
    } catch (error) {
      console.error('Error setting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStarColor = (starIndex: number) => {
    const rating = hoverRating || userRating || currentRating;
    if (starIndex <= rating) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            disabled={!user || loading}
            className={`${sizeClasses[size]} transition-colors ${
              !user ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <i className={`fas fa-star ${getStarColor(star)} ${
              loading ? 'opacity-50' : ''
            }`} />
          </button>
        ))}
      </div>
      
      {showStats && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">{currentRating.toFixed(1)}</span>
          <span className="text-gray-500"> ({totalRatings} ratings)</span>
        </div>
      )}
      
      {!user && (
        <span className="text-xs text-gray-500">Login to rate</span>
      )}
    </div>
  );
};
