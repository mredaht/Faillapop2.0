import React from 'react';

interface RatingProps {
  rating: number;
  numRatings: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export const Rating: React.FC<RatingProps> = ({ rating, numRatings, onRate, readonly = true }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  const renderStar = (starNumber: number) => {
    const filled = starNumber <= rating;
    return (
      <button
        key={starNumber}
        onClick={() => !readonly && onRate && onRate(starNumber)}
        disabled={readonly}
        className={`star ${readonly ? 'star-disabled' : ''}`}
      >
        {filled ? '★' : '☆'}
      </button>
    );
  };

  return (
    <div className="rating">
      <div className="stars">
        {stars.map(renderStar)}
      </div>
      <span className="rating-count">
        {rating.toFixed(1)} ({numRatings} {numRatings === 1 ? 'rating' : 'ratings'})
      </span>
    </div>
  );
}; 