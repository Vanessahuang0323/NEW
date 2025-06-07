import { chatApi } from './api';

export interface Application {
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

export interface ApplicationUpdate {
  status?: 'Applied' | 'Under Review' | 'Interviewing' | 'Offered' | 'Rejected' | 'Withdrawn';
  notes?: string;
  feedback?: string;
  interviewDates?: string[];
}

export const submitApplication = async (applicationData: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application> => {
  try {
    const response = await chatApi.sendMessage(
      `請處理以下職位申請的提交：\n${JSON.stringify(applicationData, null, 2)}`,
      JSON.stringify({ type: 'student', action: 'submit_application', payload: applicationData })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error submitting application:', error);
    throw new Error('Failed to submit application');
  }
};

export const getApplications = async (studentId: string): Promise<Application[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請獲取學生 ${studentId} 的所有申請記錄。`,
      JSON.stringify({ type: 'student', action: 'get_applications', studentId })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw new Error('Failed to fetch applications');
  }
};

export const getApplicationById = async (applicationId: string): Promise<Application> => {
  try {
    const response = await chatApi.sendMessage(
      `請獲取申請 ID 為 ${applicationId} 的詳細資訊。`,
      JSON.stringify({ type: 'student', action: 'get_application_by_id', applicationId })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    throw new Error('Failed to fetch application by ID');
  }
};

export const updateApplicationStatus = async (applicationId: string, updateData: ApplicationUpdate): Promise<Application> => {
  try {
    const response = await chatApi.sendMessage(
      `請更新申請 ID 為 ${applicationId} 的狀態及資訊：\n${JSON.stringify(updateData, null, 2)}`,
      JSON.stringify({ type: 'student', action: 'update_application_status', applicationId, updateData })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
};

export const withdrawApplication = async (applicationId: string): Promise<void> => {
  try {
    await chatApi.sendMessage(
      `請撤回申請 ID 為 ${applicationId} 的申請。`,
      JSON.stringify({ type: 'student', action: 'withdraw_application', applicationId })
    );
  } catch (error) {
    console.error('Error withdrawing application:', error);
    throw new Error('Failed to withdraw application');
  }
};

export const getApplicationNotifications = async (studentId: string): Promise<string[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請獲取學生 ${studentId} 的所有申請通知。`,
      JSON.stringify({ type: 'student', action: 'get_application_notifications', studentId })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching application notifications:', error);
    throw new Error('Failed to fetch application notifications');
  }
}; 