import React, { useState, useEffect } from 'react';
import { Save, Trash2, Edit2, X, Calendar } from 'lucide-react';
import Input from '../components/common/Input';
import { monthlyRevenueService } from '../services/monthlyRevenueService';
import { formatCurrency, usdToPkr } from '../utils/currency';
import type { IProject, IMonthlyRevenueFormData } from '../types';

interface RevenueEntry {
  _id?: string;
  project: IProject | string;
  amountCollected: number;
  notes: string;
  isNew?: boolean;
  isEditing?: boolean;
}

const MonthlyRevenue: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revenues, setRevenues] = useState<RevenueEntry[]>([]);
  const [availableProjects, setAvailableProjects] = useState<IProject[]>([]);

  useEffect(() => {
    fetchRevenuesForMonth();
  }, [selectedMonth]);

  const fetchRevenuesForMonth = async () => {
    try {
      setLoading(true);
      const data = await monthlyRevenueService.getRevenuesByMonth(selectedMonth);
      
      // Convert existing revenues to entries
      const existingEntries: RevenueEntry[] = data.existingRevenues.map(rev => ({
        _id: rev._id,
        project: rev.project,
        amountCollected: rev.amountCollected,
        notes: rev.notes || '',
        isEditing: false
      }));

      setRevenues(existingEntries);
      setAvailableProjects(data.projectsWithoutRevenue);
    } catch (error) {
      console.error('Failed to fetch revenues:', error);
      alert('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = (projectId: string) => {
    const project = availableProjects.find(p => p._id === projectId);
    if (!project) return;

    const newEntry: RevenueEntry = {
      project,
      amountCollected: 0,
      notes: '',
      isNew: true,
      isEditing: true
    };

    setRevenues([...revenues, newEntry]);
    setAvailableProjects(availableProjects.filter(p => p._id !== projectId));
  };

  const handleUpdateEntry = (index: number, field: 'amountCollected' | 'notes', value: string | number) => {
    const updated = [...revenues];
    updated[index] = { ...updated[index], [field]: value };
    setRevenues(updated);
  };

  const handleSaveEntry = async (index: number) => {
    const entry = revenues[index];
    const projectId = typeof entry.project === 'string' ? entry.project : entry.project._id;

    try {
      setSaving(true);
      
      const formData: IMonthlyRevenueFormData = {
        project: projectId,
        month: selectedMonth,
        amountCollected: entry.amountCollected,
        notes: entry.notes
      };

      if (entry.isNew) {
        await monthlyRevenueService.createMonthlyRevenue(formData);
      } else if (entry._id) {
        await monthlyRevenueService.updateMonthlyRevenue(entry._id, {
          amountCollected: entry.amountCollected,
          notes: entry.notes
        });
      }

      // Refresh data
      await fetchRevenuesForMonth();
    } catch (error: any) {
      console.error('Failed to save revenue:', error);
      alert(error.response?.data?.message || 'Failed to save revenue entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (index: number) => {
    const entry = revenues[index];

    if (entry.isNew) {
      // Just remove from UI
      const project = entry.project as IProject;
      setRevenues(revenues.filter((_, i) => i !== index));
      setAvailableProjects([...availableProjects, project]);
      return;
    }

    if (!entry._id) return;

    if (!window.confirm('Are you sure you want to delete this revenue entry?')) {
      return;
    }

    try {
      setSaving(true);
      await monthlyRevenueService.deleteMonthlyRevenue(entry._id);
      await fetchRevenuesForMonth();
    } catch (error) {
      console.error('Failed to delete revenue:', error);
      alert('Failed to delete revenue entry');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEdit = (index: number) => {
    const updated = [...revenues];
    updated[index] = { ...updated[index], isEditing: !updated[index].isEditing };
    setRevenues(updated);
  };

  const handleCancelEdit = (index: number) => {
    const entry = revenues[index];
    
    if (entry.isNew) {
      // Remove new entry and restore project to available list
      const project = entry.project as IProject;
      setRevenues(revenues.filter((_, i) => i !== index));
      setAvailableProjects([...availableProjects, project]);
    } else {
      // Just toggle editing off (will reload from server data)
      fetchRevenuesForMonth();
    }
  };

  const getTotalRevenue = () => {
    return revenues.reduce((sum, entry) => sum + (entry.amountCollected || 0), 0);
  };

  const getProjectName = (project: IProject | string): string => {
    return typeof project === 'string' ? project : project.name;
  };

  const getProjectClient = (project: IProject | string): string => {
    return typeof project === 'string' ? '' : project.clientName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading revenue data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monthly Project Revenue</h1>
        <p className="text-gray-600 mt-1">
          Track revenue collected from each project per month
        </p>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Total Revenue Summary */}
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Revenue (USD)</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalRevenue(), 'USD')}
            </p>
            <p className="text-sm text-gray-500">
              {formatCurrency(usdToPkr(getTotalRevenue()), 'PKR')}
            </p>
          </div>
        </div>
      </div>

      {/* Add Project Section */}
      {availableProjects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Add Project Revenue</h3>
              <p className="text-sm text-blue-700">
                {availableProjects.length} active project(s) without revenue entry for this month
              </p>
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddProject(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-4 py-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Select a project...</option>
              {availableProjects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name} - {project.clientName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Revenue Entries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Collected (USD)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (PKR)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No revenue entries for this month. Add projects above to get started.
                  </td>
                </tr>
              ) : (
                revenues.map((entry, index) => (
                  <tr key={index} className={entry.isNew ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {getProjectName(entry.project)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getProjectClient(entry.project)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry.amountCollected}
                          onChange={(e) =>
                            handleUpdateEntry(index, 'amountCollected', parseFloat(e.target.value) || 0)
                          }
                          className="w-32"
                        />
                      ) : (
                        <span className="font-semibold text-green-600">
                          {formatCurrency(entry.amountCollected, 'USD')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(usdToPkr(entry.amountCollected), 'PKR')}
                    </td>
                    <td className="px-6 py-4">
                      {entry.isEditing ? (
                        <input
                          type="text"
                          value={entry.notes}
                          onChange={(e) => handleUpdateEntry(index, 'notes', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Optional notes..."
                        />
                      ) : (
                        <span className="text-sm text-gray-600">{entry.notes || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {entry.isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEntry(index)}
                              disabled={saving}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelEdit(index)}
                              disabled={saving}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleEdit(index)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(index)}
                              disabled={saving}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Select a month to view and manage revenue entries</li>
          <li>• Add projects that collected revenue during that month</li>
          <li>• Enter the amount collected in USD (will auto-convert to PKR)</li>
          <li>• These amounts will be used to calculate employee commissions and bonuses</li>
          <li>• You can edit or remove entries as needed</li>
        </ul>
      </div>
    </div>
  );
};

export default MonthlyRevenue;

