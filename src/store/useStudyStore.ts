import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { curriculum, type SubjectStatus } from '../data/curriculum';

/** Nota por materia (una vez aprobada). Se guarda en grade_direct; grade_finals se mantiene vacío. */
export interface SubjectGrades {
    grade_direct: number | null;
    grade_finals: number[];
}

export interface GradeAverages {
    average: number | null;
    materiasConNota: number;
}

interface StudyState {
    subjectStates: Record<string, SubjectStatus>;
    subjectGrades: Record<string, SubjectGrades>;
    loading: boolean;
    userId: string | null;
    setUserId: (id: string | null) => void;
    loadStates: (userId: string) => Promise<void>;
    toggleSubjectState: (subjectId: string) => void;
    saveGrades: (subjectId: string, grade: number) => Promise<void>;
    getAverages: (subjectIds?: string[]) => GradeAverages;
    resetAll: () => void;
}

const STATUS_CYCLE: Record<SubjectStatus, SubjectStatus> = {
    pending: 'final',
    final: 'approved',
    approved: 'pending',
};

export const useStudyStore = create<StudyState>((set, get) => ({
    subjectStates: {},
    subjectGrades: {},
    loading: true,
    userId: null,

    setUserId: (id) => set({ userId: id }),

    loadStates: async (userId: string) => {
        set({ loading: true, userId });

        const { data, error } = await supabase
            .from('subject_states')
            .select('subject_id, status, grade_direct, grade_finals')
            .eq('user_id', userId);

        if (error) {
            console.error('Error loading states:', error);
            set({ loading: false });
            return;
        }

        const states: Record<string, SubjectStatus> = {};
        const grades: Record<string, SubjectGrades> = {};

        curriculum.forEach(s => { states[s.id] = 'pending'; });

        if (data) {
            data.forEach((row: { subject_id: string; status: string; grade_direct?: number | null; grade_finals?: number[] | string | null }) => {
                states[row.subject_id] = row.status as SubjectStatus;
                const gDirect = row.grade_direct != null ? Number(row.grade_direct) : null;
                let gFinals: number[] = [];
                if (Array.isArray(row.grade_finals)) {
                    gFinals = row.grade_finals.map(Number).filter((n) => !Number.isNaN(n));
                } else if (typeof row.grade_finals === 'string') {
                    const parsed = row.grade_finals.replace(/[{}]/g, '').split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
                    if (parsed.length > 0) gFinals = parsed;
                }
                if (gDirect != null || gFinals.length > 0) {
                    grades[row.subject_id] = { grade_direct: gDirect ?? null, grade_finals: gFinals };
                }
            });
        }

        set({ subjectStates: states, subjectGrades: grades, loading: false });
    },

    toggleSubjectState: (subjectId: string) => {
        const { subjectStates, userId } = get();
        const current = subjectStates[subjectId] || 'pending';
        const next = STATUS_CYCLE[current];

        set({
            subjectStates: { ...subjectStates, [subjectId]: next },
        });

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

    saveGrades: async (subjectId: string, grade: number) => {
        const { userId, subjectStates, subjectGrades } = get();
        if (!userId) return;

        const { error } = await supabase
            .from('subject_states')
            .upsert({
                user_id: userId,
                subject_id: subjectId,
                status: 'approved',
                grade_direct: grade,
                grade_finals: [],
            }, { onConflict: 'user_id,subject_id' });

        if (error) {
            console.error('Error saving grades:', error);
            return;
        }

        set({
            subjectStates: { ...subjectStates, [subjectId]: 'approved' },
            subjectGrades: {
                ...subjectGrades,
                [subjectId]: { grade_direct: grade, grade_finals: [] },
            },
        });
    },

    getAverages: (subjectIds?: string[]) => {
        const { subjectGrades } = get();
        const ids = subjectIds ?? Object.keys(subjectGrades);
        const withGrades = ids.filter(id => {
            const g = subjectGrades[id];
            if (!g) return false;
            return g.grade_direct != null || g.grade_finals.length > 0;
        });

        if (withGrades.length === 0) {
            return { average: null, materiasConNota: 0 };
        }

        const notas = withGrades.map(id => {
            const g = subjectGrades[id]!;
            return g.grade_direct != null
                ? g.grade_direct
                : (g.grade_finals[g.grade_finals.length - 1] ?? 0);
        });
        const sum = notas.reduce((a, b) => a + b, 0);

        return {
            average: Math.round((sum / notas.length) * 100) / 100,
            materiasConNota: withGrades.length,
        };
    },

    resetAll: () => {
        const { userId } = get();
        const states: Record<string, SubjectStatus> = {};
        curriculum.forEach(s => { states[s.id] = 'pending'; });
        set({ subjectStates: states, subjectGrades: {} });

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
