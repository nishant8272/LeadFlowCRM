import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { LeadList } from '../pages/LeadList';
import '@testing-library/jest-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

describe('🖥️ Frontend Lead List Component Tests', () => {
  it('should render filters, search inputs, and creation buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LeadList />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Verify search bar and filter selects render
    expect(screen.getByPlaceholderText(/Search leads.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Lead/i })).toBeInTheDocument();
    
    // Verify select filter options exist
    expect(screen.getByText(/All Statuses/i)).toBeInTheDocument();
    expect(screen.getByText(/All Priorities/i)).toBeInTheDocument();
  });
});
