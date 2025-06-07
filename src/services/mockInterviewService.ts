import { chatApi } from './api';

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewFeedback {
  originalAnswer: string;
  aiFeedback: string;
  score: number;
  suggestions: string[];
}

export const getInterviewQuestions = async (jobDescription: string, numberOfQuestions: number = 5): Promise<InterviewQuestion[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請根據以下職位描述生成 ${numberOfQuestions} 個模擬面試問題：\n${jobDescription}`,
      JSON.stringify({ type: 'student', analysis: 'mock_interview_questions', jobDescription, numberOfQuestions })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions');
  }
};

export const submitAnswerAndGetFeedback = async (question: string, answer: string): Promise<InterviewFeedback> => {
  try {
    const response = await chatApi.sendMessage(
      `請評估以下面試問題和答案：\n問題：${question}\n答案：${answer}`,
      JSON.stringify({ type: 'student', analysis: 'mock_interview_feedback', question, answer })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error submitting answer and getting feedback:', error);
    throw new Error('Failed to submit answer and get feedback');
  }
};

export const getInterviewTips = async (category?: string): Promise<string[]> => {
  try {
    const response = await chatApi.sendMessage(
      `請提供 ${category ? category + '的' : '一般'} 面試技巧。`,
      JSON.stringify({ type: 'student', analysis: 'interview_tips', category })
    );
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error fetching interview tips:', error);
    throw new Error('Failed to fetch interview tips');
  }
}; 