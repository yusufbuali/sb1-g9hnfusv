import React from 'react';
import { BarChart, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForensicsDashboard() {
  const stats = [
    { label: 'Total Cases', value: '245', icon: BarChart, color: 'bg-blue-500' },
    { label: 'In Progress', value: '82', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Completed', value: '156', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Urgent', value: '7', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Digital Forensics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Case Progress</h2>
          {/* Add progress chart here */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
          {/* Add activity feed here */}
        </div>
      </div>
    </div>
  );
}