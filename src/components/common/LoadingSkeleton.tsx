import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  height?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5, height = 'h-12' }) => {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`skeleton ${height} w-full`}></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;

