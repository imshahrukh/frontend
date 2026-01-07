import React, { useState, useEffect } from 'react';
import { Bell, User, DollarSign, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { settingsService } from '../../services/settingsService';
import { setUsdToPkrRate, getUsdToPkrRate } from '../../utils/currency';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [currentRate, setCurrentRate] = useState<number>(getUsdToPkrRate());
  const [tempRate, setTempRate] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Update rate when it changes globally
    const rate = getUsdToPkrRate();
    setCurrentRate(rate);
  }, []);

  const handleEditRate = () => {
    setTempRate(currentRate.toString());
    setIsEditingRate(true);
  };

  const handleSaveRate = async () => {
    const newRate = parseFloat(tempRate);
    if (isNaN(newRate) || newRate <= 0) {
      alert('Please enter a valid exchange rate');
      return;
    }

    try {
      setSaving(true);
      // Update backend settings
      await settingsService.updateSettings({ usdToPkrRate: newRate });
      // Update local rate
      setUsdToPkrRate(newRate);
      setCurrentRate(newRate);
      setIsEditingRate(false);
      
      // Refresh the page to update all calculations
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to update exchange rate:', error);
      alert(error.response?.data?.message || 'Failed to update exchange rate');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingRate(false);
    setTempRate('');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-opacity-90">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Page Title - Can be dynamic based on route */}
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Welcome back!
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Right side - Currency Rate, Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Currency Exchange Rate */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4 py-2 border border-green-200">
            <DollarSign className="w-4 h-4 text-green-600" />
            {!isEditingRate ? (
              <>
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">1 USD = </span>
                  <span className="font-bold text-green-600">{currentRate.toFixed(2)} PKR</span>
                </div>
                {user?.role === 'Admin' && (
                  <button
                    onClick={handleEditRate}
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                    title="Edit exchange rate"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-green-600" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Rate"
                  autoFocus
                  disabled={saving}
                />
                <button
                  onClick={handleSaveRate}
                  disabled={saving}
                  className="p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded text-white transition-colors"
                  title="Save"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="p-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 rounded text-white transition-colors"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 text-gray-400 hover:text-primary-600 transition-all duration-200 rounded-xl hover:bg-primary-50 group">
            <Bell className="w-5 h-5 group-hover:animate-bounce" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2 hover:bg-gray-100 transition-all duration-200 cursor-pointer group">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

