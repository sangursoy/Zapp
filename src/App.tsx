import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { UserProfileProvider } from './context/UserProfileContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import ToastContainer from './components/common/Toast';
import { useToast } from './hooks/useToast';
import AuthForm from './components/auth/AuthForm';
import ProfileSetup from './components/auth/ProfileSetup';
import HomePage from './pages/HomePage';
import TopicPage from './pages/TopicPage';
import DiscoverPage from './pages/DiscoverPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import SharePage from './pages/SharePage';
import { useAppContext } from './context/AppContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, userProfile } = useAppContext();
  const location = window.location;

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userProfile || !userProfile.profile_completed && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { toasts, remove } = useToast();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthForm />} />
        
        {/* Profile Setup Route */}
        <Route path="/setup-profile" element={<ProfileSetup />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/topic/:id" element={
          <ProtectedRoute>
            <TopicPage />
          </ProtectedRoute>
        } />
        
        <Route path="/discover" element={
          <ProtectedRoute>
            <DiscoverPage />
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/messages/:id" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/share" element={
          <ProtectedRoute>
            <SharePage />
          </ProtectedRoute>
        } />

        {/* Catch-all route - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer toasts={toasts} onClose={remove} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppProvider>
          <UserProfileProvider>
            <AppContent />
          </UserProfileProvider>
        </AppProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;