import { chatApi } from './api';

export interface StudentProfile {
  id: string;
  name: string;
  skills: string[];
  education: {
    school: string;
    degree: string;
    field: string;
  }[];
  experience: {
    title: string;
    company: string;
    description: string;
  }[];
  preferredJobTypes: string[];
  preferredLocations: string[];
  careerGoals: string;
  personalityTraits: string[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  description: string;
  jobPostings: {
    id: string;
    title: string;
    requirements: string[];
    skills: string[];
    location: string;
    type: string;
  }[];
}

export interface MatchResult {
  id: string;
  studentId: string;
  companyId: string;
  jobId?: string;
  matchScore: number;
  matchingReasons: string[];
  timestamp: string;
}

export interface Interaction {
  id: string;
  initiatorId: string; // studentId or companyId
  targetId: string; // studentId or companyId (the other party)
  type: 'save' | 'view' | 'reject';
  timestamp: string;
}

export const getStudentMatchesForCompany = async (companyId: string): Promise<StudentProfile[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請為公司 ${companyId} 推薦潛在的學生候選人，並附上匹配原因和分數。`,
      JSON.stringify({ type: 'company', action: 'get_student_matches', companyId })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching student matches for company:', error);
    throw new Error('Failed to fetch student matches for company');
  }
};

export const getCompanyMatchesForStudent = async (studentId: string): Promise<CompanyProfile[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請為學生 ${studentId} 推薦潛在的公司和職位，並附上匹配原因和分數。`,
      JSON.stringify({ type: 'student', action: 'get_company_matches', studentId })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching company matches for student:', error);
    throw new Error('Failed to fetch company matches for student');
  }
};

export const recordInteraction = async (interaction: Omit<Interaction, 'id' | 'timestamp'>): Promise<Interaction> => {
  try {
    const response = await chatApi.sendMessage(
      `請記錄以下互動：\n${JSON.stringify(interaction, null, 2)}`,
      JSON.stringify({ type: 'system', action: 'record_interaction', interaction })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error recording interaction:', error);
    throw new Error('Failed to record interaction');
  }
};

export const getCompanyMatchedStudents = async (companyId: string): Promise<StudentProfile[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請獲取公司 ${companyId} 已匹配的學生列表。`,
      JSON.stringify({ type: 'company', action: 'get_company_matched_students', companyId })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching company matched students:', error);
    throw new Error('Failed to fetch company matched students');
  }
};

export const getStudentMatchedCompanies = async (studentId: string): Promise<CompanyProfile[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請獲取學生 ${studentId} 已匹配的公司列表。`,
      JSON.stringify({ type: 'student', action: 'get_student_matched_companies', studentId })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching student matched companies:', error);
    throw new Error('Failed to fetch student matched companies');
  }
}; 