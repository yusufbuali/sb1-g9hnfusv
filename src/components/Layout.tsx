import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserSelect from './UserSelect';

export default function Layout() {
  return (
    <div className="flex h-screen bg-secondary-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
      <UserSelect />
    </div>
  );
}