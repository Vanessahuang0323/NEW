import { ResumeData } from '../components/ResumeForm';
import { chatApi } from './api';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  duration: string;
  salary: string;
  requirements: string[];
  description: string;
  skills: string[];
  benefits: string[];
  companyCulture: string[];
  industry: string;
  experienceLevel: string;
  isRemote: boolean;
}

interface JobMatch {
  job: JobPosting;
  matchScore: number;
  matchingSkills: string[];
  matchingReasons: string[];
  skillGaps: string[];
  improvementSuggestions: string[];
}

interface UserPreferences {
  preferredLocations: string[];
  preferredIndustries: string[];
  preferredJobTypes: string[];
  salaryExpectations: {
    min: number;
    max: number;
  };
  workStyle: string[];
  careerGoals: string[];
}

export const analyzeJobMatch = async (
  resumeData: ResumeData,
  job: JobPosting,
  userPreferences: UserPreferences
): Promise<JobMatch> => {
  try {
    const response = await chatApi.sendMessage(
      `請分析以下履歷與職位的匹配度：\n
      履歷：${JSON.stringify(resumeData, null, 2)}\n
      職位：${JSON.stringify(job, null, 2)}\n
      用戶偏好：${JSON.stringify(userPreferences, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'job_matching' })
    );

    return JSON.parse(response.content);
  } catch (error) {
    console.error('Job Match Analysis Error:', error);
    throw new Error('Failed to analyze job match');
  }
};

export const getPersonalizedJobRecommendations = async (
  resumeData: ResumeData,
  userPreferences: UserPreferences,
  availableJobs: JobPosting[]
): Promise<JobMatch[]> => {
  try {
    // 首先過濾符合基本偏好的職位
    const filteredJobs = availableJobs.filter(job => {
      const locationMatch = userPreferences.preferredLocations.includes(job.location);
      const industryMatch = userPreferences.preferredIndustries.includes(job.industry);
      const typeMatch = userPreferences.preferredJobTypes.includes(job.type);
      
      // 解析薪資範圍
      const salaryMatch = (() => {
        const jobSalary = parseInt(job.salary.replace(/[^0-9]/g, ''));
        return jobSalary >= userPreferences.salaryExpectations.min &&
               jobSalary <= userPreferences.salaryExpectations.max;
      })();

      return locationMatch && industryMatch && typeMatch && salaryMatch;
    });

    // 對每個過濾後的職位進行詳細匹配分析
    const matches = await Promise.all(
      filteredJobs.map(job => analyzeJobMatch(resumeData, job, userPreferences))
    );

    // 根據匹配分數排序
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Job Recommendation Error:', error);
    throw new Error('Failed to get job recommendations');
  }
};

export interface CategorizedJobRecommendations {
  highSuitability: JobMatch[];
  remoteJobs: JobMatch[];
  popularJobs: JobMatch[];
}

export const getCategorizedJobRecommendations = async (
  resumeData: ResumeData,
  userPreferences: UserPreferences,
  availableJobs: JobPosting[]
): Promise<CategorizedJobRecommendations> => {
  try {
    const allMatches = await getPersonalizedJobRecommendations(resumeData, userPreferences, availableJobs);

    const highSuitability = allMatches.slice(0, 10); // 取前10個高適配度的職位

    const remoteJobs = allMatches.filter(match => match.job.isRemote);

    // 為了「熱門」職位，我們假設有一個 popularityScore 欄位，或者可以根據某些條件（例如申請人數）來定義
    // 這裡暫時根據 matchScore 來做一個簡單的熱門模擬，實際應用中會更複雜
    const popularJobs = [...allMatches].sort((a, b) => b.matchScore - a.matchScore).slice(0, 10); // 暫時用 matchScore 模擬熱門

    return {
      highSuitability,
      remoteJobs,
      popularJobs,
    };
  } catch (error) {
    console.error('Error getting categorized job recommendations:', error);
    throw new Error('Failed to get categorized job recommendations');
  }
};

export const getSkillGapAnalysis = async (
  resumeData: ResumeData,
  targetJob: JobPosting
): Promise<{
  missingSkills: string[];
  improvementPlan: string[];
  learningResources: string[];
}> => {
  try {
    const response = await chatApi.sendMessage(
      `請分析以下履歷與目標職位之間的技能差距：\n
      履歷：${JSON.stringify(resumeData, null, 2)}\n
      目標職位：${JSON.stringify(targetJob, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'skill_gap' })
    );

    return JSON.parse(response.content);
  } catch (error) {
    console.error('Skill Gap Analysis Error:', error);
    throw new Error('Failed to analyze skill gaps');
  }
};

export const getCareerPathSuggestions = async (
  resumeData: ResumeData,
  currentJob: JobPosting,
  careerGoals: string[]
): Promise<{
  suggestedPath: string[];
  requiredSkills: string[];
  timeline: string;
  milestones: string[];
}> => {
  try {
    const response = await chatApi.sendMessage(
      `請根據以下資訊提供職業發展建議：\n
      履歷：${JSON.stringify(resumeData, null, 2)}\n
      當前職位：${JSON.stringify(currentJob, null, 2)}\n
      職業目標：${JSON.stringify(careerGoals, null, 2)}`,
      JSON.stringify({ type: 'student', analysis: 'career_path' })
    );

    return JSON.parse(response.content);
  } catch (error) {
    console.error('Career Path Suggestion Error:', error);
    throw new Error('Failed to get career path suggestions');
  }
};

export const getSavedJobs = async (studentId: string): Promise<JobPosting[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請獲取學生 ${studentId} 收藏的所有職位。`,
      JSON.stringify({ type: 'student', action: 'get_saved_jobs', studentId })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    throw new Error('Failed to fetch saved jobs');
  }
}; 