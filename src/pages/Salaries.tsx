import React, { useEffect, useState } from 'react';
import { DollarSign, Eye, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import { salaryService } from '../services/salaryService';
import type { ISalary, IEmployee } from '../types';
import { SalaryStatus } from '../types';
import { formatCurrency as formatCurrencyUtil, formatDualCurrency, pkrToUsd } from '../utils/currency';

const Salaries: React.FC = () => {
  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [salaries, setSalaries] = useState<ISalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<ISalary | null>(null);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterStatus, setFilterStatus] = useState('');
  const [generateMonth, setGenerateMonth] = useState(getCurrentMonth());
  const [generating, setGenerating] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  // Payment form
  const [paidDate, setPaidDate] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    fetchSalaries();
  }, [filterMonth, filterStatus]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterMonth) filters.month = filterMonth;
      if (filterStatus) filters.status = filterStatus;
      const data = await salaryService.getSalaries(filters);
      setSalaries(data);
    } catch (error) {
      console.error('Failed to fetch salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSalaries = async () => {
    if (!generateMonth) {
      alert('Please select a month');
      return;
    }

    if (window.confirm(`Generate salaries for ${generateMonth}?`)) {
      try {
        setGenerating(true);
        const result = await salaryService.generateSalaries(generateMonth);
        setGenerateMonth(getCurrentMonth()); // Reset to current month
        fetchSalaries();
        
        // Show detailed message
        const message = result.message || 
          `Successfully generated ${result.count} salaries for ${generateMonth}!`;
        alert(message);
      } catch (error: any) {
        console.error('Failed to generate salaries:', error);
        alert(error.response?.data?.message || 'Failed to generate salaries');
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleRecalculateSalaries = async () => {
    if (!generateMonth) {
      alert('Please select a month');
      return;
    }

    if (window.confirm(`Recalculate salaries for ${generateMonth}? This will update all salaries with the latest project bonuses and commissions.`)) {
      try {
        setRecalculating(true);
        const result = await salaryService.recalculateSalaries(generateMonth);
        fetchSalaries();
        
        alert(result.message || `Successfully recalculated salaries for ${generateMonth}!`);
      } catch (error: any) {
        console.error('Failed to recalculate salaries:', error);
        alert(error.response?.data?.message || 'Failed to recalculate salaries');
      } finally {
        setRecalculating(false);
      }
    }
  };

  const handleViewDetails = (salary: ISalary) => {
    setSelectedSalary(salary);
    setIsDetailModalOpen(true);
  };

  const handleOpenPaymentModal = (salary: ISalary) => {
    setSelectedSalary(salary);
    setPaidDate(new Date().toISOString().split('T')[0]);
    setPaymentReference('');
    setIsPaymentModalOpen(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedSalary) return;

    try {
      await salaryService.updateSalaryStatus(
        selectedSalary._id,
        'Paid',
        paidDate,
        paymentReference
      );
      setIsPaymentModalOpen(false);
      setSelectedSalary(null);
      fetchSalaries();
    } catch (error) {
      console.error('Failed to update salary status:', error);
      alert('Failed to update salary status');
    }
  };

  const formatCurrency = (amount: number, showDual = false) => {
    if (showDual) {
      return formatDualCurrency(amount);
    }
    return formatCurrencyUtil(amount, 'PKR');
  };
  
  const formatCurrencyDualDisplay = (amount: number) => {
    return (
      <div className="text-sm">
        <div className="font-semibold">{formatCurrencyUtil(amount, 'PKR')}</div>
        <div className="text-gray-500 text-xs">{formatCurrencyUtil(pkrToUsd(amount), 'USD')}</div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const columns: Column<ISalary>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (salary) => {
        const employee = salary.employee as IEmployee;
        return (
          <div>
            <p className="font-medium">{employee.name}</p>
            <p className="text-xs text-gray-500">{employee.email}</p>
          </div>
        );
      },
    },
    { key: 'month', header: 'Month' },
    {
      key: 'baseSalary',
      header: 'Base Salary (PKR)',
      render: (salary) => formatCurrencyDualDisplay(salary.baseSalary),
    },
    {
      key: 'bonuses',
      header: 'Bonuses (PKR / USD)',
      render: (salary) => {
        const totalBonuses = salary.projectBonuses.reduce(
          (sum, bonus) => sum + bonus.amount,
          0
        );
        return (
          <div className="text-sm">
            <div className="font-semibold">{formatCurrencyUtil(totalBonuses, 'PKR')}</div>
            <div className="text-gray-500 text-xs">{formatCurrencyUtil(pkrToUsd(totalBonuses), 'USD')}</div>
          </div>
        );
      },
    },
    {
      key: 'commissions',
      header: 'Commissions (PKR / USD)',
      render: (salary) => {
        const totalCommissions = [
          ...salary.pmCommissions,
          ...(salary.teamLeadCommissions || []),
          ...salary.managerCommissions,
          ...(salary.bidderCommissions || []),
        ].reduce((sum, comm) => sum + comm.amount, 0);
        return (
          <div className="text-sm">
            <div className="font-semibold">{formatCurrencyUtil(totalCommissions, 'PKR')}</div>
            <div className="text-gray-500 text-xs">{formatCurrencyUtil(pkrToUsd(totalCommissions), 'USD')}</div>
          </div>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Total Amount (PKR / USD)',
      render: (salary) => formatCurrencyDualDisplay(salary.totalAmount),
    },
    {
      key: 'status',
      header: 'Status',
      render: (salary) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            salary.status === 'Paid'
              ? 'bg-success-100 text-success-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {salary.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (salary) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(salary);
            }}
            className="text-primary-600 hover:text-primary-800"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {salary.status === 'Pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPaymentModal(salary);
              }}
              className="text-success-600 hover:text-success-800"
              title="Mark as Paid"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salaries</h1>
          <p className="text-gray-600 mt-1">Manage salary payments and generation</p>
        </div>
      </div>

      {/* Generate Salaries Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Generate Monthly Salaries</h3>
            <p className="text-primary-100 text-sm">
              Generate new salaries or recalculate existing ones with latest project data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-48">
              <input
              type="month"
              value={generateMonth}
              onChange={(e) => setGenerateMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:ring-2 focus:ring-white focus:border-white"
                placeholder="Select month"
            />
            </div>
            <Button
              onClick={handleGenerateSalaries}
              variant="secondary"
              loading={generating}
              disabled={!generateMonth}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Generate
            </Button>
            <Button
              onClick={handleRecalculateSalaries}
              variant="secondary"
              loading={recalculating}
              disabled={!generateMonth}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="month"
            label="Filter by Month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={Object.values(SalaryStatus).map((status) => ({
              value: status,
              label: status,
            }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={salaries}
            rowClassName={(salary) =>
              salary.status === 'Paid' ? 'bg-success-50' : ''
            }
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Salary Breakdown"
        size="lg"
      >
        {selectedSalary && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Employee Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm">
                  <span className="font-medium">Name:</span>{' '}
                  {(selectedSalary.employee as IEmployee).name}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Email:</span>{' '}
                  {(selectedSalary.employee as IEmployee).email}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Month:</span> {selectedSalary.month}
                </p>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Salary Components
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Base Salary */}
                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 border-b">
                  <span className="text-gray-700 font-medium">Base Salary</span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrencyUtil(selectedSalary.baseSalary, 'PKR')}</div>
                    <div className="text-xs text-gray-500">{formatCurrencyUtil(pkrToUsd(selectedSalary.baseSalary), 'USD')}</div>
                  </div>
                </div>

                {/* Project Bonuses */}
                {selectedSalary.projectBonuses.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                      <p className="text-sm font-semibold text-blue-900">Project Bonuses</p>
                    </div>
                    {selectedSalary.projectBonuses.map((bonus, index) => {
                      const runningTotal = selectedSalary.baseSalary + 
                        selectedSalary.projectBonuses.slice(0, index + 1).reduce((sum, b) => sum + b.amount, 0);
                      return (
                        <div key={index} className="flex justify-between items-center py-2 px-4 hover:bg-gray-50 border-b text-sm">
                          <div className="flex-1">
                            <div className="text-gray-700">
                              {typeof bonus.project === 'string' ? 'Project' : (bonus.project as any).name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Accumulative: {formatCurrencyUtil(runningTotal, 'PKR')} / {formatCurrencyUtil(pkrToUsd(runningTotal), 'USD')}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-medium text-blue-700">+{formatCurrencyUtil(bonus.amount, 'PKR')}</div>
                            <div className="text-xs text-gray-500">+{formatCurrencyUtil(pkrToUsd(bonus.amount), 'USD')}</div>
                      </div>
                  </div>
                      );
                    })}
                  </>
                )}

                {/* PM Commissions */}
                {selectedSalary.pmCommissions.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                      <p className="text-sm font-semibold text-green-900">PM Commissions</p>
                    </div>
                    {selectedSalary.pmCommissions.map((comm, index) => {
                      const bonusTotal = selectedSalary.projectBonuses.reduce((sum, b) => sum + b.amount, 0);
                      const pmTotal = selectedSalary.pmCommissions.slice(0, index + 1).reduce((sum, c) => sum + c.amount, 0);
                      const runningTotal = selectedSalary.baseSalary + bonusTotal + pmTotal;
                      const commInfo = (comm as any);
                      const rateDisplay = commInfo.commissionType === 'percentage' 
                        ? `${commInfo.commissionRate}%` 
                        : `Fixed: ${formatCurrencyUtil(commInfo.commissionRate || 0, 'PKR')}`;
                      return (
                        <div key={index} className="flex justify-between items-center py-2 px-4 hover:bg-gray-50 border-b text-sm">
                          <div className="flex-1">
                            <div className="text-gray-700">
                              {typeof comm.project === 'string' ? 'Project' : (comm.project as any).name}
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded font-semibold">
                                {rateDisplay}
                        </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Accumulative: {formatCurrencyUtil(runningTotal, 'PKR')} / {formatCurrencyUtil(pkrToUsd(runningTotal), 'USD')}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-medium text-green-700">+{formatCurrencyUtil(comm.amount, 'PKR')}</div>
                            <div className="text-xs text-gray-500">+{formatCurrencyUtil(pkrToUsd(comm.amount), 'USD')}</div>
                      </div>
                  </div>
                      );
                    })}
                  </>
                )}

                {/* Team Lead Commissions */}
                {selectedSalary.teamLeadCommissions && selectedSalary.teamLeadCommissions.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-purple-50 border-b border-purple-100">
                      <p className="text-sm font-semibold text-purple-900">Team Lead Commissions</p>
                    </div>
                    {selectedSalary.teamLeadCommissions.map((comm, index) => {
                      const bonusTotal = selectedSalary.projectBonuses.reduce((sum, b) => sum + b.amount, 0);
                      const pmTotal = selectedSalary.pmCommissions.reduce((sum, c) => sum + c.amount, 0);
                      const tlTotal = selectedSalary.teamLeadCommissions!.slice(0, index + 1).reduce((sum, c) => sum + c.amount, 0);
                      const runningTotal = selectedSalary.baseSalary + bonusTotal + pmTotal + tlTotal;
                      const commInfo = (comm as any);
                      const rateDisplay = commInfo.commissionType === 'percentage' 
                        ? `${commInfo.commissionRate}%` 
                        : `Fixed: ${formatCurrencyUtil(commInfo.commissionRate || 0, 'PKR')}`;
                      return (
                        <div key={index} className="flex justify-between items-center py-2 px-4 hover:bg-gray-50 border-b text-sm">
                          <div className="flex-1">
                            <div className="text-gray-700">
                              {typeof comm.project === 'string' ? 'Project' : (comm.project as any).name}
                              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded font-semibold">
                                {rateDisplay}
                        </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Accumulative: {formatCurrencyUtil(runningTotal, 'PKR')} / {formatCurrencyUtil(pkrToUsd(runningTotal), 'USD')}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-medium text-purple-700">+{formatCurrencyUtil(comm.amount, 'PKR')}</div>
                            <div className="text-xs text-gray-500">+{formatCurrencyUtil(pkrToUsd(comm.amount), 'USD')}</div>
                      </div>
                  </div>
                      );
                    })}
                  </>
                )}

                {/* Manager Commissions */}
                {selectedSalary.managerCommissions.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
                      <p className="text-sm font-semibold text-yellow-900">Manager Commissions</p>
                    </div>
                    {selectedSalary.managerCommissions.map((comm, index) => {
                      const bonusTotal = selectedSalary.projectBonuses.reduce((sum, b) => sum + b.amount, 0);
                      const pmTotal = selectedSalary.pmCommissions.reduce((sum, c) => sum + c.amount, 0);
                      const tlTotal = (selectedSalary.teamLeadCommissions || []).reduce((sum, c) => sum + c.amount, 0);
                      const mgrTotal = selectedSalary.managerCommissions.slice(0, index + 1).reduce((sum, c) => sum + c.amount, 0);
                      const runningTotal = selectedSalary.baseSalary + bonusTotal + pmTotal + tlTotal + mgrTotal;
                      const commInfo = (comm as any);
                      const rateDisplay = commInfo.commissionType === 'percentage' 
                        ? `${commInfo.commissionRate}%` 
                        : `Fixed: ${formatCurrencyUtil(commInfo.commissionRate || 0, 'PKR')}`;
                      return (
                        <div key={index} className="flex justify-between items-center py-2 px-4 hover:bg-gray-50 border-b text-sm">
                          <div className="flex-1">
                            <div className="text-gray-700">
                              {typeof comm.project === 'string' ? 'Project' : (comm.project as any).name}
                              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-semibold">
                                {rateDisplay}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Accumulative: {formatCurrencyUtil(runningTotal, 'PKR')} / {formatCurrencyUtil(pkrToUsd(runningTotal), 'USD')}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-medium text-yellow-700">+{formatCurrencyUtil(comm.amount, 'PKR')}</div>
                            <div className="text-xs text-gray-500">+{formatCurrencyUtil(pkrToUsd(comm.amount), 'USD')}</div>
                      </div>
                  </div>
                      );
                    })}
                  </>
                )}

                {/* Bidder Commissions */}
                {selectedSalary.bidderCommissions && selectedSalary.bidderCommissions.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                      <p className="text-sm font-semibold text-indigo-900">Bidder Commissions</p>
                    </div>
                    {selectedSalary.bidderCommissions.map((comm, index) => {
                      const bonusTotal = selectedSalary.projectBonuses.reduce((sum, b) => sum + b.amount, 0);
                      const pmTotal = selectedSalary.pmCommissions.reduce((sum, c) => sum + c.amount, 0);
                      const tlTotal = (selectedSalary.teamLeadCommissions || []).reduce((sum, c) => sum + c.amount, 0);
                      const mgrTotal = selectedSalary.managerCommissions.reduce((sum, c) => sum + c.amount, 0);
                      const bidderTotal = selectedSalary.bidderCommissions!.slice(0, index + 1).reduce((sum, c) => sum + c.amount, 0);
                      const runningTotal = selectedSalary.baseSalary + bonusTotal + pmTotal + tlTotal + mgrTotal + bidderTotal;
                      const commInfo = (comm as any);
                      const rateDisplay = commInfo.commissionType === 'percentage' 
                        ? `${commInfo.commissionRate}%` 
                        : `Fixed: ${formatCurrencyUtil(commInfo.commissionRate || 0, 'PKR')}`;
                      return (
                        <div key={index} className="flex justify-between items-center py-2 px-4 hover:bg-gray-50 border-b text-sm">
                          <div className="flex-1">
                            <div className="text-gray-700">
                              {typeof comm.project === 'string' ? 'Project' : (comm.project as any).name}
                              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded font-semibold">
                                {rateDisplay}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Accumulative: {formatCurrencyUtil(runningTotal, 'PKR')} / {formatCurrencyUtil(pkrToUsd(runningTotal), 'USD')}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-medium text-indigo-700">+{formatCurrencyUtil(comm.amount, 'PKR')}</div>
                            <div className="text-xs text-gray-500">+{formatCurrencyUtil(pkrToUsd(comm.amount), 'USD')}</div>
                      </div>
                  </div>
                      );
                    })}
                  </>
                )}

                {/* Total */}
                <div className="flex justify-between items-center py-4 px-4 bg-primary-50">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary-600">{formatCurrencyUtil(selectedSalary.totalAmount, 'PKR')}</div>
                    <div className="text-sm text-primary-700">{formatCurrencyUtil(pkrToUsd(selectedSalary.totalAmount), 'USD')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {selectedSalary.status === 'Paid' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Payment Information
                </h3>
                <div className="bg-success-50 rounded-lg p-4">
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <span className="text-success-700">Paid</span>
                  </p>
                  {selectedSalary.paidDate && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Paid Date:</span>{' '}
                      {formatDate(selectedSalary.paidDate)}
                    </p>
                  )}
                  {selectedSalary.paymentReference && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Reference:</span>{' '}
                      {selectedSalary.paymentReference}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Mark Salary as Paid"
        size="md"
      >
        {selectedSalary && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium">Employee:</span>{' '}
                {(selectedSalary.employee as IEmployee).name}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Amount:</span>{' '}
                {formatCurrency(selectedSalary.totalAmount)}
              </p>
            </div>

            <Input
              label="Payment Date"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              required
            />

            <Input
              label="Payment Reference (Optional)"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g., Transaction ID, Check Number"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" variant="success" onClick={handleMarkAsPaid}>
                Mark as Paid
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Salaries;

