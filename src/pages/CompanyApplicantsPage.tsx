import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';
import { Loader2, FileText, Calendar, User, Mail, Phone, Download, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  appliedDate: string;
  status: 'Applied' | 'Under Review' | 'Interviewing' | 'Offered' | 'Rejected' | 'Withdrawn';
  selfRecommendation?: string;
  documents?: {
    name: string;
    url: string;
    type: 'resume' | 'coverLetter' | 'other';
  }[];
}

const statusConfig = {
  Applied: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  'Under Review': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  Interviewing: { color: 'bg-purple-100 text-purple-800', icon: Calendar },
  Offered: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  Rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  Withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const CompanyApplicantsPage: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'company') {
      navigate('/login', { state: { from: '/company/applicants' } });
      return;
    }

    const fetchApplicants = async () => {
      try {
        setIsLoading(true);
        const data = await applicationApi.getCompanyApplicants();
        setApplicants(data);
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError('無法載入申請者資料。請稍後再試。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicants();
  }, [user, navigate]);

  const handleStatusUpdate = async (applicantId: string, newStatus: string) => {
    try {
      await applicationApi.updateApplicationStatus(applicantId, newStatus);
      setApplicants(prev =>
        prev.map(app =>
          app.id === applicantId ? { ...app, status: newStatus as Applicant['status'] } : app
        )
      );
      toast({
        title: '狀態已更新',
        description: '申請者狀態已成功更新。',
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: '更新失敗',
        description: '無法更新申請者狀態。請稍後再試。',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredApplicants = selectedStatus === 'all'
    ? applicants
    : applicants.filter(app => app.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#32ADE6]" />
        <p className="ml-4 text-gray-600">載入申請者資料中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">申請者管理</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-[#32ADE6] focus:ring-[#32ADE6]"
            >
              <option value="all">所有狀態</option>
              <option value="Applied">已申請</option>
              <option value="Under Review">審核中</option>
              <option value="Interviewing">面試中</option>
              <option value="Offered">已錄取</option>
              <option value="Rejected">已拒絕</option>
              <option value="Withdrawn">已撤回</option>
            </select>
          </div>
        </div>

        {filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">目前沒有申請者。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((applicant) => {
              const StatusIcon = statusConfig[applicant.status].icon;
              return (
                <div
                  key={applicant.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {applicant.name}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail size={16} className="mr-1" />
                          {applicant.email}
                        </div>
                        {applicant.phone && (
                          <div className="flex items-center">
                            <Phone size={16} className="mr-1" />
                            {applicant.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          申請日期：{formatDate(applicant.appliedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          statusConfig[applicant.status].color
                        }`}
                      >
                        <StatusIcon size={16} className="mr-1" />
                        {applicant.status}
                      </span>
                      {applicant.status === 'Applied' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleStatusUpdate(applicant.id, 'Under Review')}
                            className="bg-[#32ADE6] text-white hover:bg-[#2A8BC7]"
                          >
                            開始審核
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(applicant.id, 'Rejected')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            拒絕
                          </Button>
                        </div>
                      )}
                      {applicant.status === 'Under Review' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleStatusUpdate(applicant.id, 'Interviewing')}
                            className="bg-[#32ADE6] text-white hover:bg-[#2A8BC7]"
                          >
                            安排面試
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(applicant.id, 'Rejected')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            拒絕
                          </Button>
                        </div>
                      )}
                      {applicant.status === 'Interviewing' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleStatusUpdate(applicant.id, 'Offered')}
                            className="bg-[#32ADE6] text-white hover:bg-[#2A8BC7]"
                          >
                            錄取
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(applicant.id, 'Rejected')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            拒絕
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {applicant.selfRecommendation && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">自我推薦</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {applicant.selfRecommendation}
                      </p>
                    </div>
                  )}

                  {applicant.documents && applicant.documents.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">申請文件</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {applicant.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                          >
                            <FileText size={16} className="mr-1" />
                            {doc.name}
                            <Download size={16} className="ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyApplicantsPage; 