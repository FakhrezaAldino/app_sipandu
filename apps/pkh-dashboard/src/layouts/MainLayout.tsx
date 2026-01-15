
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';

const MainLayout = () => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
