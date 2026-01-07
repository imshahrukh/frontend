import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  Edit, 
  Plus,
  TrendingUp,
  Activity
} from 'lucide-react';
import { projectHistoryService } from '../../services/projectHistoryService';
import type { IProjectHistory } from '../../types';

interface ProjectHistoryTimelineProps {
  projectId: string;
}

const ProjectHistoryTimeline: React.FC<ProjectHistoryTimelineProps> = ({ projectId }) => {
  const [history, setHistory] = useState<IProjectHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [projectId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await projectHistoryService.getProjectHistory(projectId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch project history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'CREATED':
        return <Plus className="w-5 h-5 text-green-600" />;
      case 'TEAM_CHANGED':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'STATUS_CHANGED':
        return <Activity className="w-5 h-5 text-yellow-600" />;
      case 'CLOSED':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      case 'REOPENED':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Edit className="w-5 h-5 text-gray-600" />;
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'CREATED':
        return 'bg-green-100 border-green-300';
      case 'TEAM_CHANGED':
        return 'bg-blue-100 border-blue-300';
      case 'STATUS_CHANGED':
        return 'bg-yellow-100 border-yellow-300';
      case 'CLOSED':
        return 'bg-gray-100 border-gray-300';
      case 'REOPENED':
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'CREATED':
        return 'Project Created';
      case 'TEAM_CHANGED':
        return 'Team Updated';
      case 'STATUS_CHANGED':
        return 'Status Changed';
      case 'CLOSED':
        return 'Project Closed';
      case 'REOPENED':
        return 'Project Reopened';
      default:
        return 'Project Updated';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No history available for this project</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {history.map((entry) => (
            <div key={entry._id} className="relative pl-16">
              {/* Icon */}
              <div
                className={`absolute left-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getChangeTypeColor(
                  entry.changeType
                )}`}
              >
                {getChangeTypeIcon(entry.changeType)}
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {getChangeTypeLabel(entry.changeType)}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      by {entry.changedBy.email} • {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Changes */}
                {entry.changes.length > 0 && (
                  <div className="space-y-2">
                    {entry.changes.map((change, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded p-3 text-sm"
                      >
                        {change.description ? (
                          <p className="text-gray-700">{change.description}</p>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">
                              {change.field}:
                            </span>
                            {change.oldValue && (
                              <>
                                <span className="text-red-600 line-through">
                                  {typeof change.oldValue === 'object'
                                    ? JSON.stringify(change.oldValue)
                                    : String(change.oldValue)}
                                </span>
                                <span className="text-gray-400">→</span>
                              </>
                            )}
                            <span className="text-green-600 font-medium">
                              {typeof change.newValue === 'object'
                                ? JSON.stringify(change.newValue)
                                : String(change.newValue)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Snapshot Summary */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {entry.snapshot.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        ${entry.snapshot.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Team Summary */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Team:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.snapshot.team.projectManager && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          PM: {entry.snapshot.team.projectManager}
                        </span>
                      )}
                      {entry.snapshot.team.teamLead && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          TL: {entry.snapshot.team.teamLead}
                        </span>
                      )}
                      {entry.snapshot.team.manager && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Manager: {entry.snapshot.team.manager}
                        </span>
                      )}
                      {entry.snapshot.team.bidder && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Bidder: {entry.snapshot.team.bidder}
                        </span>
                      )}
                      {entry.snapshot.team.developers.length > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          Devs: {entry.snapshot.team.developers.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectHistoryTimeline;

