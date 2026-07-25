import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { Login } from '../pages/Login';
import '@testing-library/jest-dom';

describe('🖥️ Frontend Authentication Component Tests', () => {
  it('should render the login card correctly with all inputs', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Checks card title
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    
    // Checks form fields
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    
    // Checks CTA submit button
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});
