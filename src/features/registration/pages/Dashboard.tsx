import React, { useState, useEffect } from 'react';
import { BarChart, Users, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Case } from '../../../types/auth';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingReview: number;
  urgentCases: number;
}

export default function RegistrationDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    pendingReview: 0,
    urgentCases: 0
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch total cases count
      const { count: totalCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true });

      // Fetch active cases (in_progress)
      const { count: activeCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      // Fetch pending review cases (new)
      const { count: pendingCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      // Fetch urgent cases
      const { count: urgentCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('priority', 'urgent');

      // Fetch recent cases
      const { data: recentData, error: recentError } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      setStats({
        totalCases: totalCount || 0,
        activeCases: activeCount || 0,
        pendingReview: pendingCount || 0,
        urgentCases: urgentCount || 0
      });

      setRecentCases(recentData.map(item => ({
        id: item.case_number,
        title: item.title,
        description: item.description || '',
        status: item.status,
        priority: item.priority,
        createdAt: item.created_at,
        assignedTo: item.assigned_to,
        department: item.department,
        personName: item.person_name || ''
      })));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Cases', 
      value: stats.totalCases, 
      icon: BarChart, 
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Active Cases', 
      value: stats.activeCases, 
      icon: Users, 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    { 
      label: 'Pending Review', 
      value: stats.pendingReview, 
      icon: Clock, 
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    { 
      label: 'Urgent Cases', 
      value: stats.urgentCases, 
      icon: AlertCircle, 
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center gap-2 text-primary-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-secondary-900">
          Registration Department Dashboard
        </h1>
        <button
          onClick={() => fetchDashboardData()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
        >
          <Clock className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-secondary-100">
            <div className="p-6">
              <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <h3 className="text-secondary-600 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-display font-bold text-secondary-900 mt-2">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-secondary-100">
        <div className="p-6">
          <h2 className="text-xl font-display font-semibold text-secondary-900 mb-6">
            Recent Cases
          </h2>
          
          <div className="divide-y divide-secondary-100">
            {recentCases.length === 0 ? (
              <p className="text-center py-6 text-secondary-500">
                No cases found
              </p>
            ) : (
              recentCases.map((case_) => (
                <div key={case_.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-secondary-900">
                        {case_.title}
                        <span className="ml-2 text-sm text-secondary-500">
                          ({case_.id})
                        </span>
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {case_.description}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm text-secondary-500">
                          Created: {new Date(case_.createdAt).toLocaleDateString()}
                        </span>
                        {case_.assignedTo && (
                          <span className="text-sm text-secondary-500">
                            Assigned to: {case_.assignedTo}
                          </span>
                        )}
                        {case_.priority === 'urgent' && (
                          <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium
                      ${case_.status === 'new' ? 'bg-blue-50 text-blue-700' : 
                        case_.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-green-50 text-green-700'}`}
                    >
                      {case_.status === 'new' ? 'New' :
                       case_.status === 'in_progress' ? 'In Progress' :
                       'Completed'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}