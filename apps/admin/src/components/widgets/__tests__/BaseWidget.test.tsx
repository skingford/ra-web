import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../theme';
import { BaseWidget } from '../BaseWidget';
import { WidgetConfig, WidgetData } from '../types';

const mockConfig: WidgetConfig = {
  id: 'test-widget',
  title: 'Test Widget',
  type: 'metric',
  size: { width: 300, height: 200 },
  position: { x: 0, y: 0 },
};

const mockData: WidgetData = {
  id: 'test-widget',
  data: { value: 100 },
  loading: false,
  lastUpdated: new Date('2023-01-01T12:00:00Z'),
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {component}
    </ChakraProvider>
  );
};

describe('BaseWidget', () => {
  it('renders widget title correctly', () => {
    renderWithChakra(
      <BaseWidget config={mockConfig} data={mockData}>
        <div>Widget Content</div>
      </BaseWidget>
    );

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    const loadingData = { ...mockData, loading: true };
    
    renderWithChakra(
      <BaseWidget config={mockConfig} data={loadingData}>
        <div>Widget Content</div>
      </BaseWidget>
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });

  it('displays error state', () => {
    const errorData = { ...mockData, error: 'Failed to load data' };
    
    renderWithChakra(
      <BaseWidget config={mockConfig} data={errorData}>
        <div>Widget Content</div>
      </BaseWidget>
    );

    expect(screen.getByText('Error loading widget!')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders children when not loading and no error', () => {
    renderWithChakra(
      <BaseWidget config={mockConfig} data={mockData}>
        <div>Widget Content</div>
      </BaseWidget>
    );

    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });

  it('shows last updated time', () => {
    renderWithChakra(
      <BaseWidget config={mockConfig} data={mockData}>
        <div>Widget Content</div>
      </BaseWidget>
    );

    expect(screen.getByText('12:00:00 PM')).toBeInTheDocument();
  });

  it('shows options menu when editable', () => {
    const mockRefresh = vi.fn();
    const mockEdit = vi.fn();
    const mockDelete = vi.fn();

    renderWithChakra(
      <BaseWidget
        config={mockConfig}
        data={mockData}
        onRefresh={mockRefresh}
        onEdit={mockEdit}
        onDelete={mockDelete}
        isEditable={true}
      >
        <div>Widget Content</div>
      </BaseWidget>
    );

    const optionsButton = screen.getByLabelText('Widget options');
    expect(optionsButton).toBeInTheDocument();

    fireEvent.click(optionsButton);

    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls refresh callback when refresh is clicked', () => {
    const mockRefresh = vi.fn();

    renderWithChakra(
      <BaseWidget
        config={mockConfig}
        data={mockData}
        onRefresh={mockRefresh}
        isEditable={true}
      >
        <div>Widget Content</div>
      </BaseWidget>
    );

    fireEvent.click(screen.getByLabelText('Widget options'));
    fireEvent.click(screen.getByText('Refresh'));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not show options menu when not editable', () => {
    renderWithChakra(
      <BaseWidget config={mockConfig} data={mockData} isEditable={false}>
        <div>Widget Content</div>
      </BaseWidget>
    );

    expect(screen.queryByLabelText('Widget options')).not.toBeInTheDocument();
  });
});