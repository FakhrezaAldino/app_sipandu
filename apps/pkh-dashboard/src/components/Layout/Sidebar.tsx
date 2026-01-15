import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';


const Sidebar = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const navItems = [
        // Pendamping/All items
        { name: 'Dashboard', path: '/dashboard', icon: 'dashboard', section: 'Menu Utama', roles: ['pendamping'] },
        { name: 'Kelompok', path: '/kelompok', icon: 'groups', section: 'Menu Utama', roles: ['pendamping'] },
        { name: 'Absensi', path: '/absensi', icon: 'calendar_month', section: 'Menu Utama', roles: ['pendamping'] },

        // Admin items
        { name: 'Dashboard Admin', path: '/admin/dashboard', icon: 'admin_panel_settings', section: 'Menu Admin', roles: ['admin'] },
        { name: 'Pendamping', path: '/admin/pendamping', icon: 'manage_accounts', section: 'Menu Admin', roles: ['admin'] },
        { name: 'Kelompok', path: '/admin/kelompok', icon: 'groups', section: 'Menu Admin', roles: ['admin'] },

        // Monitoring (Mostly for Pendamping)
        { name: 'Permasalahan', path: '/permasalahan', icon: 'report_problem', section: 'Monitoring', roles: ['pendamping'] },
        { name: 'Graduasi', path: '/graduasi', icon: 'school', section: 'Monitoring', roles: ['pendamping'] },
        { name: 'Usaha', path: '/usaha', icon: 'storefront', section: 'Monitoring', roles: ['pendamping'] },
        { name: 'Prestasi', path: '/prestasi', icon: 'emoji_events', section: 'Monitoring', roles: ['pendamping'] },
    ];

    const filteredItems = navItems.filter(item => item.roles.includes(user?.role || 'pendamping'));

    return (
        <aside className="hidden lg:flex flex-col w-[260px] border-r border-[#e5e7eb] dark:border-[#2a3441] bg-white dark:bg-[#1a202c] overflow-y-auto">
            <div className="flex flex-col gap-1 p-4">
                {/* Section titles and items based on role */}
                {isAdmin ? (
                    <>
                        <div className="px-3 py-2 mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-gray-500">Administrasi</h3>
                        </div>
                        {filteredItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                                    isActive
                                        ? "text-primary bg-primary/10 dark:text-primary font-bold"
                                        : "text-[#617589] dark:text-gray-400 hover:bg-[#f3f4f6] dark:hover:bg-gray-800 hover:text-[#111418] dark:hover:text-white font-medium"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={clsx("material-symbols-outlined transition-colors", isActive ? "fill-1" : "group-hover:text-primary")}>
                                            {item.icon}
                                        </span>
                                        <span className="text-sm">{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </>
                ) : (
                    <>
                        <div className="px-3 py-2 mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-gray-500">Menu Utama</h3>
                        </div>

                        {filteredItems.filter(item => item.section === 'Menu Utama').map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                                    isActive
                                        ? "text-primary bg-primary/10 dark:text-primary font-bold"
                                        : "text-[#617589] dark:text-gray-400 hover:bg-[#f3f4f6] dark:hover:bg-gray-800 hover:text-[#111418] dark:hover:text-white font-medium"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={clsx("material-symbols-outlined transition-colors", isActive ? "fill-1" : "group-hover:text-primary")}>
                                            {item.icon}
                                        </span>
                                        <span className="text-sm">{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}

                        <div className="my-2 border-b border-[#e5e7eb] dark:border-[#2a3441] mx-3"></div>

                        <div className="px-3 py-2 mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-gray-500">Monitoring</h3>
                        </div>

                        {filteredItems.filter(item => item.section === 'Monitoring').map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                                    isActive
                                        ? "text-primary bg-primary/10 dark:text-primary font-bold"
                                        : "text-[#617589] dark:text-gray-400 hover:bg-[#f3f4f6] dark:hover:bg-gray-800 hover:text-[#111418] dark:hover:text-white font-medium"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={clsx("material-symbols-outlined transition-colors", isActive ? "fill-1" : "group-hover:text-primary")}>
                                            {item.icon}
                                        </span>
                                        <span className="text-sm">{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
