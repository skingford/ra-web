import { renderHook, act } from '@testing-library/react';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import { DashboardLayout, WidgetConfig } from '../../types';

const mockWidget: WidgetConfig = {
  id: 'test-widget',
  title: 'Test Widget',
  type: 'metric',
  size: { width: 300, height: 200 },
  position: { x: 0, y: 0 },
};

const mockLayout: DashboardLayout = {
  id: 'test-layout',
  name: 'Test Layout',
  columns: 3,
  gap: 4,
  widgets: [mockWidget],
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useDashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default layout when no options provided', () => {
    const { result } = renderHook(() => useDashboardLayout());

    expect(result.current.layout).toEqual({
      id: 'default',
      name: 'Default Dashboard',
      widgets: [],
      columns: 3,
      gap: 4,
    });
  });

  it('initializes with provided initial layout', () => {
    const { result } = renderHook(() => 
      useDashboardLayout({ initialLayout: mockLayout })
    );

    expect(result.current.layout).toEqual(mockLayout);
  });

  it('loads layout from localStorage when persistKey is provided', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLayout));

    const { result } = renderHook(() => 
      useDashboardLayout({ persistKey: 'test-key' })
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('dashboard-layout-test-key');
    expect(result.current.layout).toEqual(mockLayout);
  });

  it('falls back to default layout when localStorage parsing fails', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => 
      useDashboardLayout({ persistKey: 'test-key' })
    );

    expect(result.current.layout.id).toBe('default');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse saved dashboard layout:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('updates layout correctly', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.updateLayout(mockLayout);
    });

    expect(result.current.layout).toEqual(mockLayout);
  });

  it('adds widget correctly', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.addWidget(mockWidget);
    });

    expect(result.current.layout.widgets).toContain(mockWidget);
  });

  it('removes widget correctly', () => {
    const { result } = renderHook(() => 
      useDashboardLayout({ initialLayout: mockLayout })
    );

    act(() => {
      result.current.removeWidget('test-widget');
    });

    expect(result.current.layout.widgets).toHaveLength(0);
  });

  it('updates widget correctly', () => {
    const { result } = renderHook(() => 
      useDashboardLayout({ initialLayout: mockLayout })
    );

    act(() => {
      result.current.updateWidget('test-widget', { title: 'Updated Title' });
    });

    expect(result.current.layout.widgets[0].title).toBe('Updated Title');
  });

  it('moves widget correctly', () => {
    const { result } = renderHook(() => 
      useDashboardLayout({ initialLayout: mockLayout })
    );

    act(() => {
      result.current.moveWidget('test-widget', { x: 1, y: 1 });
    });

    expect(result.current.layout.widgets[0].position).toEqual({ x: 1, y: 1 });
  });

  it('resizes widget correctly', () => {
    const { result } = renderHook(() => 
      useDashboardLayout({ initialLayout: mockLayout })
    );

    act(() => {
      result.current.resizeWidget('test-widget', { width: 400, height: 300 });
    });

    expect(result.current.layout.widgets[0].size).toEqual({ width: 400, height: 300 });
  });

  it('resets layout to default', () => {
    const { result } = renderHook(() => 
      useDashboardLayout({ initialLayout: mockLayout })
    );

    act(() => {
      result.current.resetLayout();
    });

    expect(result.current.layout).toEqual({
      id: 'default',
      name: 'Default Dashboard',
      widgets: [],
      columns: 3,
      gap: 4,
    });
  });

  it('persists layout changes to localStorage', () => {
    const { result } = renderHook(() => 
      useDashboardLayout({ persistKey: 'test-key' })
    );

    act(() => {
      result.current.updateLayout(mockLayout);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dashboard-layout-test-key',
      JSON.stringify(mockLayout)
    );
  });

  it('does not persist when no persistKey is provided', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.updateLayout(mockLayout);
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});