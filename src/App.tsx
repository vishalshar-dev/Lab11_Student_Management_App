import { useState } from 'react';
import AppLayout, { type PageKey } from '@/components/AppLayout';
import { ToastProvider } from '@/components/ui/Toast';
import Dashboard from '@/pages/Dashboard';
import StudentsPage from '@/pages/StudentsPage';
import StudentProfile from '@/pages/StudentProfile';
import CoursesPage from '@/pages/CoursesPage';
import SubjectsPage from '@/pages/SubjectsPage';
import TasksPage from '@/pages/TasksPage';

type View =
  | { page: PageKey }
  | { page: 'student-profile'; studentId: string };

export default function App() {
  const [view, setView] = useState<View>({ page: 'dashboard' });

  const handleNavigate = (page: PageKey) => {
    setView({ page });
  };

  const handleViewStudent = (id: string) => {
    setView({ page: 'student-profile', studentId: id });
  };

  const handleBackFromProfile = () => {
    setView({ page: 'students' });
  };

  const renderContent = () => {
    if (view.page === 'student-profile') {
      return <StudentProfile studentId={view.studentId} onBack={handleBackFromProfile} />;
    }
    switch (view.page) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'students':
        return <StudentsPage onViewStudent={handleViewStudent} />;
      case 'courses':
        return <CoursesPage />;
      case 'subjects':
        return <SubjectsPage />;
      case 'tasks':
        return <TasksPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const layoutPage: PageKey = view.page === 'student-profile' ? 'students' : view.page;

  return (
    <ToastProvider>
      <AppLayout current={layoutPage} onNavigate={handleNavigate}>
        {renderContent()}
      </AppLayout>
    </ToastProvider>
  );
}
