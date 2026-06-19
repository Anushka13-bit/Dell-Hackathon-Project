import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface OnboardingState {
  step: number;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  faceVerified: boolean;
  collegeInfo: {
    college: string;
    degree: string;
    year: string;
  };
  links: {
    linkedin: string;
    github: string;
  };
  resumeUploaded: boolean;
  onboardingComplete: boolean;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateData: (data: Partial<Omit<OnboardingState, 'nextStep' | 'prevStep' | 'setStep' | 'updateData'>>) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  fullName: '',
  email: '',
  emailVerified: false,
  phone: '',
  phoneVerified: false,
  faceVerified: false,
  collegeInfo: { college: '', degree: '', year: '' },
  links: { linkedin: '', github: '' },
  resumeUploaded: false,
  onboardingComplete: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  devtools(
    (set) => ({
      ...initialState,
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 8) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
      setStep: (step: number) => set({ step }),
      updateData: (data) => set((state) => ({ ...state, ...data })),
      reset: () => set(initialState),
    }),
    { name: 'onboarding-store' }
  )
);
