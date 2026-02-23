import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { curriculum, type SubjectStatus } from '../data/curriculum';

interface StudyState {
    subjectStates: Record<string, SubjectStatus>;
    loading: boolean;
    userId: string | null;
    setUserId: (id: string | null) => void;
    loadStates: (userId: string) => Promise<void>;
    toggleSubjectState: (subjectId: string) => void;
    resetAll: () => void;
}

const STATUS_CYCLE: Record<SubjectStatus, SubjectStatus> = {
    pending: 'regular',
    regular: 'final',
    final: 'approved',
    approved: 'pending',
};

export const useStudyStore = create<StudyState>((set, get) => ({
    subjectStates: {},
    loading: true,
    userId: null,

    setUserId: (id) => set({ userId: id }),

    loadStates: async (userId: string) => {
        set({ loading: true, userId });

        const { data, error } = await supabase
            .from('subject_states')
            .select('subject_id, status')
            .eq('user_id', userId);

        if (error) {
            console.error('Error loading states:', error);
            set({ loading: false });
            return;
        }

        // Build states from DB
        const states: Record<string, SubjectStatus> = {};

        // Init all subjects as pending
        curriculum.forEach(s => { states[s.id] = 'pending'; });

        // Override with DB values
        if (data) {
            data.forEach(row => {
                states[row.subject_id] = row.status as SubjectStatus;
            });
        }

        set({ subjectStates: states, loading: false });
    },

    toggleSubjectState: (subjectId: string) => {
        const { subjectStates, userId } = get();
        const current = subjectStates[subjectId] || 'pending';
        const next = STATUS_CYCLE[current];

        // Optimistic update
        set({
            subjectStates: { ...subjectStates, [subjectId]: next },
        });

        // Persist to Supabase
        if (userId) {
            supabase
                .from('subject_states')
                .upsert({
                    user_id: userId,
                    subject_id: subjectId,
                    status: next,
                }, { onConflict: 'user_id,subject_id' })
                .then(({ error }) => {
                    if (error) console.error('Error saving state:', error);
                });
        }
    },

    resetAll: () => {
        const { userId } = get();
        const states: Record<string, SubjectStatus> = {};
        curriculum.forEach(s => { states[s.id] = 'pending'; });
        set({ subjectStates: states });

        // Delete all states in DB
        if (userId) {
            supabase
                .from('subject_states')
                .delete()
                .eq('user_id', userId)
                .then(({ error }) => {
                    if (error) console.error('Error resetting states:', error);
                });
        }
    },
}));
