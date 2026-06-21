import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Hebrew app title', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'ניהול שעות עבודה' }),
    ).toBeInTheDocument()
  })
})
