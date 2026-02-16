import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn - className merger', () => {
    it('should merge simple class strings', () => {
      const result = cn('px-2', 'py-1');
      expect(result).toContain('px-2');
      expect(result).toContain('py-1');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('should handle conditional classes as false', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).not.toContain('active-class');
    });

    it('should merge tailwind classes and override correctly', () => {
      // Tailwind merge should prefer right-most class
      const result = cn('px-2 px-4');
      expect(result).toContain('px-4');
      expect(result).not.toContain('px-2');
    });

    it('should handle array of classes', () => {
      const result = cn(['p-4', 'text-sm']);
      expect(result).toContain('p-4');
      expect(result).toContain('text-sm');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle null and undefined values', () => {
      const result = cn('base-class', null, undefined, 'another-class');
      expect(result).toContain('base-class');
      expect(result).toContain('another-class');
    });

    it('should handle nested arrays', () => {
      const result = cn(['p-4', ['text-sm', 'm-2']]);
      expect(result).toContain('p-4');
      expect(result).toContain('text-sm');
      expect(result).toContain('m-2');
    });

    it('should handle objects', () => {
      const result = cn({ 'p-4': true, 'text-sm': false });
      expect(result).toContain('p-4');
      expect(result).not.toContain('text-sm');
    });

    it('should prioritize rightmost value in class conflicts', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toContain('text-blue-500');
      expect(result).not.toContain('text-red-500');
    });
  });
});
