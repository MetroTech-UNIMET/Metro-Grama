import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Profile from './Profile';
import type { MyStudentDetails, OtherStudentDetails } from '@/api/interactions/student.types';

// Mock child components
vi.mock('./cards/StudentCard', () => ({
  StudentCard: () => <div data-testid="student-card">StudentCard</div>,
}));
vi.mock('./cards/SubjectsCard', () => ({
  SubjectsCard: () => <div data-testid="subjects-card">SubjectsCard</div>,
}));
vi.mock('./cards/FriendsCard', () => ({
  FriendsCard: () => <div data-testid="friends-card">FriendsCard</div>,
  OnlyFriendsCard: () => <div data-testid="only-friends-card">OnlyFriendsCard</div>,
}));
vi.mock('./cards/SchedulesCard', () => ({
  SchedulesCard: () => <div data-testid="schedules-card">SchedulesCard</div>,
}));
vi.mock('./cards/SubjectSectionHistoryCard', () => ({
  SubjectSectionHistoryCard: () => <div data-testid="history-card">SubjectSectionHistoryCard</div>,
}));
vi.mock('./buttons/AcceptFriendButton', () => ({
  AcceptFriendButton: () => <button data-testid="accept-friend-btn">Accept</button>,
}));

describe('Profile', () => {
  const mockUser = {
    firstName: 'Juan',
    lastName: 'Perez',
    email: 'juan@test.com',
    username: 'juanp',
    isActive: true,
    roles: [],
    id: { ID: 'user1', Table: 'user' },
  };

  const commonData = {
    id: { ID: 'student1', Table: 'student' },
    user: mockUser,
    careers: [],
    next_courses: { principal: [], secondary: [] },
    current_courses: { principal: [], secondary: [] },
    subject_section_history: [],
    passed_subjects: [], // Mocking empty array for simplicity
  };

  const mockMyData: MyStudentDetails = {
    ...commonData,
    // Key property for isMyProfile check
    pending_friends: [],
    friends: [],
    friend_applications: [],
  } as any; // Cast to any to avoid strict type checks on complex sub-objects if needed

  const mockOtherData: OtherStudentDetails = {
    ...commonData,
    receiving_friendship_status: 'none',
    friendship_status: 'none',
    friends: [],
  } as any;

  it('renders my profile correctly', () => {
    render(<Profile data={mockMyData} />);

    expect(screen.getByTestId('student-card')).toBeInTheDocument();
    expect(screen.getByTestId('subjects-card')).toBeInTheDocument();
    expect(screen.getByTestId('friends-card')).toBeInTheDocument();
    expect(screen.queryByTestId('only-friends-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('schedules-card')).toBeInTheDocument();
    expect(screen.getByTestId('history-card')).toBeInTheDocument();
    expect(screen.queryByTestId('accept-friend-btn')).not.toBeInTheDocument();
  });

  it('renders other student profile correctly', () => {
    render(<Profile data={mockOtherData} />);

    expect(screen.getByTestId('student-card')).toBeInTheDocument();
    // In this mock, friends is empty but defined, so OnlyFriendsCard should render because data.friends is truthy
    // Wait, let's check Profile.tsx: data.friends && <OnlyFriendsCard ... />
    expect(screen.getByTestId('only-friends-card')).toBeInTheDocument();
    expect(screen.queryByTestId('friends-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('accept-friend-btn')).not.toBeInTheDocument();
  });

  it('shows accept friend button when status is pending', () => {
    const pendingData: OtherStudentDetails = {
      ...mockOtherData,
      receiving_friendship_status: 'pending',
    };

    render(<Profile data={pendingData} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/Juan Perez quiere ser tu amigo/i);
    expect(screen.getByTestId('accept-friend-btn')).toBeInTheDocument();
  });
});
