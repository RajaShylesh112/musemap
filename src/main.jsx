import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout'; // your layout with navbar/footer
import { HomePage } from './pages/home';
import { BookingPage } from './pages/booking';
import { ChatbotPage } from './pages/chatbot';
import { MuseumDetailsPage } from './pages/museum-details';
import { PaymentPage } from './pages/payment';
import { FAQPage } from './pages/faq';
import { ContactPage } from './pages/contact';

import { RewardCriteriaPage } from './pages/reward-criteria';
import { SearchPage } from './pages/search';
import { MuseumsPage } from './pages/museums';
import { QuizPage } from './pages/quiz';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { DashboardPage } from './pages/dashboard';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import AdminMuseumDetailsPage from './pages/admin/MuseumDetailsPage';
import ExhibitionsPage from './pages/admin/ExhibitionsPage';
import ArtifactsPage from './pages/admin/ArtifactsPage';
import QuizzesPage from './pages/admin/QuizzesPage';
import QuizCreatePage from './pages/admin/QuizCreatePage';
import QuizEditPage from './pages/admin/QuizEditPage';
import ExhibitionCreatePage from './pages/admin/ExhibitionCreatePage';
import ExhibitionEditPage from './pages/admin/ExhibitionEditPage';
import ArtifactCreatePage from './pages/admin/ArtifactCreatePage';
import ArtifactEditPage from './pages/admin/ArtifactEditPage';
import AdminLayout from './pages/admin/AdminLayout';
import { ProfilePage } from './pages/profile';
import { getSupabase } from './supabase';
import './style.css';

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }) {
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);
    const supabase = getSupabase();

    React.useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }



    return children;
}

const container = document.getElementById('root');

if (container) {
  // Check if a React root has already been created for this container.
  // React internally adds _reactRootContainer to the DOM element.
  if (!container._reactRootContainer) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <Router>
          <Routes>
            {/* Admin Section: All admin pages with sidebar and light mode */}
            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="museum-details" element={<AdminMuseumDetailsPage />} />
                    <Route path="museum" element={<AdminMuseumDetailsPage />} />
                    <Route path="exhibitions" element={<ExhibitionsPage />} />
                    <Route path="exhibitions/new" element={<ExhibitionCreatePage />} />
                    <Route path="exhibitions/edit/:exhibitionId" element={<ExhibitionEditPage />} /> 
                    <Route path="artifacts" element={<ArtifactsPage />} />
                    <Route path="artifacts/new" element={<ArtifactCreatePage />} />
                    <Route path="artifacts/edit/:artifactId" element={<ArtifactEditPage />} /> {/* Add new route */}
                    <Route path="quizzes" element={<QuizzesPage />} />
                    <Route path="quizzes/new" element={<QuizCreatePage />} />
                    <Route path="quizzes/edit/:quizId" element={<QuizEditPage />} /> 
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* Owner/User Dashboard: NO Layout */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/quiz/create" element={<ProtectedRoute requireAdmin><QuizCreatePage /></ProtectedRoute>} />

            {/* All other pages: WITH Layout */}
            <Route
              path="*"
              element={
                <Layout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/museums" element={<MuseumsPage />} />
                    <Route path="/museums/:id" element={<MuseumDetailsPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/quiz" element={<QuizPage />} />

                    {/* Protected Routes */}
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/booking/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                    <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                    <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
                    <Route path="/rewards" element={<ProtectedRoute><RewardCriteriaPage /></ProtectedRoute>} />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </Router>
      </React.StrictMode>
    );
  }
  // If container._reactRootContainer already exists, it means React has already initialized this container.
  // We do nothing here to prevent calling createRoot again.
  // HMR or other updates should be handled by React internally without re-creating the root.
}