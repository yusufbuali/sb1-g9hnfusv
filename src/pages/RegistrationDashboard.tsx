import React from 'react';
import { BarChart, Users, Clock, AlertCircle } from 'lucide-react';

export default function RegistrationDashboard() {
  const stats = [
    { label: 'Total Cases', value: '156', icon: BarChart, color: 'bg-blue-500' },
    { label: 'Active Cases', value: '43', icon: Users, color: 'bg-green-500' },
    { label: 'Pending Review', value: '12', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Urgent Cases', value: '3', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Registration Department Dashboard</h1>
      
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

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Cases</h2>
        {/* Add table or list of recent cases here */}
      </div>
    </div>
  );
}