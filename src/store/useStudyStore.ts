import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SubjectStatus } from '../data/curriculum';
import { initialSubjectStates } from '../data/curriculum';

interface StudyState {
    subjectStates: Record<string, SubjectStatus>;
    toggleSubjectState: (id: string) => void;
    resetAll: () => void;
    isInitialized: boolean;
}

const STATUS_CYCLE: Record<SubjectStatus, SubjectStatus> = {
    pending: 'regular',
    regular: 'final',
    final: 'approved',
    approved: 'pending',
};

export const useStudyStore = create<StudyState>()(
    persist(
        (set) => ({
            subjectStates: { ...initialSubjectStates },
            isInitialized: false,
            toggleSubjectState: (id) =>
                set((state) => {
                    const current = state.subjectStates[id] || 'pending';
                    return {
                        subjectStates: {
                            ...state.subjectStates,
                            [id]: STATUS_CYCLE[current],
                        },
                    };
                }),
            resetAll: () => set({ subjectStates: { ...initialSubjectStates }, isInitialized: true }),
        }),
        {
            name: 'unitraker-storage',
            merge: (persisted, current) => {
                const persistedState = persisted as Partial<StudyState> | undefined;
                if (persistedState && persistedState.isInitialized) {
                    return {
                        ...current,
                        ...persistedState,
                    };
                }
                // First time: use initial states from Notion
                return {
                    ...current,
                    subjectStates: { ...initialSubjectStates },
                    isInitialized: true,
                };
            },
        }
    )
);
