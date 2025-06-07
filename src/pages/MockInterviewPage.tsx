import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getInterviewQuestions, submitAnswerAndGetFeedback, InterviewQuestion, InterviewFeedback } from '../services/mockInterviewService';
import { toast } from '../components/ui/use-toast';

const MockInterviewPage: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [history, setHistory] = useState<{ q: string; a: string; f: string; score: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 暫時使用模擬職位描述，未來可以從用戶設定或推薦職位中獲取
  const mockJobDescription = "軟體工程師，負責開發和維護後端系統，熟悉Node.js和資料庫。";

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const fetchedQuestions = await getInterviewQuestions(mockJobDescription);
        setQuestions(fetchedQuestions);
        toast({
          title: '成功',
          description: '面試問題已成功載入。',
        });
      } catch (err) {
        console.error('Error fetching interview questions:', err);
        setError('無法載入面試問題。請稍後再試。');
        toast({
          title: '錯誤',
          description: '無法載入面試問題。',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) throw new Error("沒有當前問題。");

      const aiFeedback = await submitAnswerAndGetFeedback(currentQuestion.question, userAnswer);
      setFeedback(aiFeedback);
      setHistory(prev => [...prev, {
        q: currentQuestion.question,
        a: userAnswer,
        f: aiFeedback.aiFeedback,
        score: aiFeedback.score
      }]);
      setUserAnswer('');

      // 延遲一下再切換到下一個問題，讓用戶有時間閱讀反饋
      setTimeout(() => {
        setFeedback(null);
        setCurrentQuestionIndex(prev => (prev + 1 < questions.length ? prev + 1 : 0));
      }, 3000);

    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('提交答案時發生錯誤。請稍後再試。');
      toast({
        title: '錯誤',
        description: '提交答案時發生錯誤。',
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
        <p className="ml-4 text-gray-600">載入面試問題中...</p>
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#32ADE6]">模擬面試</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="mb-4 text-lg font-semibold text-gray-700">問題 ({currentQuestionIndex + 1}/{questions.length})：</div>
          <div className="mb-6 text-gray-800 text-xl">{currentQuestion?.question || '沒有更多問題了。'}</div>
          <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <input
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#32ADE6]"
              placeholder="請輸入你的回答..."
              disabled={isSubmitting || !currentQuestion}
            />
            <button
              type="submit"
              className="bg-[#32ADE6] text-white px-6 py-2 rounded-lg hover:bg-[#2A8BC7] transition-colors flex items-center justify-center"
              disabled={isSubmitting || !currentQuestion}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : ''}送出
            </button>
          </form>
          {feedback && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <div className="font-semibold">AI 回饋 (分數: {feedback.score}/100)：</div>
              <p>{feedback.aiFeedback}</p>
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold">改進建議：</div>
                  <ul className="list-disc list-inside">
                    {feedback.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">歷史紀錄</h2>
          {history.length === 0 ? (
            <div className="text-gray-400">尚無紀錄</div>
          ) : (
            <ul className="space-y-4">
              {history.map((item, idx) => (
                <li key={idx} className="border-b pb-2">
                  <div className="font-medium text-gray-800">Q: {item.q}</div>
                  <div className="text-gray-700 mt-1">A: {item.a}</div>
                  <div className="text-green-600 mt-1">AI (分數: {item.score}/100)：{item.f}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockInterviewPage; 