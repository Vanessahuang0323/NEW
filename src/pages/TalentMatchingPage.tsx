import React, { useEffect, useState } from 'react';
import TalentMatching from '../components/TalentMatching';
import { getStudentMatchesForCompany, StudentProfile } from '../services/matchingService';
import { useAppContext } from '../context/AppContext';
import { toast } from '../components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const TalentMatchingPage: React.FC = () => {
  const { companyId } = useAppContext(); // 假設 useAppContext 提供了 companyId
  const [talents, setTalents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTalents = async () => {
      if (!companyId) {
        setError('公司 ID 未提供，無法載入人才匹配資料。');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const studentMatches = await getStudentMatchesForCompany(companyId);
        setTalents(studentMatches);
        toast({
          title: '成功',
          description: '人才匹配資料已成功載入。',
        });
      } catch (err) {
        console.error('Error fetching talent matches:', err);
        setError('無法載入人才匹配資料。請稍後再試。');
        toast({
          title: '錯誤',
          description: '無法載入人才匹配資料。',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalents();
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#32ADE6]" />
        <p className="ml-4 text-gray-600">載入人才匹配中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">人才配對</h1>
        {talents.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">目前沒有可供配對的人才。</p>
        ) : (
          <TalentMatching talents={talents} />
        )}
      </div>
    </div>
  );
};

export default TalentMatchingPage; 