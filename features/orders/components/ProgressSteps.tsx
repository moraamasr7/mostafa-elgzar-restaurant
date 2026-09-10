'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number; // 1: Cart, 2: Customer info & delivery, 3: Payment & confirmation
}

const steps = [
  { id: 1, label: 'السلة' },
  { id: 2, label: 'بيانات الطلب' },
  { id: 3, label: 'طريقة الدفع' },
];

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <nav className="w-full py-2 px-1 mb-3" aria-label="خطوات إتمام الطلب">
      <div className="flex items-center justify-between relative max-w-sm mx-auto">
        <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-stone-200 dark:bg-white/10 -z-0 rounded-full" aria-hidden />

        <div
          className="absolute right-4 top-3.5 h-0.5 bg-primary-600 transition-all duration-500 -z-0 rounded-full"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 85}%` }}
          aria-hidden
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                    : isActive
                    ? 'bg-primary-600 border-primary-500 text-white shadow-md shadow-primary-600/30 scale-105'
                    : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-white/15 text-stone-400'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
              </div>
              <span
                className={`text-[11px] mt-1 font-bold transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-stone-400 dark:text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
