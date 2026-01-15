import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: ('admin' | 'pendamping')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, isPending } = useAuth();
    const location = useLocation();

    // Log for diagnosis
    console.log('ProtectedRoute - Path:', location.pathname, 'User:', !!user, 'Role:', user?.role);

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // If we are already on the login page or unauthorized page, don't redirect to /
        if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/unauthorized') {
            return <Outlet />;
        }
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Role check logic
    // If user exists but role is undefined (might be syncing), we might want to wait
    // but for now let's handle the allowedRoles check safely
    if (allowedRoles) {
        const userRole = user.role as string | undefined;

        // If role is missing, it might still be loading from a slow session sync
        // In Better Auth, roles provided by additionalFields might sometimes lag
        if (!userRole) {
            console.warn('ProtectedRoute - User present but role missing. Potential sync issue.');
            // Fallback: if it's a pendamping route and role is null, we might allow it 
            // but safer to redirect to unauthorized if explicitly restricted
        }

        if (!allowedRoles.includes(userRole as any)) {
            console.error('ProtectedRoute - Access Denied. Required:', allowedRoles, 'UserRole:', userRole);
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
