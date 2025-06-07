import React, { useState } from 'react';
import TalentCard from './TalentCard';
import { ChevronLeft, ChevronRight, Bookmark, X } from 'lucide-react'; // Import Bookmark icon
import { motion, AnimatePresence } from 'framer-motion';
import { recordInteraction, StudentProfile } from '../services/matchingService';
import { toast } from './ui/use-toast';

interface TalentMatchingProps {
  talents: StudentProfile[];
}

const TalentMatching: React.FC<TalentMatchingProps> = ({ talents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedTalents, setSavedTalents] = useState<StudentProfile[]>([]); // Changed from likedTalents
  const [isAnimating, setIsAnimating] = useState(false);

  const currentTalent = talents[currentIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const talentId = currentTalent.id;

    try {
      if (direction === 'right') {
        // Save action
        await recordInteraction({
          initiatorId: "currentCompanyId", // Replace with actual company ID
          targetId: talentId,
          type: 'save',
        });
        setSavedTalents(prev => [...prev, currentTalent]);
        toast({
          title: '收藏成功',
          description: `${currentTalent.name} 已被收藏。`,
        });
      } else {
        // Reject action (previously dislike)
        await recordInteraction({
          initiatorId: "currentCompanyId", // Replace with actual company ID
          targetId: talentId,
          type: 'reject',
        });
        toast({
          title: '已跳過',
          description: `${currentTalent.name} 已被跳過。`,
        });
      }
    } catch (error) {
      console.error('Error recording interaction:', error);
      toast({
        title: '操作失敗',
        description: '無法記錄操作，請稍後再試。',
        variant: 'destructive',
      });
    }
    
    // Delay transition to allow animation to complete
    setTimeout(() => {
      if (currentIndex < talents.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // If no more talents, reset or show a message
        setCurrentIndex(0); // For demonstration, reset to start
        toast({
          title: '已完成',
          description: '所有人才已處理完畢。',
        });
      }
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-100 p-4 rounded-xl shadow-lg">
      <AnimatePresence>
        {currentTalent ? (
          <motion.div
            key={currentTalent.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <TalentCard talent={currentTalent} onSwipe={handleSwipe} />
          </motion.div>
        ) : (
          <div className="text-center text-gray-600 text-lg">目前沒有可供配對的人才。</div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => handleSwipe('left')}
          className="p-4 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors flex items-center justify-center"
          disabled={isAnimating || !currentTalent}
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="p-4 bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors flex items-center justify-center"
          disabled={isAnimating || !currentTalent}
        >
          <Bookmark className="w-8 h-8 text-blue-500" /> {/* Changed to Bookmark icon */}
        </button>
      </div>

      <div className="mt-8">
        <div className="flex justify-center gap-2 mb-2">
          {talents.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-500 scale-125'
                  : index < currentIndex
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm">
          還有 {talents.length - currentIndex - 1} 位候選人
        </p>
      </div>
    </div>
  );
};

export default TalentMatching; 