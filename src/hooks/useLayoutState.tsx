import { useState, useEffect } from 'react';

interface LayoutState {
  bottomPanelVisible: boolean;
  sidebarCollapsed: boolean;
}

const STORAGE_KEY = 'dashboard-layout-state';

export const useLayoutState = () => {
  const [layoutState, setLayoutState] = useState<LayoutState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {
        bottomPanelVisible: true,
        sidebarCollapsed: false
      };
    } catch {
      return {
        bottomPanelVisible: true,
        sidebarCollapsed: false
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutState));
    } catch (error) {
      console.warn('Failed to save layout state:', error);
    }
  }, [layoutState]);

  const toggleBottomPanel = () => {
    setLayoutState(prev => ({
      ...prev,
      bottomPanelVisible: !prev.bottomPanelVisible
    }));
  };

  const toggleSidebar = () => {
    setLayoutState(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed
    }));
  };

  return {
    layoutState,
    toggleBottomPanel,
    toggleSidebar,
    setLayoutState
  };
};