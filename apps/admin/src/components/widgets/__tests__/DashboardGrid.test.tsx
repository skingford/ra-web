import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../theme';
import { DashboardGrid } from '../DashboardGrid';
import { DashboardLayout, WidgetData } from '../types';

const mockLayout: DashboardLayout = {
  id: 'test-dashboard',
  name: 'Test Dashboard',
  columns: 3,
  gap: 4,
  widgets: [
    {
      id: 'widget-1',
      title: 'Test Widget 1',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 0, y: 0 },
      metricConfig: {
        value: 100,
        label: 'Test Metric',
      },
    },
    {
      id: 'widget-2',
      title: 'Test Widget 2',
      type: 'chart',
      size: { width: 400, height: 300 },
      position: { x: 1, y: 0 },
      chartConfig: {
        chartType: 'line',
        dataKey: 'value',
      },
    },
  ],
};

const mockWidgetData: Record<string, WidgetData> = {
  'widget-1': {
    id: 'widget-1',
    data: { value: 100, label: 'Test Metric' },
    loading: false,
  },
  'widget-2': {
    id: 'widget-2',
    data: [{ name: 'A', value: 100 }],
    loading: false,
  },
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {component}
    </ChakraProvider>
  );
};

// Mock the widget components to avoid complex rendering
vi.mock('../WidgetFactory', () => ({
  WidgetFactory: ({ config, onRefresh, onDelete }: any) => (
    <div data-testid={`widget-${config.id}`}>
      <span>{config.title}</span>
      <button onClick={() => onRefresh?.()} data-testid={`refresh-${config.id}`}>
        Refresh
      </button>
      <button onClick={() => onDelete?.()} data-testid={`delete-${config.id}`}>
        Delete
      </button>
    </div>
  ),
}));

describe('DashboardGrid', () => {
  it('renders dashboard title', () => {
    renderWithChakra(
      <DashboardGrid
        layout={mockLayout}
        widgetData={mockWidgetData}
      />
    );

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  it('renders all widgets', () => {
    renderWithChakra(
      <DashboardGrid
        layout={mockLayout}
        widgetData={mockWidgetData}
      />
    );

    expect(screen.getByText('Test Widget 1')).toBeInTheDocument();
    expect(screen.getByText('Test Widget 2')).toBeInTheDocument();
  });

  it('shows add widget button when editable', () => {
    renderWithChakra(
      <DashboardGrid
        layout={mockLayout}
        widgetData={mockWidgetData}
        isEditable={true}
      />
    );

    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('does not show add widget button when not editable', () => {
    renderWithChakra(
      <DashboardGrid
        layout={mockLayout}
        widgetData={mockWidgetData}
        isEditable={false}
      />
    );

    expect(screen.queryByText('Add Widget')).not.toBeInTheDocument();
  });

  it('opens add widget modal when add button is clicked', async () => {
    renderWithChakra(
      <DashboardGrid
        layout={mockLayout}
        widgetData={mockWidgetData}
        isEditable={true}
      />
    );

    fireEvent.click(screen.getByText('Add Widget'));

    await waitFor(() => {
      expect(screen.getByText('Add New Widget')).toBeInTheDocument();
    });
  });

  it('calls onWidgetRefresh when widget refresh is triggered', () => {
    const mockRefresh = vi.fn();

    renderWithChakra(
      <DashboardGrid
        layout={mockLayout}
        widgetData={mockWidgetData}
        onWidgetRefresh={mockRefresh}
      />
    );

    fireEvent.click(screen.getByTestId('refresh-widget-1'));

    expect(mockRefresh).toHaveBeenCalledWith('widget-1');
  });

  it('calls onLayoutChange when widget is deleted', () => {
    const mockLayoutChange = vi.fn();

    renderWithChakra(
      <DashboardGrid
        layout={mockLayout}
        widgetData={mockWidgetData}
        onLayoutChange={mockLayoutChange}
      />
    );

    fireEvent.click(screen.getByTestId('delete-widget-1'));

    expect(mockLayoutChange).toHaveBeenCalledWith({
      ...mockLayout,
      widgets: mockLayout.widgets.filter(w => w.id !== 'widget-1'),
    });
  });

  it('adds new widget when form is submitted', async () => {
    const mockLayoutChange = vi.fn();

    renderWithChakra(
      <DashboardGrid
        layout={mockLayout}
        widgetData={mockWidgetData}
        onLayoutChange={mockLayoutChange}
        isEditable={true}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText('Add Widget'));

    await waitFor(() => {
      expect(screen.getByText('Add New Widget')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter widget title'), {
      target: { value: 'New Widget' },
    });

    fireEvent.change(screen.getByPlaceholderText('API endpoint or data source'), {
      target: { value: '/api/data' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Add Widget'));

    await waitFor(() => {
      expect(mockLayoutChange).toHaveBeenCalledWith(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              title: 'New Widget',
              dataSource: '/api/data',
            }),
          ]),
        })
      );
    });
  });
});