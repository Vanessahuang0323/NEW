import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobApi, applicationApi } from '../services/api';
import { toast } from '../components/ui/use-toast';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Loader2, Briefcase, MapPin, Building2, DollarSign, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  logo: string;
}

interface UploadedFile {
  file: File;
  type: 'resume' | 'coverLetter';
  name: string;
}

const ApplyPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selfRecommendation, setSelfRecommendation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    selfRecommendation?: string;
    resume?: string;
  }>({});

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/apply/${jobId}` } });
      return;
    }

    const fetchJobDetails = async () => {
      if (!jobId) {
        setError('職位 ID 未提供。');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await jobApi.getJobDetails(Number(jobId));
        setJobDetails(data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('無法載入職位詳細資訊。請稍後再試。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, user, navigate]);

  const validateForm = (): boolean => {
    const errors: { selfRecommendation?: string; resume?: string } = {};
    
    if (!selfRecommendation.trim()) {
      errors.selfRecommendation = '請填寫自我推薦。';
    } else if (selfRecommendation.length > 200) {
      errors.selfRecommendation = '自我推薦不能超過 200 字。';
    }

    if (!uploadedFiles.some(file => file.type === 'resume')) {
      errors.resume = '請上傳履歷。';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'coverLetter') => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file: file as File,
      type,
      name: file.name
    }));

    setUploadedFiles(prev => {
      // 如果是履歷，替換舊的履歷
      if (type === 'resume') {
        return [...prev.filter(f => f.type !== 'resume'), ...newFiles];
      }
      // 如果是求職信，添加到現有文件
      return [...prev, ...newFiles];
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: '請上傳文件',
        description: '請至少上傳一份申請文件。',
        variant: 'destructive',
      });
      return;
    }

    if (!validateForm()) {
        return;
    }

    try {
      setIsSubmitting(true);
      
      // 構建符合 applicationApi.submitApplication 預期簽名的數據對象
      const submissionData = {
        jobId: jobId || '',
        jobTitle: jobDetails?.title || '',
        companyName: jobDetails?.company || '',
        documents: uploadedFiles.map(f => f.file as File), // 確保文件類型正確
        selfRecommendation: selfRecommendation,
      };

      await applicationApi.submitApplication(submissionData);
      
      notificationService.addNotification({
        type: 'application',
        title: '申請已提交',
        message: `您已成功申請 ${jobDetails?.title || '未知職位'} 職位，我們將盡快處理您的申請。`,
      });

      toast({
        title: '申請已提交',
        description: '您的申請已成功提交，我們將盡快處理。',
      });
      navigate('/student/applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: '提交失敗',
        description: '無法提交申請。請稍後再試。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#32ADE6]" />
        <p className="ml-4 text-gray-600">載入職位中...</p>
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

  if (!jobDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">找不到該職位。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-6 text-[#32ADE6]">申請職位：{jobDetails.title}</h1>
        
        <div className="mb-6 space-y-2">
          <p className="text-gray-700 text-lg font-medium">{jobDetails.company}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center"><MapPin size={16} className="mr-1" /> {jobDetails.location}</div>
            <div className="flex items-center"><Building2 size={16} className="mr-1" /> {jobDetails.type}</div>
            <div className="flex items-center"><DollarSign size={16} className="mr-1" /> {jobDetails.salary}</div>
          </div>
          <p className="text-gray-700 mt-4">{jobDetails.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="selfRecommendation" className="block text-lg font-medium text-gray-700 mb-2">
              自我推薦 (最多 200 字)
            </label>
            <Textarea
              id="selfRecommendation"
              value={selfRecommendation}
              onChange={(e) => setSelfRecommendation(e.target.value)}
              placeholder="請用一句話簡述您為什麼適合這個職位，例如：我對貴公司的創新文化充滿熱情，並相信我的前端開發技能能夠為團隊帶來巨大價值。"
              rows={4}
              maxLength={200}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#32ADE6] focus:ring-[#32ADE6] sm:text-sm ${
                validationErrors.selfRecommendation ? 'border-red-500' : ''
              }`}
            />
            {validationErrors.selfRecommendation && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.selfRecommendation}</p>
            )}
            <p className="mt-2 text-sm text-gray-500 text-right">{selfRecommendation.length}/200</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                上傳履歷 (必填)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="resume-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#32ADE6] hover:text-[#2A8BC7] focus-within:outline-none"
                    >
                      <span>上傳文件</span>
                      <input
                        id="resume-upload"
                        name="resume-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'resume')}
                      />
                    </label>
                    <p className="pl-1">或拖放文件到這裡</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX 格式，最大 5MB</p>
                </div>
              </div>
              {validationErrors.resume && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.resume}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                上傳求職信 (選填)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="cover-letter-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#32ADE6] hover:text-[#2A8BC7] focus-within:outline-none"
                    >
                      <span>上傳文件</span>
                      <input
                        id="cover-letter-upload"
                        name="cover-letter-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'coverLetter')}
                      />
                    </label>
                    <p className="pl-1">或拖放文件到這裡</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX 格式，最大 5MB</p>
                </div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">已上傳的文件：</h3>
                <ul className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#32ADE6] text-white py-2 rounded-md hover:bg-[#2A8BC7] transition-colors flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {isSubmitting ? '提交中...' : '確認申請'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage; 