import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DiveSitesList from '../components/DiveSitesList';
import { useFirebase } from '../contexts/FirebaseContext';

// Mock the useFirebase hook
jest.mock('../contexts/FirebaseContext');

// Mock data for testing
const mockDiveSites = [
  {
    id: '1',
    title: 'Saturday Milonga at El Ateneo',
    hobby: 'Tango',
    place: 'Buenos Aires',
    country: 'Argentina',
    date: new Date('2023-01-15'),
    notes: 'Great atmosphere, live music'
  },
  {
    id: '2',
    title: 'Beach Photography Session',
    hobby: 'Photography',
    place: 'Malibu',
    country: 'USA',
    date: new Date('2023-02-20'),
    notes: 'Golden hour shots'
  },
  {
    id: '3',
    title: 'Mountain Hiking Adventure',
    hobby: 'Hiking',
    place: 'Alps',
    country: 'Switzerland',
    date: new Date('2023-03-10'),
    notes: 'Amazing views from the peak'
  }
];

const renderDiveSitesList = (overrideProps = {}) => {
  const defaultProps = {
    diveSites: mockDiveSites,
    loading: false,
    error: null,
    deleteDiveSite: jest.fn(),
    retryLoadDiveSites: jest.fn(),
    ...overrideProps
  };
  
  useFirebase.mockReturnValue(defaultProps);
  
  return render(
    <BrowserRouter>
      <DiveSitesList />
    </BrowserRouter>
  );
};

describe('DiveSitesList Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input field', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('filters entries by title', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Initially all entries should be visible
    expect(screen.getByText('Saturday Milonga at El Ateneo')).toBeInTheDocument();
    expect(screen.getByText('Beach Photography Session')).toBeInTheDocument();
    expect(screen.getByText('Mountain Hiking Adventure')).toBeInTheDocument();
    
    // Search for "Beach"
    fireEvent.change(searchInput, { target: { value: 'Beach' } });
    
    // Only the beach photography entry should be visible
    expect(screen.queryByText('Saturday Milonga at El Ateneo')).not.toBeInTheDocument();
    expect(screen.getByText('Beach Photography Session')).toBeInTheDocument();
    expect(screen.queryByText('Mountain Hiking Adventure')).not.toBeInTheDocument();
  });

  test('filters entries by hobby', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Search for "Tango"
    fireEvent.change(searchInput, { target: { value: 'Tango' } });
    
    // Only the tango entry should be visible
    expect(screen.getByText('Saturday Milonga at El Ateneo')).toBeInTheDocument();
    expect(screen.queryByText('Beach Photography Session')).not.toBeInTheDocument();
    expect(screen.queryByText('Mountain Hiking Adventure')).not.toBeInTheDocument();
  });

  test('filters entries by place', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Search for "Malibu"
    fireEvent.change(searchInput, { target: { value: 'Malibu' } });
    
    // Only the Malibu entry should be visible
    expect(screen.queryByText('Saturday Milonga at El Ateneo')).not.toBeInTheDocument();
    expect(screen.getByText('Beach Photography Session')).toBeInTheDocument();
    expect(screen.queryByText('Mountain Hiking Adventure')).not.toBeInTheDocument();
  });

  test('filters entries by country', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Search for "Switzerland"
    fireEvent.change(searchInput, { target: { value: 'Switzerland' } });
    
    // Only the Switzerland entry should be visible
    expect(screen.queryByText('Saturday Milonga at El Ateneo')).not.toBeInTheDocument();
    expect(screen.queryByText('Beach Photography Session')).not.toBeInTheDocument();
    expect(screen.getByText('Mountain Hiking Adventure')).toBeInTheDocument();
  });

  test('filters entries by notes', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Search for "live music"
    fireEvent.change(searchInput, { target: { value: 'live music' } });
    
    // Only the entry with "live music" in notes should be visible
    expect(screen.getByText('Saturday Milonga at El Ateneo')).toBeInTheDocument();
    expect(screen.queryByText('Beach Photography Session')).not.toBeInTheDocument();
    expect(screen.queryByText('Mountain Hiking Adventure')).not.toBeInTheDocument();
  });

  test('shows "no results" message when search has no matches', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'NonexistentEntry' } });
    
    // Should show no results message
    expect(screen.getByText(/no entries match your search for "NonexistentEntry"/i)).toBeInTheDocument();
    
    // No entries should be visible
    expect(screen.queryByText('Saturday Milonga at El Ateneo')).not.toBeInTheDocument();
    expect(screen.queryByText('Beach Photography Session')).not.toBeInTheDocument();
    expect(screen.queryByText('Mountain Hiking Adventure')).not.toBeInTheDocument();
  });

  test('shows search results count when filtering', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Search for "a" which should match multiple entries
    fireEvent.change(searchInput, { target: { value: 'a' } });
    
    // Should show results count (all entries contain 'a')
    expect(screen.getByText(/found 3 of 3 entries/i)).toBeInTheDocument();
  });

  test('clear search button works', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Add search text
    fireEvent.change(searchInput, { target: { value: 'Beach' } });
    expect(searchInput.value).toBe('Beach');
    
    // Clear button should appear
    const clearButton = screen.getByRole('button', { name: '✕' });
    expect(clearButton).toBeInTheDocument();
    
    // Click clear button
    fireEvent.click(clearButton);
    
    // Search should be cleared
    expect(searchInput.value).toBe('');
    
    // All entries should be visible again
    expect(screen.getByText('Saturday Milonga at El Ateneo')).toBeInTheDocument();
    expect(screen.getByText('Beach Photography Session')).toBeInTheDocument();
    expect(screen.getByText('Mountain Hiking Adventure')).toBeInTheDocument();
  });

  test('search is case insensitive', () => {
    renderDiveSitesList();
    
    const searchInput = screen.getByPlaceholderText(/search entries by title, hobby, place, country, or notes/i);
    
    // Search for "TANGO" in uppercase
    fireEvent.change(searchInput, { target: { value: 'TANGO' } });
    
    // Should still find the tango entry
    expect(screen.getByText('Saturday Milonga at El Ateneo')).toBeInTheDocument();
    expect(screen.queryByText('Beach Photography Session')).not.toBeInTheDocument();
    expect(screen.queryByText('Mountain Hiking Adventure')).not.toBeInTheDocument();
  });
});