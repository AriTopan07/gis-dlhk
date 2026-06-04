import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';

function FlashToast() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [currentFlash, setCurrentFlash] = useState(null);

    useEffect(() => {
        const msg = flash?.success || flash?.message || flash?.error;
        if (msg) {
            setCurrentFlash({
                text: msg,
                type: flash?.error ? 'error' : 'success',
            });
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || !currentFlash) return null;

    const isError = currentFlash.type === 'error';

    return (
        <div
            className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl max-w-sm
                ${isError ? 'bg-red-600 text-white' : 'bg-[#047857] text-white'}`}
        >
            <span className="shrink-0">
                {isError
                    ? <IconAlertCircle size={20} stroke={2} />
                    : <IconCheck size={20} stroke={2.5} />
                }
            </span>
            <span className="text-sm font-semibold leading-snug flex-1">
                {currentFlash.text}
            </span>
            <button
                onClick={() => setVisible(false)}
                className="shrink-0 opacity-75 hover:opacity-100 transition-opacity"
            >
                <IconX size={16} stroke={2} />
            </button>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const hasPermission = (permission) => {
        return user?.permissions?.includes(permission) || user?.roles?.includes('superadmin');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <FlashToast />

            <nav className="bg-white border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center">
                                    <img
                                        src="/img/logo-sidoarjo.webp"
                                        alt="Sidoarjo Logo"
                                        className="h-10 w-auto object-contain"
                                    />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                {hasPermission('view dashboard') && (
                                    <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                        Dashboard
                                    </NavLink>
                                )}
                                {hasPermission('view lokasi') && (
                                    <NavLink href={route('lokasi.index')} active={route().current('lokasi.*')}>
                                        Lokasi
                                    </NavLink>
                                )}
                                {(hasPermission('view ulasan') || user?.roles?.includes('kordinator')) && (
                                    <NavLink href={route('ulasan.index')} active={route().current('ulasan.*')}>
                                        Ulasan
                                    </NavLink>
                                )}
                                {hasPermission('view kordinators') && (
                                    <NavLink href={route('kordinators.index')} active={route().current('kordinators.*')}>
                                        Kordinator
                                    </NavLink>
                                )}
                                {hasPermission('view pengawas') && (
                                    <NavLink href={route('pengawas.index')} active={route().current('pengawas.*')}>
                                        Pengawas
                                    </NavLink>
                                )}
                                {hasPermission('view petugas') && (
                                    <NavLink href={route('petugas.index')} active={route().current('petugas.*')}>
                                        Petugas
                                    </NavLink>
                                )}
                                {hasPermission('view users') && (
                                    <NavLink href={route('users.index')} active={route().current('users.*')}>
                                        User
                                    </NavLink>
                                )}
                                {hasPermission('view roles') && (
                                    <NavLink href={route('roles.index')} active={route().current('roles.*')}>
                                        Role
                                    </NavLink>
                                )}
                                {hasPermission('view import') && (
                                    <NavLink href={route('import.index')} active={route().current('import.*')}>
                                        Import
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-bold leading-4 text-slate-600 transition duration-150 ease-in-out hover:text-slate-900 focus:outline-none"
                                            >
                                                {user.name}
                                                <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 transition duration-150 ease-in-out hover:bg-slate-50 hover:text-slate-500 focus:bg-slate-50 focus:text-slate-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        {hasPermission('view dashboard') && (
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                        )}
                        {hasPermission('view lokasi') && (
                            <ResponsiveNavLink href={route('lokasi.index')} active={route().current('lokasi.*')}>Lokasi</ResponsiveNavLink>
                        )}
                        {(hasPermission('view ulasan') || user?.roles?.includes('kordinator')) && (
                            <ResponsiveNavLink href={route('ulasan.index')} active={route().current('ulasan.*')}>Ulasan</ResponsiveNavLink>
                        )}
                        {hasPermission('view kordinators') && (
                            <ResponsiveNavLink href={route('kordinators.index')} active={route().current('kordinators.*')}>Kordinator</ResponsiveNavLink>
                        )}
                        {hasPermission('view pengawas') && (
                            <ResponsiveNavLink href={route('pengawas.index')} active={route().current('pengawas.*')}>Pengawas</ResponsiveNavLink>
                        )}
                        {hasPermission('view petugas') && (
                            <ResponsiveNavLink href={route('petugas.index')} active={route().current('petugas.*')}>Petugas</ResponsiveNavLink>
                        )}
                        {hasPermission('view users') && (
                            <ResponsiveNavLink href={route('users.index')} active={route().current('users.*')}>User</ResponsiveNavLink>
                        )}
                        {hasPermission('view roles') && (
                            <ResponsiveNavLink href={route('roles.index')} active={route().current('roles.*')}>Role</ResponsiveNavLink>
                        )}
                        {hasPermission('view import') && (
                            <ResponsiveNavLink href={route('import.index')} active={route().current('import.*')}>Import</ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-slate-100 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-bold text-black">{user.name}</div>
                            <div className="text-sm font-medium text-slate-500">{user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-transparent">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
