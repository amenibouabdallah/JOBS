'use client';

import React, { Children, isValidElement, cloneElement, ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckIcon } from '@heroicons/react/24/outline';
import { StepDefinition } from '@/types/form.types';

interface StepperProps {
  children: React.ReactNode;
  onFinish?: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  steps: StepDefinition[];
}

interface StepComponentProps {
  onNext?: () => void;
  onPrevious?: () => void;
  [key: string]: any;
}

export function Stepper({ children, onFinish, currentStep, onStepChange, steps }: StepperProps) {
  const stepContents = Children.toArray(children);
  const isLastStep = currentStep === stepContents.length - 1;

  const next = () => {
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const activeStepContent = Children.map(stepContents[currentStep], (child) => {
    if (isValidElement<StepComponentProps>(child)) {
      return cloneElement(child as ReactElement<StepComponentProps>, {
        ...child.props,
        onNext: next,
        onPrevious: prev,
      });
    }
    return child;
  });

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {/* Step Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-red-500 text-white'
                        : 'bg-foreground/80 text-background/80'
                    }`}
                  >
                    {isCompleted ? <CheckIcon className="w-5 h-5" /> : step.id}
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-center px-1 sm:px-2">
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <Progress
          value={((currentStep + 1) / steps.length) * 100}
          className="h-2"
        />
      </div>

      {/* Active Step Content */}
      <div className="min-h-[400px]">
        {activeStepContent}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        {currentStep > 0 ? (
          <Button variant="outline" onClick={prev} type="button">
            Previous
          </Button>
        ) : (
          <div />
        )}
        
        {!isLastStep ? (
          <Button onClick={next} type="button">
            Next
          </Button>
        ) : (
          <Button onClick={onFinish} type="button">
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}