import { ResumeData } from '../components/ResumeForm';
import { chatApi } from './api';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  requirements: string[];
  description: string;
  skills: string[];
}

interface MatchResult {
  job: JobPosting;
  matchScore: number;
  matchingSkills: string[];
  matchingReasons: string[];
}

interface ResumeAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  matchScore: number;
}

export const analyzeResume = async (resumeData: ResumeData): Promise<ResumeAnalysis> => {
  try {
    const response = await chatApi.sendMessage(
      `請分析以下履歷內容：\n${JSON.stringify(resumeData, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'resume' })
    );

    const analysis = JSON.parse(response.content);
    return {
      skills: analysis.skills || [],
      experience: analysis.experience || [],
      education: analysis.education || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      suggestions: analysis.suggestions || [],
      matchScore: analysis.matchScore || 0,
    };
  } catch (error) {
    console.error('Resume Analysis Error:', error);
    throw new Error('Failed to analyze resume');
  }
};

export const generateResumeSuggestions = async (resumeData: ResumeData): Promise<string[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請根據以下履歷內容提供具體的改進建議：\n${JSON.stringify(resumeData, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'resume_suggestions' })
    );

    return response.content.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Resume Suggestions Error:', error);
    throw new Error('Failed to generate resume suggestions');
  }
};

export const matchJobsWithResume = async (
  resumeData: ResumeData,
  jobs: JobPosting[]
): Promise<MatchResult[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請分析以下履歷與職位的匹配度：\n履歷：${JSON.stringify(resumeData, null, 2)}\n職位：${JSON.stringify(jobs, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'job_matching' })
    );

    return JSON.parse(response.content);
  } catch (error) {
    console.error('Job Matching Error:', error);
    throw new Error('Failed to match jobs with resume');
  }
};

export const generateResumeSummary = async (resumeData: ResumeData): Promise<string> => {
  try {
    const response = await chatApi.sendMessage(
      `請為以下履歷生成一個簡短的專業摘要：\n${JSON.stringify(resumeData, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'resume_summary' })
    );

    return response.content;
  } catch (error) {
    console.error('Resume Summary Error:', error);
    throw new Error('Failed to generate resume summary');
  }
};

export const analyzeResumeKeywords = async (resumeData: ResumeData): Promise<string[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請從以下履歷中提取關鍵詞：\n${JSON.stringify(resumeData, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'resume_keywords' })
    );

    return response.content.split(',').map(keyword => keyword.trim());
  } catch (error) {
    console.error('Resume Keywords Error:', error);
    throw new Error('Failed to analyze resume keywords');
  }
}; 