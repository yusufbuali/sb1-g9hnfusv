import { RouteObject } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewCase from './pages/NewCase';
import SearchCases from './pages/SearchCases';
import Cases from './pages/Cases';

export const registrationRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: <Dashboard />
  },
  {
    path: 'new-case',
    element: <NewCase />
  },
  {
    path: 'search',
    element: <SearchCases />
  },
  {
    path: 'cases',
    element: <Cases />
  }
];