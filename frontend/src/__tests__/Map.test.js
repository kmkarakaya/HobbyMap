import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FirebaseProvider } from '../contexts/FirebaseContext';
import DiveMap from '../components/Map';

// Mock Leaflet to avoid issues in test environment
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => <div data-testid="map-container" {...props}>{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}));

// Mock Firebase context with test data
const mockFirebaseContext = {
  diveSites: [
    {
      id: '1',
      title: 'First Dive',
      latitude: 25.7617,
      longitude: -80.1918,
      date: new Date('2023-01-15'),
      hobby: 'Scuba Diving',
      place: 'Miami',
      country: 'USA'
    },
    {
      id: '2', 
      title: 'Second Dive',
      latitude: 36.7783,
      longitude: -119.4179,
      date: new Date('2023-06-20'),
      hobby: 'Scuba Diving',
      place: 'California',
      country: 'USA'
    }
  ],
  loading: false,
  error: null,
  retryLoadDiveSites: jest.fn()
};

jest.mock('../contexts/FirebaseContext', () => ({
  useFirebase: () => mockFirebaseContext
}));

describe('DiveMap Animation Controls', () => {
  test('renders animation controls', () => {
    render(<DiveMap />);
    
    expect(screen.getByRole('button', { name: /play animation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /animation speed/i })).toBeInTheDocument();
  });

  test('animation controls have correct initial state', () => {
    render(<DiveMap />);
    
    const playButton = screen.getByRole('button', { name: /play animation/i });
    const showAllButton = screen.getByRole('button', { name: /show all/i });
    const resetButton = screen.getByRole('button', { name: /reset/i });
    
    expect(playButton).not.toBeDisabled();
    expect(showAllButton).toBeDisabled(); // Should be disabled when showing all
    expect(resetButton).not.toBeDisabled();
  });

  test('speed slider works correctly', () => {
    render(<DiveMap />);
    
    const speedSlider = screen.getByRole('slider', { name: /animation speed/i });
    expect(speedSlider).toHaveValue('1000'); // Default 1000ms
    
    fireEvent.change(speedSlider, { target: { value: '2000' } });
    expect(speedSlider).toHaveValue('2000');
    
    expect(screen.getByText('2.0s')).toBeInTheDocument();
  });

  test('shows correct status info', () => {
    render(<DiveMap />);
    
    // Should show "Showing all X entries" initially
    expect(screen.getByText(/showing all 2 entries/i)).toBeInTheDocument();
  });

  test('map renders with correct number of markers', () => {
    render(<DiveMap />);
    
    // Should render 2 markers for the test data
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
  });
});