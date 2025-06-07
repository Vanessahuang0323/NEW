export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: string;
  education: string;
  location: string;
  profileImage?: string;
  bio?: string;
  projects?: {
    name: string;
    description: string;
    technologies: string[];
  }[];
}

export interface MatchInteraction {
  initiatorId: string;
  targetId: string;
  type: 'like' | 'dislike' | 'save' | 'reject';
  timestamp: Date;
}

// 模擬學生資料
const mockStudents: StudentProfile[] = [
  {
    id: '1',
    name: '王小明',
    email: 'wang@example.com',
    skills: ['React', 'Node.js', 'TypeScript', 'Python'],
    experience: '2年前端開發經驗',
    education: '國立台灣大學資訊工程學系',
    location: '台北市',
    bio: '熱愛程式開發，專精於前端技術，具備良好的團隊合作能力。',
    projects: [
      {
        name: '電商網站',
        description: '使用 React 和 Node.js 開發的全端電商平台',
        technologies: ['React', 'Node.js', 'MongoDB']
      }
    ]
  },
  {
    id: '2',
    name: '李小華',
    email: 'li@example.com',
    skills: ['Vue.js', 'Laravel', 'MySQL', 'Docker'],
    experience: '3年全端開發經驗',
    education: '國立清華大學資訊工程學系',
    location: '新竹市',
    bio: '全端開發者，擅長 Vue.js 和 Laravel，有豐富的專案經驗。',
    projects: [
      {
        name: '企業管理系統',
        description: '使用 Vue.js 和 Laravel 開發的企業內部管理系統',
        technologies: ['Vue.js', 'Laravel', 'MySQL']
      }
    ]
  },
  {
    id: '3',
    name: '張小美',
    email: 'zhang@example.com',
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    experience: '1年後端開發經驗',
    education: '國立成功大學資訊工程學系',
    location: '台南市',
    bio: '後端開發新手，對雲端技術和資料庫設計有濃厚興趣。',
    projects: [
      {
        name: 'API 服務',
        description: '使用 Django 開發的 RESTful API 服務',
        technologies: ['Python', 'Django', 'PostgreSQL']
      }
    ]
  }
];

export const getStudentMatchesForCompany = async (companyId: string): Promise<StudentProfile[]> => {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模擬的學生資料
  return mockStudents;
};

export const recordInteraction = async (interaction: Omit<MatchInteraction, 'timestamp'>): Promise<void> => {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 在實際應用中，這裡會將互動記錄保存到資料庫
  const fullInteraction: MatchInteraction = {
    ...interaction,
    timestamp: new Date()
  };
  
  console.log('Interaction recorded:', fullInteraction);
  
  // 可以將互動記錄保存到 localStorage 或發送到後端 API
  const existingInteractions = JSON.parse(localStorage.getItem('matchInteractions') || '[]');
  existingInteractions.push(fullInteraction);
  localStorage.setItem('matchInteractions', JSON.stringify(existingInteractions));
};

export const getMatchHistory = async (userId: string): Promise<MatchInteraction[]> => {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 從 localStorage 獲取互動記錄
  const interactions = JSON.parse(localStorage.getItem('matchInteractions') || '[]');
  return interactions.filter((interaction: MatchInteraction) => 
    interaction.initiatorId === userId
  );
};