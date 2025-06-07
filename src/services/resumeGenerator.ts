import { ResumeData } from '../components/ResumeForm';
import { chatApi } from './api';

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  style: string;
  preview: string;
}

interface ResumeAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
  skillGaps: string[];
}

interface ResumeOptimization {
  originalContent: string;
  optimizedContent: string;
  changes: {
    section: string;
    original: string;
    optimized: string;
    reason: string;
  }[];
}

export const generateResume = async (
  resumeData: ResumeData,
  template: ResumeTemplate,
  targetJob?: {
    title: string;
    company: string;
    requirements: string[];
  }
): Promise<string> => {
  try {
    const prompt = targetJob
      ? `請根據以下履歷資料和目標職位生成一份優化的履歷：\n
         履歷資料：${JSON.stringify(resumeData, null, 2)}\n
         目標職位：${JSON.stringify(targetJob, null, 2)}\n
         使用模板：${JSON.stringify(template, null, 2)}`
      : `請根據以下履歷資料生成一份專業的履歷：\n
         履歷資料：${JSON.stringify(resumeData, null, 2)}\n
         使用模板：${JSON.stringify(template, null, 2)}`;

    const response = await chatApi.sendMessage(
      prompt,
      JSON.stringify({ type: 'student', analysis: 'resume_generation' })
    );

    return response.content;
  } catch (error) {
    console.error('Resume Generation Error:', error);
    throw new Error('Failed to generate resume');
  }
};

export const analyzeResume = async (resumeData: ResumeData): Promise<ResumeAnalysis> => {
  try {
    const response = await chatApi.sendMessage(
      `請分析以下履歷內容：\n${JSON.stringify(resumeData, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'resume_analysis' })
    );

    return JSON.parse(response.content);
  } catch (error) {
    console.error('Resume Analysis Error:', error);
    throw new Error('Failed to analyze resume');
  }
};

export const optimizeResumeForJob = async (
  resumeData: ResumeData,
  targetJob: {
    title: string;
    company: string;
    requirements: string[];
    description: string;
  }
): Promise<ResumeOptimization> => {
  try {
    const response = await chatApi.sendMessage(
      `請優化以下履歷以匹配目標職位：\n
       履歷：${JSON.stringify(resumeData, null, 2)}\n
       目標職位：${JSON.stringify(targetJob, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'resume_optimization' })
    );

    return JSON.parse(response.content);
  } catch (error) {
    console.error('Resume Optimization Error:', error);
    throw new Error('Failed to optimize resume');
  }
};

export const generateResumeSummary = async (resumeData: ResumeData): Promise<string> => {
  try {
    const response = await chatApi.sendMessage(
      `請為以下履歷生成一個專業的摘要：\n${JSON.stringify(resumeData, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'resume_summary' })
    );

    return response.content;
  } catch (error) {
    console.error('Resume Summary Error:', error);
    throw new Error('Failed to generate resume summary');
  }
};

export const getResumeTemplates = async (): Promise<ResumeTemplate[]> => {
  try {
    const response = await chatApi.sendMessage(
      '請提供可用的履歷模板列表',
      JSON.stringify({ type: 'student', analysis: 'resume_templates' })
    );

    return JSON.parse(response.content);
  } catch (error) {
    console.error('Resume Templates Error:', error);
    throw new Error('Failed to get resume templates');
  }
};

export const generateCoverLetter = async (
  resumeData: ResumeData,
  targetJob: {
    title: string;
    company: string;
    description: string;
  }
): Promise<string> => {
  try {
    const response = await chatApi.sendMessage(
      `請根據以下履歷和目標職位生成一封求職信：\n
       履歷：${JSON.stringify(resumeData, null, 2)}\n
       目標職位：${JSON.stringify(targetJob, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'cover_letter' })
    );

    return response.content;
  } catch (error) {
    console.error('Cover Letter Generation Error:', error);
    throw new Error('Failed to generate cover letter');
  }
}; 