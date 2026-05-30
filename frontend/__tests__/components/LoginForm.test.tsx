import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginForm from '@/app/(auth)/login/LoginForm'

describe('LoginForm', () => {
  it('renders all form fields', () => {
    render(<LoginForm />)

    // Check for email field
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()

    // Check for password field
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()

    // Check for remember me checkbox
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument()

    // Check for submit button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
