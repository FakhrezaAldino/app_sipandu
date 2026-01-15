import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../Auth/ChangePasswordModal';

const Header = () => {
    const { user, signOut, pendampingProfile } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.role === 'admin';
    const displayName = user?.name || 'User';
    const roleLabel = isAdmin ? 'ADMINISTRATOR' : 'PENDAMPING';
    const roleDescription = isAdmin
        ? 'Admin Sistem PKH'
        : pendampingProfile?.wilayahBinaan || 'Pendamping Sosial';

    // Generate initials for avatar fallback
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        navigate('/login');
                    }
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        } finally {
            setIsLoggingOut(false);
            setIsDropdownOpen(false);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-20 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-[#2a3441] bg-white dark:bg-[#1a202c] px-6 py-3">
                <div className="flex items-center gap-4">
                    <div className="size-8 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">diversity_3</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">PKH Management</h2>
                        <span className="text-xs text-[#617589] dark:text-gray-400 font-medium">Sistem Pendamping Sosial</span>
                    </div>
                    {/* Role Badge - different color for admin vs pendamping */}
                    <div className={`ml-4 rounded-full px-3 py-1 text-xs font-bold border ${isAdmin
                        ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400'
                        : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                        {roleLabel}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Notification Icon Removed */}


                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors"
                        >
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-bold text-[#111418] dark:text-white">{displayName}</span>
                                <span className="text-xs text-[#617589] dark:text-gray-400">{roleDescription}</span>
                            </div>
                            {/* Avatar with initials fallback */}
                            <div className={`flex items-center justify-center rounded-full size-10 ring-2 ring-white dark:ring-[#1a202c] shadow-sm font-bold text-white ${isAdmin
                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                : 'bg-gradient-to-br from-primary to-blue-600'
                                }`}>
                                {initials}
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-lg">
                                {isDropdownOpen ? 'expand_less' : 'expand_more'}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a202c] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                {/* User Info */}
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                    <p className="text-sm font-semibold text-[#111418] dark:text-white">{displayName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setIsPasswordModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg text-gray-500">lock</span>
                                        Ubah Password
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
    );
};

export default Header;

