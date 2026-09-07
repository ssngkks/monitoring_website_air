import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { UserGuide } from './pages/UserGuide';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Signup,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'alerts', Component: Alerts },
      { path: 'reports', Component: Reports },
      { path: 'settings', Component: Settings },
      { path: 'guide', Component: UserGuide },
      { path: '*', Component: NotFound },
    ],
  },
]);
