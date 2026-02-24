import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { SubjectStatus, Subject } from '../data/curriculum';
import { curriculum } from '../data/curriculum';

interface FriendProfile {
    id: string;
    display_name: string;
    avatar_url: string | null;
    profile_color: string;
    profile_icon: string;
    degree_track: string;
    profile_subtitle?: string | null;
    active_plan_id?: string | null;
}

export interface FriendPlanInfo {
    id: string;
    name: string;
    is_public: boolean;
}

interface Friendship {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    sender?: FriendProfile;
    receiver?: FriendProfile;
}

interface FriendsState {
    friends: Friendship[];
    pendingRequests: Friendship[];
    searchResults: FriendProfile[];
    loading: boolean;
    searching: boolean;
    friendStates: Record<string, SubjectStatus>;
    /** Notas del amigo (grade_direct por materia) para calcular promedio */
    friendGrades: Record<string, number>;
    friendProfile: FriendProfile | null;
    friendPlan: FriendPlanInfo | null;
    friendPlanSubjects: Subject[];
    /** Cache de estadísticas por amigo (approved, final, pending, total, pct) para el mini resumen en lista */
    friendStatsCache: Record<string, { approved: number; final: number; pending: number; total: number; pct: number }>;

    loadFriends: (userId: string) => Promise<void>;
    loadFriendStats: (friendId: string) => Promise<void>;
    loadPendingRequests: (userId: string) => Promise<void>;
    searchUsers: (query: string, currentUserId: string) => Promise<void>;
    sendRequest: (senderId: string, receiverId: string) => Promise<{ error: string | null }>;
    acceptRequest: (friendshipId: string) => Promise<void>;
    rejectRequest: (friendshipId: string) => Promise<void>;
    removeFriend: (friendshipId: string) => Promise<void>;
    loadFriendStates: (friendId: string) => Promise<void>;
    clearSearch: () => void;
    clearFriendView: () => void;
}



export const useFriendsStore = create<FriendsState>((set, get) => ({
    friends: [],
    pendingRequests: [],
    searchResults: [],
    loading: false,
    searching: false,
    friendStates: {},
    friendGrades: {},
    friendProfile: null,
    friendPlan: null,
    friendPlanSubjects: [],
    friendStatsCache: {},

    loadFriendStats: async (friendId: string) => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, degree_track, active_plan_id')
            .eq('id', friendId)
            .single();

        const { data: states } = await supabase
            .from('subject_states')
            .select('subject_id, status')
            .eq('user_id', friendId);

        const stateMap: Record<string, SubjectStatus> = {};
        if (states) {
            states.forEach((row: { subject_id: string; status: string }) => {
                stateMap[row.subject_id] = row.status as SubjectStatus;
            });
        }

        let subjects: Subject[] = curriculum;
        if (profile?.active_plan_id) {
            const { data: subjectRows } = await supabase
                .from('plan_subjects')
                .select('subject_id, name, year, semester, is_analyst, category, correlatives')
                .eq('plan_id', profile.active_plan_id)
                .order('year', { ascending: true })
                .order('semester', { ascending: true });
            if (subjectRows?.length) {
                subjects = subjectRows.map((row: { subject_id: string; name: string; year: number; semester: number; is_analyst: boolean; category: string; correlatives: string[] | null }) => ({
                    id: row.subject_id,
                    name: row.name,
                    year: row.year,
                    semester: row.semester,
                    credits: 0,
                    isAnalyst: row.is_analyst,
                    correlatives: row.correlatives ?? [],
                    category: row.category,
                }));
            }
        }
        const isAnalyst = profile?.degree_track === 'analista';
        const filtered = isAnalyst ? subjects.filter(s => s.isAnalyst) : subjects;
        const total = filtered.length;
        let approved = 0, finalCount = 0, pending = 0;
        filtered.forEach(s => {
            const st = stateMap[s.id] || 'pending';
            if (st === 'approved') approved++;
            else if (st === 'final') finalCount++;
            else pending++;
        });
        const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
        set(state => ({
            friendStatsCache: {
                ...state.friendStatsCache,
                [friendId]: { approved, final: finalCount, pending, total, pct },
            },
        }));
    },

    loadFriends: async (userId: string) => {
        set({ loading: true });
        const { data } = await supabase
            .from('friendships')
            .select(`
        id, sender_id, receiver_id, status, created_at,
        sender:profiles!friendships_sender_id_fkey(id, display_name, avatar_url, profile_color, profile_icon, degree_track),
        receiver:profiles!friendships_receiver_id_fkey(id, display_name, avatar_url, profile_color, profile_icon, degree_track)
      `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .eq('status', 'accepted');

        set({
            friends: (data || []).map(f => ({
                ...f,
                sender: Array.isArray(f.sender) ? f.sender[0] : f.sender,
                receiver: Array.isArray(f.receiver) ? f.receiver[0] : f.receiver,
            })) as Friendship[],
            loading: false,
        });
    },

    loadPendingRequests: async (userId: string) => {
        const { data } = await supabase
            .from('friendships')
            .select(`
        id, sender_id, receiver_id, status, created_at,
        sender:profiles!friendships_sender_id_fkey(id, display_name, avatar_url, profile_color, profile_icon, degree_track)
      `)
            .eq('receiver_id', userId)
            .eq('status', 'pending');

        set({
            pendingRequests: (data || []).map(f => ({
                ...f,
                sender: Array.isArray(f.sender) ? f.sender[0] : f.sender,
            })) as Friendship[],
        });
    },

    searchUsers: async (query: string, currentUserId: string) => {
        if (!query.trim()) { set({ searchResults: [] }); return; }
        set({ searching: true });

        const { data } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, profile_color, profile_icon, degree_track')
            .neq('id', currentUserId)
            .or(`display_name.ilike.%${query}%`)
            .limit(10);

        set({ searchResults: (data || []) as FriendProfile[], searching: false });
    },

    sendRequest: async (senderId: string, receiverId: string) => {
        // Check if friendship already exists
        const { data: existing } = await supabase
            .from('friendships')
            .select('id, status')
            .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
            .limit(1);

        if (existing && existing.length > 0) {
            return { error: 'Ya existe una solicitud con este usuario' };
        }

        const { error } = await supabase
            .from('friendships')
            .insert({ sender_id: senderId, receiver_id: receiverId });

        if (error) return { error: error.message };
        return { error: null };
    },

    acceptRequest: async (friendshipId: string) => {
        await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('id', friendshipId);

        // Refresh lists
        const state = get();
        const userId = state.pendingRequests[0]?.receiver_id;
        if (userId) {
            state.loadPendingRequests(userId);
            state.loadFriends(userId);
        }
    },

    rejectRequest: async (friendshipId: string) => {
        await supabase
            .from('friendships')
            .update({ status: 'rejected' })
            .eq('id', friendshipId);

        const state = get();
        set({ pendingRequests: state.pendingRequests.filter(r => r.id !== friendshipId) });
    },

    removeFriend: async (friendshipId: string) => {
        await supabase
            .from('friendships')
            .delete()
            .eq('id', friendshipId);

        const state = get();
        set({ friends: state.friends.filter(f => f.id !== friendshipId) });
    },

    loadFriendStates: async (friendId: string) => {
        // Load profile (incluye active_plan_id para saber el plan del amigo)
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, profile_color, profile_icon, degree_track, profile_subtitle, active_plan_id')
            .eq('id', friendId)
            .single();

        // Load subject states and grades (para promedio del amigo)
        const { data: states } = await supabase
            .from('subject_states')
            .select('subject_id, status, grade_direct')
            .eq('user_id', friendId);

        const stateMap: Record<string, SubjectStatus> = {};
        const gradesMap: Record<string, number> = {};
        if (states) {
            states.forEach((row: { subject_id: string; status: string; grade_direct?: number | null }) => {
                stateMap[row.subject_id] = row.status as SubjectStatus;
                const direct = row.grade_direct != null ? Number(row.grade_direct) : null;
                if (direct != null) gradesMap[row.subject_id] = direct;
            });
        }

        let friendPlan: FriendPlanInfo | null = null;
        let friendPlanSubjects: Subject[] = [];

        if (profile?.active_plan_id) {
            const { data: planRow } = await supabase
                .from('curriculum_plans')
                .select('id, name, is_public')
                .eq('id', profile.active_plan_id)
                .single();

            if (planRow) {
                friendPlan = { id: planRow.id, name: planRow.name, is_public: planRow.is_public ?? false };

                const { data: subjectRows } = await supabase
                    .from('plan_subjects')
                    .select('subject_id, name, year, semester, is_analyst, category, correlatives')
                    .eq('plan_id', planRow.id)
                    .order('year', { ascending: true })
                    .order('semester', { ascending: true });

                if (subjectRows) {
                    friendPlanSubjects = subjectRows.map((row: { subject_id: string; name: string; year: number; semester: number; is_analyst: boolean; category: string; correlatives: string[] | null }) => ({
                        id: row.subject_id,
                        name: row.name,
                        year: row.year,
                        semester: row.semester,
                        credits: 0,
                        isAnalyst: row.is_analyst,
                        correlatives: row.correlatives ?? [],
                        category: row.category,
                    }));
                }
            }
        }

        set({
            friendStates: stateMap,
            friendGrades: gradesMap,
            friendProfile: profile as FriendProfile | null,
            friendPlan,
            friendPlanSubjects,
        });
    },

    clearSearch: () => set({ searchResults: [] }),
    clearFriendView: () => set({ friendStates: {}, friendGrades: {}, friendProfile: null, friendPlan: null, friendPlanSubjects: [] }),
}));
