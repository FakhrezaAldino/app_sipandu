import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from '../lib/auth-client';
import api from '../lib/api';

interface PendampingProfile {
    wilayahBinaan: string;
    nik: string;
    noHp: string;
}

interface AuthContextType {
    user: any;
    session: any;
    isPending: boolean;
    pendampingProfile: PendampingProfile | null;
    signIn: typeof authClient.signIn;
    signOut: typeof authClient.signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: sessionData, isPending, error } = authClient.useSession();
    const [pendampingProfile, setPendampingProfile] = useState<PendampingProfile | null>(null);

    // Fetch pendamping profile when user is logged in
    useEffect(() => {
        const fetchPendampingProfile = async () => {
            const user = sessionData?.user as any;
            if (user && user.role === 'pendamping') {
                console.log('Fetching pendamping profile for user:', user.email);
                try {
                    const response = await api.get('/users/me/profile');
                    console.log('Pendamping profile response:', response.data);
                    if (response.data.success && response.data.data) {
                        setPendampingProfile(response.data.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch pendamping profile:', error);
                }
            } else {
                if (user) console.log('User is not a pendamping, role:', user.role);
                setPendampingProfile(null);
            }
        };

        if (!isPending && sessionData) {
            fetchPendampingProfile();
        }
    }, [sessionData, isPending]);

    // Log the session state for debugging
    React.useEffect(() => {
        if (!isPending) {
            console.log('AuthContext Session Updated:', {
                hasUser: !!sessionData?.user,
                role: (sessionData?.user as any)?.role,
                hasSession: !!sessionData?.session,
                error
            });
        }
    }, [sessionData, isPending, error]);


    return (
        <AuthContext.Provider
            value={{
                user: sessionData?.user,
                session: sessionData?.session,
                isPending,
                pendampingProfile,
                signIn: authClient.signIn,
                signOut: authClient.signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

