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
    return <div data-testid="entry-map">Mock Map Component</div>;
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

    // Check if hero content is displayed
    expect(screen.getByText('Track Your Hobby Adventures Worldwide')).toBeInTheDocument();
    expect(screen.getByText(/Record and visualize your hobby activities/)).toBeInTheDocument();
    
    // Check if CTA buttons are present
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    
    // Check if features section is displayed
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Record Locations')).toBeInTheDocument();
    expect(screen.getByText('Visualize on Map')).toBeInTheDocument();
    expect(screen.getByText('Track Progress')).toBeInTheDocument();
    
    // Check if final CTA section is displayed
    expect(screen.getByText('Ready to Start Mapping Your Hobbies?')).toBeInTheDocument();
    expect(screen.getByText('Create Your Free Account')).toBeInTheDocument();
  });

  test('renders map for authenticated users', () => {
    // Mock authenticated state
    useFirebase.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
    });

    renderWithRouter(<LandingPage />);

  // Check if map is displayed instead of landing page content
  expect(screen.getByTestId('entry-map')).toBeInTheDocument();
    
    // Check that landing page content is NOT displayed
    expect(screen.queryByText('Track Your Hobby Adventures Worldwide')).not.toBeInTheDocument();
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
  });

  test('sign up and sign in links have correct paths', () => {
    useFirebase.mockReturnValue({
      user: null,
    });

    renderWithRouter(<LandingPage />);

    // Check link destinations
    const getStartedLink = screen.getByText('Get Started').closest('a');
    const signInLink = screen.getByText('Sign In').closest('a');
    const createAccountLink = screen.getByText('Create Your Free Account').closest('a');
    const alreadyHaveAccountLink = screen.getByText(/Already have an account\? Sign In/).closest('a');

    expect(getStartedLink).toHaveAttribute('href', '/signup');
    expect(signInLink).toHaveAttribute('href', '/login');
    expect(createAccountLink).toHaveAttribute('href', '/signup');
    expect(alreadyHaveAccountLink).toHaveAttribute('href', '/login');
  });
});