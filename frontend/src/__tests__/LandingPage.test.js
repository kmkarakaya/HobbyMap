import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import { useFirebase } from '../contexts/FirebaseContext';

// Mock the Firebase context
jest.mock('../contexts/FirebaseContext');

// Mock the Map component
jest.mock('../components/Map', () => {
  return function MockDiveMap() {
    return <div data-testid="dive-map">Mock Map Component</div>;
  };
});

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders informative landing page for unauthenticated users', () => {
    // Mock unauthenticated state
    useFirebase.mockReturnValue({
      user: null,
    });

    renderWithRouter(<LandingPage />);

    // Check if hero content is displayed with new content
    expect(screen.getByText(/Discover & Track Your/)).toBeInTheDocument();
    expect(screen.getByText('Scuba Diving')).toBeInTheDocument();
    expect(screen.getByText(/Create your personal diving logbook/)).toBeInTheDocument();
    
    // Check if CTA buttons are present with new text
    expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
    
    // Check if features section is displayed with new content
    expect(screen.getByText('Everything You Need for Dive Logging')).toBeInTheDocument();
    expect(screen.getByText('Interactive Dive Map')).toBeInTheDocument();
    expect(screen.getByText('Digital Logbook')).toBeInTheDocument();
    expect(screen.getByText('Dive Analytics')).toBeInTheDocument();
    
    // Check if testimonials section is displayed
    expect(screen.getByText('Loved by Divers Worldwide')).toBeInTheDocument();
    
    // Check if final CTA section is displayed with new content
    expect(screen.getByText('Ready to Dive Into Your Digital Logbook?')).toBeInTheDocument();
    expect(screen.getByText('Create Free Account')).toBeInTheDocument();
  });

  test('renders map for authenticated users', () => {
    // Mock authenticated state
    useFirebase.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
    });

    renderWithRouter(<LandingPage />);

    // Check if map is displayed instead of landing page content
    expect(screen.getByTestId('dive-map')).toBeInTheDocument();
    
    // Check that landing page content is NOT displayed
    expect(screen.queryByText(/Discover & Track Your/)).not.toBeInTheDocument();
    expect(screen.queryByText('Start Your Journey')).not.toBeInTheDocument();
  });

  test('sign up and sign in links have correct paths', () => {
    useFirebase.mockReturnValue({
      user: null,
    });

    renderWithRouter(<LandingPage />);

    // Check link destinations
    const getStartedLink = screen.getByText('Start Your Journey').closest('a');
    const signInLinks = screen.getAllByText('Sign In');
    const createAccountLink = screen.getByText('Create Free Account').closest('a');

    expect(getStartedLink).toHaveAttribute('href', '/signup');
    expect(signInLinks[0].closest('a')).toHaveAttribute('href', '/login');
    expect(createAccountLink).toHaveAttribute('href', '/signup');
  });
});