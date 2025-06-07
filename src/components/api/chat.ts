import { chatApi } from '../../services/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatContext {
  type: 'student' | 'company';
  jobId?: number;
  resumeId?: number;
}

export async function chatWithGPT(message: string, context: ChatContext): Promise<string> {
  try {
    const response = await chatApi.sendMessage(message, JSON.stringify(context));
    return response.content;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw new Error('Failed to get response from AI assistant');
  }
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  try {
    const response = await chatApi.getChatHistory();
    return response.messages;
  } catch (error) {
    console.error('Chat History Error:', error);
    throw new Error('Failed to fetch chat history');
  }
}

export async function clearChatHistory(): Promise<void> {
  try {
    await chatApi.clearChatHistory();
  } catch (error) {
    console.error('Clear Chat History Error:', error);
    throw new Error('Failed to clear chat history');
  }
}

export async function analyzeJobDescription(jobDescription: string): Promise<string> {
  try {
    const response = await chatApi.sendMessage(
      `請分析以下職位描述，並提供關鍵技能要求和建議：\n${jobDescription}`,
      JSON.stringify({ type: 'company', analysis: 'job' })
    );
    return response.content;
  } catch (error) {
    console.error('Job Analysis Error:', error);
    throw new Error('Failed to analyze job description');
  }
}

export async function analyzeResume(resumeContent: string): Promise<string> {
  try {
    const response = await chatApi.sendMessage(
      `請分析以下履歷內容，並提供改進建議：\n${resumeContent}`,
      JSON.stringify({ type: 'student', analysis: 'resume' })
    );
    return response.content;
  } catch (error) {
    console.error('Resume Analysis Error:', error);
    throw new Error('Failed to analyze resume');
  }
}

export async function generateInterviewQuestions(jobDescription: string): Promise<string[]> {
  try {
    const response = await chatApi.sendMessage(
      `請根據以下職位描述生成5個面試問題：\n${jobDescription}`,
      JSON.stringify({ type: 'company', analysis: 'interview' })
    );
    return response.content.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Interview Questions Error:', error);
    throw new Error('Failed to generate interview questions');
  }
}

export async function evaluateInterviewAnswer(question: string, answer: string): Promise<string> {
  try {
    const response = await chatApi.sendMessage(
      `請評估以下面試答案：\n問題：${question}\n答案：${answer}`,
      JSON.stringify({ type: 'student', analysis: 'interview_feedback' })
    );
    return response.content;
  } catch (error) {
    console.error('Interview Evaluation Error:', error);
    throw new Error('Failed to evaluate interview answer');
  }
} 