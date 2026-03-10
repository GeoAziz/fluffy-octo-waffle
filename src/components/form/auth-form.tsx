'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';
import { EnhancedInput } from '@/components/form/enhanced-input';

export type AuthFormField = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
  };
};

export type AuthFormProps = {
  fields: AuthFormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  serverError?: string;
  successMessage?: string;
  className?: string;
};

/**
 * AuthForm - Reusable authentication form with validation and error handling
 * Uses EnhancedInput for cinematic error displays and success states
 * Includes server error display and loading states
 */
export function AuthForm({
  fields,
  onSubmit,
  submitLabel = 'Continue',
  isLoading = false,
  serverError,
  successMessage,
  className,
}: AuthFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateField = (field: AuthFormField, value: string): string | null => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }

    if (field.validation?.pattern && value && !field.validation.pattern.test(value)) {
      return field.validation.errorMessage || `${field.label} format is invalid`;
    }

    if (field.validation?.minLength && value.length < field.validation.minLength) {
      return `${field.label} must be at least ${field.validation.minLength} characters`;
    }

    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `${field.label} must be no more than ${field.validation.maxLength} characters`;
    }

    return null;
  };

  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error on change
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name] || '');
      if (error) {
        errors[field.name] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error is handled by parent component
      console.error('Form submission error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-emerald-700 dark:text-emerald-300 text-sm font-medium animate-scale-in">
          ✓ {successMessage}
        </div>
      )}

      {/* Server Error */}
      {serverError && (
        <div className="rounded-lg bg-risk-light dark:bg-risk/10 border border-risk/20 dark:border-risk/40 p-3 flex items-start gap-3 animate-shake-error">
          <AlertCircle className="h-5 w-5 text-risk flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-risk dark:text-red-400 uppercase tracking-tight">Error</p>
            <p className="text-xs text-risk/80 dark:text-red-400/80 mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div
            key={field.name}
            className="animate-slide-up opacity-0"
            style={{
              animationDelay: `${idx * 50}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <EnhancedInput
              label={field.label}
              name={field.name}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              error={fieldErrors[field.name]}
              disabled={isProcessing || isLoading}
              required={field.required}
              aria-name={field.label}
            />
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || isLoading}
        className="w-full h-12 bg-primary hover:bg-primary-mid text-white font-black uppercase text-[11px] tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
      >
        {isProcessing || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
