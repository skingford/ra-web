import { useState, useCallback, useEffect } from 'react';
import { DashboardLayout, WidgetConfig } from '../types';

interface UseDashboardLayoutOptions {
  initialLayout?: DashboardLayout;
  persistKey?: string;
}

const DEFAULT_LAYOUT: DashboardLayout = {
  id: 'default',
  name: 'Default Dashboard',
  widgets: [],
  columns: 3,
  gap: 4,
};

export const useDashboardLayout = ({ 
  initialLayout, 
  persistKey 
}: UseDashboardLayoutOptions = {}) => {
  const [layout, setLayout] = useState<DashboardLayout>(() => {
    if (initialLayout) return initialLayout;
    
    if (persistKey) {
      const saved = localStorage.getItem(`dashboard-layout-${persistKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Failed to parse saved dashboard layout:', error);
        }
      }
    }
    
    return DEFAULT_LAYOUT;
  });

  // Persist layout changes to localStorage
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(`dashboard-layout-${persistKey}`, JSON.stringify(layout));
    }
  }, [layout, persistKey]);

  const updateLayout = useCallback((newLayout: DashboardLayout) => {
    setLayout(newLayout);
  }, []);

  const addWidget = useCallback((widget: WidgetConfig) => {
    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, widget],
    }));
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
    }));
  }, []);

  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      ),
    }));
  }, []);

  const moveWidget = useCallback((widgetId: string, newPosition: { x: number; y: number }) => {
    updateWidget(widgetId, { position: newPosition });
  }, [updateWidget]);

  const resizeWidget = useCallback((widgetId: string, newSize: { width: number; height: number }) => {
    updateWidget(widgetId, { size: newSize });
  }, [updateWidget]);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
  }, []);

  return {
    layout,
    updateLayout,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    resizeWidget,
    resetLayout,
  };
};