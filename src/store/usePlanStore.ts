import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Subject } from '../data/curriculum';

export interface PlanSubject {
    id?: string;
    plan_id?: string;
    subject_id: string;
    name: string;
    year: number;
    semester: number;
    is_analyst: boolean;
    category: string;
    correlatives: string[];
    /** Título para el que cuenta la materia (ej. Analista, Ingeniería, Técnico). Personalizable por el usuario. */
    title_name?: string;
}

export interface CurriculumPlan {
    id: string;
    name: string;
    creator_id: string;
    is_default: boolean;
    is_public: boolean;
    created_at: string;
}

interface PlanState {
    plans: CurriculumPlan[];
    activePlanId: string | null;
    activePlanSubjects: Subject[];
    loading: boolean;

    loadUserPlans: (userId: string) => Promise<void>;
    loadPlanSubjects: (planId: string) => Promise<void>;
    setActivePlan: (planId: string, userId: string) => Promise<void>;
    createPlanFromDefault: (userId: string) => Promise<string | null>;
    createCustomPlan: (userId: string, name: string, subjects: PlanSubject[]) => Promise<string | null>;
    copyPlan: (planId: string, userId: string) => Promise<string | null>;
    deletePlan: (planId: string, userId?: string) => Promise<void>;
}

// Convert DB row to Subject
const toSubject = (row: PlanSubject): Subject => ({
    id: row.subject_id,
    name: row.name,
    year: row.year,
    semester: row.semester,
    credits: 0,
    isAnalyst: row.is_analyst,
    correlatives: row.correlatives || [],
    category: row.category,
});

export const usePlanStore = create<PlanState>((set, get) => ({
    plans: [],
    activePlanId: null,
    activePlanSubjects: [],
    loading: true,

    loadUserPlans: async (userId: string) => {
        set({ loading: true });
        try {
            const { data: ownPlans } = await supabase
                .from('curriculum_plans')
                .select('*')
                .or(`creator_id.eq.${userId},is_default.eq.true`);

            const { data: profile } = await supabase
                .from('profiles')
                .select('active_plan_id')
                .eq('id', userId)
                .single();

            const plans = (ownPlans || []) as CurriculumPlan[];
            let activePlanId = profile?.active_plan_id ?? null;

            if (activePlanId === null && get().activePlanId) {
                const currentId = get().activePlanId;
                if (plans.some(p => p.id === currentId)) activePlanId = currentId;
            }

            set({ plans, activePlanId });

            if (activePlanId) {
                await get().loadPlanSubjects(activePlanId);
            }
        } finally {
            set({ loading: false });
        }
    },

    loadPlanSubjects: async (planId: string) => {
        const { data } = await supabase
            .from('plan_subjects')
            .select('*')
            .eq('plan_id', planId)
            .order('year', { ascending: true })
            .order('semester', { ascending: true });

        if (data) {
            const subjects = data.map((row: any) => toSubject({
                subject_id: row.subject_id,
                name: row.name,
                year: row.year,
                semester: row.semester,
                is_analyst: row.is_analyst,
                category: row.category,
                correlatives: row.correlatives || [],
            }));
            set({ activePlanSubjects: subjects });
        }
    },

    setActivePlan: async (planId: string, userId: string) => {
        set({ activePlanId: planId });

        await supabase
            .from('profiles')
            .update({ active_plan_id: planId })
            .eq('id', userId);

        get().loadPlanSubjects(planId);
    },

    createPlanFromDefault: async (userId: string) => {
        // Asegurar que exista la fila en profiles (por si el trigger on signup no corrió, ej. usuario anterior o OAuth)
        const { error: profileErr } = await supabase.from('profiles').insert({ id: userId });
        if (profileErr && profileErr.code !== '23505') {
            console.error('Error asegurando perfil:', profileErr);
        }

        // Import static curriculum
        const { curriculum } = await import('../data/curriculum');

        // Create plan record
        const { data: plan, error: planErr } = await supabase
            .from('curriculum_plans')
            .insert({
                name: 'Ing. Sistemas 2024',
                creator_id: userId,
                is_default: false,
                is_public: false,
            })
            .select('id')
            .single();

        if (planErr || !plan) {
            console.error('Error creating plan:', planErr);
            return null;
        }

        // Insert all subjects
        const subjects = curriculum.map(s => ({
            plan_id: plan.id,
            subject_id: s.id,
            name: s.name,
            year: s.year,
            semester: s.semester,
            is_analyst: s.isAnalyst,
            category: s.category,
            correlatives: s.correlatives,
        }));

        await supabase.from('plan_subjects').insert(subjects);

        // Marcar como plan activo en el perfil (necesario para que al volver a entrar se cargue)
        await supabase
            .from('profiles')
            .update({ active_plan_id: plan.id })
            .eq('id', userId)
            .select('active_plan_id')
            .single();

        // Dejar en store el plan activo y refrescar lista; loadUserPlans no lo pisa si el perfil no devolvió el id a tiempo
        set({ activePlanId: plan.id });
        await get().loadUserPlans(userId);

        return plan.id;
    },

    createCustomPlan: async (userId: string, name: string, subjects: PlanSubject[]) => {
        const { data: plan, error: planErr } = await supabase
            .from('curriculum_plans')
            .insert({
                name,
                creator_id: userId,
                is_default: false,
                is_public: true,
            })
            .select('id')
            .single();

        if (planErr || !plan) {
            console.error('Error creating plan:', planErr);
            return null;
        }

        const rows = subjects.map(s => {
            const titleName = (s.title_name ?? '').trim();
            const isAnalyst = titleName
                ? titleName.toLowerCase().includes('analista')
                : s.is_analyst;
            return {
                plan_id: plan.id,
                subject_id: s.subject_id,
                name: s.name,
                year: s.year,
                semester: s.semester,
                is_analyst: isAnalyst,
                category: s.category,
                correlatives: s.correlatives,
                title_name: titleName || null,
            };
        });

        await supabase.from('plan_subjects').insert(rows);

        // Set as active
        await supabase
            .from('profiles')
            .update({ active_plan_id: plan.id })
            .eq('id', userId);

        set({ activePlanId: plan.id });
        await get().loadUserPlans(userId);

        return plan.id;
    },

    copyPlan: async (planId: string, userId: string) => {
        // Get source plan info
        const { data: srcPlan } = await supabase
            .from('curriculum_plans')
            .select('name')
            .eq('id', planId)
            .single();

        if (!srcPlan) return null;

        // Get source subjects
        const { data: srcSubjects } = await supabase
            .from('plan_subjects')
            .select('subject_id, name, year, semester, is_analyst, category, correlatives, title_name')
            .eq('plan_id', planId);

        if (!srcSubjects) return null;

        // Create new plan
        const { data: newPlan } = await supabase
            .from('curriculum_plans')
            .insert({
                name: `${srcPlan.name} (copia)`,
                creator_id: userId,
                is_default: false,
                is_public: false,
            })
            .select('id')
            .single();

        if (!newPlan) return null;

        // Copy subjects
        const rows = srcSubjects.map(s => ({
            ...s,
            plan_id: newPlan.id,
        }));

        await supabase.from('plan_subjects').insert(rows);

        await get().loadUserPlans(userId);
        return newPlan.id;
    },

    deletePlan: async (planId: string, userId?: string) => {
        const state = get();
        const wasActive = state.activePlanId === planId;
        const remainingPlans = state.plans.filter(p => p.id !== planId);
        const newActiveId = wasActive && remainingPlans.length > 0 ? remainingPlans[0].id : (wasActive ? null : state.activePlanId);

        await supabase.from('curriculum_plans').delete().eq('id', planId);
        set({ plans: remainingPlans, activePlanId: newActiveId });

        if (wasActive && userId) {
            await supabase.from('profiles').update({ active_plan_id: newActiveId }).eq('id', userId);
            if (newActiveId) get().loadPlanSubjects(newActiveId);
            else set({ activePlanSubjects: [] });
        }
    },
}));
