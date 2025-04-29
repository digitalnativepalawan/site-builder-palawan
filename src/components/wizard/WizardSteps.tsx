import Step1_Identity from './Step1_Identity';
import MediaStep from './MediaStep';
import AmenityStep from './AmenityStep';
import DomainStep from './DomainStep';
import SuccessStep from './SuccessStep';

/**
 * Ordered list of wizard steps.
 * Add/remove steps here to change the flow.
 */
export const steps = [
  Step1_Identity,
  MediaStep,
  AmenityStep,
  DomainStep, // ← custom domain purchase step
  SuccessStep,
];
