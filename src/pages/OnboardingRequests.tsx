import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Mail,
  Briefcase,
  CreditCard
} from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { onboardingService } from '../services/onboardingService';
import type { IOnboardingRequest } from '../services/onboardingService';
import { formatDate } from '../utils/formatters';

const OnboardingRequests: React.FC = () => {
  const [requests, setRequests] = useState<IOnboardingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<IOnboardingRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [baseSalary, setBaseSalary] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getOnboardingRequests(filterStatus);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching onboarding requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !baseSalary) return;

    try {
      setActionLoading(true);
      await onboardingService.approveOnboardingRequest(
        selectedRequest._id,
        Number(baseSalary),
        reviewNotes
      );
      setShowApproveModal(false);
      setSelectedRequest(null);
      setBaseSalary('');
      setReviewNotes('');
      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      await onboardingService.rejectOnboardingRequest(
        selectedRequest._id,
        reviewNotes
      );
      setShowRejectModal(false);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      await onboardingService.deleteOnboardingRequest(id);
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-success-100 text-success-800',
      Rejected: 'bg-danger-100 text-danger-800',
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Requests</h1>
          <p className="text-gray-600 mt-1">Review and approve new employee applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Button onClick={fetchRequests} variant="secondary">
            Refresh
          </Button>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Onboarding Requests</h3>
          <p className="text-gray-600">
            {filterStatus ? 'No requests found with this status' : 'There are no onboarding requests to review'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.name}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{request.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{request.department}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{formatDate(request.joiningDate)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setBaseSalary(String(request.baseSalary || ''));
                              setShowApproveModal(true);
                            }}
                            className="text-success-600 hover:text-success-900"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                            className="text-danger-600 hover:text-danger-900"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(request._id)}
                        className="text-danger-600 hover:text-danger-900"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
          title="Onboarding Request Details"
        >
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{selectedRequest.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date of Birth:</span>
                  <p className="font-medium">{selectedRequest.dateOfBirth || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium">{selectedRequest.address || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Emergency Contact:</span>
                  <p className="font-medium">{selectedRequest.emergencyContact || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Emergency Phone:</span>
                  <p className="font-medium">{selectedRequest.emergencyPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Employment Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Role:</span>
                  <p className="font-medium">{selectedRequest.role}</p>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <p className="font-medium">{selectedRequest.department}</p>
                </div>
                <div>
                  <span className="text-gray-600">Joining Date:</span>
                  <p className="font-medium">{formatDate(selectedRequest.joiningDate)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Base Salary:</span>
                  <p className="font-medium">Rs {selectedRequest.baseSalary?.toLocaleString() || 'Not set'}</p>
                </div>
                {selectedRequest.techStack && selectedRequest.techStack.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Tech Stack:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedRequest.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banking Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Banking Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bank Name:</span>
                  <p className="font-medium">{selectedRequest.bankName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Account Holder:</span>
                  <p className="font-medium">{selectedRequest.accountHolderName}</p>
                </div>
                <div>
                  <span className="text-gray-600">IBAN:</span>
                  <p className="font-medium font-mono text-xs">{selectedRequest.iban}</p>
                </div>
                <div>
                  <span className="text-gray-600">SWIFT Code:</span>
                  <p className="font-medium">{selectedRequest.swiftCode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Payoneer Information */}
            {selectedRequest.hasPayoneer && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Payoneer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Payoneer Email:</span>
                    <p className="font-medium">{selectedRequest.payoneerEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Account ID:</span>
                    <p className="font-medium">{selectedRequest.payoneerAccountId || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Information */}
            {selectedRequest.status !== 'Pending' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Review Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">{getStatusBadge(selectedRequest.status)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Reviewed At:</span>
                    <p className="font-medium">{selectedRequest.reviewedAt ? formatDate(selectedRequest.reviewedAt) : 'N/A'}</p>
                  </div>
                  {selectedRequest.reviewNotes && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Review Notes:</span>
                      <p className="font-medium">{selectedRequest.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Approve Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedRequest(null);
            setBaseSalary('');
            setReviewNotes('');
          }}
          title="Approve Onboarding Request"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Approve <strong>{selectedRequest.name}</strong> for the role of{' '}
              <strong>{selectedRequest.role}</strong>?
            </p>
            <Input
              label="Base Salary (PKR)"
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              placeholder="300000"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any notes about the approval..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                  setBaseSalary('');
                  setReviewNotes('');
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                variant="success"
                loading={actionLoading}
                disabled={!baseSalary}
              >
                Approve & Create Employee
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
            setReviewNotes('');
          }}
          title="Reject Onboarding Request"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to reject the onboarding request from{' '}
              <strong>{selectedRequest.name}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Explain why the request is being rejected..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setReviewNotes('');
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="danger"
                loading={actionLoading}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OnboardingRequests;

