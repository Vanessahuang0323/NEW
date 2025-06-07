import axios from 'axios';

// 創建 axios 實例
const api = axios.create({
  baseURL: process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401 錯誤且沒有重試過
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { token } = response.data;
          
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // 處理其他錯誤
    const errorMessage = error.response?.data?.message || '發生錯誤，請稍後再試';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// API 端點
export const jobApi = {
  // 獲取職位匹配列表
  getJobMatches: async () => {
    try {
      const response = await api.post('/chatbot/job-matches', {
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 獲取職位詳情
  getJobDetails: async (jobId: number) => {
    try {
      const response = await api.post('/chatbot/job-details', {
        jobId,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 申請職位
  applyJob: async (jobId: number, applicationData: any) => {
    try {
      const response = await api.post('/chatbot/apply-job', {
        jobId,
        ...applicationData,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 保存職位
  saveJob: async (jobId: number) => {
    try {
      const response = await api.post('/chatbot/save-job', {
        jobId,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 獲取已保存的職位
  getSavedJobs: async () => {
    try {
      const response = await api.get('/chatbot/saved-jobs');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 獲取申請歷史
  getApplicationHistory: async () => {
    try {
      const response = await api.get('/chatbot/application-history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const resumeApi = {
  // 獲取履歷分析
  getResumeAnalysis: async () => {
    try {
      const response = await api.post('/chatbot/resume-analysis', {
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新履歷
  updateResume: async (resumeData: any) => {
    try {
      const response = await api.post('/chatbot/update-resume', {
        ...resumeData,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 生成履歷
  generateResume: async (resumeData: any) => {
    try {
      const response = await api.post('/chatbot/generate-resume', {
        ...resumeData,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const interviewApi = {
  // 獲取模擬面試問題
  getMockInterviewQuestions: async (jobId: number) => {
    try {
      const response = await api.post('/chatbot/mock-interview', {
        jobId,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 提交面試答案
  submitInterviewAnswer: async (interviewId: number, answer: string) => {
    try {
      const response = await api.post('/chatbot/submit-answer', {
        interviewId,
        answer,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 獲取面試反饋
  getInterviewFeedback: async (interviewId: number) => {
    try {
      const response = await api.get(`/chatbot/interview-feedback/${interviewId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const chatApi = {
  // 發送聊天消息
  sendMessage: async (message: string, context: string) => {
    try {
      const response = await api.post('/chatbot/chat', {
        message,
        context,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 獲取聊天歷史
  getChatHistory: async () => {
    try {
      const response = await api.get('/chatbot/chat-history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 清除聊天歷史
  clearChatHistory: async () => {
    try {
      const response = await api.delete('/chatbot/chat-history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// 申请相关的 API
export const applicationApi = {
  submitApplication: async (data: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    documents: File[];
    selfRecommendation: string;
  }) => {
    const formData = new FormData();
    formData.append('jobId', data.jobId);
    formData.append('jobTitle', data.jobTitle);
    formData.append('companyName', data.companyName);
    formData.append('selfRecommendation', data.selfRecommendation);
    
    data.documents.forEach((file, index) => {
      formData.append(`document${index}`, file);
    });

    const response = await axios.post('/api/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getApplications: async () => {
    const response = await axios.get('/api/applications');
    return response.data;
  },

  getApplicationById: async (id: string) => {
    const response = await axios.get(`/api/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (id: string, status: string) => {
    const response = await axios.patch(`/api/applications/${id}`, { status });
    return response.data;
  },

  withdrawApplication: async (id: string) => {
    const response = await axios.delete(`/api/applications/${id}`);
    return response.data;
  },

  // 公司端 API
  getCompanyApplicants: async () => {
    const response = await axios.get('/api/company/applicants');
    return response.data;
  },

  getCompanyApplicantById: async (id: string) => {
    const response = await axios.get(`/api/company/applicants/${id}`);
    return response.data;
  },

  updateApplicantStatus: async (id: string, status: string, feedback?: string) => {
    const response = await axios.patch(`/api/company/applicants/${id}`, {
      status,
      feedback,
    });
    return response.data;
  },

  scheduleInterview: async (id: string, interviewDate: string, notes?: string) => {
    const response = await axios.post(`/api/company/applicants/${id}/interview`, {
      interviewDate,
      notes,
    });
    return response.data;
  },

  sendFeedback: async (id: string, feedback: string) => {
    const response = await axios.post(`/api/company/applicants/${id}/feedback`, {
      feedback,
    });
    return response.data;
  },

  downloadDocument: async (id: string, documentId: string) => {
    const response = await axios.get(`/api/company/applicants/${id}/documents/${documentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api; 