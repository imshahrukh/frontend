import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const Card: React.FC<CardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary-600',
  trend,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 card-hover">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="mt-3 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <div className="mt-3 flex items-center text-sm">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                  trend.isPositive
                    ? 'bg-success-100 text-success-800'
                    : 'bg-danger-100 text-danger-800'
                }`}
              >
                <span className="mr-1">{trend.isPositive ? '↑' : '↓'}</span>
                {Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover-bounce`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;

