import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users as UsersIcon, History } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SearchableSelect from '../components/common/SearchableSelect';
import SearchableMultiSelect from '../components/common/SearchableMultiSelect';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import { projectService } from '../services/projectService';
import { employeeService } from '../services/employeeService';
import type { IProject, IProjectFormData, IEmployee } from '../types';
import { ProjectStatus, CommissionType } from '../types';
import { formatCurrency as formatCurrencyUtil, usdToPkr } from '../utils/currency';
import ProjectHistoryTimeline from '../components/project/ProjectHistoryTimeline';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [viewingHistoryProject, setViewingHistoryProject] = useState<IProject | null>(null);

  const [formData, setFormData] = useState<IProjectFormData>({
    name: '',
    clientName: '',
    totalAmount: 0,
    startDate: '',
    endDate: '',
    status: ProjectStatus.ACTIVE,
    team: {
      developers: [],
      projectManager: '',
      teamLead: '',
      manager: '',
      bidder: '',
    },
    bonusPool: 0,
    pmCommission: { type: CommissionType.PERCENTAGE, amount: 0 },
    teamLeadCommission: { type: CommissionType.PERCENTAGE, amount: 0 },
    managerCommission: { type: CommissionType.PERCENTAGE, amount: 0 },
    bidderCommission: { type: CommissionType.PERCENTAGE, amount: 0 },
  });

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleOpenModal = (project?: IProject) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        clientName: project.clientName,
        totalAmount: project.totalAmount,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        status: project.status,
        team: {
          developers: project.team.developers.map(dev => 
            typeof dev === 'string' ? dev : dev._id
          ),
          projectManager: typeof project.team.projectManager === 'string' 
            ? project.team.projectManager 
            : project.team.projectManager?._id || '',
          teamLead: typeof project.team.teamLead === 'string'
            ? project.team.teamLead
            : project.team.teamLead?._id || '',
          manager: typeof project.team.manager === 'string'
            ? project.team.manager
            : project.team.manager?._id || '',
          bidder: typeof project.team.bidder === 'string'
            ? project.team.bidder
            : project.team.bidder?._id || '',
        },
        bonusPool: project.bonusPool,
        pmCommission: project.pmCommission,
        teamLeadCommission: project.teamLeadCommission,
        managerCommission: project.managerCommission,
        bidderCommission: project.bidderCommission,
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        clientName: '',
        totalAmount: 0,
        startDate: '',
        endDate: '',
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [],
          projectManager: '',
          teamLead: '',
          manager: '',
          bidder: '',
        },
        bonusPool: 0,
        pmCommission: { type: CommissionType.PERCENTAGE, amount: 0 },
        teamLeadCommission: { type: CommissionType.PERCENTAGE, amount: 0 },
        managerCommission: { type: CommissionType.PERCENTAGE, amount: 0 },
        bidderCommission: { type: CommissionType.PERCENTAGE, amount: 0 },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up the form data - remove empty strings for optional fields
      const cleanedData = {
        ...formData,
        endDate: formData.endDate || undefined,
        team: {
          developers: formData.team.developers,
          projectManager: formData.team.projectManager || undefined,
          teamLead: formData.team.teamLead || undefined,
          manager: formData.team.manager || undefined,
          bidder: formData.team.bidder || undefined,
        }
      };

      if (editingProject) {
        await projectService.updateProject(editingProject._id, cleanedData);
      } else {
        await projectService.createProject(cleanedData);
      }
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        fetchProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };


  const formatCurrencyDualDisplay = (usdAmount: number) => {
    return (
      <div className="text-sm">
        <div className="font-semibold">{formatCurrencyUtil(usdAmount, 'USD')}</div>
        <div className="text-gray-500 text-xs">{formatCurrencyUtil(usdToPkr(usdAmount), 'PKR')}</div>
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

  const columns: Column<IProject>[] = [
    { key: 'name', header: 'Project Name' },
    { key: 'clientName', header: 'Client' },
    {
      key: 'totalAmount',
      header: 'Total Amount (USD / PKR)',
      render: (project) => formatCurrencyDualDisplay(project.totalAmount),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (project) => formatDate(project.startDate),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (project) => project.endDate ? formatDate(project.endDate) : <span className="text-gray-400 italic">Not set</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (project) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            project.status === 'Active'
              ? 'bg-success-100 text-success-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {project.status}
        </span>
      ),
    },
    {
      key: 'team',
      header: 'Team Size',
      render: (project) => (
        <div className="flex items-center">
          <UsersIcon className="w-4 h-4 mr-1 text-gray-500" />
          {project.team.developers.length}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (project) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewingHistoryProject(project);
              setIsHistoryModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="View History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(project);
            }}
            className="text-primary-600 hover:text-primary-800"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(project._id);
            }}
            className="text-danger-600 hover:text-danger-800"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // All employees for Team Lead, Manager, Bidder, PM, and Developers with searchable dropdown
  const allEmployeesOptions = employees.map((emp) => ({
    value: emp._id,
    label: emp.name,
    subtitle: `${emp.role} • ${emp.email}`,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and teams</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <Table columns={columns} data={projects} />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Client Name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
              <div>
                <Input
                  label="Total Amount (USD)"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: Number(e.target.value) })
                  }
                  required
                />
                {formData.totalAmount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    ≈ {formatCurrencyUtil(usdToPkr(formData.totalAmount), 'PKR')}
                  </p>
                )}
              </div>
              <Input
                label="Bonus Pool"
                type="number"
                value={formData.bonusPool}
                onChange={(e) =>
                  setFormData({ ...formData, bonusPool: Number(e.target.value) })
                }
                required
              />
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ProjectStatus })
                }
                options={Object.values(ProjectStatus).map((status) => ({
                  value: status,
                  label: status,
                }))}
                required
              />
            </div>
          </div>

          {/* Team Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Developers - Multi-select with search */}
              <SearchableMultiSelect
                label="Developers"
                value={formData.team.developers}
                onChange={(values) =>
                  setFormData({
                    ...formData,
                    team: { ...formData.team, developers: values },
                  })
                }
                options={allEmployeesOptions}
                placeholder="Search and select developers..."
              />

              <SearchableSelect
                label="Project Manager"
                value={formData.team.projectManager || ''}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    team: { ...formData.team, projectManager: value },
                  })
                }
                options={allEmployeesOptions}
                placeholder="Search for project manager..."
              />

              <SearchableSelect
                label="Team Lead"
                value={formData.team.teamLead || ''}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    team: { ...formData.team, teamLead: value },
                  })
                }
                options={allEmployeesOptions}
                placeholder="Search for team lead..."
              />

              <SearchableSelect
                label="Manager"
                value={formData.team.manager || ''}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    team: { ...formData.team, manager: value },
                  })
                }
                options={allEmployeesOptions}
                placeholder="Search for manager..."
              />

              <SearchableSelect
                label="Bidder"
                value={formData.team.bidder || ''}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    team: { ...formData.team, bidder: value },
                  })
                }
                options={allEmployeesOptions}
                placeholder="Search for bidder..."
              />
            </div>
          </div>

          {/* Commissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Configuration</h3>
            <div className="space-y-4">
              {/* PM Commission */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PM Commission Type
                  </label>
                  <select
                    value={formData.pmCommission.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pmCommission: {
                          ...formData.pmCommission,
                          type: e.target.value as CommissionType,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={CommissionType.PERCENTAGE}>Percentage</option>
                    <option value={CommissionType.FIXED}>Fixed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="PM Commission Amount"
                    type="number"
                    value={formData.pmCommission.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pmCommission: {
                          ...formData.pmCommission,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                    helperText={
                      formData.pmCommission.type === CommissionType.PERCENTAGE
                        ? 'Enter percentage (e.g., 10 for 10%)'
                        : 'Enter fixed amount'
                    }
                  />
                </div>
              </div>

              {/* Team Lead Commission */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Lead Commission Type
                  </label>
                  <select
                    value={formData.teamLeadCommission.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teamLeadCommission: {
                          ...formData.teamLeadCommission,
                          type: e.target.value as CommissionType,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={CommissionType.PERCENTAGE}>Percentage</option>
                    <option value={CommissionType.FIXED}>Fixed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Team Lead Commission Amount"
                    type="number"
                    value={formData.teamLeadCommission.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teamLeadCommission: {
                          ...formData.teamLeadCommission,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Manager Commission */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Commission Type
                  </label>
                  <select
                    value={formData.managerCommission.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        managerCommission: {
                          ...formData.managerCommission,
                          type: e.target.value as CommissionType,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={CommissionType.PERCENTAGE}>Percentage</option>
                    <option value={CommissionType.FIXED}>Fixed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Manager Commission Amount"
                    type="number"
                    value={formData.managerCommission.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        managerCommission: {
                          ...formData.managerCommission,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Bidder Commission */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bidder Commission Type
                  </label>
                  <select
                    value={formData.bidderCommission.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bidderCommission: {
                          ...formData.bidderCommission,
                          type: e.target.value as CommissionType,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={CommissionType.PERCENTAGE}>Percentage</option>
                    <option value={CommissionType.FIXED}>Fixed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Bidder Commission Amount"
                    type="number"
                    value={formData.bidderCommission.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bidderCommission: {
                          ...formData.bidderCommission,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProject ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Project History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setViewingHistoryProject(null);
        }}
        title={`Project History: ${viewingHistoryProject?.name || ''}`}
        size="xl"
      >
        {viewingHistoryProject && (
          <div className="max-h-[600px] overflow-y-auto">
            <ProjectHistoryTimeline projectId={viewingHistoryProject._id} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Projects;

