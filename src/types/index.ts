/**
 * Employee Roles
 */
export const EmployeeRole = {
  DEVELOPER: 'Developer',
  PM: 'PM',
  TEAM_LEAD: 'TeamLead',
  MANAGER: 'Manager',
  BIDDER: 'Bidder',
  ADMIN: 'Admin'
} as const;

export type EmployeeRole = typeof EmployeeRole[keyof typeof EmployeeRole];

/**
 * Employee Status
 */
export const EmployeeStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
} as const;

export type EmployeeStatus = typeof EmployeeStatus[keyof typeof EmployeeStatus];

/**
 * Project Status
 */
export const ProjectStatus = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed'
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

/**
 * Salary Payment Status
 */
export const SalaryStatus = {
  PAID: 'Paid',
  PENDING: 'Pending'
} as const;

export type SalaryStatus = typeof SalaryStatus[keyof typeof SalaryStatus];

/**
 * Commission Type
 */
export const CommissionType = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
} as const;

export type CommissionType = typeof CommissionType[keyof typeof CommissionType];

/**
 * Commission Configuration Interface
 */
export interface ICommission {
  type: CommissionType;
  amount: number;
}

/**
 * Project Bonus Interface
 */
export interface IProjectBonus {
  project: string | IProject;
  amount: number;
}

/**
 * Department Interface
 */
export interface IDepartment {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Employee Interface
 */
export interface IEmployee {
  _id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  department: string | IDepartment;
  techStack: string[];
  baseSalary: number;
  status: EmployeeStatus;
  projects: string[] | IProject[];
  onboardingData?: {
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    joiningDate?: string;
    banking?: {
      bankName?: string;
      accountHolderName?: string;
      iban?: string;
      swiftCode?: string;
    };
    payoneer?: {
      email?: string;
      accountId?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Project Team Interface
 */
export interface IProjectTeam {
  developers: string[] | IEmployee[];
  projectManager?: string | IEmployee;
  teamLead?: string | IEmployee;
  manager?: string | IEmployee;
  bidder?: string | IEmployee;
}

/**
 * Project Interface
 */
export interface IProject {
  _id: string;
  name: string;
  clientName: string;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  team: IProjectTeam;
  bonusPool: number;
  pmCommission: ICommission;
  teamLeadCommission: ICommission;
  managerCommission: ICommission;
  bidderCommission: ICommission;
  createdAt: string;
  updatedAt: string;
}

/**
 * Salary Interface
 */
export interface ISalary {
  _id: string;
  employee: string | IEmployee;
  month: string;
  baseSalary: number;
  projectBonuses: IProjectBonus[];
  pmCommissions: IProjectBonus[];
  teamLeadCommissions?: IProjectBonus[];
  managerCommissions: IProjectBonus[];
  bidderCommissions?: IProjectBonus[];
  totalAmount: number;
  status: SalaryStatus;
  paidDate?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Interface (for authentication)
 */
export interface IUser {
  _id: string;
  email: string;
  role: EmployeeRole;
  employee?: string | IEmployee;
  createdAt: string;
  updatedAt: string;
}

/**
 * JWT Payload Interface
 */
export interface IJWTPayload {
  id: string;
  email: string;
  role: EmployeeRole;
}

/**
 * Auth Response
 */
export interface IAuthResponse {
  success: boolean;
  token: string;
  user: IUser;
}

/**
 * API Response
 */
export interface IAPIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Dashboard Metrics
 */
export interface IDashboardMetrics {
  totalActiveEmployees: number;
  totalPaidSalary: number;
  totalPendingSalary: number;
  totalProjectPayout: number;
  salaryOverview: {
    paid: ISalary[];
    pending: ISalary[];
  };
}

/**
 * Login Credentials
 */
export interface ILoginCredentials {
  email: string;
  password: string;
}

/**
 * Register Data
 */
export interface IRegisterData {
  email: string;
  password: string;
  role: EmployeeRole;
}

/**
 * Employee Form Data
 */
export interface IEmployeeFormData {
  name: string;
  email: string;
  role: EmployeeRole;
  department: string;
  techStack: string[];
  baseSalary: number;
  status: EmployeeStatus;
  onboardingData?: {
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    joiningDate?: string;
    banking?: {
      bankName?: string;
      accountHolderName?: string;
      iban?: string;
      swiftCode?: string;
    };
    payoneer?: {
      email?: string;
      accountId?: string;
    };
  };
}

/**
 * Project Form Data
 */
export interface IProjectFormData {
  name: string;
  clientName: string;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  team: {
    developers: string[];
    projectManager?: string;
    teamLead?: string;
    manager?: string;
    bidder?: string;
  };
  bonusPool: number;
  pmCommission: ICommission;
  teamLeadCommission: ICommission;
  managerCommission: ICommission;
  bidderCommission: ICommission;
}

/**
 * Salary Filter Options
 */
export interface ISalaryFilterOptions {
  month?: string;
  status?: SalaryStatus;
  employee?: string;
  department?: string;
}

/**
 * Monthly Project Revenue
 */
export interface IMonthlyProjectRevenue {
  _id: string;
  project: string | IProject;
  month: string;
  amountCollected: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Monthly Revenue Form Data
 */
export interface IMonthlyRevenueFormData {
  project: string;
  month: string;
  amountCollected: number;
  notes?: string;
}

/**
 * Monthly Revenue Response (for month view)
 */
export interface IMonthlyRevenueResponse {
  existingRevenues: IMonthlyProjectRevenue[];
  projectsWithoutRevenue: IProject[];
}

/**
 * Commission Config
 */
export interface ICommissionConfig {
  _id: string;
  role: EmployeeRole;
  commissionType: CommissionType;
  amount: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project History Change
 */
export interface IProjectHistoryChange {
  field: string;
  oldValue: any;
  newValue: any;
  description?: string;
}

/**
 * Project History
 */
export interface IProjectHistory {
  _id: string;
  project: string;
  changeType: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'TEAM_CHANGED' | 'CLOSED' | 'REOPENED';
  changedBy: {
    _id: string;
    email: string;
  };
  changes: IProjectHistoryChange[];
  snapshot: {
    name: string;
    status: string;
    totalAmount: number;
    team: {
      projectManager?: string;
      teamLead?: string;
      manager?: string;
      bidder?: string;
      developers: string[];
    };
  };
  notes?: string;
  createdAt: string;
}

