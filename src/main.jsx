/**
 * Main application entry point
 * Sets up React Router and protected routes for the Museum Map application
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/home'
import { BookingPage } from './pages/booking'
import { ChatbotPage } from './pages/chatbot'
import { MuseumDetailsPage } from './pages/museum-details'
import { PaymentPage } from './pages/payment'
import { FAQPage } from './pages/faq'
import { ContactPage } from './pages/contact'
import { QuizCreatePage } from './pages/quiz-create'
import { RewardCriteriaPage } from './pages/reward-criteria'
import { SearchPage } from './pages/search'
import { MuseumsPage } from './pages/museums'
import { QuizPage } from './pages/quiz'
import { LoginPage } from './pages/login'
import { RegisterPage } from './pages/register'
import { DashboardPage } from './pages/dashboard'
import { AdminDashboardPage } from './pages/admin/dashboard'
import { ProfilePage } from './pages/profile'
import { getSupabase } from './supabase'
import './style.css'

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.requireAdmin - Whether admin privileges are required
 * @returns {React.ReactNode} - Protected route or redirect
 */
function ProtectedRoute({ children, requireAdmin = false }) {
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);
    const supabase = getSupabase();

    React.useEffect(() => {
        // Check user authentication status
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error('Error checking user:', error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Redirect to dashboard if admin access required but not granted
    if (requireAdmin && !user.user_metadata?.isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    return children;
}

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes - Accessible to all users */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/museums" element={<MuseumsPage />} />
          <Route path="/museums/:id" element={<MuseumDetailsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/quiz" element={<QuizPage />} />

          {/* Protected Routes - Require authentication */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <RewardCriteriaPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes - Require admin privileges */}
          <Route
            path="/admin/quiz/create"
            element={
              <ProtectedRoute requireAdmin>
                <QuizCreatePage />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  </React.StrictMode>
) 