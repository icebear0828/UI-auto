
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { RenderChildren } from './renderUtils';
import { useTheme } from '@/components/ThemeContext';
import { UINode, type UIAction } from '@/types';

interface StepperItem {
  id: string;
  title: string;
  content: UINode[];
}

interface StepperProps {
  currentStep: number;
  items: StepperItem[];
  onAction?: (action: UIAction) => void;
  path?: string;
}

export const Stepper = ({ currentStep = 0, items = [], onAction, path }: StepperProps) => {
  const { theme } = useTheme();
  // We use local state for immediate feedback, but sync with props for AI control
  const [activeStep, setActiveStep] = useState(currentStep);

  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  if (!items || items.length === 0) return null;

  // Calculate progress percentage for the connecting line
  const progressPercent = (activeStep / (items.length - 1)) * 100;

  return (
    <div className={theme.stepper.container}>
      {/* 1. Stepper Header (Visual Indicator) */}
      <div className={theme.stepper.header}>
        {/* Background Line */}
        <div className={theme.stepper.line.base}>
          <motion.div 
            className={theme.stepper.line.progress}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dots */}
        {items.map((item, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          
          let dotClass = theme.stepper.dot.inactive;
          let labelClass = theme.stepper.label.inactive;

          if (isActive) {
            dotClass = theme.stepper.dot.active;
            labelClass = theme.stepper.label.active;
          } else if (isCompleted) {
            dotClass = theme.stepper.dot.completed;
            labelClass = theme.stepper.label.completed;
          }

          return (
            <div 
              key={item.id} 
              className={theme.stepper.step}
              onClick={() => {
                // Optional: Allow clicking steps to navigate if desired
                if (onAction && path) {
                   onAction({
                     type: 'PATCH_STATE',
                     path,
                     payload: { currentStep: index }
                   });
                }
              }}
            >
              <div className={`${theme.stepper.dot.base} ${dotClass}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
              </div>
              <span className={`${theme.stepper.label.base} ${labelClass}`}>
                {item.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Active Step Content */}
      <div className="relative min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="w-full"
          >
             {items[activeStep] && (
               <RenderChildren 
                  children={items[activeStep].content} 
                  onAction={onAction} 
                  parentPath={path ? `${path}.items.${activeStep}.content` : undefined} 
               />
             )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
