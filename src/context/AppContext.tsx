import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyId, setCompanyId] = useState<string | null>('company-1'); // 模擬公司 ID

  return (
    <AppContext.Provider value={{ companyId, setCompanyId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};