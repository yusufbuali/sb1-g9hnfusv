import { RouteObject } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Evidence from './pages/Evidence';
import Cases from './pages/Cases';
import AssignCases from './pages/AssignCases';

export const forensicsRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/case/:caseId/evidence',
    element: <Evidence />
  },
  {
    path: '/cases',
    element: <Cases />
  },
  {
    path: '/assign-cases',
    element: <AssignCases />
  }
];