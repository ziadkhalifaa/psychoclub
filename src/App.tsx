import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

// Contexts & Components
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/Toast';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import './i18n';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseView = lazy(() => import('./pages/CourseView'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleView = lazy(() => import('./pages/ArticleView'));
const Sessions = lazy(() => import('./pages/Sessions'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const About = lazy(() => import('./pages/About'));
const Tools = lazy(() => import('./pages/Tools'));
const ToolView = lazy(() => import('./pages/ToolView'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const Community = lazy(() => import('./pages/Community'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'courses', element: <Courses /> },
      { path: 'courses/:slug', element: <CourseView /> },
      { path: 'articles', element: <Articles /> },
      { path: 'articles/:slug', element: <ArticleView /> },
      { path: 'sessions', element: <Sessions /> },
      { path: 'sessions/:id', element: <DoctorProfile /> },
      { path: 'about', element: <About /> },
      { path: 'tools', element: <Tools /> },
      { path: 'tools/:id', element: <ToolView /> },
      { path: 'profile', element: <Profile /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'doctor', element: <DoctorDashboard /> },
      { path: 'community', element: <Community /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'payment/success', element: <PaymentSuccess /> },
      { path: 'payment/failed', element: <PaymentFailed /> },
      { path: 'privacy', element: <PrivacyPolicy /> },
      { path: 'terms', element: <TermsOfUse /> },
    ],
  },
  {
    path: '/courses/:slug/learn',
    element: <CoursePlayer />
  }
]);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Set reasonable loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <AnimatePresence mode="wait">
                {isLoading && <LoadingScreen key="loading" />}
              </AnimatePresence>
              <RouterProvider router={router} />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
