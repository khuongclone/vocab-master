import { create } from 'zustand';

interface StudyState {
  currentWordIndex: number;
  isFlipped: boolean;
  studyMode: 'flashcard' | 'typing' | 'multiple-choice' | 'word-blast' | 'matching' | 'listen';
  setCurrentWordIndex: (index: number) => void;
  setIsFlipped: (flipped: boolean) => void;
  setStudyMode: (mode: StudyState['studyMode']) => void;
  nextWord: () => void;
  reset: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  currentWordIndex: 0,
  isFlipped: false,
  studyMode: 'flashcard',
  setCurrentWordIndex: (index) => set({ currentWordIndex: index }),
  setIsFlipped: (flipped) => set({ isFlipped: flipped }),
  setStudyMode: (mode) => set({ studyMode: mode }),
  nextWord: () => set((state) => ({ currentWordIndex: state.currentWordIndex + 1, isFlipped: false })),
  reset: () => set({ currentWordIndex: 0, isFlipped: false }),
}));
