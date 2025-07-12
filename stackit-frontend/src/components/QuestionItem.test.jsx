import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuestionItem from './QuestionItem';
import { describe, it, expect } from 'vitest';

// Mock question data
const mockQuestion = {
  _id: '123',
  title: 'How to test a React component?',
  author: { username: 'testuser' },
  tags: [{ _id: 't1', name: 'react' }, { _id: 't2', name: 'testing' }],
  voteCount: 10,
  answers: [{}, {}], // 2 answers
  createdAt: new Date().toISOString(),
};

describe('QuestionItem', () => {
  it('renders question details correctly', () => {
    render(
      <BrowserRouter>
        <QuestionItem question={mockQuestion} />
      </BrowserRouter>
    );

    // Check for the title (which is a link)
    expect(screen.getByRole('link', { name: /how to test a react component\?/i })).toBeInTheDocument();

    // Check for stats
    expect(screen.getByText('10 votes')).toBeInTheDocument();
    expect(screen.getByText('2 answers')).toBeInTheDocument();

    // Check for tags
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();

    // Check for author
    expect(screen.getByText(/asked.*by testuser/i)).toBeInTheDocument();
  });
});
