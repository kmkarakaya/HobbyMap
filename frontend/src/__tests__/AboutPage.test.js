import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AboutPage', () => {
  test('renders about page content', () => {
    renderWithRouter(<AboutPage />);
    
    expect(screen.getByText('About Hobby Map Tracker')).toBeInTheDocument();
    expect(screen.getAllByText('Murat Karakaya')).toHaveLength(2); // appears in main text and developer section
    expect(screen.getByText(/developed by/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
    expect(screen.getByText(/hobbyists/i)).toBeInTheDocument();
  });

  test('renders developer information', () => {
    renderWithRouter(<AboutPage />);
    
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('muratkarakaya.net')).toBeInTheDocument();
  });

  test('website link has correct attributes', () => {
    renderWithRouter(<AboutPage />);
    
    const websiteLink = screen.getByRole('link', { name: 'muratkarakaya.net' });
    expect(websiteLink).toHaveAttribute('href', 'https://muratkarakaya.net');
    expect(websiteLink).toHaveAttribute('target', '_blank');
    expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders hobby description', () => {
    renderWithRouter(<AboutPage />);
    
    expect(screen.getByText(/scuba diving, photography, hiking/i)).toBeInTheDocument();
    expect(screen.getByText(/interactive world map/i)).toBeInTheDocument();
  });
});