import React, { useState, useEffect } from 'react';
import { Users, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../lib/supabase';

interface ForensicsEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
  currentCases: number;
  expertise: string[];
}

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  priority: 'normal' | 'urgent';
  receivedDate: string;
  department: string;
}

export default function AssignCases() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unassignedCases, setUnassignedCases] = useState<Case[]>([]);
  const [forensicsEmployees, setForensicsEmployees] = useState<ForensicsEmployee[]>([]);

  useEffect(() => {
    fetchUnassignedCases();
    fetchForensicsEmployees();
  }, []);

  const fetchUnassignedCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .is('assigned_to', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCases = data.map(item => ({
        id: item.id,
        caseNumber: item.case_number,
        title: item.title,
        description: item.description || '',
        priority: item.priority,
        receivedDate: item.received_date,
        department: item.department
      }));

      setUnassignedCases(formattedCases);
    } catch (err) {
      console.error('Error fetching unassigned cases:', err);
      setError('Failed to load unassigned cases.');
    }
  };

  const fetchForensicsEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: users, error: usersError } = await supabase
        .from('app_users')
        .select('*')
        .in('role', ['forensics', 'forensics_head']);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        console.log('No forensics team members found');
        setForensicsEmployees([]);
        return;
      }

      // Get case counts for each employee
      const employeesWithCases = await Promise.all(
        users.map(async (employee) => {
          const { count } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', employee.name)
            .eq('status', 'in_progress');

          return {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            currentCases: count || 0,
            expertise: ['Digital Forensics', 'Network Analysis'] // Mock expertise data
          };
        })
      );

      setForensicsEmployees(employeesWithCases);
    } catch (err) {
      console.error('Error fetching forensics employees:', err);
      setError('Failed to load forensics team members.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCase = async () => {
    if (!selectedCase || !selectedEmployee) return;

    try {
      const employee = forensicsEmployees.find(emp => emp.id === selectedEmployee);
      if (!employee) throw new Error('Selected employee not found');

      const { error: updateError } = await supabase
        .from('cases')
        .update({ 
          assigned_to: employee.name,
          status: 'in_progress'
        })
        .eq('id', selectedCase);

      if (updateError) throw updateError;

      setSuccessMessage('Case assigned successfully!');
      
      // Refresh data
      fetchUnassignedCases();
      fetchForensicsEmployees();
      
      // Reset selections
      setSelectedCase(null);
      setSelectedEmployee(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error assigning case:', err);
      setError('Failed to assign case. Please try again.');
    }
  };

  if (user?.role !== 'forensics_head') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only the head of forensics department can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center gap-2 text-primary-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-secondary-900">
          Assign Cases
        </h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unassigned Cases */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-display font-semibold text-secondary-900 mb-4">
            Unassigned Cases
          </h2>
          <div className="space-y-4">
            {unassignedCases.length === 0 ? (
              <p className="text-center text-secondary-500 py-4">No unassigned cases found.</p>
            ) : (
              unassignedCases.map(case_ => (
                <div
                  key={case_.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCase === case_.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedCase(case_.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-secondary-900">
                        {case_.title}
                        <span className="ml-2 text-sm text-secondary-500">
                          ({case_.caseNumber})
                        </span>
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {case_.description}
                      </p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-secondary-500">
                          Received: {case_.receivedDate}
                        </span>
                        {case_.priority === 'urgent' && (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Forensics Team */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-secondary-900">
              Forensics Team
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {forensicsEmployees.length === 0 ? (
              <p className="text-center text-secondary-500 py-4">No team members found.</p>
            ) : (
              forensicsEmployees
                .filter(employee =>
                  employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  employee.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(employee => (
                  <div
                    key={employee.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedEmployee === employee.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedEmployee(employee.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-secondary-900">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          {employee.email}
                        </p>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-secondary-700">
                            Current Cases: {employee.currentCases}
                          </span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {employee.expertise.map(skill => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Assignment Action */}
      <div className="flex justify-end">
        <button
          onClick={handleAssignCase}
          disabled={!selectedCase || !selectedEmployee}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Assign Case
        </button>
      </div>
    </div>
  );
}