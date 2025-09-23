import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/Header';
import { useFirebase } from '../contexts/FirebaseContext';

// Mock the Firebase context
jest.mock('../contexts/FirebaseContext');

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header Authentication Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to login when unauthenticated user clicks Map', () => {
    // Mock unauthenticated state
    useFirebase.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    renderWithRouter(<Header />);

    const mapLink = screen.getByRole('link', { name: 'Map' });
    fireEvent.click(mapLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('redirects to login when unauthenticated user clicks My Entries', () => {
    // Mock unauthenticated state
    useFirebase.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    renderWithRouter(<Header />);

    const entriesLink = screen.getByRole('link', { name: 'My Entries' });
    fireEvent.click(entriesLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('allows navigation when user is authenticated', () => {
    // Mock authenticated state
    useFirebase.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      signOut: jest.fn(),
    });

    renderWithRouter(<Header />);

    const mapLink = screen.getByRole('link', { name: 'Map' });
    const entriesLink = screen.getByRole('link', { name: 'My Entries' });
    
    // For authenticated users, clicking should not call navigate to login
    fireEvent.click(mapLink);
    fireEvent.click(entriesLink);

    expect(mockNavigate).not.toHaveBeenCalledWith('/login');
  });

  test('shows user info when authenticated', () => {
    // Mock authenticated state
    useFirebase.mockReturnValue({
      user: { uid: '123', email: 'test@example.com', displayName: 'Test User' },
      signOut: jest.fn(),
    });

    renderWithRouter(<Header />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
  });

  test('shows sign in/up links when not authenticated', () => {
    // Mock unauthenticated state
    useFirebase.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    renderWithRouter(<Header />);

    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  test('renders About link in navigation', () => {
    // Mock unauthenticated state (About should be accessible to all users)
    useFirebase.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    renderWithRouter(<Header />);

    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });
});