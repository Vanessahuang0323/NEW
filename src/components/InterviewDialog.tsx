import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from './ui/use-toast';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface InterviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: Date, notes: string) => Promise<void>;
  applicantName: string;
}

const InterviewDialog: React.FC<InterviewDialogProps> = ({
  isOpen,
  onClose,
  onSchedule,
  applicantName,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast({
        title: '請選擇面試日期',
        description: '請選擇一個面試日期。',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSchedule(selectedDate, notes);
      toast({
        title: '面試已安排',
        description: '面試時間已成功安排。',
      });
      onClose();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: '安排失敗',
        description: '無法安排面試時間。請稍後再試。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>安排面試 - {applicantName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">選擇面試日期</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={zhTW}
              className="rounded-md border"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              備註
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="請輸入面試相關的備註，例如：面試地點、需要準備的文件等"
              className="h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#32ADE6] text-white hover:bg-[#2A8BC7]"
          >
            {isSubmitting ? '安排中...' : '確認安排'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewDialog; 