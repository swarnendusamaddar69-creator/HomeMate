import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete: (code: string) => void;
  onResend?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
  resendCooldown?: number;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  onResend,
  disabled = false,
  isLoading = false,
  error = null,
  resendCooldown = 30,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState<number>(resendCooldown);

  // Initialize countdown on mount or when resend is triggered
  useEffect(() => {
    setCountdown(resendCooldown);
  }, [resendCooldown]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus the first input on mount
  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.slice(-1);
    // Allow digits only
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const nextVal = newDigits.join('').slice(0, length);
    onChange(nextVal);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (nextVal.length === length) {
      onComplete(nextVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const targetIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[targetIdx]?.focus();

    if (pasted.length === length) {
      onComplete(pasted);
    }
  };

  const handleResendClick = () => {
    if (countdown > 0 || disabled || isLoading) return;
    setCountdown(resendCooldown);
    if (onResend) onResend();
  };

  return (
    <div className="space-y-4 w-full">
      {/* 6 Digit Input Group */}
      <div
        role="group"
        aria-label="6-digit verification code"
        className="flex items-center justify-center gap-2 sm:gap-3"
      >
        {Array.from({ length }).map((_, idx) => {
          const isFilled = !!digits[idx];
          const hasError = !!error;

          return (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={idx === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digits[idx]}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={disabled || isLoading}
              aria-label={`Digit ${idx + 1} of ${length}`}
              className={`min-w-[48px] min-h-[48px] w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 transition-all outline-none select-none shadow-xs ${
                hasError
                  ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-600 focus:ring-4 focus:ring-rose-200'
                  : isFilled
                  ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200'
                  : 'border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
              } ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-text'}`}
            />
          );
        })}
      </div>

      {/* Error Message with ARIA live */}
      <div aria-live="polite" className="min-h-[20px] text-center">
        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {isLoading && !error && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 animate-fadeIn">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Verifying code with secure session...</span>
          </div>
        )}
      </div>

      {/* Resend 30s Countdown Timer Button */}
      {onResend && (
        <div className="flex items-center justify-center text-xs">
          {countdown > 0 ? (
            <p className="text-slate-500 font-medium">
              Resend code in{' '}
              <span className="font-mono font-bold text-slate-800">
                00:{countdown.toString().padStart(2, '0')}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendClick}
              disabled={disabled || isLoading}
              className="min-h-[48px] px-4 py-2 font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              aria-label="Resend verification code"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Verification Code</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
