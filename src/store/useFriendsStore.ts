import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { SubjectStatus } from '../data/curriculum';

interface FriendProfile {
    id: string;
    display_name: string;
    avatar_url: string | null;
    profile_color: string;
    profile_icon: string;
    degree_track: string;
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
    friendProfile: FriendProfile | null;

    loadFriends: (userId: string) => Promise<void>;
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
    friendProfile: null,

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
        // Load profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, profile_color, profile_icon, degree_track')
            .eq('id', friendId)
            .single();

        // Load states
        const { data: states } = await supabase
            .from('subject_states')
            .select('subject_id, status')
            .eq('user_id', friendId);

        const stateMap: Record<string, SubjectStatus> = {};
        if (states) {
            states.forEach(row => {
                stateMap[row.subject_id] = row.status as SubjectStatus;
            });
        }

        set({
            friendStates: stateMap,
            friendProfile: profile as FriendProfile | null,
        });
    },

    clearSearch: () => set({ searchResults: [] }),
    clearFriendView: () => set({ friendStates: {}, friendProfile: null }),
}));
