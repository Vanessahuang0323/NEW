import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Card } from './ui/card';
import { toast } from './ui/use-toast';
import {
  generateResume,
  analyzeResume,
  optimizeResumeForJob,
  generateCoverLetter,
  getResumeTemplates,
} from '../services/resumeGenerator';

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  education: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    achievements?: string[];
  }[];
  experience: {
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
    skills: string[];
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    name: string;
    description: string;
    templateUsed?: string;
    outcomeDescription: string;
    technologies: string[];
    links?: string[];
    startDate: string;
    endDate: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
  personalityTraits: string[];
}

const resumeSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(1, '姓名為必填項'),
    email: z.string().email('請輸入有效的電子郵件'),
    phone: z.string().min(1, '電話為必填項'),
    location: z.string().min(1, '地點為必填項'),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }),
  summary: z.string().min(50, '摘要至少需要50個字符'),
  education: z.array(
    z.object({
      school: z.string().min(1, '學校名稱為必填項'),
      degree: z.string().min(1, '學位為必填項'),
      field: z.string().min(1, '專業為必填項'),
      startDate: z.string().min(1, '開始日期為必填項'),
      endDate: z.string().min(1, '結束日期為必填項'),
      gpa: z.string().optional(),
      achievements: z.array(z.string()).optional(),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string().min(1, '公司名稱為必填項'),
      position: z.string().min(1, '職位為必填項'),
      location: z.string().min(1, '地點為必填項'),
      startDate: z.string().min(1, '開始日期為必填項'),
      endDate: z.string().min(1, '結束日期為必填項'),
      description: z.string().min(1, '描述為必填項'),
      achievements: z.array(z.string()),
      skills: z.array(z.string()),
    })
  ),
  skills: z.array(
    z.object({
      category: z.string().min(1, '技能類別為必填項'),
      items: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1, '項目名稱為必填項'),
      description: z.string().min(1, '描述為必填項'),
      templateUsed: z.string().optional(),
      outcomeDescription: z.string().min(1, '成果簡述為必填項'),
      technologies: z.array(z.string()),
      links: z.array(z.string().url('請輸入有效的URL')).optional(),
      startDate: z.string().min(1, '開始日期為必填項'),
      endDate: z.string().min(1, '結束日期為必填項'),
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string().min(1, '證書名稱為必填項'),
      issuer: z.string().min(1, '頒發機構為必填項'),
      date: z.string().min(1, '日期為必填項'),
      link: z.string().optional(),
    })
  ),
  languages: z.array(
    z.object({
      language: z.string().min(1, '語言為必填項'),
      proficiency: z.string().min(1, '熟練度為必填項'),
    })
  ),
  personalityTraits: z.array(z.string())
    .min(1, '請至少選擇一個性格特質')
    .max(3, '最多只能選擇三個性格特質'),
});

export const ResumeForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
      },
      summary: '',
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      personalityTraits: [],
    },
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: "projects",
  });

  const { fields: skillCategoryFields, append: appendSkillCategory, remove: removeSkillCategory } = useFieldArray({
    control,
    name: "skills",
  });

  const getSkillItems = (categoryIndex: number) => {
    const skillCategory = watch(`skills.${categoryIndex}`);
    return skillCategory?.items || [];
  };

  const appendSkillItem = (categoryIndex: number, value: string) => {
    const currentSkills = control.getValues(`skills.${categoryIndex}.items`) || [];
    control.setValue(`skills.${categoryIndex}.items`, [...currentSkills, value]);
  };

  const removeSkillItem = (categoryIndex: number, itemIndex: number) => {
    const currentSkills = control.getValues(`skills.${categoryIndex}.items`) || [];
    const newSkills = currentSkills.filter((_: any, idx: number) => idx !== itemIndex);
    control.setValue(`skills.${categoryIndex}.items`, newSkills);
  };

  const getProjectLinks = (projectIndex: number) => {
    const project = watch(`projects.${projectIndex}`);
    return project?.links || [];
  };

  const appendProjectLink = (projectIndex: number, value: string) => {
    const currentLinks = control.getValues(`projects.${projectIndex}.links`) || [];
    control.setValue(`projects.${projectIndex}.links`, [...currentLinks, value]);
  };

  const removeProjectLink = (projectIndex: number, linkIndex: number) => {
    const currentLinks = control.getValues(`projects.${projectIndex}.links`) || [];
    const newLinks = currentLinks.filter((_: any, idx: number) => idx !== linkIndex);
    control.setValue(`projects.${projectIndex}.links`, newLinks);
  };

  React.useEffect(() => {
    const loadTemplates = async () => {
      try {
        const availableTemplates = await getResumeTemplates();
        setTemplates(availableTemplates);
      } catch (error) {
        toast({
          title: '錯誤',
          description: '無法載入履歷模板',
          variant: 'destructive',
        });
      }
    };
    loadTemplates();
  }, []);

  const onSubmit = async (data: ResumeData) => {
    setIsLoading(true);
    try {
      const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
      if (!selectedTemplateData) {
        throw new Error('請選擇一個履歷模板');
      }

      const resume = await generateResume(data, selectedTemplateData);
      
      // 分析履歷
      const analysis = await analyzeResume(data);
      
      toast({
        title: '成功',
        description: '履歷已生成並分析完成',
      });

      // 這裡可以添加下載或預覽履歷的邏輯
    } catch (error) {
      toast({
        title: '錯誤',
        description: error instanceof Error ? error.message : '生成履歷時發生錯誤',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableTraits = [
    '積極主動',
    '團隊合作',
    '創新思維',
    '解決問題',
    '溝通能力',
    '適應力強',
    '細心嚴謹',
    '學習能力強',
    '領導能力',
    '抗壓性高',
  ];

  const projectTemplates = [
    { id: 'template-1', name: '網頁開發專案模板', description: '適用於前後端網站開發專案' },
    { id: 'template-2', name: '數據分析專案模板', description: '適用於數據分析、機器學習專案' },
    { id: 'template-3', name: '行動應用專案模板', description: '適用於 iOS/Android APP 開發專案' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">個人信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="personalInfo.name"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">姓名</label>
                <Input {...field} />
                {errors.personalInfo?.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.personalInfo.name.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="personalInfo.email"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">電子郵件</label>
                <Input {...field} type="email" />
                {errors.personalInfo?.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.personalInfo.email.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="personalInfo.phone"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">電話</label>
                <Input {...field} />
                {errors.personalInfo?.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.personalInfo.phone.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="personalInfo.location"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">地點</label>
                <Input {...field} />
                {errors.personalInfo?.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.personalInfo.location.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="personalInfo.linkedin"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn 個人檔案 (選填)</label>
                <Input {...field} placeholder="例如: https://linkedin.com/in/yourprofile" />
              </div>
            )}
          />
          <Controller
            name="personalInfo.website"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-1">個人網站 (選填)</label>
                <Input {...field} placeholder="例如: https://yourwebsite.com" />
              </div>
            )}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">專業摘要</h2>
        <Controller
          name="summary"
          control={control}
          render={({ field }) => (
            <div>
              <Textarea {...field} rows={4} placeholder="簡述您的專業背景、職業目標和主要成就..." />
              {errors.summary && (
                <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>
              )}
            </div>
          )}
        />
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">性格特質 (最多選擇3個)</h2>
        <Controller
          name="personalityTraits"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {availableTraits.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  className={`px-4 py-2 rounded-full border ${field.value.includes(trait) ? 'bg-[#32ADE6] text-white border-[#32ADE6]' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  onClick={() => {
                    const currentTraits = new Set(field.value);
                    if (currentTraits.has(trait)) {
                      currentTraits.delete(trait);
                    } else {
                      if (currentTraits.size < 3) {
                        currentTraits.add(trait);
                      } else {
                        toast({
                          title: '選擇過多',
                          description: '最多只能選擇三個性格特質。',
                          variant: 'destructive',
                        });
                      }
                    }
                    field.onChange(Array.from(currentTraits));
                  }}
                >
                  {trait}
                </button>
              ))}
            </div>
          )}
        />
        {errors.personalityTraits && (
          <p className="text-red-500 text-sm mt-1">{errors.personalityTraits.message}</p>
        )}
      </Card>

      {/* 教育經歷部分 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">教育經歷</h2>
        {/* 教育經歷表單字段 */}
      </Card>

      {/* 工作經驗部分 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">工作經驗</h2>
        {/* 工作經驗表單字段 */}
      </Card>

      {/* 技能部分 */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">技能</h2>
          <Button type="button" onClick={() => appendSkillCategory({ category: '', items: [] })}>
            新增技能類別
          </Button>
        </div>
        {skillCategoryFields.length === 0 && <p className="text-gray-600">請新增技能類別</p>}
        {skillCategoryFields.map((categoryField, categoryIndex) => (
          <div key={categoryField.id} className="space-y-4 border p-4 rounded-lg mb-4">
            <div className="flex justify-end">
              <Button type="button" variant="destructive" onClick={() => removeSkillCategory(categoryIndex)}>
                刪除此類別
              </Button>
            </div>
            <Controller
              name={`skills.${categoryIndex}.category`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">技能類別名稱</label>
                  <Input {...field} placeholder="例如: 前端技術, 後端技術, 軟技能" />
                  {errors.skills?.[categoryIndex]?.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.skills[categoryIndex].category.message}</p>
                  )}
                </div>
              )}
            />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">此類別下的技能</h3>
              <Button type="button" onClick={() => appendSkillItem(categoryIndex, '')} className="mb-2">
                新增技能
              </Button>
              {getSkillItems(categoryIndex).map((itemField, itemIndex) => (
                <div key={itemField.id} className="flex items-center gap-2 mb-2">
                  <Controller
                    name={`skills.${categoryIndex}.items.${itemIndex}`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="例如: React, Node.js, Python" />
                    )}
                  />
                  <Button type="button" variant="destructive" onClick={() => removeSkillItem(categoryIndex, itemIndex)}>
                    移除
                  </Button>
                </div>
              ))}
              {errors.skills?.[categoryIndex]?.items && (
                <p className="text-red-500 text-sm mt-1">{errors.skills[categoryIndex].items.message}</p>
              )}
            </div>
          </div>
        ))}
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">AI 技能自動生成</h3>
          <p className="text-gray-600 mb-4">點擊下方按鈕，AI 將根據您的履歷資料自動分析並推薦技能標籤。</p>
          <Button type="button" onClick={() => console.log('Implement AI skill generation')} variant="outline">
            從履歷生成技能 (待開發)
          </Button>
        </div>
      </Card>

      {/* 項目經驗部分 */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">項目經驗</h2>
          <Button type="button" onClick={() => appendProject({
            name: '', description: '', technologies: [], startDate: '', endDate: '', outcomeDescription: '', links: []
          })}>
            新增項目
          </Button>
        </div>
        {projectFields.length === 0 && <p className="text-gray-600">請新增項目經驗</p>}
        {projectFields.map((field, index) => (
          <div key={field.id} className="space-y-4 border p-4 rounded-lg mb-4">
            <div className="flex justify-end">
              <Button type="button" variant="destructive" onClick={() => removeProject(index)}>
                刪除項目
              </Button>
            </div>
            <Controller
              name={`projects.${index}.name`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">項目名稱</label>
                  <Input {...field} />
                  {errors.projects?.[index]?.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.projects[index].name.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name={`projects.${index}.startDate`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">開始日期</label>
                  <Input {...field} type="date" />
                  {errors.projects?.[index]?.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.projects[index].startDate.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name={`projects.${index}.endDate`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">結束日期</label>
                  <Input {...field} type="date" />
                  {errors.projects?.[index]?.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.projects[index].endDate.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name={`projects.${index}.description`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">專案描述</label>
                  <Textarea {...field} rows={3} placeholder="描述您的專案內容和您的職責..." />
                  {errors.projects?.[index]?.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.projects[index].description.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name={`projects.${index}.templateUsed`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">選擇專案模板 (選填)</label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="選擇一個模板" />
                    </Select.Trigger>
                    <Select.Content>
                      {projectTemplates.map(template => (
                        <Select.Item key={template.id} value={template.id}>
                          {template.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              )}
            />
            <Controller
              name={`projects.${index}.outcomeDescription`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">成果簡述</label>
                  <Textarea {...field} rows={3} placeholder="簡述您在專案中取得的成果和影響..." />
                  {errors.projects?.[index]?.outcomeDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.projects[index].outcomeDescription.message}</p>
                  )}
                </div>
              )}
            />
            {/* 作品集連結部分 */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">作品集連結</h3>
              <Button type="button" onClick={() => appendProjectLink(index, '')} className="mb-2">
                新增連結
              </Button>
              {getProjectLinks(index).map((link, linkIndex) => (
                <div key={linkIndex} className="flex items-center gap-2 mb-2">
                  <Controller
                    name={`projects.${index}.links.${linkIndex}`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="例如: https://drive.google.com/yourproject" />
                    )}
                  />
                  <Button type="button" variant="destructive" onClick={() => removeProjectLink(index, linkIndex)}>
                    移除
                  </Button>
                </div>
              ))}
              {errors.projects?.[index]?.links && (
                <p className="text-red-500 text-sm mt-1">{errors.projects[index].links.message}</p>
              )}
            </div>
            <Controller
              name={`projects.${index}.technologies`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">使用技術 (逗號分隔)</label>
                  <Input
                    {...field}
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    onChange={(e) => field.onChange(e.target.value.split(',').map(tech => tech.trim()))}
                    placeholder="例如: React, Node.js, MongoDB"
                  />
                  {errors.projects?.[index]?.technologies && (
                    <p className="text-red-500 text-sm mt-1">{errors.projects[index].technologies.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        ))}
      </Card>

      {/* 證書部分 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">證書</h2>
        {/* 證書表單字段 */}
      </Card>

      {/* 語言能力部分 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">語言能力</h2>
        {/* 語言能力表單字段 */}
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // 重置表單
          }}
        >
          重置
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '生成中...' : '生成履歷'}
        </Button>
      </div>
    </form>
  );
}; 