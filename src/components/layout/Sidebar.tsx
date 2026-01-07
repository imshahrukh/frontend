import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  DollarSign as DollarSignIcon,
  Settings,
  LogOut,
  UserPlus,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Onboarding', icon: UserPlus, path: '/onboarding-requests' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Monthly Revenue', icon: TrendingUp, path: '/monthly-revenue' },
    { name: 'Salaries', icon: DollarSignIcon, path: '/salaries' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen shadow-2xl">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <DollarSignIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Salary Manager
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-200" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

