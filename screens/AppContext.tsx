import React, { createContext, useState, useContext } from "react";

interface AppContextProps {
  showCards: boolean;
  setShowCards: (value: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showCards, setShowCards] = useState(false);

  return (
    <AppContext.Provider value={{ showCards, setShowCards }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe usarse dentro de AppProvider");
  }
  return context;
};
