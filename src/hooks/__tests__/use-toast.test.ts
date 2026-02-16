import { reducer } from '@/hooks/use-toast';

type ToasterToast = ReturnType<typeof reducer>['toasts'][number];

type State = {
  toasts: ToasterToast[];
};

describe('use-toast reducer', () => {
  const initialState: State = {
    toasts: [],
  };

  describe('ADD_TOAST', () => {
    it('should add a new toast to the beginning of the list', () => {
      const newToast: ToasterToast = {
        id: '1',
        title: 'Test Toast',
      };

      const state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: newToast,
      });

      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]).toEqual(newToast);
    });

    it('should prepend new toast (add to beginning)', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First' }],
      };

      const newToast: ToasterToast = {
        id: '2',
        title: 'Second',
      };

      const state = reducer(existingState, {
        type: 'ADD_TOAST',
        toast: newToast,
      });

      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].id).toBe('2'); // New toast is first
      expect(state.toasts[1].id).toBe('1'); // Old toast is second
    });

    it('should limit toasts to TOAST_LIMIT (3)', () => {
      const existingState: State = {
        toasts: [
          { id: '1', title: 'First' },
          { id: '2', title: 'Second' },
          { id: '3', title: 'Third' },
        ],
      };

      const newToast: ToasterToast = {
        id: '4',
        title: 'Fourth',
      };

      const state = reducer(existingState, {
        type: 'ADD_TOAST',
        toast: newToast,
      });

      expect(state.toasts).toHaveLength(3);
      expect(state.toasts[0].id).toBe('4'); // New toast is first
      expect(state.toasts[1].id).toBe('1'); // First toast is second
      expect(state.toasts[2].id).toBe('2'); // Second toast is third
      // Third toast (id: '3') is removed
    });
  });

  describe('UPDATE_TOAST', () => {
    it('should update an existing toast by id', () => {
      const existingState: State = {
        toasts: [
          { id: '1', title: 'Original Title', description: 'Original Description' },
        ],
      };

      const state = reducer(existingState, {
        type: 'UPDATE_TOAST',
        toast: {
          id: '1',
          title: 'Updated Title',
        },
      });

      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].title).toBe('Updated Title');
      expect(state.toasts[0].description).toBe('Original Description'); // Unchanged
    });

    it('should not affect other toasts when updating', () => {
      const existingState: State = {
        toasts: [
          { id: '1', title: 'Toast 1' },
          { id: '2', title: 'Toast 2' },
        ],
      };

      const state = reducer(existingState, {
        type: 'UPDATE_TOAST',
        toast: {
          id: '1',
          title: 'Updated Toast 1',
        },
      });

      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].title).toBe('Updated Toast 1');
      expect(state.toasts[1].title).toBe('Toast 2'); // Unchanged
    });

    it('should not add toast if id does not exist', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'Toast 1' }],
      };

      const state = reducer(existingState, {
        type: 'UPDATE_TOAST',
        toast: {
          id: '99',
          title: 'Non-existent Toast',
        },
      });

      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe('1');
    });
  });

  describe('DISMISS_TOAST', () => {
    it('should mark a toast as open: false', () => {
      const existingState: State = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };

      const state = reducer(existingState, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      });

      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].open).toBe(false); // First toast dismissed
      expect(state.toasts[1].open).toBe(true); // Second toast still open
    });

    it('should dismiss all toasts when toastId is not provided', () => {
      const existingState: State = {
        toasts: [
          { id: '1', title: 'Toast 1', open: true },
          { id: '2', title: 'Toast 2', open: true },
        ],
      };

      const state = reducer(existingState, {
        type: 'DISMISS_TOAST',
      });

      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].open).toBe(false);
      expect(state.toasts[1].open).toBe(false);
    });
  });

  describe('REMOVE_TOAST', () => {
    it('should remove a toast by id', () => {
      const existingState: State = {
        toasts: [
          { id: '1', title: 'Toast 1' },
          { id: '2', title: 'Toast 2' },
        ],
      };

      const state = reducer(existingState, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      });

      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe('2');
    });

    it('should remove all toasts when toastId is not provided', () => {
      const existingState: State = {
        toasts: [
          { id: '1', title: 'Toast 1' },
          { id: '2', title: 'Toast 2' },
        ],
      };

      const state = reducer(existingState, {
        type: 'REMOVE_TOAST',
      });

      expect(state.toasts).toHaveLength(0);
    });

    it('should not crash if toast id does not exist', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'Toast 1' }],
      };

      const state = reducer(existingState, {
        type: 'REMOVE_TOAST',
        toastId: '99',
      });

      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe('1');
    });
  });

  describe('mixed actions', () => {
    it('should handle add, update, and remove in sequence', () => {
      let state = initialState;

      // Add first toast
      state = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast 1' },
      });
      expect(state.toasts).toHaveLength(1);

      // Add second toast
      state = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '2', title: 'Toast 2' },
      });
      expect(state.toasts).toHaveLength(2);

      // Update first toast
      state = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '2', title: 'Updated Toast 2' },
      });
      expect(state.toasts[0].title).toBe('Updated Toast 2');

      // Remove first toast
      state = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: '2',
      });
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe('1');
    });
  });
});
