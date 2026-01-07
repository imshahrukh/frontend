import React, { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, Briefcase, Calendar } from 'lucide-react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import { dashboardService } from '../services/dashboardService';
import type { IDashboardMetrics, ISalary, IEmployee } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency as formatCurrencyUtil, formatDualCurrency, formatDualCurrencyFromUsd, pkrToUsd } from '../utils/currency';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchMetrics();
  }, [selectedMonth]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getMetrics({ month: selectedMonth });
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, showDual = false) => {
    if (showDual) {
      return formatDualCurrency(amount);
    }
    return formatCurrencyUtil(amount, 'PKR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const salaryColumns: Column<ISalary>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (salary) => {
        const employee = salary.employee as IEmployee;
        return employee.name || 'N/A';
      },
    },
    {
      key: 'month',
      header: 'Month',
    },
    {
      key: 'totalAmount',
      header: 'Amount (PKR / USD)',
      render: (salary) => (
        <div className="text-sm">
          <div className="font-semibold">{formatCurrencyUtil(salary.totalAmount, 'PKR')}</div>
          <div className="text-gray-500 text-xs">{formatCurrencyUtil(pkrToUsd(salary.totalAmount), 'USD')}</div>
        </div>
      ),
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
      key: 'paidDate',
      header: 'Date',
      render: (salary) =>
        salary.paidDate ? formatDate(salary.paidDate) : '-',
    },
  ];

  // Chart data for paid vs pending
  const pieChartData = metrics && metrics.totalPaidSalary !== undefined
    ? [
        { name: 'Paid', value: metrics.totalPaidSalary || 0, color: '#22c55e' },
        { name: 'Pending', value: metrics.totalPendingSalary || 0, color: '#eab308' },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your salary management system</p>
      </div>

      {/* Month Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Month & Year
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Viewing Data For</p>
            <p className="text-lg font-bold text-primary-600">
              {(() => {
                const [year, month] = selectedMonth.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                return date.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                });
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Active Employees"
          value={metrics?.totalActiveEmployees || 0}
          icon={Users}
          iconColor="text-blue-600"
        />
        <Card
          title="Total Paid (Selected Month)"
          value={formatCurrency(metrics?.totalPaidSalary || 0, true)}
          icon={DollarSign}
          iconColor="text-success-600"
        />
        <Card
          title="Total Pending (Selected Month)"
          value={formatCurrency(metrics?.totalPendingSalary || 0, true)}
          icon={TrendingUp}
          iconColor="text-yellow-600"
        />
        <Card
          title="Monthly Revenue Collected"
          value={formatDualCurrencyFromUsd(metrics?.totalProjectPayout || 0)}
          icon={Briefcase}
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Paid vs Pending */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Salary Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Recent Salaries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Salary Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: 'Paid',
                  count: metrics?.salaryOverview?.paid?.length || 0,
                  amount: metrics?.totalPaidSalary || 0,
                },
                {
                  name: 'Pending',
                  count: metrics?.salaryOverview?.pending?.length || 0,
                  amount: metrics?.totalPendingSalary || 0,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="amount" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Paid Salaries Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Paid Salaries ({(() => {
              const [year, month] = selectedMonth.split('-');
              const date = new Date(parseInt(year), parseInt(month) - 1, 1);
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              });
            })()})
          </h3>
        </div>
        <Table
          columns={salaryColumns}
          data={metrics?.salaryOverview?.paid || []}
          emptyMessage="No paid salaries found"
          rowClassName={(salary) =>
            salary.status === 'Paid' ? 'bg-success-50' : ''
          }
        />
      </div>

      {/* Pending Salaries Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Salaries ({(() => {
              const [year, month] = selectedMonth.split('-');
              const date = new Date(parseInt(year), parseInt(month) - 1, 1);
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              });
            })()})
          </h3>
        </div>
        <Table
          columns={salaryColumns}
          data={metrics?.salaryOverview?.pending || []}
          emptyMessage="No pending salaries found"
        />
      </div>
    </div>
  );
};

export default Dashboard;

