import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';
import { Loader2, FileText, Calendar, Building2, MapPin, DollarSign, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  appliedDate: string;
  status: 'Applied' | 'Under Review' | 'Interviewing' | 'Offered' | 'Rejected' | 'Withdrawn';
  notes?: string;
  feedback?: string;
  interviewDates?: string[];
  documents?: {
    name: string;
    url: string;
    type: 'resume' | 'coverLetter' | 'other';
  }[];
  selfRecommendation?: string;
}

const statusConfig = {
  Applied: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  'Under Review': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  Interviewing: { color: 'bg-purple-100 text-purple-800', icon: Calendar },
  Offered: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  Rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  Withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const StudentApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/student/applications' } });
      return;
    }

    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const data = await applicationApi.getApplications();
        setApplications(data);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('無法載入申請記錄。請稍後再試。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user, navigate]);

  const handleWithdraw = async (applicationId: string) => {
    try {
      await applicationApi.withdrawApplication(applicationId);
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'Withdrawn' } : app
        )
      );
      toast({
        title: '申請已撤回',
        description: '您的申請已成功撤回。',
      });
    } catch (err) {
      console.error('Error withdrawing application:', err);
      toast({
        title: '撤回失敗',
        description: '無法撤回申請。請稍後再試。',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#32ADE6]" />
        <p className="ml-4 text-gray-600">載入申請記錄中...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">我的申請</h1>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#32ADE6] text-white hover:bg-[#2A8BC7]"
          >
            瀏覽更多職位
          </Button>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">您還沒有任何申請記錄。</p>
            <Button
              onClick={() => navigate('/')}
              className="mt-4 bg-[#32ADE6] text-white hover:bg-[#2A8BC7]"
            >
              開始申請職位
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const StatusIcon = statusConfig[application.status].icon;
              return (
                <div
                  key={application.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {application.jobTitle}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building2 size={16} className="mr-1" />
                          {application.companyName}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          申請日期：{formatDate(application.appliedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          statusConfig[application.status].color
                        }`}
                      >
                        <StatusIcon size={16} className="mr-1" />
                        {application.status}
                      </span>
                      {application.status === 'Applied' && (
                        <Button
                          variant="outline"
                          onClick={() => handleWithdraw(application.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          撤回申請
                        </Button>
                      )}
                    </div>
                  </div>

                  {application.selfRecommendation && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">自我推薦</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {application.selfRecommendation}
                      </p>
                    </div>
                  )}

                  {application.documents && application.documents.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">已上傳文件</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {application.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                          >
                            <FileText size={16} className="mr-1" />
                            {doc.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.feedback && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">回饋</h3>
                      <p className="mt-1 text-sm text-gray-600">{application.feedback}</p>
                    </div>
                  )}

                  {application.interviewDates && application.interviewDates.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">面試時間</h3>
                      <div className="mt-2 space-y-2">
                        {application.interviewDates.map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <Calendar size={16} className="mr-2" />
                            {formatDate(date)}
                          </div>
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

export default StudentApplicationsPage; 