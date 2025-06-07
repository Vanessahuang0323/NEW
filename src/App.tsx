import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NotificationCenter from './components/NotificationCenter';
import LoginPage from './pages/LoginPage';
import ApplyPage from './pages/ApplyPage';
import StudentApplicationsPage from './pages/StudentApplicationsPage';
import CompanyApplicantsPage from './pages/CompanyApplicantsPage';
import MockInterviewPage from './pages/MockInterviewPage';
import TalentMatchingPage from './pages/TalentMatchingPage';
import { ResumeForm } from './components/ResumeForm';
import { Toaster } from './components/ui/toaster';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            歡迎來到 <span className="text-[#32ADE6]">TalenTag</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            智能人才媒合平台，讓求職與招聘更簡單
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">學生功能</h3>
              <div className="space-y-2">
                <Link 
                  to="/resume" 
                  className="block text-[#32ADE6] hover:text-[#2A8BC7] transition-colors"
                >
                  建立履歷
                </Link>
                <Link 
                  to="/student/applications" 
                  className="block text-[#32ADE6] hover:text-[#2A8BC7] transition-colors"
                >
                  我的申請
                </Link>
                <Link 
                  to="/mock-interview" 
                  className="block text-[#32ADE6] hover:text-[#2A8BC7] transition-colors"
                >
                  模擬面試
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">企業功能</h3>
              <div className="space-y-2">
                <Link 
                  to="/company/applicants" 
                  className="block text-[#32ADE6] hover:text-[#2A8BC7] transition-colors"
                >
                  申請者管理
                </Link>
                <Link 
                  to="/talent-matching" 
                  className="block text-[#32ADE6] hover:text-[#2A8BC7] transition-colors"
                >
                  人才配對
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">系統功能</h3>
              <div className="space-y-2">
                <Link 
                  to="/login" 
                  className="block text-[#32ADE6] hover:text-[#2A8BC7] transition-colors"
                >
                  登入
                </Link>
                <span className="block text-gray-500">通知中心</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-[#32ADE6]">
                TalenTag
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-[#32ADE6] transition-colors"
              >
                登入
              </Link>
            </div>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/resume" element={<ResumeForm />} />
            <Route path="/apply/:jobId" element={<ApplyPage />} />
            <Route path="/student/applications" element={<StudentApplicationsPage />} />
            <Route path="/company/applicants" element={<CompanyApplicantsPage />} />
            <Route path="/mock-interview" element={<MockInterviewPage />} />
            <Route path="/talent-matching" element={<TalentMatchingPage />} />
          </Routes>
        </main>
        
        <Toaster />
      </div>
    </AuthProvider>
  );
};

export default App;