import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Share2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import ShareLinkModal from '../components/common/ShareLinkModal';
import type { Column } from '../components/common/Table';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import type { IEmployee, IEmployeeFormData, IDepartment } from '../types';
import { EmployeeRole, EmployeeStatus } from '../types';
import { formatCurrency as formatCurrencyUtil, pkrToUsd } from '../utils/currency';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Form state
  const [formData, setFormData] = useState<IEmployeeFormData>({
    name: '',
    email: '',
    role: EmployeeRole.DEVELOPER,
    department: '',
    techStack: [],
    baseSalary: 0,
    status: EmployeeStatus.ACTIVE,
  });

  // Extended onboarding data
  const [onboardingData, setOnboardingData] = useState({
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    joiningDate: '',
    banking: {
      bankName: '',
      accountHolderName: '',
      iban: '',
      swiftCode: '',
    },
    payoneer: {
      email: '',
      accountId: '',
    },
  });

  const [techStackInput, setTechStackInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'banking' | 'payoneer'>('basic');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleOpenModal = (employee?: IEmployee) => {
    if (employee) {
      setEditingEmployee(employee);
      const dept = typeof employee.department === 'string' ? employee.department : employee.department._id;
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: dept,
        techStack: employee.techStack,
        baseSalary: employee.baseSalary,
        status: employee.status,
      });
      
      // Populate onboarding data if it exists
      if (employee.onboardingData) {
        setOnboardingData({
          phone: employee.onboardingData.phone || '',
          address: employee.onboardingData.address || '',
          dateOfBirth: employee.onboardingData.dateOfBirth || '',
          emergencyContact: employee.onboardingData.emergencyContact || '',
          emergencyPhone: employee.onboardingData.emergencyPhone || '',
          joiningDate: employee.onboardingData.joiningDate ? employee.onboardingData.joiningDate.split('T')[0] : '',
          banking: {
            bankName: employee.onboardingData.banking?.bankName || '',
            accountHolderName: employee.onboardingData.banking?.accountHolderName || '',
            iban: employee.onboardingData.banking?.iban || '',
            swiftCode: employee.onboardingData.banking?.swiftCode || '',
          },
          payoneer: {
            email: employee.onboardingData.payoneer?.email || '',
            accountId: employee.onboardingData.payoneer?.accountId || '',
          },
        });
      }
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        role: EmployeeRole.DEVELOPER,
        department: '',
        techStack: [],
        baseSalary: 0,
        status: EmployeeStatus.ACTIVE,
      });
      setOnboardingData({
        phone: '',
        address: '',
        dateOfBirth: '',
        emergencyContact: '',
        emergencyPhone: '',
        joiningDate: '',
        banking: {
          bankName: '',
          accountHolderName: '',
          iban: '',
          swiftCode: '',
        },
        payoneer: {
          email: '',
          accountId: '',
        },
      });
    }
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setTechStackInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employeeData = {
        ...formData,
        onboardingData,
      };
      
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee._id, employeeData);
      } else {
        await employeeService.createEmployee(employeeData);
      }
      handleCloseModal();
      fetchEmployees();
    } catch (error) {
      console.error('Failed to save employee:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.deleteEmployee(id);
        fetchEmployees();
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const handleAddTechStack = () => {
    if (techStackInput.trim() && !formData.techStack.includes(techStackInput.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techStackInput.trim()],
      });
      setTechStackInput('');
    }
  };

  const handleRemoveTechStack = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || employee.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const columns: Column<IEmployee>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    {
      key: 'department',
      header: 'Department',
      render: (employee) => {
        const dept = employee.department as IDepartment;
        return dept?.name || 'N/A';
      },
    },
    {
      key: 'techStack',
      header: 'Tech Stack',
      render: (employee) => (
        <div className="flex flex-wrap gap-1">
          {employee.techStack.slice(0, 2).map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded"
            >
              {tech}
            </span>
          ))}
          {employee.techStack.length > 2 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
              +{employee.techStack.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'baseSalary',
      header: 'Base Salary (PKR / USD)',
      render: (employee) => (
        <div className="text-sm">
          <div className="font-semibold">{formatCurrencyUtil(employee.baseSalary, 'PKR')}</div>
          <div className="text-gray-500 text-xs">{formatCurrencyUtil(pkrToUsd(employee.baseSalary), 'USD')}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (employee) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            employee.status === 'Active'
              ? 'bg-success-100 text-success-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {employee.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employee) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(employee);
            }}
            className="text-primary-600 hover:text-primary-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(employee._id);
            }}
            className="text-danger-600 hover:text-danger-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your team members</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsShareModalOpen(true)} variant="secondary">
            <Share2 className="w-4 h-4 mr-2" />
            Share Onboarding Link
          </Button>
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            options={Object.values(EmployeeRole).map((role) => ({
              value: role,
              label: role,
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
          <Table columns={columns} data={filteredEmployees} />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'basic'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contact'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contact & Personal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('banking')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'banking'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Banking
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payoneer')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payoneer'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payoneer
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-4 max-h-96 overflow-y-auto">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as EmployeeRole })
                    }
                    options={Object.values(EmployeeRole).map((role) => ({
                      value: role,
                      label: role,
                    }))}
                    required
                  />
                  <Select
                    label="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    options={departments.map((dept) => ({
                      value: dept._id,
                      label: dept.name,
                    }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Base Salary (PKR)"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, baseSalary: Number(e.target.value) })
                    }
                    required
                  />
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as EmployeeStatus })
                    }
                    options={Object.values(EmployeeStatus).map((status) => ({
                      value: status,
                      label: status,
                    }))}
                    required
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tech Stack
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={techStackInput}
                      onChange={(e) => setTechStackInput(e.target.value)}
                      placeholder="Add technology..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTechStack();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTechStack} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTechStack(tech)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Personal Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    value={onboardingData.phone}
                    onChange={(e) =>
                      setOnboardingData({ ...onboardingData, phone: e.target.value })
                    }
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={onboardingData.dateOfBirth}
                    onChange={(e) =>
                      setOnboardingData({ ...onboardingData, dateOfBirth: e.target.value })
                    }
                  />
                </div>

                <Input
                  label="Address"
                  value={onboardingData.address}
                  onChange={(e) =>
                    setOnboardingData({ ...onboardingData, address: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Emergency Contact Name"
                    value={onboardingData.emergencyContact}
                    onChange={(e) =>
                      setOnboardingData({ ...onboardingData, emergencyContact: e.target.value })
                    }
                  />
                  <Input
                    label="Emergency Contact Phone"
                    value={onboardingData.emergencyPhone}
                    onChange={(e) =>
                      setOnboardingData({ ...onboardingData, emergencyPhone: e.target.value })
                    }
                  />
                </div>

                <Input
                  label="Joining Date"
                  type="date"
                  value={onboardingData.joiningDate}
                  onChange={(e) =>
                    setOnboardingData({ ...onboardingData, joiningDate: e.target.value })
                  }
                />
              </div>
            )}

            {/* Banking Tab */}
            {activeTab === 'banking' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Bank Name"
                    value={onboardingData.banking.bankName}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        banking: { ...onboardingData.banking, bankName: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Account Holder Name"
                    value={onboardingData.banking.accountHolderName}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        banking: { ...onboardingData.banking, accountHolderName: e.target.value },
                      })
                    }
                  />
                </div>

                <Input
                  label="IBAN"
                  value={onboardingData.banking.iban}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      banking: { ...onboardingData.banking, iban: e.target.value },
                    })
                  }
                />

                <Input
                  label="SWIFT Code (Optional)"
                  value={onboardingData.banking.swiftCode}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      banking: { ...onboardingData.banking, swiftCode: e.target.value },
                    })
                  }
                />
              </div>
            )}

            {/* Payoneer Tab */}
            {activeTab === 'payoneer' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    If the employee uses Payoneer for international payments, add their details here.
                  </p>
                </div>

                <Input
                  label="Payoneer Email"
                  type="email"
                  value={onboardingData.payoneer.email}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      payoneer: { ...onboardingData.payoneer, email: e.target.value },
                    })
                  }
                />

                <Input
                  label="Payoneer Account ID"
                  value={onboardingData.payoneer.accountId}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      payoneer: { ...onboardingData.payoneer, accountId: e.target.value },
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingEmployee ? 'Update Employee' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Share Link Modal */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default Employees;

