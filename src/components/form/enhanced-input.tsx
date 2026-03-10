'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  label?: string;
}

/**
 * EnhancedInput - Form input with error states, animations, and premium styling.
 * Includes specific error messages, shake animation, and accessibility support.
 */
const EnhancedInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, success, icon, label, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}

          <input
            type={type === 'password' && showPassword ? 'text' : type}
            className={cn(
              'flex h-11 w-full rounded-lg border bg-background px-4 py-2 text-sm transition-all duration-200',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))]',
              icon && 'pl-10',
              error && 'border-destructive focus:ring-destructive focus:ring-destructive animate-shake-error',
              success && 'border-green-500 focus:ring-green-500',
              !error && !success && 'border-input hover:border-input/70',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />

          {/* Password toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Success indicator */}
          {success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Error message with animation */}
        {error && (
          <div
            className="flex items-center gap-2 text-sm text-destructive animate-slide-up"
            role="alert"
            id={`${props.id}-error`}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput };
