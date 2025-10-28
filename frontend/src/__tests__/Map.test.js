import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EntryMap from '../components/Map';

// Mock Leaflet to avoid issues in test environment
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => <div data-testid="map-container" {...props}>{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  // Provide a mocked useMap hook so components that call useMap() work in tests
  useMap: () => ({
    fitBounds: () => {},
    getCenter: () => ({ lat: 0, lng: 0 }),
    getZoom: () => 2,
    getMaxZoom: () => 18,
    flyTo: () => {},
    setView: () => {},
    latLngToContainerPoint: () => ({ x: 100, y: 100 }),
    getSize: () => ({ x: 800, y: 600 }),
  }),
}));

// Mock Firebase context with test data
const mockFirebaseContext = {
  entries: [
    {
      id: '1',
      title: 'First Entry',
      latitude: 25.7617,
      longitude: -80.1918,
      date: new Date('2023-01-15'),
      hobby: 'Scuba Diving',
      place: 'Miami',
      country: 'USA'
    },
    {
      id: '2', 
      title: 'Second Entry',
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
  retryLoadEntries: jest.fn()
};

jest.mock('../contexts/FirebaseContext', () => ({
  useFirebase: () => mockFirebaseContext
}));

describe('EntryMap Animation Controls', () => {
  test('renders animation controls', () => {
    render(
      <BrowserRouter>
        <EntryMap />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button', { name: /play animation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /animation speed/i })).toBeInTheDocument();
  });

  test('animation controls have correct initial state', () => {
  render(
    <BrowserRouter>
      <EntryMap />
    </BrowserRouter>
  );
    
    const playButton = screen.getByRole('button', { name: /play animation/i });
    const showAllButton = screen.getByRole('button', { name: /show all/i });
    const resetButton = screen.getByRole('button', { name: /reset/i });
    
    expect(playButton).not.toBeDisabled();
    expect(showAllButton).toBeDisabled(); // Should be disabled when showing all
    expect(resetButton).not.toBeDisabled();
  });

  test('speed slider works correctly', () => {
  render(
    <BrowserRouter>
      <EntryMap />
    </BrowserRouter>
  );
    
    const speedSlider = screen.getByRole('slider', { name: /animation speed/i });
    expect(speedSlider).toHaveValue('1000'); // Default 1000ms
    
    fireEvent.change(speedSlider, { target: { value: '2000' } });
    expect(speedSlider).toHaveValue('2000');
    
    expect(screen.getByText('2.0s')).toBeInTheDocument();
  });

  test('shows correct status info', () => {
  render(
    <BrowserRouter>
      <EntryMap />
    </BrowserRouter>
  );
    
    // Should show "Showing all X entries" initially
    expect(screen.getByText(/showing all 2 entries/i)).toBeInTheDocument();
  });

  test('map renders with correct number of markers', () => {
  render(
    <BrowserRouter>
      <EntryMap />
    </BrowserRouter>
  );
    
    // Should render 2 markers for the test data
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
  });
});