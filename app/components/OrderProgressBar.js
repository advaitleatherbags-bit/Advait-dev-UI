'use client'

import { CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/solid'

export default function OrderProgressBar({ status }) {
  const norm = (status || '').toLowerCase()

  const isFailed = norm === 'failed' || norm === 'paymentfailed' || norm === 'rejected' || norm === 'fail'
  const isPlaced = norm === 'placed'
  const isConfirmed = norm === 'confirmed' || norm === 'confirm' || norm === 'paid' || norm === 'success'

  let steps = []

  if (isFailed) {
    steps = [
      { id: 'pending', label: 'Pending', state: 'passed' },
      { id: 'failed', label: 'Failed', state: 'failed' }
    ]
  } else if (isPlaced) {
    steps = [
      { id: 'pending', label: 'Pending', state: 'completed' },
      { id: 'confirm', label: 'Confirm', state: 'completed' },
      { id: 'placed', label: 'Placed', state: 'completed' }
    ]
  } else if (isConfirmed) {
    steps = [
      { id: 'pending', label: 'Pending', state: 'completed' },
      { id: 'confirm', label: 'Confirm', state: 'completed' }
    ]
  } else {
    // Pending
    steps = [
      { id: 'pending', label: 'Pending', state: 'current' },
      { id: 'confirm', label: 'Confirm', state: 'upcoming' }
    ]
  }

  return (
    <div className="w-full my-5 px-1">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isFirst = idx === 0
          const isLast = idx === steps.length - 1

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">
              {/* Line to previous step */}
              {!isFirst && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-1 -translate-y-1/2 z-0 ${
                    step.state === 'failed'
                      ? 'bg-red-500'
                      : step.state === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Line to next step */}
              {!isLast && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-1 -translate-y-1/2 z-0 ${
                    steps[idx + 1].state === 'failed'
                      ? 'bg-red-500'
                      : steps[idx + 1].state === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                  step.state === 'completed'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 ring-4 ring-emerald-100'
                    : step.state === 'failed'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200 ring-4 ring-red-100'
                    : step.state === 'current'
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : step.state === 'passed'
                    ? 'bg-slate-400 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.state === 'completed' || step.state === 'passed' ? (
                  <CheckIcon className="w-4 h-4 stroke-[3]" />
                ) : step.state === 'failed' ? (
                  <XMarkIcon className="w-4 h-4 stroke-[3]" />
                ) : step.state === 'current' ? (
                  <ClockIcon className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-semibold tracking-wide ${
                  step.state === 'completed'
                    ? 'text-emerald-700'
                    : step.state === 'failed'
                    ? 'text-red-600 font-bold'
                    : step.state === 'current'
                    ? 'text-amber-700'
                    : step.state === 'passed'
                    ? 'text-slate-600'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
