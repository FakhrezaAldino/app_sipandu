import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login attempt started for:', email);
        setIsLoading(true);
        setError(null);

        try {
            const result = await authClient.signIn.email({
                email,
                password,
            }, {
                onSuccess: async () => {
                    console.log('Login successful on server, syncing session...');

                    // Small delay to ensure session is fully established on server
                    await new Promise(resolve => setTimeout(resolve, 200));

                    // Force refresh session to get the roles and custom fields
                    const session = await authClient.getSession();
                    const user = session?.data?.user as { role?: string } | undefined;

                    console.log('Login success - Full User Data:', user);

                    if (user?.role === 'admin') {
                        console.log('Redirecting to Admin Dashboard');
                        navigate('/admin/dashboard', { replace: true });
                    } else {
                        console.log('Redirecting to Pendamping Dashboard');
                        navigate('/dashboard', { replace: true });
                    }
                },
                onError: (ctx) => {
                    console.error('Login failed:', ctx.error);
                    setError(ctx.error.message || 'Login gagal. Silakan periksa email dan password Anda.');
                    setIsLoading(false);
                }
            });

            console.log('API call finished, result:', !!result);
        } catch (err: any) {
            console.error('Unexpected Login error:', err);
            setError(err.message || 'Terjadi kesalahan yang tidak terduga.');
            setIsLoading(false);
        }
        // Note: setIsLoading(false) moved to onError and catch to keep it true during success-navigation
    };

    return (
        <div className="flex h-screen w-full">
            {/* Left Section: Visual/Hero (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative bg-primary/5 items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAs000YqBtOwjbrzcMTeTkEK63tEJnH16X51wobN17jo26-XscOp85Fl_Nb0uKOpls3xk9oQOjLBVxndX-9aplGf5z-o3x1lgOOWD9rCLYofkC88IU0tPyg1fy_vAmxo4QL2b3Rd-Si4PH1m_aWlmvFwenckQIvxh3N3JE-ke3QOgr77TldDCTHQT_aVJBhvG6mlrBXt8D_aLFESQVzNFAFCVfX05tIZmCn94IeVk5JoQtJ8qwTrPe8jvM9QW18D-qFsYsdZH1OPRUi")' }}
                >
                </div>
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 mix-blend-multiply"></div>
                {/* Hero Content */}
                <div className="relative z-10 p-16 text-white max-w-2xl flex flex-col justify-end h-full w-full pb-24">
                    <div className="mb-6">
                        <div className="size-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 shadow-inner border border-white/30">
                            <span className="material-symbols-outlined text-3xl">diversity_3</span>
                        </div>
                        <h2 className="text-4xl font-bold leading-tight mb-4 text-white">SIPANDU PKH</h2>
                        <p className="text-lg text-white/90 leading-relaxed font-light">Sistem Informasi Pendampingan Terpadu. Kelola data, pantau perkembangan, dan dukung kesejahteraan masyarakat dengan lebih efektif.</p>
                    </div>
                    {/* Simple Trust Indicator */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/20">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200 bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmX_guC8cWJ_B_dEW8MIyNiJEjlTCptWozjOAwFsACbSUuDD-20s3T1A2Rbl0DaiimHifYu7EXoLNMVY7weR2JVxFT0gkhUJPt8NkRJ_ZoxllmVrazL8Xlh-D2xiWe0GffU8fyDbIHhtPNMQZ9M2aj7OHoOZDdvp-vAsWTu3hcKtw-dCBUJ-x9RZJGpzOsd6KOqc2-0er4FNwQ4TXbFdobUYYh6Tz1yu41pcz7nuf8ED7_cw7-RgcNr8N5cy70j50CtiHivpfDePi_")' }}></div>
                            <div className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200 bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAywEBuaWp-w0htmL1G-DPXzjteEDZylRy0D9OXcgW2UDZzg9tkrKK4hqfl3NGvWOnp-GgCbb2j1n34S0omB88BdbxaA7t7eiHX-QXyaztJsbBU0ELQmils2Iib8WJ8bzu4yvJf0Id06BzgCsmkh_S7uM0fUQ98alIvBjHkxK2-nDZznUwMSKzGcQw7iNfjjmeWKlYZMsbR6JEPyX8IyldC-BOojfsfFbY5QiSJkVofa_25CBobKQnMpood1g8WZsHOVtl2j2bBdbNQ")' }}></div>
                            <div className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200 bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDrJYHz7WCnnZOmcNzdW_-CT1Ph3p6gW9slJhGEK05sUWPCBsAf4Zk-kJtgxtUUmnCZ6ypBA5gJQmw4H-0etTOtbasgaZM95qtaGqhBvlYje2_C_09zTuI-LfEQSaKCm0hh0UF5Z-u48AeQ5L2p3p4QKYHjrQDqd-OJvYb03sCNIcb_bPWCQans0PtpE6WUbcr1LSXQeG_WlDA7u1FRFS_AVKFtkqrLU5iLmvEf5ZQFOk11pm64CS5KFpQh4WKi8Vrps_Y9pPNl_Dan")' }}></div>
                        </div>
                        <div className="text-sm font-medium">Trusted by 10,000+ Pendamping</div>
                    </div>
                </div>
            </div>
            {/* Right Section: Login Form */}
            <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 lg:px-24 bg-white dark:bg-background-dark overflow-y-auto">
                <div className="w-full max-w-[480px]">
                    {/* Header / Logo */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="mb-6 size-12 text-primary">
                            <svg className="w-full h-full drop-shadow-sm" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path className="opacity-50" d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
                                <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h1 className="tracking-tight text-[32px] font-bold leading-tight text-center pb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            SIPANDU PKH
                        </h1>
                        <p className="text-[#617589] dark:text-slate-400 text-base font-normal leading-normal text-center max-w-sm">
                            Sistem Informasi Pendampingan Terpadu
                        </p>
                    </div>
                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                                <span className="material-symbols-outlined text-lg">error</span>
                                <span>{error}</span>
                            </div>
                        )}
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[#111418] dark:text-white text-sm font-medium leading-normal" htmlFor="email">Email Address</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-[#617589] dark:text-slate-500 material-symbols-outlined select-none text-[20px]">mail</span>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe0e6] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-14 placeholder:text-[#9aa2ac] dark:placeholder:text-slate-500 pl-11 pr-4 text-base font-normal leading-normal transition-colors"
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    required={true}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[#111418] dark:text-white text-sm font-medium leading-normal" htmlFor="password">Password</label>
                            </div>
                            <div className="relative flex items-center group">
                                <span className="absolute left-4 text-[#617589] dark:text-slate-500 material-symbols-outlined select-none text-[20px]">lock</span>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe0e6] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-14 placeholder:text-[#9aa2ac] dark:placeholder:text-slate-500 pl-11 pr-12 text-base font-normal leading-normal transition-colors"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    required={true}
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    className="absolute right-3 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-[#617589] dark:text-slate-500 transition-colors flex items-center"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px] select-none">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>
                        {/* Action Row */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                                <input className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700" id="remember" type="checkbox" />
                                <label className="text-sm text-[#617589] dark:text-slate-400 select-none cursor-pointer" htmlFor="remember">Remember me</label>
                            </div>
                        </div>
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary hover:bg-blue-600 active:scale-[0.98] text-white text-base font-bold leading-normal tracking-wide rounded-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Login to Dashboard</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                    {/* Footer / Help */}
                    <div className="mt-8 pt-6 border-t border-[#f0f2f4] dark:border-slate-800 text-center space-y-4">
                        <p className="text-xs text-[#9aa2ac] dark:text-slate-600">
                            Copyright © 2025 PKH Management System.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
