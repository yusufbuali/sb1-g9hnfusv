import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/auth';
import { Users, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UserSelect() {
  const { user, setUser } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*');
    
    if (!error && data) {
      setUsers(data);
    }
  };

  const roleColors: Record<UserRole, string> = {
    registration: 'bg-blue-100 text-blue-800',
    forensics: 'bg-green-100 text-green-800',
    forensics_head: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800'
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[500px]' : 'max-h-16'
      }`}>
        <button
          onClick={toggleExpand}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Switch User</h3>
              {!isExpanded && (
                <p className="text-sm text-gray-500">{user?.name}</p>
              )}
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        <div className={`p-4 ${isExpanded ? 'block' : 'hidden'}`}>
          <div className="space-y-2">
            {users.map((demoUser) => (
              <button
                key={demoUser.id}
                onClick={() => {
                  setUser({
                    id: demoUser.id,
                    name: demoUser.name,
                    email: demoUser.email,
                    role: demoUser.role
                  });
                  setIsExpanded(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  user?.id === demoUser.id
                    ? 'bg-gray-100 ring-2 ring-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{demoUser.name}</p>
                    <p className="text-sm text-gray-500">{demoUser.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${roleColors[demoUser.role as UserRole]}`}>
                    {demoUser.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}