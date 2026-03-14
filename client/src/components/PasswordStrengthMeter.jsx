import React, { useMemo } from 'react'

export default function PasswordStrengthMeter({ password = '' }) {
  const checks = {
    length: password.length >= 8,
    letters: /[A-Za-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  const pct = Math.round((score / Object.keys(checks).length) * 100);

  const strengthText = useMemo(() => {
    if (pct === 0) return { label: 'Empty', emoji: '⚪', color: 'text-gray-400' };
    if (pct <= 25) return { label: 'Very Weak', emoji: '😢', color: 'text-red-500' };
    if (pct <= 50) return { label: 'Weak', emoji: '😟', color: 'text-orange-500' };
    if (pct <= 75) return { label: 'Good', emoji: '🙂', color: 'text-yellow-500' };
    return { label: 'Strong', emoji: '💪', color: 'text-green-500' };
  }, [pct]);

  const barColor =
    pct >= 75 ? 'from-green-500 to-green-400' :
    pct >= 50 ? 'from-yellow-400 to-yellow-300' :
    'from-red-400 to-red-300';

  return (
    <div className="mt-2 space-y-2">
      <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          style={{ width: `${pct}%` }}
          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-300 ease-out rounded-full`}
        />
      </div>

      {password && (
        <div className={`text-xs font-medium flex items-center gap-1 ${strengthText.color}`}>
          <span>{strengthText.emoji}</span>
          <span>{strengthText.label}</span>
        </div>
      )}

      <div className="text-xs text-gray-600 dark:text-slate-300 grid grid-cols-2 gap-y-1">
        <div className={`${checks.length ? 'text-green-600 dark:text-green-400' : 'opacity-60'}`}>
           Min 8 characters
        </div>
        <div className={`${checks.letters ? 'text-green-600 dark:text-green-400' : 'opacity-60'}`}>
           Letters
        </div>
        <div className={`${checks.numbers ? 'text-green-600 dark:text-green-400' : 'opacity-60'}`}>
           Numbers
        </div>
        <div className={`${checks.special ? 'text-green-600 dark:text-green-400' : 'opacity-60'}`}>
           Special char
        </div>
      </div>
    </div>
  )
}
