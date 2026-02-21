import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnrollDialog from './EnrollDialog';
import { SubjectNode } from '../behaviors/MenuActions';
import { TooltipProvider } from '@ui/tooltip';

// Mock dependencies
vi.mock('@/api/interactions/enrollApi', () => ({
  enrollStudent2: vi.fn(),
}));

vi.mock('../behaviors/StatusActions', () => ({
  useStatusActions: () => ({
    nodeActions: {
      enableViewedNode: vi.fn(),
    },
  }),
}));

vi.mock('@/hooks/queries/trimester/use-FetchTrimesters', () => ({
  useFetchTrimestersOptions: () => ({
    data: [
      {
        value: 'trim1',
        label: 'Enero-Marzo 2026',
        data: { is_current: false, is_next: false },
      },
    ],
    isLoading: false,
  }),
}));

// Mock UI components that might cause issues or need simplified rendering
vi.mock('@ui/dialog', () => ({
  DialogContent: ({ children, ref }: any) => (
    <div ref={ref} data-testid="dialog-content">
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h1>{children}</h1>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { enrollStudent } from '@/api/interactions/enrollApi';

describe('EnrollDialog', () => {
  const mockSubjectNode = {
    _cfg: {
      model: {
        data: {
          data: {
            code: { ID: 'MAT101' },
            name: 'Matemáticas I',
          },
        },
      },
    },
  } as unknown as SubjectNode;

  const mockAfterSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with subject info', () => {
    render(
      <TooltipProvider>
        <EnrollDialog subject={mockSubjectNode._cfg.model.data.data} isEditMode={false} afterSubmit={mockAfterSubmit} />
      </TooltipProvider>,
    );

    expect(screen.getByText(/Matemáticas I/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nota/i)).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    (enrollStudent as any).mockResolvedValue({ message: 'Success' });
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <EnrollDialog
          subject={mockSubjectNode._cfg.model.data.data as any}
          isEditMode={false}
          afterSubmit={mockAfterSubmit}
        />
      </TooltipProvider>,
    );

    // Fill form
    await user.type(screen.getByLabelText(/Nota/i), '18');

    // Select Trimester (Autocomplete mock handling might be tricky, assuming standard select-like behavior or input)
    // The component uses FormAutocompleteField.
    // If it renders an input, we can type.
    // We mocked useFetchTrimestersOptions to return data.
    // In a real test, interacting with Radix UI / Shadcn Select/Autocomplete is verbose.
    // For now, let's assume we can type into the input if it's an autocomplete.
    // Or simpler: Mock the FormAutocompleteField to be a simple input for this test.

    // But waiting for the "Guardar" button to be enabled/clickable.

    // Let's try to submit without trimester and see validation (optional check).

    // To make it easier, let's assume the user fills it.
    // If FormAutocompleteField renders an input with role="combobox" or similar.
    const trimesterInput = screen.getByPlaceholderText(/Selecciona el trimestre/i);
    await user.click(trimesterInput);
    // Select option (mocked data returns 'Enero-Marzo 2026')
    const option = await screen.findByText('Enero-Marzo 2026');
    await user.click(option);

    // Difficulty/Workload (Radio Groups)
    // We want to select "Media" (value 3). There are 5 options per group.
    // Difficulty is the first group, Workload is the second.
    // Media is the 3rd option (index 2) in each group.
    const radios = screen.getAllByRole('radio');
    await user.click(radios[2]); // Difficulty
    await user.click(radios[7]); // Workload

    // Submit
    await user.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(enrollStudent).toHaveBeenCalledWith(
        'MAT101',
        expect.objectContaining({
          grade: 18,
          trimesterId: { ID: 'trim1', Table: 'trimester' },
          difficulty: 3,
          workload: 3,
        }),
      );
    });

    expect(mockAfterSubmit).toHaveBeenCalled();
  });
});
