import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ParsedResumeData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  college_name?: string | null;
  degree?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  raw_skills?: string[];
  experience_summary?: string;
  projects?: string[];
}

export interface OnboardingAiData {
  parsed_resume: ParsedResumeData;
  skill_vector: Record<string, number>;
  semantic_embedding: number[];
  raw_text?: string;
}

export interface OnboardingState {
  step: number;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  gender: string;
  faceVerified: boolean;
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
  aiData: OnboardingAiData | null;

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
  gender: '',
  faceVerified: false,
  collegeInfo: { college: '', degree: '', year: '' },
  links: { linkedin: '', github: '' },
  resumeUploaded: false,
  onboardingComplete: false,
  aiData: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  devtools(
    (set) => ({
      ...initialState,
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 7) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
      setStep: (step: number) => set({ step }),
      updateData: (data) => set((state) => ({ ...state, ...data })),
      reset: () => set(initialState),
    }),
    { name: 'onboarding-store' }
  )
);
