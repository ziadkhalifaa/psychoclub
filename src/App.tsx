import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseView from './pages/CourseView';
import CoursePlayer from './pages/CoursePlayer';
import Articles from './pages/Articles';
import ArticleView from './pages/ArticleView';
import Sessions from './pages/Sessions';
import DoctorProfile from './pages/DoctorProfile';
import About from './pages/About';
import Tools from './pages/Tools';
import ToolView from './pages/ToolView';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Community from './pages/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/Toast';
import LoadingScreen from './components/LoadingScreen';
import './i18n';

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
