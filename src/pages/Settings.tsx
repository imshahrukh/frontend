import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Percent, Award } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { settingsService, type ISettings } from '../services/settingsService';
import { setUsdToPkrRate } from '../utils/currency';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    usdToPkrRate: 271.2,
    pmCommissionPercentage: 10,
    teamLeadBonusAmount: 10000,
    bidderBonusAmount: 5000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setFormData({
        usdToPkrRate: data.usdToPkrRate,
        pmCommissionPercentage: data.pmCommissionPercentage,
        teamLeadBonusAmount: data.teamLeadBonusAmount,
        bidderBonusAmount: data.bidderBonusAmount,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      alert('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (window.confirm('Are you sure you want to update these settings? This will affect all salary calculations.')) {
      try {
        setSaving(true);
        await settingsService.updateSettings(formData);
        // Update the global currency rate
        setUsdToPkrRate(formData.usdToPkrRate);
        alert('Settings updated successfully! The new exchange rate will be used for all future calculations.');
        // Reload the page to update all calculations
        window.location.reload();
      } catch (error: any) {
        console.error('Failed to update settings:', error);
        alert(error.response?.data?.message || 'Failed to update settings');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        usdToPkrRate: settings.usdToPkrRate,
        pmCommissionPercentage: settings.pmCommissionPercentage,
        teamLeadBonusAmount: settings.teamLeadBonusAmount,
        bidderBonusAmount: settings.bidderBonusAmount,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure exchange rates, commissions, and bonus amounts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Currency Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Currency Settings</h2>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> Changing the exchange rate will affect all USD to PKR conversions 
              in salary calculations. The new rate will be applied immediately to all future calculations.
            </p>
          </div>

          <div className="max-w-md">
            <Input
              label="USD to PKR Exchange Rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.usdToPkrRate}
              onChange={(e) =>
                setFormData({ ...formData, usdToPkrRate: parseFloat(e.target.value) || 0 })
              }
              required
              helperText="1 USD = ? PKR (e.g., 271.20)"
            />
            
            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-700">
                Current Rate: <strong>1 USD = {formData.usdToPkrRate} PKR</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Example: $100 = Rs {(100 * formData.usdToPkrRate).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Percent className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Commission Settings</h2>
          </div>

          <div className="max-w-md">
            <Input
              label="PM Default Commission Percentage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.pmCommissionPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pmCommissionPercentage: parseFloat(e.target.value) || 0,
                })
              }
              required
              helperText="Default commission percentage for Project Managers"
            />
          </div>
        </div>

        {/* Bonus Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Award className="w-5 h-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Bonus Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Team Lead Bonus Amount (PKR)"
              type="number"
              min="0"
              value={formData.teamLeadBonusAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  teamLeadBonusAmount: parseFloat(e.target.value) || 0,
                })
              }
              required
              helperText="Fixed bonus amount for Team Leads"
            />

            <Input
              label="Bidder Bonus Amount (PKR)"
              type="number"
              min="0"
              value={formData.bidderBonusAmount}
              onChange={(e) =>
                setFormData({ ...formData, bidderBonusAmount: parseFloat(e.target.value) || 0 })
              }
              required
              helperText="Fixed bonus amount for Bidders"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>

      {/* Last Updated Info */}
      {settings && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Last updated: {new Date(settings.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default Settings;
