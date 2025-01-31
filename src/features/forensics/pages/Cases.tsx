import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, MoreVertical, FileText, Search, Loader2, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Case } from '../../../types/auth';

interface CaseDetailsModalProps {
  case_: Case;
  onClose: () => void;
}

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({ case_, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-secondary-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-secondary-900">
            Case Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Case Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Case Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-secondary-500">Case Number</p>
                <p className="text-secondary-900">{case_.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Title</p>
                <p className="text-secondary-900">{case_.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Status</p>
                <p className="text-secondary-900">{case_.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Priority</p>
                <p className="text-secondary-900">{case_.priority}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Department</p>
                <p className="text-secondary-900">{case_.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Received Date</p>
                <p className="text-secondary-900">
                  {case_.receivedDate ? new Date(case_.receivedDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Persons Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Persons Information</h3>
            {case_.persons && case_.persons.length > 0 ? (
              <div className="space-y-4">
                {case_.persons.map((person, index) => (
                  <div key={index} className="bg-secondary-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-secondary-500">Name</p>
                        <p className="text-secondary-900">{person.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-500">CPR Number</p>
                        <p className="text-secondary-900">{person.cprNo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-500">Passport Number</p>
                        <p className="text-secondary-900">{person.passportNo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-500">Gender</p>
                        <p className="text-secondary-900">{person.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-500">Nationality</p>
                        <p className="text-secondary-900">{person.nationality || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500">No persons information available</p>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Description</h3>
            <p className="text-secondary-700 whitespace-pre-wrap">
              {case_.description || 'No description available'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
            <Link
              to={`/case/${case_.id}/evidence`}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Evidence
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCases();
  }, [user]);

  const fetchCases = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('assigned_to', user.name)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCases: Case[] = data.map(item => ({
        id: item.case_number,
        title: item.title,
        description: item.description || '',
        status: item.status as Case['status'],
        priority: item.priority as Case['priority'],
        createdAt: item.created_at,
        assignedTo: item.assigned_to || undefined,
        department: item.department,
        personName: item.person_name || '',
        receivedDate: item.received_date,
        persons: item.persons || []
      }));

      setCases(formattedCases);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to load cases. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Case['status']) => {
    switch (status) {
      case 'new':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusText = (status: Case['status']) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
    }
  };

  const filteredCases = cases.filter(case_ => {
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center gap-2 text-primary-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading cases...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Assigned Cases</h1>
        <div className="flex gap-4">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid gap-4 p-6">
          {filteredCases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No cases found matching your filters.</p>
            </div>
          ) : (
            filteredCases.map((case_) => (
              <div
                key={case_.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCase(case_)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {case_.title}
                      </h3>
                      <span className="text-sm text-gray-500">({case_.id})</span>
                    </div>
                    <p className="text-gray-600">{case_.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/case/${case_.id}/evidence`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">View Evidence</span>
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(case_.status)}
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusText(case_.status)}
                    </span>
                  </div>
                  {case_.priority === 'urgent' && (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        Urgent
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500">
                    Created: {new Date(case_.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <CaseDetailsModal
          case_={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}