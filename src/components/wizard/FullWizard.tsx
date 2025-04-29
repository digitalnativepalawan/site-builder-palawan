import { useState } from 'react';
import { WizardLayout } from './WizardLayout';
import { steps } from './WizardSteps';

export function FullWizard() {
  const [current, setCurrent] = useState(0);
  const StepComponent = steps[current];

  const goNext = () => {
    setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
  };

  return (
    <WizardLayout currentStep={current} totalSteps={steps.length}>
      <StepComponent onStepComplete={goNext} />
    </WizardLayout>
  );
}
