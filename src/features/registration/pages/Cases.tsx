import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, MoreVertical, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Case } from '../../../types/auth';

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("This data "+data);
      console.log("This error "+error);
      const formattedCases: Case[] = data.map(item => ({
        id: item.case_number,
        title: item.title,
        description: item.description || '',
        status: item.status,
        priority: item.priority,
        createdAt: item.created_at,
        assignedTo: item.assigned_to || undefined,
        department: item.department,
        personName: item.person_name || '',
        receivedDate: item.received_date
      }));

      console.log(formattedCases);
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
        <h1 className="text-3xl font-bold text-gray-900">Registration Cases</h1>
        <div className="flex gap-4">
          <Link
            to="/new-case"
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Link>
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
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
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
                    <div className="flex gap-4 text-sm text-gray-500">
                      {case_.personName && (
                        <span>Person: {case_.personName}</span>
                      )}
                      {case_.department && (
                        <span>Department: {case_.department}</span>
                      )}
                      {case_.receivedDate && (
                        <span>Received: {new Date(case_.receivedDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    {case_.assignedTo && (
                      <p className="text-sm text-gray-500">Assigned to: {case_.assignedTo}</p>
                    )}
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
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
    </div>
  );
}