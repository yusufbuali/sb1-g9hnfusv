import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Search, FolderPlus, LogOut, Folder, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const registrationLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/cases', icon: Folder, label: 'Cases' },
    { to: '/new-case', icon: FolderPlus, label: 'New Case' },
    { to: '/search', icon: Search, label: 'Search Cases' },
  ];

  const forensicsLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/cases', icon: Folder, label: 'Cases' },
    { to: '/assign-cases', icon: Users, label: 'Assign Cases', roles: ['forensics_head'] }
  ];

  const getLinks = () => {
    if (user?.role === 'registration') return registrationLinks;
    if (user?.role === 'forensics' || user?.role === 'forensics_head') {
      return forensicsLinks.filter(link => !link.roles || link.roles.includes(user.role));
    }
    if (user?.role === 'admin') {
      return [...registrationLinks, ...forensicsLinks];
    }
    return [];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-secondary-200">
        <h2 className="text-2xl font-display font-bold text-secondary-800">Case Management</h2>
        <p className="text-sm font-medium text-secondary-600 mt-1">{user?.role.toUpperCase()}</p>
      </div>
      
      <nav className="flex-1 mt-6">
        {getLinks().map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "flex items-center px-6 py-3.5 text-secondary-600 hover:bg-secondary-50 transition-colors font-medium",
              location.pathname === link.to && "bg-primary-50 text-primary-700 border-r-4 border-primary-500 font-semibold"
            )}
          >
            <link.icon className="w-5 h-5 mr-3" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-secondary-200">
        <div className="mb-4">
          <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
          <p className="text-xs text-secondary-500">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded-md transition-colors font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}