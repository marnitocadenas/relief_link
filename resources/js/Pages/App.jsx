import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/axios';
import { Icon, Button, Badge, Error, Empty } from '../Components/UI';
import InternationalPhoneInput, { COUNTRY_LIST } from '../Components/InternationalPhoneInput';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const title = (s = '') =>
    String(s)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const labels = {
    donations: 'Donations',
    requests: 'Support Requests',
    users: 'Members & Accounts',
};

const getRoleDashboard = (role) => {
    if (role === 'admin') return '/dashboard';
    if (role === 'staff') return '/staff/dashboard';
    if (role === 'donor') return '/donor/dashboard';
    if (role === 'beneficiary') return '/beneficiary/dashboard';
    return '/login';
};

function RouteGuard({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-8 font-bold text-[#2563EB]">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to={getRoleDashboard(user.role)} replace />;
    return children;
}

function NotificationsNavButton() {
    const { unreadCount } = useNotifications();
    return (
        <NavLink
            to="/notifications"
            className="relative inline-flex items-center justify-center p-2 rounded-xl text-[#2563EB] no-underline transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="View notifications page"
        >
            <Icon name="bell" size={20} />
            {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </NavLink>
    );
}

function Sidebar({ mobileOpen, setMobileOpen }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const getModulesForRole = (role) => {
        if (role === 'admin') {
            return [
                { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
                { name: 'User Management', path: '/users', icon: 'users' },
                { name: 'Donation Management', path: '/donations', icon: 'donation' },
                { name: 'Request Management', path: '/requests', icon: 'request' },
                { name: 'Matching Management', path: '/matches', icon: 'match' },
                { name: 'Category Management', path: '/admin/categories', icon: 'categories' },
                { name: 'Approval Management', path: '/admin/approvals', icon: 'approvals' },
                { name: 'Announcements', path: '/admin/announcements', icon: 'announcements' },
                { name: 'Activity Logs', path: '/activities', icon: 'activity' },
                { name: 'Reports & Analytics', path: '/reports', icon: 'report' },
            ];
        }
        if (role === 'staff') {
            return [
                { name: 'Dashboard', path: '/staff/dashboard', icon: 'dashboard' },
                { name: 'Request Verifications', path: '/staff/verifications', icon: 'approvals' },
                { name: 'Warehouse & Inventory', path: '/staff/inventory', icon: 'donation' },
                { name: 'Walk-In Relief Desk', path: '/staff/desk', icon: 'request' },
                { name: 'Support & Fulfillment', path: '/staff/handoffs', icon: 'fulfillment' },
                { name: 'Activity & Reports', path: '/staff/activity', icon: 'activity' },
            ];
        }
        if (role === 'donor') {
            return [
                { name: 'Dashboard', path: '/donor/dashboard', icon: 'dashboard' },
                { name: 'Make a Donation', path: '/donate', icon: 'donation' },
                { name: 'Browse Requests', path: '/donor/needs', icon: 'request' },
                { name: 'My Donations', path: '/donations', icon: 'donation' },
                { name: 'My Matches', path: '/matches', icon: 'match' },
                { name: 'Fulfillment Status', path: '/donor/fulfillment', icon: 'fulfillment' },
                { name: 'Donation History', path: '/donor/history', icon: 'history' },
            ];
        }
        if (role === 'beneficiary') {
            return [
                { name: 'Dashboard', path: '/beneficiary/dashboard', icon: 'dashboard' },
                { name: 'Create Request', path: '/request-help', icon: 'request' },
                { name: 'My Requests', path: '/requests', icon: 'request' },
                { name: 'My Matches', path: '/matches', icon: 'match' },
                { name: 'Support / Fulfillment', path: '/beneficiary/fulfillment', icon: 'fulfillment' },
                { name: 'Request History', path: '/beneficiary/history', icon: 'history' },
            ];
        }
        return [];
    };

    const modules = getModulesForRole(user.role);

    const sidebarContent = (
        <div className="flex h-full flex-col p-4">
            <Link
                to={getRoleDashboard(user.role)}
                className="mb-6 flex items-center gap-3 border-b border-white/20 pb-4 text-xl font-extrabold text-white no-underline"
            >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-blue-600 shadow-sm">
                    <Icon name="heart" size={22} />
                </div>
                <div className="flex flex-col">
                    <span className="leading-tight">ReliefLink</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Campus Exchange</span>
                </div>
            </Link>

            <nav className="space-y-1 flex-1 overflow-y-auto">
                {modules.map((m) => {
                    const isActive = location.pathname === m.path;
                    return (
                        <NavLink
                            key={m.name}
                            to={m.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition ${
                                isActive
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon name={m.icon} size={20} />
                            <span>{m.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <>
            <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-blue-100 lg:bg-blue-600 z-20">
                {sidebarContent}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative z-10 flex h-full w-72 flex-col bg-blue-600 border-r border-blue-100 shadow-2xl">
                        <div className="absolute right-3 top-3">
                            <button
                                className="p-2 text-white hover:bg-white/10 rounded-xl transition"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close menu"
                            >
                                <Icon name="close" size={20} />
                            </button>
                        </div>
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}

function UserDropdown() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    if (!user) return null;

    const handleLogout = async () => {
        setOpen(false);
        try {
            await logout();
        } catch (e) {
            console.error(e);
        }
        navigate('/login', { replace: true });
    };

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-white px-3 py-1.5 font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition group"
                aria-label="User menu"
                aria-expanded={open}
            >
                {user.profile_photo_url ? (
                    <img
                        src={user.profile_photo_url}
                        alt={user.name}
                        className="h-7 w-7 rounded-full object-cover border border-current"
                    />
                ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 group-hover:bg-blue-200 transition">
                        {initial}
                    </span>
                )}
                <span className="text-sm font-semibold hidden sm:block">{user.name}</span>
                <svg
                    className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <div className="dropdown absolute right-0 top-full z-50 w-48 p-1">
                    <NavLink
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                            `dropdown-item ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                        }
                    >
                        <Icon name="profile" size={16} />
                        <span>Profile</span>
                    </NavLink>
                    {user.role === 'admin' && (
                        <NavLink
                            to="/admin/settings"
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `dropdown-item ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                            }
                        >
                            <Icon name="settings" size={16} />
                            <span>Settings</span>
                        </NavLink>
                    )}
                    <div className="dropdown-divider" />
                    <button
                        onClick={handleLogout}
                        className="dropdown-item danger"
                    >
                        <Icon name="decline" size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
}

const publicNavigation = [
    { label: 'Home', href: '#top', icon: 'home' },
    { label: 'How It Works', href: '#how-it-works', icon: 'workflow' },
    { label: 'Categories', href: '#categories', icon: 'categories' },
    { label: 'About', href: '#about', icon: 'info' },
];

function Header({ setMobileOpen }) {
    const { user } = useAuth();
    const location = useLocation();
    const [publicMenuOpen, setPublicMenuOpen] = useState(false);

    // Hide top navigation header section on all authentication pages
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    if (isAuthPage) return null;

    return (
        <header
            className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-gray-300 shadow-sm shadow-gray-900/5 px-4 lg:px-8"
        >
            <div className="flex items-center gap-3">
                {user && (
                    <button
                        type="button"
                        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden transition"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open navigation menu"
                    >
                        <Icon name="menu" size={22} />
                    </button>
                )}
                {!user && (
                    <NavLink to="/" className="flex items-center gap-2.5 no-underline" aria-label="ReliefLink home">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
                            <Icon name="heart" size={22} />
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-gray-900 hidden sm:block">ReliefLink</span>
                    </NavLink>
                )}
            </div>

            {!user && (
                <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 lg:flex xl:gap-7" aria-label="Public navigation">
                    {publicNavigation.map(({ label, href, icon }) => (
                        <a key={label} href={href} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-blue-600 no-underline transition hover:bg-blue-50 hover:text-blue-700">
                            <Icon name={icon} size={15} />
                            <span>{label}</span>
                        </a>
                    ))}
                </nav>
            )}

            <div className={`flex items-center ${user ? 'gap-4 sm:gap-5' : 'gap-3'}`}>
                {user ? (
                    <>
                        <NotificationsNavButton />
                        <UserDropdown />
                    </>
                ) : (
                    <>
                        <div className="hidden items-center gap-2 sm:flex">
                            <NavLink to="/login" className="btn btn-ghost btn-sm">
                                <Icon name="profile" size={16} />
                                <span>Sign in</span>
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="btn btn-primary btn-sm"
                            >
                                Get started
                            </NavLink>
                        </div>
                        <button
                            type="button"
                            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden transition"
                            onClick={() => setPublicMenuOpen((open) => !open)}
                            aria-label="Toggle navigation menu"
                            aria-expanded={publicMenuOpen}
                        >
                            <Icon name={publicMenuOpen ? 'close' : 'menu'} size={22} />
                        </button>
                        {publicMenuOpen && (
                            <div className="dropdown absolute left-4 right-4 top-full z-50 p-2 lg:hidden">
                                <nav className="space-y-1" aria-label="Mobile public navigation">
                                    {publicNavigation.map(({ label, href, icon }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            onClick={() => setPublicMenuOpen(false)}
                                            className="dropdown-item"
                                        >
                                            <Icon name={icon} size={16} />
                                            {label}
                                        </a>
                                    ))}
                                </nav>
                                <div className="dropdown-divider" />
                                <div className="grid grid-cols-2 gap-2">
                                    <NavLink
                                        to="/login"
                                        onClick={() => setPublicMenuOpen(false)}
                                        className="dropdown-item justify-center"
                                    >
                                        Sign in
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        onClick={() => setPublicMenuOpen(false)}
                                        className="btn btn-primary btn-sm justify-center"
                                    >
                                        Get started
                                    </NavLink>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </header>
    );
}

function Home() {
    const { user, loading } = useAuth();
    // Do not render the public landing page while an existing session is being restored.
    if (loading) return <main className="min-h-screen bg-white" aria-busy="true" aria-label="Restoring your session"/>;
    if (user) return <Navigate to={getRoleDashboard(user.role)} replace />;

    const categories = [
        { name: 'Food & Meals', icon: 'food' },
        { name: 'Clothing & Apparel', icon: 'clothing' },
        { name: 'Educational & Books', icon: 'books' },
        { name: 'Medical & Health', icon: 'medical' },
        { name: 'Electronics & Tech', icon: 'electronics' },
        { name: 'Household & Bedding', icon: 'household' },
        { name: 'Personal Care & Hygiene', icon: 'hygiene' },
        { name: 'Emergency Aid', icon: 'emergency' },
    ];

    return (
        <main id="top" className="min-h-screen bg-white scroll-smooth">
            {/* HERO BANNER SECTION */}
            <section className="bg-[#2563EB] text-white">
                <div className="shell grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:items-center">
                    {/* Left Hero Content */}
                    <div className="lg:col-span-7 space-y-6">
                        <span className="inline-block rounded-full border border-white bg-white/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[.15em]">
                            CAMPUS RESOURCE EXCHANGE
                        </span>

                        <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl tracking-tight">
                            Useful things.<br />
                            Real impact.
                        </h1>

                        <p className="max-w-xl text-base sm:text-lg leading-relaxed opacity-95">
                            A practical, secure platform for campus donors and beneficiaries to turn available resources into meaningful, direct support.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <NavLink
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-xl border border-white bg-white px-6 py-3.5 text-sm font-extrabold text-[#2563EB] no-underline shadow-md hover:bg-[#2563EB] hover:text-white hover:border-white transition"
                            >
                                <span>Join ReliefLink</span>
                                <Icon name="plus" size={16} />
                            </NavLink>

                            <NavLink
                                to="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-white bg-[#2563EB] px-6 py-3.5 text-sm font-extrabold text-white no-underline hover:bg-white hover:text-[#2563EB] transition"
                            >
                                <span>Explore Needs</span>
                                <Icon name="requests" size={16} />
                            </NavLink>
                        </div>
                    </div>

                    {/* Right How It Works Container */}
                    <div id="how-it-works" className="lg:col-span-5 rounded-2xl border-2 border-white bg-white/10 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/30 pb-3 mb-6">
                            <p className="text-xs font-extrabold tracking-[.15em] uppercase">HOW IT WORKS</p>
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#2563EB] uppercase">
                                3 SIMPLE STEPS
                            </span>
                        </div>

                        <div className="space-y-6">
                            {[
                                { step: '1', title: 'List resources you can share', desc: 'Donors upload available items, food, textbooks, or supplies with availability details.' },
                                { step: '2', title: 'Submit and review support requests', desc: 'Students and campus beneficiaries request assistance with clear justification and urgency.' },
                                { step: '3', title: 'Arrange a safe handoff together', desc: 'ReliefLink coordinates meeting schedules and locations for safe, verified handoffs.' },
                            ].map((item) => (
                                <div className="relative flex gap-4 items-start" key={item.step}>
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-base font-extrabold text-[#2563EB] shadow">
                                        {item.step}
                                    </span>
                                    <div>
                                        <h3 className="font-extrabold text-base text-white">{item.title}</h3>
                                        <p className="mt-1 text-xs text-white opacity-85 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-white/30 pt-4 text-[10px] font-extrabold uppercase tracking-wide text-white"><span>Donate</span><span className="text-[#22C55E]">→</span><span>Verify</span><span className="text-[#22C55E]">→</span><span>Smart match</span><span className="text-[#22C55E]">→</span><span>Safe handoff</span><span className="text-[#22C55E]">→</span><span>Impact</span></div>
                    </div>
                </div>
            </section>

            {/* LIVE IMPACT STATISTICS STRIP */}
            <section className="border-b border-[#2563EB] bg-white py-8">
                <div className="shell grid gap-6 sm:grid-cols-3 text-center">
                    <div className="p-4 rounded-2xl border border-[#2563EB] bg-white">
                        <span className="text-2xl font-extrabold text-[#22C55E] block">100% Verified</span>
                        <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider mt-1 block">
                            Campus Identity & Admin Approval
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[#2563EB] bg-white">
                        <span className="text-2xl font-extrabold text-[#2563EB] block">Instant Matching</span>
                        <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider mt-1 block">
                            Urgency & Category Guided
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[#2563EB] bg-white">
                        <span className="text-2xl font-extrabold text-[#22C55E] block">Safe Handoffs</span>
                        <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider mt-1 block">
                            Scheduled Meeting Locations
                        </span>
                    </div>
                </div>
            </section>

            {/* KEY FEATURE CARDS SECTION */}
            <section id="about" className="shell py-14">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <p className="eyebrow">KEY PLATFORM VALUES</p>
                    <h2 className="page-title text-3xl">Designed for trust, transparency, and ease</h2>
                    <p className="page-copy mt-2">
                        ReliefLink connects student support needs directly with generous campus donors.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        ['Trusted requests', 'Administrators and verified systems review every request to ensure genuine campus need and safety.', 'check'],
                        ['Smarter matching', 'Availability windows, pickup locations, and urgency levels guide intelligent resource matching.', 'heart'],
                        ['Visible outcomes', 'Follow every resource donation through scheduling, two-party confirmation, and fulfillment.', 'fulfillment'],
                    ].map(([heading, copy, iconName]) => (
                        <article className="panel no-hover p-7 transition hover:border-[#22C55E] flex flex-col justify-between" key={heading}>
                            <div>
                                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#22C55E] bg-[#22C55E] text-white">
                                    <Icon name={iconName} size={24} />
                                </div>
                                <h3 className="mt-5 text-xl font-extrabold text-[#2563EB]">{heading}</h3>
                                <p className="mt-3 text-xs leading-relaxed font-semibold text-[#2563EB] opacity-90">{copy}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="border-t border-[#2563EB]/20 bg-[#2563EB]/5 py-14">
                <div className="shell">
                    <div className="mx-auto max-w-2xl text-center"><p className="eyebrow">PLATFORM IMPACT</p><h2 className="mt-2 text-3xl font-extrabold text-[#2563EB]">Verified impact, visible as it happens</h2><p className="mt-3 text-sm font-semibold leading-relaxed text-[#2563EB]/80">ReliefLink will publish live platform impact here as verified activity becomes available.</p></div>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        {['Donations & resources shared', 'Successful matches', 'Completed safe handoffs'].map((label, index) => <article key={label} className="panel p-5 text-center"><span className={`mx-auto grid h-11 w-11 place-items-center rounded-2xl ${index === 1 ? 'bg-[#22C55E] text-white' : 'border border-[#2563EB] bg-white text-[#2563EB]'}`}><Icon name={index === 0 ? 'donation' : index === 1 ? 'match' : 'fulfillment'} /></span><p className="mt-3 text-sm font-extrabold text-[#2563EB]">{label}</p><p className="mt-1 text-xs font-semibold text-[#2563EB]/65">Live verified data will appear here.</p></article>)}
                    </div>
                </div>
            </section>

            <section className="shell py-14">
                <div className="text-center"><p className="eyebrow">THE RELIEFLINK FLOW</p><h2 className="mt-2 text-3xl font-extrabold text-[#2563EB]">From generous offer to real support</h2></div>
                <div className="mt-8 grid gap-3 sm:grid-cols-5">{[['Donate', 'donation'], ['Verify', 'approvals'], ['Match', 'match'], ['Handoff', 'fulfillment'], ['Impact', 'check']].map(([label, icon], index) => <div key={label} className="relative text-center"><div className="panel no-hover min-h-32 place-items-center p-4 transition hover:-translate-y-1 hover:border-[#22C55E]"><div><span className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${index === 4 ? 'bg-[#22C55E] text-white' : 'bg-[#2563EB] text-white'}`}><Icon name={icon}/></span><p className="mt-3 text-sm font-extrabold text-[#2563EB]">{label}</p><p className="mt-1 text-[11px] font-semibold text-[#2563EB]/65">{['Share a resource', 'Confirm eligibility', 'Connect the right need', 'Coordinate safely', 'See the outcome'][index]}</p></div></div>{index < 4 && <span className="hidden sm:block absolute -right-2 top-1/2 z-10 -translate-y-1/2 text-xl font-extrabold text-[#22C55E]">→</span>}</div>)}</div>
            </section>

            {/* RESOURCE CATEGORIES SHOWCASE */}
            <section id="categories" className="border-t border-[#2563EB] bg-white py-14">
                <div className="shell">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB] pb-4 mb-8">
                        <div>
                            <p className="eyebrow">SUPPORT CATEGORIES</p>
                            <h2 className="text-2xl font-extrabold text-[#2563EB]">What you can donate or request</h2>
                        </div>
                        <NavLink to="/register" className="text-xs font-extrabold text-[#22C55E] underline hover:text-[#2563EB]">
                            Get Started Now &rarr;
                        </NavLink>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.name}
                                className="panel no-hover p-4 flex items-center gap-3 text-xs font-extrabold text-[#2563EB] hover:border-[#22C55E] transition cursor-pointer"
                            >
                                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#2563EB] bg-white text-[#2563EB]">
                                    <Icon name={cat.icon} size={16} />
                                </div>
                                <span>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION FOOTER BANNER */}
            <section className="bg-[#2563EB] text-[#FFFFFF] py-16">
                <div className="shell text-center max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to make a difference on campus?</h2>
                    <p className="text-base sm:text-lg opacity-90">
                        Join ReliefLink today whether you want to donate available supplies or request support.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                        <NavLink
                            to="/register"
                            className="rounded-xl border border-white bg-white px-7 py-3.5 text-sm font-extrabold text-[#2563EB] no-underline shadow-lg hover:bg-[#2563EB] hover:text-white hover:border-white transition"
                        >
                            Create an Account
                        </NavLink>
                        <NavLink
                            to="/login"
                            className="rounded-xl border border-white bg-[#2563EB] px-7 py-3.5 text-sm font-extrabold text-white no-underline hover:bg-white hover:text-[#2563EB] transition"
                        >
                            Sign In
                        </NavLink>
                    </div>
                </div>
            </section>
            <footer className="border-t border-white/30 bg-[#2563EB] text-white">
                <div className="shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2"><div className="flex items-center gap-3"><img src="/images/relieflink-logo.png" alt="ReliefLink logo" className="h-10 w-10 object-contain"/><span className="text-lg font-extrabold">ReliefLink</span></div><p className="mt-3 max-w-md text-sm font-semibold text-white/85">A secure campus resource exchange connecting generous donors with verified student needs.</p></div>
                    <div><p className="text-xs font-extrabold uppercase tracking-wider text-white/75">Navigation</p><div className="mt-3 grid gap-2 text-sm font-bold">{[['Home', '#top'], ['How It Works', '#how-it-works'], ['Categories', '#categories'], ['About', '#about']].map(([label, href]) => <a key={label} href={href} className="text-white no-underline hover:text-[#22C55E]">{label}</a>)}</div></div>
                    <div><p className="text-xs font-extrabold uppercase tracking-wider text-white/75">Support</p><div className="mt-3 grid gap-2 text-sm font-bold"><NavLink to="/login" className="text-white no-underline hover:text-[#22C55E]">Help</NavLink><NavLink to="/login" className="text-white no-underline hover:text-[#22C55E]">Contact</NavLink><NavLink to="/login" className="text-white no-underline hover:text-[#22C55E]">Privacy Policy</NavLink><NavLink to="/login" className="text-white no-underline hover:text-[#22C55E]">Terms of Service</NavLink></div></div>
                </div>
                <div className="border-t border-white/30"><div className="shell flex flex-wrap justify-between gap-2 py-4 text-xs font-semibold text-white/80"><span>© {new Date().getFullYear()} ReliefLink</span><span>Campus Exchange</span></div></div>
            </footer>
        </main>
    );
}

function CountrySelect({ id, value, onChange, disabled = false }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef(null);
    const selected = COUNTRY_LIST.find((country) => country.name === value);
    const options = COUNTRY_LIST.filter((country) =>
        country.name.toLowerCase().includes(query.toLowerCase()) || country.code.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (disabled) setOpen(false);
    }, [disabled]);

    useEffect(() => {
        const close = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const choose = (country) => {
        onChange(country.name);
        setQuery('');
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="relative mt-1">
            <button
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={disabled}
                onClick={() => {
                    if (!disabled) setOpen((current) => !current);
                }}
                className="field flex w-full items-center justify-between text-left text-xs py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5"
            >
                <span className={selected ? 'text-[#2563EB]' : 'text-[#2563EB]/70'}>
                    {selected ? `${selected.flag} ${selected.name}` : 'Select your country'}
                </span>
                <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>
            {open && !disabled && (
                <div role="listbox" aria-label="Select your country" className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-xl border border-[#2563EB]/20 bg-white shadow-xl">
                    <div className="border-b border-[#2563EB]/15 p-2">
                        <input
                            autoFocus
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search country"
                            className="field w-full py-1.5 text-xs font-semibold"
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                        {options.map((country) => (
                            <button
                                key={country.code}
                                type="button"
                                role="option"
                                aria-selected={country.name === value}
                                onClick={() => choose(country)}
                                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs font-semibold transition ${
                                    country.name === value ? 'bg-[#22C55E] text-white' : 'text-[#2563EB] hover:bg-[#2563EB]/10'
                                }`}
                            >
                                <span>{country.flag} {country.name}</span>
                                <span className="text-[10px] font-bold opacity-75">{country.dialCode}</span>
                            </button>
                        ))}
                        {options.length === 0 && <p className="px-3 py-2 text-xs font-semibold text-[#2563EB]/70">No countries found.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

function Auth({ register = false }) {
    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Mode: 'login' | 'register' | 'forgot-email' | 'forgot-otp' | 'forgot-reset' | 'forgot-success'
    const [mode, setMode] = useState(register ? 'register' : 'login');

    const [f, setF] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        country: '',
        country_code: '',
        campus_id: '',
        address: '',
        student_id_number: '',
        school_email: '',
        department: '',
        course: '',
        year_level: '',
        contact_number: '',
    });
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    // Each state is sourced from Laravel, never from a local list of accounts.
    const [uniqueness, setUniqueness] = useState({
        name: { status: 'idle', message: '' },
        campus_id: { status: 'idle', message: '' },
        student_id_number: { status: 'idle', message: '' },
        contact_number: { status: 'idle', message: '' },
        email: { status: 'idle', message: '' },
    });

    // Password Visibility Toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP States
    const [otpCode, setOtpCode] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const otpInputRefs = useRef([]);
    const [otpTimer, setOtpTimer] = useState(0);
    const [demoOtp, setDemoOtp] = useState(null);

    // UI Feedback & Errors
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);

    // Registration Password Security Calculations
    const regPwd = f.password || '';
    const regConfirmPwd = f.password_confirmation || '';
    const regNameStr = f.name || '';
    const regEmailStr = f.email || '';
    const regEmailPrefix = regEmailStr.split('@')[0] || '';
    const regNameParts = regNameStr.toLowerCase().split(' ').filter(p => p.length >= 3);

    const regHasLength = regPwd.length >= 8 && regPwd.length <= 64;
    const regHasUpper = /[A-Z]/.test(regPwd);
    const regHasLower = /[a-z]/.test(regPwd);
    const regHasNumber = /[0-9]/.test(regPwd);
    const regHasSpecial = /[!@#$%^&*()_\-+=\[\]{}|:;,.?]/.test(regPwd);
    const regNoSpaces = regPwd.length > 0 && regPwd.trim() === regPwd;
    const regWeakList = ['password', '12345678', 'qwerty', 'admin', 'welcome', '123456', 'password123', 'relieflink', 'letmein'];
    const regNotWeak = !regWeakList.includes(regPwd.toLowerCase());

    let regContainsPersonal = false;
    if (regPwd.length > 0) {
        if (regEmailPrefix.length >= 3 && regPwd.toLowerCase().includes(regEmailPrefix.toLowerCase())) {
            regContainsPersonal = true;
        }
        for (const part of regNameParts) {
            if (regPwd.toLowerCase().includes(part)) {
                regContainsPersonal = true;
                break;
            }
        }
    }
    const regNoPersonal = regPwd.length > 0 && !regContainsPersonal;
    const regMatchesConfirm = regConfirmPwd.length > 0 && regConfirmPwd === regPwd;
    const regIsPasswordValid = regHasLength && regHasUpper && regHasLower && regHasNumber && regHasSpecial && regNoSpaces && regNotWeak && regNoPersonal;

    const nameTrimmed = regNameStr.trim();
    const nameWords = nameTrimmed.split(/[\s,]+/).filter((w) => w.length >= 1);
    const regNameValid = nameWords.length >= 2
        && /^[A-Za-zÀ-ÿ\s,'\-\.]+$/.test(nameTrimmed)
        && nameTrimmed.length >= 3
        && nameTrimmed.length <= 255;
    const regRoleValid = ['donor', 'beneficiary'].includes(f.role);
    const regCountryValid = (f.country || '').trim().length > 0
        && (f.country || '').trim().toLowerCase() !== 'select your country'
        && (f.country || '').trim().length <= 100;

    // Beneficiary fields validation
    const regStudentIdTrimmed = (f.student_id_number || '').trim();
    const regStudentIdValid = regStudentIdTrimmed.length >= 3 && regStudentIdTrimmed.length <= 50;
    const regSchoolEmailTrimmed = (f.school_email || '').trim();
    const regSchoolEmailValid = regSchoolEmailTrimmed.length > 0
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regSchoolEmailTrimmed);
    const regDepartmentValid = (f.department || '').trim().length > 0;
    const regCourseValid = (f.course || '').trim().length > 0;
    const regYearLevelValid = (f.year_level || '').trim().length > 0;

    // Donor fields validation
    const regAddressValid = (f.address || '').trim().length > 0;
    const regIdTrimmed = (f.campus_id || '').trim();
    const regIdValid = regIdTrimmed.length >= 3 && regIdTrimmed.length <= 50;

    // Contact number validation
    const regContactNumber = f.contact_number || '';
    const regContactValid = isPhoneValid === true && regContactNumber.trim().length >= 7;

    // Email validation
    const regEmailValid = regEmailStr.trim() !== ''
        && regEmailStr.trim().length <= 255
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmailStr.trim());

    // Uniqueness states from server
    const regNameAvailable = uniqueness.name.status === 'available';
    const regIdAvailable = uniqueness.campus_id.status === 'available';
    const regStudentIdAvailable = uniqueness.student_id_number?.status === 'available';
    const regContactAvailable = uniqueness.contact_number.status === 'available';
    const regEmailAvailable = uniqueness.email.status === 'available';

    // Strict Sequential Field Progression Gates
    // 1. Account Type is enabled on form load. Country requires Account Type selected.
    const regCanUseCountry = regRoleValid;

    // 2. Beneficiary sequence: Country -> Student ID -> School Email -> Department -> Course -> Year Level -> Contact
    const regCanUseStudentId = f.role === 'beneficiary' && regCanUseCountry && regCountryValid;
    const regCanUseSchoolEmail = regCanUseStudentId && regStudentIdValid && regStudentIdAvailable;
    const regCanUseDepartment = regCanUseSchoolEmail && regSchoolEmailValid;
    const regCanUseCourse = regCanUseDepartment && regDepartmentValid;
    const regCanUseYearLevel = regCanUseCourse && regCourseValid;

    // 3. Donor sequence: Country -> Address -> Valid ID -> Contact
    const regCanUseAddress = f.role === 'donor' && regCanUseCountry && regCountryValid;
    const regCanUseValidId = regCanUseAddress && regAddressValid;

    // 4. Contact Number Gate
    const regCanUseContact = f.role === 'beneficiary'
        ? (regCanUseYearLevel && regYearLevelValid)
        : f.role === 'donor'
            ? (regCanUseValidId && regIdValid && regIdAvailable)
            : false;

    // 5. Downstream Common Gates
    const regCanUseEmail = regCanUseContact && regContactValid && regContactAvailable;
    const regCanUsePassword = regCanUseEmail && regEmailValid && regEmailAvailable;
    const regCanUseConfirm = regCanUsePassword && regIsPasswordValid;
    const regIsFormValid = regNameValid && regNameAvailable && regCanUseConfirm && regMatchesConfirm;

    const duplicateCandidates = {
        name: regNameValid ? nameTrimmed : '',
        campus_id: (f.role === 'donor' && regCanUseValidId && regIdValid) ? regIdTrimmed : '',
        student_id_number: (f.role === 'beneficiary' && regCanUseStudentId && regStudentIdValid) ? regStudentIdTrimmed : '',
        contact_number: (regCanUseContact && regContactValid) ? regContactNumber.trim() : '',
        email: (regCanUseEmail && regEmailValid) ? regEmailStr.trim() : '',
    };
    const duplicateCandidateKey = JSON.stringify(duplicateCandidates);

    const handleRegistrationNameChange = (e) => {
        setF((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    };

    // Debounce real-time identity checks so every completed field is verified by
    // the API, while typing stays responsive. Cancelling stale responses avoids
    // an older value overwriting the state of a newer value.
    useEffect(() => {
        const candidates = JSON.parse(duplicateCandidateKey);
        let cancelled = false;
        const fields = Object.keys(candidates);

        setUniqueness((previous) => {
            const next = { ...previous };
            fields.forEach((field) => {
                const value = candidates[field];
                const old = previous[field];
                if (!value) next[field] = { status: 'idle', message: '' };
                else if (old.checkedValue !== value) next[field] = { status: 'checking', message: '', checkedValue: value };
            });
            return next;
        });

        const timer = setTimeout(async () => {
            await Promise.all(fields.filter((field) => candidates[field]).map(async (field) => {
                const value = candidates[field];
                try {
                    const { data } = await api.post('/register/check-availability', { field, value, country: f.country });
                    if (!cancelled) {
                        setUniqueness((previous) => ({
                            ...previous,
                            [field]: { status: data.available ? 'available' : 'taken', message: data.message || '', checkedValue: value },
                        }));
                    }
                } catch (requestError) {
                    if (!cancelled) {
                        const message = requestError.response?.data?.errors?.value?.[0]
                            || 'Could not verify this value. Please try again.';
                        setUniqueness((previous) => ({
                            ...previous,
                            [field]: { status: 'error', message, checkedValue: value },
                        }));
                    }
                }
            }));
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [duplicateCandidateKey]);

    const renderDuplicateStatus = (field) => {
        const state = uniqueness[field];
        if (!state || state.status === 'idle' || state.status === 'available') return null;
        if (state.status === 'checking') {
            return <p className="mt-1 text-[11px] font-semibold text-[#2563EB]/70">Checking availability…</p>;
        }
        return <p className="mt-1 text-[11px] font-semibold text-red-600">{state.message}</p>;
    };

    const handleRegistrationRoleChange = (e) => {
        const newRole = e.target.value;
        setF((prev) => ({
            ...prev,
            role: newRole,
            country: '',
            country_code: '',
            campus_id: '',
            address: '',
            student_id_number: '',
            school_email: '',
            department: '',
            course: '',
            year_level: '',
            contact_number: '',
            email: '',
            password: '',
            password_confirmation: '',
        }));
        setIsPhoneValid(false);
        setUniqueness((previous) => ({
            ...previous,
            campus_id: { status: 'idle', message: '' },
            student_id_number: { status: 'idle', message: '' },
            contact_number: { status: 'idle', message: '' },
            email: { status: 'idle', message: '' },
        }));
    };

    const handleRegistrationCountryChange = (val) => {
        setF((prev) => ({
            ...prev,
            country: val,
            country_code: COUNTRY_LIST.find((country) => country.name === val)?.code || prev.country_code,
        }));
    };

    const handleRegistrationIdChange = (e) => {
        setF((prev) => ({
            ...prev,
            campus_id: e.target.value,
        }));
    };

    const handleRegistrationFieldChange = (field, value) => {
        setF((prev) => ({ ...prev, [field]: value }));
    };

    const handleRegistrationPhoneChange = (e164Value, valid) => {
        setF((prev) => ({
            ...prev,
            contact_number: e164Value,
        }));
        setIsPhoneValid(valid);
    };

    const handleRegistrationEmailChange = (e) => {
        setF((prev) => ({
            ...prev,
            email: e.target.value,
        }));
    };

    const handleRegistrationPasswordChange = (e) => {
        setF((prev) => ({
            ...prev,
            password: e.target.value,
        }));
    };

    const handleRegistrationConfirmPasswordChange = (e) => {
        setF((prev) => ({
            ...prev,
            password_confirmation: e.target.value,
        }));
    };

    let regPwdScore = 0;
    if (regPwd.length >= 8) regPwdScore += 1;
    if (regHasUpper && regHasLower) regPwdScore += 1;
    if (regHasNumber && regHasSpecial) regPwdScore += 1;
    if (regIsPasswordValid) regPwdScore += 1;

    let regStrengthLabel = 'Weak';
    if (regPwdScore === 2) regStrengthLabel = 'Fair';
    if (regPwdScore === 3) regStrengthLabel = 'Strong';
    if (regPwdScore === 4) regStrengthLabel = 'Very Strong';

    useEffect(() => {
        const targetMode = register ? 'register' : 'login';
        setMode(targetMode);
        setError('');
        setSuccessMessage('');

        // Check if user saved email with Remember Me
        const rememberedEmail = localStorage.getItem('relieflink_remembered_email');
        if (rememberedEmail && targetMode === 'login') {
            setRemember(true);
            setF({
                name: '',
                email: rememberedEmail,
                password: '',
                password_confirmation: '',
                role: '',
                country: '',
                campus_id: '',
                address: '',
                student_id_number: '',
                school_email: '',
                department: '',
                course: '',
                year_level: '',
                contact_number: '',
            });
        } else {
            setRemember(false);
            setF({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: '',
                country: '',
                campus_id: '',
                address: '',
                student_id_number: '',
                school_email: '',
                department: '',
                course: '',
                year_level: '',
                contact_number: '',
            });
        }
    }, [register]);

    // 60-Second Cooldown Timer for OTP
    useEffect(() => {
        let interval = null;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [otpTimer]);

    if (authLoading) return <main className="min-h-screen bg-white" aria-busy="true" aria-label="Restoring your session"/>;
    if (user) return <Navigate to={getRoleDashboard(user.role)} replace />;

    // Handle Login & Register Submit
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (mode === 'register' && !regIsFormValid) {
            setError('Please complete each registration field in order before creating your account.');
            setLoading(false);
            return;
        }

        if (mode === 'register') {
            if (f.password !== f.password_confirmation) {
                setError('Passwords do not match. Please check and try again.');
                setLoading(false);
                return;
            }
            if (f.password.length < 8) {
                setError('Password must be at least 8 characters long.');
                setLoading(false);
                return;
            }
        }

        const submitPayload = mode === 'register' ? {
            name: f.name.trim(),
            email: f.email.trim(),
            password: f.password,
            password_confirmation: f.password_confirmation,
            role: f.role,
            country: f.country.trim() || null,
            country_code: f.country_code?.trim() || null,
            ...(f.role === 'donor' ? {
                address: f.address.trim(),
                campus_id: f.campus_id.trim(),
            } : {
                student_id_number: f.student_id_number.trim(),
                school_email: f.school_email.trim(),
                department: f.department.trim(),
                course: f.course.trim(),
                year_level: f.year_level.trim(),
            }),
            contact_number: f.contact_number.trim(),
        } : f;

        try {
            const u = await login(submitPayload, mode === 'register');
            if (remember && mode === 'login') {
                localStorage.setItem('relieflink_remembered_email', f.email);
            } else {
                localStorage.removeItem('relieflink_remembered_email');
            }
            navigate(getRoleDashboard(u.role), { replace: true });
        } catch (e) {
            const validationErrors = e.response?.data?.errors;
            if (mode === 'register' && validationErrors) {
                const messages = {
                    name: validationErrors.name?.[0],
                    campus_id: validationErrors.campus_id?.[0],
                    contact_number: validationErrors.contact_number?.[0],
                    email: validationErrors.email?.[0],
                };
                setUniqueness((previous) => {
                    const next = { ...previous };
                    Object.entries(messages).forEach(([field, message]) => {
                        if (message) next[field] = { status: 'taken', message, checkedValue: f[field] };
                    });
                    return next;
                });
            }
            setError(e.response?.data?.message || 'Unable to authenticate. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        const numeric = value.replace(/\D/g, '');
        if (!numeric) {
            const newDigits = [...otpDigits];
            newDigits[index] = '';
            setOtpDigits(newDigits);
            setOtpCode(newDigits.join(''));
            return;
        }

        const digit = numeric.slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);
        setOtpCode(newDigits.join(''));

        if (index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otpDigits[index] && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasteData) {
            const digitsArray = pasteData.split('');
            const newDigits = ['', '', '', '', '', ''];
            digitsArray.forEach((d, i) => {
                if (i < 6) newDigits[i] = d;
            });
            setOtpDigits(newDigits);
            setOtpCode(newDigits.join(''));

            const focusIndex = Math.min(digitsArray.length, 5);
            otpInputRefs.current[focusIndex]?.focus();
        }
    };

    // Step 1: Send OTP to Registered Email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!f.email) {
            setError('Please enter your registered email address.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await api.post('/forgot-password/send-otp', { email: f.email });
            setSuccessMessage(res.data.message || 'OTP verification code sent.');
            if (res.data.otp_demo) {
                setDemoOtp(res.data.otp_demo);
            }
            setMode('forgot-otp');
            setOtpTimer(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP code. Ensure email exists.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP Code
    const handleResendOtp = async () => {
        if (otpTimer > 0) return;
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await api.post('/forgot-password/send-otp', { email: f.email });
            setSuccessMessage(res.data.message || 'New OTP verification code sent.');
            if (res.data.otp_demo) {
                setDemoOtp(res.data.otp_demo);
            }
            setOtpTimer(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP code.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otpCode || otpCode.length !== 6) {
            setError('Please enter a valid 6-digit OTP code.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await api.post('/forgot-password/verify-otp', {
                email: f.email,
                otp: otpCode,
            });
            setSuccessMessage(res.data.message || 'OTP verified successfully.');
            setMode('forgot-reset');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP code.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (f.password !== f.password_confirmation) {
            setError('New password and confirmation do not match.');
            return;
        }
        if (f.password.length < 8) {
            setError('New password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await api.post('/forgot-password/reset-password', {
                email: f.email,
                otp: otpCode,
                password: f.password,
                password_confirmation: f.password_confirmation,
            });
            setSuccessMessage(res.data.message || 'Password reset successfully.');
            setMode('forgot-success');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthScore = (pwd) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        return score;
    };

    const pwdScore = getPasswordStrengthScore(f.password);

    return (
        <main className="grid min-h-screen lg:grid-cols-2 text-[#2563EB]">
            {/* Left Hero Side Banner */}
            <aside className="hidden bg-[#2563EB] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/relieflink-logo.png"
                            alt="ReliefLink Emblem"
                            className="h-12 w-12 rounded-xl border border-white object-cover shadow"
                        />
                        <div>
                            <p className="text-xl font-extrabold text-white leading-none">ReliefLink</p>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white mt-1">
                                Campus Exchange
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 space-y-4 max-w-md">
                        <span className="inline-block rounded-full border border-white bg-[#2563EB] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                            VERIFIED COMMUNITY EXCHANGE
                        </span>
                        <h1 className="text-4xl font-extrabold leading-tight text-white">
                            Small acts create a stronger campus.
                        </h1>
                        <p className="text-sm font-semibold leading-relaxed text-white">
                            Connecting students, faculty, and campus donors to share resources, fulfill essential aid requests, and coordinate safe handoffs.
                        </p>
                    </div>
                </div>

                <div className="border-t border-white pt-6 text-xs font-extrabold text-white flex items-center justify-between">
                    <span>© {new Date().getFullYear()} ReliefLink System</span>
                    <span>100% Campus Verified</span>
                </div>
            </aside>

            {/* Right Auth Form Section */}
            <section className="flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md space-y-6">
                    {/* Success Banner */}
                    {successMessage && (
                        <div className="rounded-xl border border-[#22C55E] bg-white p-3.5 text-xs font-extrabold text-[#22C55E] flex items-center gap-2">
                            <Icon name="check" size={16} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Mode 1: LOGIN */}
                    {mode === 'login' && (
                        <form className="panel no-hover space-y-5 bg-white p-6 shadow-lg sm:p-8" onSubmit={handleAuthSubmit} autoComplete="off">
                            <div className="text-center">
                                <p className="eyebrow">WELCOME BACK</p>
                                <h1 className="page-title text-2xl font-extrabold text-[#2563EB]">
                                    Sign in to ReliefLink
                                </h1>
                                <p className="page-copy text-xs font-semibold text-[#2563EB] mt-1 max-w-xs mx-auto">
                                    Enter your registered email and password to access your dashboard.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="auth_email" className="block text-xs font-bold text-[#2563EB]">
                                        Email address <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <input
                                        id="auth_email"
                                        required
                                        type="email"
                                        autoComplete="off"
                                        placeholder="Enter your email address"
                                        className="field mt-1 text-xs font-semibold"
                                        value={f.email}
                                        onChange={(e) => setF({ ...f, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="auth_password" className="block text-xs font-bold text-[#2563EB]">
                                        Password <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="auth_password"
                                            required
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Enter your password"
                                            className="field text-xs font-semibold"
                                            value={f.password}
                                            onChange={(e) => setF({ ...f, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[#2563EB] select-none">
                                            <input
                                                type="checkbox"
                                                className="h-3.5 w-3.5 rounded border-[#2563EB] text-[#2563EB] focus:ring-[#22C55E]"
                                                checked={remember}
                                                onChange={(e) => setRemember(e.target.checked)}
                                            />
                                            <span>Remember Me</span>
                                        </label>
                                        <button
                                            type="button"
                                            className="text-xs font-bold text-[#2563EB] hover:text-[#22C55E] transition no-underline bg-transparent border-0 p-0 cursor-pointer"
                                            onClick={() => {
                                                setMode('forgot-email');
                                                setError('');
                                                setSuccessMessage('');
                                                setF((prev) => ({ ...prev, password: '', password_confirmation: '' }));
                                            }}
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                </div>

                                {error && <Error>{error}</Error>}

                                <Button type="submit" loading={loading} className="w-full py-3 text-xs font-extrabold">
                                    Sign In
                                </Button>
                            </div>

                            <div className="pt-4 border-t border-[#2563EB] text-center text-xs font-bold text-[#2563EB]">
                                Don't have an account yet?{' '}
                                <button
                                    type="button"
                                    className="font-bold text-[#22C55E] hover:text-[#2563EB] transition no-underline bg-transparent border-0 p-0"
                                    onClick={() => {
                                        setMode('register');
                                        setError('');
                                        setSuccessMessage('');
                                        setF({
                                            name: '',
                                            email: '',
                                            password: '',
                                            password_confirmation: '',
                                            role: '',
                                            country: '',
                                            campus_id: '',
                                            address: '',
                                            student_id_number: '',
                                            school_email: '',
                                            department: '',
                                            course: '',
                                            year_level: '',
                                            contact_number: '',
                                        });
                                    }}
                                >
                                    Create an Account
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Mode 2: REGISTER */}
                    {mode === 'register' && (
                        <form className="panel no-hover space-y-4 bg-white p-6 shadow-lg sm:p-8" noValidate onSubmit={handleAuthSubmit}>
                            <div className="text-center">
                                <p className="eyebrow">JOIN RELIEFLINK</p>
                                <h1 className="page-title text-2xl font-extrabold text-[#2563EB]">
                                    Create your account
                                </h1>
                                <p className="page-copy text-xs text-[#2563EB] opacity-80 mt-1 max-w-xs mx-auto">
                                    Register as a campus donor or beneficiary to start sharing resources.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="reg_name" className="block text-xs font-bold text-[#2563EB]">
                                        Full Name <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <input
                                        id="reg_name"
                                        required
                                        type="text"
                                        placeholder="Enter your first name and last name"
                                        className={`field mt-1 text-xs py-2 font-semibold ${uniqueness.name.status === 'taken' || uniqueness.name.status === 'error' ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                        value={f.name}
                                        onChange={handleRegistrationNameChange}
                                        maxLength={255}
                                    />
                                    {f.name.length > 0 && !regNameValid && (
                                        <p className="text-[11px] font-semibold text-[#2563EB]/70 mt-1">
                                            Please enter both your first name and last name (e.g., Juan Dela Cruz).
                                        </p>
                                    )}
                                    {renderDuplicateStatus('name')}
                                </div>

                                <div>
                                    <label htmlFor="reg_role" className="block text-xs font-bold text-[#2563EB]">
                                        Account Type <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <select
                                        id="reg_role"
                                        className="field mt-1 text-xs py-2 font-semibold"
                                        value={f.role}
                                        onChange={handleRegistrationRoleChange}
                                        required
                                    >
                                        <option value="" disabled hidden>Select account type</option>
                                        <option value="beneficiary">Request Support (Beneficiary)</option>
                                        <option value="donor">Make a Donation (Donor)</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="reg_country" className="block text-xs font-bold text-[#2563EB]">
                                        Country <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <CountrySelect
                                        id="reg_country"
                                        value={f.country}
                                        onChange={handleRegistrationCountryChange}
                                        disabled={!regCanUseCountry}
                                    />
                                </div>

                                {f.role === 'donor' && (
                                    <>
                                        <div>
                                            <label htmlFor="reg_address" className="block text-xs font-bold text-[#2563EB]">Address <span className="text-[#22C55E]">*</span></label>
                                            <input id="reg_address" type="text" placeholder="Enter your address" className={`field mt-1 text-xs py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5`} value={f.address} onChange={(e) => handleRegistrationFieldChange('address', e.target.value)} disabled={!regCanUseAddress} maxLength={255} required />
                                        </div>
                                        <div>
                                            <label htmlFor="reg_campus_id" className="block text-xs font-bold text-[#2563EB]">Valid ID Number <span className="text-[#22C55E]">*</span></label>
                                            <input id="reg_campus_id" type="text" placeholder="Enter your valid ID number" className={`field mt-1 text-xs py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5 ${uniqueness.campus_id.status === 'taken' || uniqueness.campus_id.status === 'error' ? 'border-red-500 ring-1 ring-red-500' : ''}`} value={f.campus_id} onChange={handleRegistrationIdChange} disabled={!regCanUseValidId} maxLength={50} required />
                                            {renderDuplicateStatus('campus_id')}
                                        </div>
                                    </>
                                )}

                                {f.role === 'beneficiary' && (
                                    <>
                                        <div>
                                            <label htmlFor="reg_student_id" className="block text-xs font-bold text-[#2563EB]">Student ID Number <span className="text-[#22C55E]">*</span></label>
                                            <input id="reg_student_id" type="text" placeholder="Enter your student ID number" className={`field mt-1 text-xs py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5 ${uniqueness.student_id_number?.status === 'taken' || uniqueness.student_id_number?.status === 'error' ? 'border-red-500 ring-1 ring-red-500' : ''}`} value={f.student_id_number} onChange={(e) => handleRegistrationFieldChange('student_id_number', e.target.value)} disabled={!regCanUseStudentId} maxLength={50} required />
                                            {renderDuplicateStatus('student_id_number')}
                                        </div>
                                        <div>
                                            <label htmlFor="reg_school_email" className="block text-xs font-bold text-[#2563EB]">School Email Address <span className="text-[#22C55E]">*</span></label>
                                            <input id="reg_school_email" type="email" placeholder="Enter your school email address" className={`field mt-1 text-xs py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5`} value={f.school_email} onChange={(e) => handleRegistrationFieldChange('school_email', e.target.value)} disabled={!regCanUseSchoolEmail} maxLength={255} required />
                                        </div>
                                        <div>
                                            <label htmlFor="reg_department" className="block text-xs font-bold text-[#2563EB]">Department <span className="text-[#22C55E]">*</span></label>
                                            <input id="reg_department" type="text" placeholder="Enter your department" className={`field mt-1 text-xs py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5`} value={f.department} onChange={(e) => handleRegistrationFieldChange('department', e.target.value)} disabled={!regCanUseDepartment} maxLength={255} required />
                                        </div>
                                        <div>
                                            <label htmlFor="reg_course" className="block text-xs font-bold text-[#2563EB]">Course <span className="text-[#22C55E]">*</span></label>
                                            <input id="reg_course" type="text" placeholder="Enter your course" className={`field mt-1 text-xs py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5`} value={f.course} onChange={(e) => handleRegistrationFieldChange('course', e.target.value)} disabled={!regCanUseCourse} maxLength={255} required />
                                        </div>
                                        <div>
                                            <label htmlFor="reg_year_level" className="block text-xs font-bold text-[#2563EB]">Year Level <span className="text-[#22C55E]">*</span></label>
                                            <input id="reg_year_level" type="text" placeholder="e.g., 1st Year" className={`field mt-1 text-xs py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5`} value={f.year_level} onChange={(e) => handleRegistrationFieldChange('year_level', e.target.value)} disabled={!regCanUseYearLevel} maxLength={50} required />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label htmlFor="reg_contact_number" className="block text-xs font-bold text-[#2563EB]">
                                        Contact Number <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <InternationalPhoneInput
                                        id="reg_contact_number"
                                        value={f.contact_number}
                                        onChange={handleRegistrationPhoneChange}
                                        disabled={!regCanUseContact}
                                        defaultCountry={COUNTRY_LIST.find((country) => country.name === f.country)?.code || 'PH'}
                                        placeholder="Enter contact number"
                                    />
                                    {renderDuplicateStatus('contact_number')}
                                </div>

                                <div>
                                    <label htmlFor="reg_email" className="block text-xs font-bold text-[#2563EB]">
                                        Email Address <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <input
                                        id="reg_email"
                                        required
                                        type="email"
                                        placeholder="Enter your email address"
                                        className={`field mt-1 text-xs py-2 font-semibold ${uniqueness.email.status === 'taken' || uniqueness.email.status === 'error' ? 'border-red-500 ring-1 ring-red-500' : ''} ${!regCanUseEmail ? 'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5' : ''}`}
                                        value={f.email}
                                        onChange={handleRegistrationEmailChange}
                                        disabled={!regCanUseEmail}
                                        maxLength={255}
                                    />
                                    {renderDuplicateStatus('email')}
                                </div>

                                <div>
                                    <label htmlFor="reg_password" className="block text-xs font-bold text-[#2563EB]">
                                        Password <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            id="reg_password"
                                            required
                                            minLength={8}
                                            maxLength={64}
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            placeholder="Create a password"
                                            className={`field text-xs py-2 pr-10 font-semibold ${!regCanUsePassword ? 'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5' : ''}`}
                                            value={f.password}
                                            onChange={handleRegistrationPasswordChange}
                                            disabled={!regCanUsePassword}
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            disabled={!regCanUsePassword}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2563EB] hover:text-[#22C55E] disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-0 p-1 cursor-pointer transition"
                                        >
                                            {showPassword ? (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength Meter */}
                                    {f.password && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between text-[11px] font-bold text-[#2563EB]">
                                                <span>Password Strength:</span>
                                                <span className={`font-extrabold ${regPwdScore >= 3 ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                                    {regStrengthLabel}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full border border-[#2563EB] bg-white overflow-hidden flex">
                                                <div
                                                    className={`h-full transition-all duration-300 ${regPwdScore >= 3 ? 'bg-[#22C55E]' : 'bg-[#2563EB]'}`}
                                                    style={{ width: `${(regPwdScore / 4) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Real-time Requirement Checklist */}
                                    <div className="mt-2.5 rounded-xl border border-[#2563EB] bg-white p-3 space-y-1.5 text-xs">
                                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] mb-1">
                                            Password Security Requirements:
                                        </p>

                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${regHasLength ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{regHasLength ? '✓' : '•'}</span>
                                            <span>8 to 64 characters in length</span>
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${(regHasUpper && regHasLower) ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{(regHasUpper && regHasLower) ? '✓' : '•'}</span>
                                            <span>Contains uppercase (A-Z) & lowercase (a-z) letters</span>
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${(regHasNumber && regHasSpecial) ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{(regHasNumber && regHasSpecial) ? '✓' : '•'}</span>
                                            <span>Contains numbers (0-9) & special characters (!@#$...)</span>
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${(regNoSpaces && regNotWeak && regNoPersonal) ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{(regNoSpaces && regNotWeak && regNoPersonal) ? '✓' : '•'}</span>
                                            <span>No personal info (name/email), spaces, or common passwords</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="reg_confirm" className="block text-xs font-bold text-[#2563EB]">
                                        Confirm Password <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            id="reg_confirm"
                                            required
                                            minLength={8}
                                            maxLength={64}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            placeholder="Re-enter your password"
                                            className={`field text-xs py-2 pr-10 font-semibold ${!regCanUseConfirm ? 'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#2563EB]/5' : ''}`}
                                            value={f.password_confirmation}
                                            onChange={handleRegistrationConfirmPasswordChange}
                                            disabled={!regCanUseConfirm}
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                            disabled={!regCanUseConfirm}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2563EB] hover:text-[#22C55E] disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-0 p-1 cursor-pointer transition"
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {f.password_confirmation && (
                                        <div className={`mt-1 flex items-center gap-1.5 text-[11px] font-bold ${regMatchesConfirm ? 'text-[#22C55E]' : 'text-red-500'}`}>
                                            <span className="font-black">{regMatchesConfirm ? '✓ Passwords match' : '✕ Passwords do not match.'}</span>
                                        </div>
                                    )}
                                </div>

                                {error && <Error>{error}</Error>}

                                <Button
                                    type="submit"
                                    loading={loading}
                                    disabled={!regIsFormValid || loading}
                                    className="w-full py-3 text-xs font-extrabold mt-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Create Account
                                </Button>
                            </div>

                            <div className="pt-4 border-t border-[#2563EB] text-center text-xs font-bold text-[#2563EB]">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    className="font-bold text-[#22C55E] hover:text-[#2563EB] transition no-underline bg-transparent border-0 p-0 cursor-pointer"
                                    onClick={() => {
                                        setMode('login');
                                        setError('');
                                        setSuccessMessage('');
                                        setF({
                                            name: '',
                                            email: '',
                                            password: '',
                                            password_confirmation: '',
                                            role: '',
                                            country: '',
                                            campus_id: '',
                                            address: '',
                                            student_id_number: '',
                                            school_email: '',
                                            department: '',
                                            course: '',
                                            year_level: '',
                                            contact_number: '',
                                        });
                                    }}
                                >
                                    Sign In
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Mode 3: FORGOT PASSWORD STEP 1 - Enter Email */}
                    {mode === 'forgot-email' && (
                        <form className="panel no-hover space-y-5 bg-white p-6 shadow-lg sm:p-8" onSubmit={handleSendOtp}>
                            <div>
                                <p className="eyebrow">PASSWORD RESET STEP 1 OF 3</p>
                                <h1 className="page-title text-2xl font-extrabold text-[#2563EB]">
                                    Forgot your password?
                                </h1>
                                <p className="page-copy text-xs text-[#2563EB] opacity-80 mt-1">
                                    Enter your registered email address and we'll send you a 6-digit OTP verification code.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="reset_email" className="block text-xs font-bold text-[#2563EB]">
                                    Registered Email Address <span className="text-[#22C55E]">*</span>
                                </label>
                                <input
                                    id="reset_email"
                                    required
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="field mt-1 text-xs"
                                    value={f.email}
                                    onChange={(e) => setF({ ...f, email: e.target.value })}
                                />
                            </div>

                            {error && <Error>{error}</Error>}

                            <div className="space-y-2">
                                <Button type="submit" loading={loading} className="w-full py-3 text-xs font-extrabold">
                                    Send Verification OTP
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full py-2.5 text-xs"
                                    onClick={() => setMode('login')}
                                >
                                    Back to Sign In
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Mode 4: FORGOT PASSWORD STEP 2 - Enter OTP */}
                    {mode === 'forgot-otp' && (
                        <form className="panel no-hover space-y-5 bg-white p-6 shadow-lg sm:p-8" onSubmit={handleVerifyOtp}>
                            <div>
                                <p className="eyebrow">PASSWORD RESET STEP 2 OF 3</p>
                                <h1 className="page-title text-2xl font-extrabold text-[#2563EB]">
                                    Enter 6-Digit OTP Code
                                </h1>
                                <p className="page-copy text-xs font-semibold text-[#2563EB] mt-1">
                                    We sent a verification code to <span className="font-extrabold">{f.email}</span>.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#2563EB] mb-2">
                                    Verification Code <span className="text-[#22C55E]">*</span>
                                </label>
                                <div className="flex items-center justify-between gap-1.5 sm:gap-3" onPaste={handleOtpPaste}>
                                    {otpDigits.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (otpInputRefs.current[idx] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            className="h-12 w-10 sm:w-12 text-center text-xl font-extrabold text-[#2563EB] rounded-xl border border-[#2563EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-[#22C55E] transition shadow-sm"
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Resend OTP Cooldown Timer */}
                            <div className="flex items-center justify-between text-xs font-bold text-[#2563EB]">
                                <span>
                                    {otpTimer > 0 ? (
                                        <span className="text-[#2563EB]">Resend in {otpTimer}s</span>
                                    ) : (
                                        <span className="text-[#22C55E]">Code ready to resend</span>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    disabled={otpTimer > 0 || loading}
                                    className="font-bold text-[#2563EB] hover:text-[#22C55E] transition no-underline bg-transparent border-0 p-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    onClick={handleResendOtp}
                                >
                                    Resend OTP Code
                                </button>
                            </div>

                            {error && <Error>{error}</Error>}

                            <div className="space-y-2">
                                <Button type="submit" loading={loading} className="w-full py-3 text-xs font-extrabold">
                                    Verify OTP Code
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full py-2.5 text-xs"
                                    onClick={() => setMode('forgot-email')}
                                >
                                    Change Email Address
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Mode 5: FORGOT PASSWORD STEP 3 - Reset Password */}
                    {mode === 'forgot-reset' && (
                        <form className="panel no-hover space-y-4 bg-white p-6 shadow-lg sm:p-8" onSubmit={handleResetPassword}>
                            <div>
                                <p className="eyebrow">PASSWORD RESET STEP 3 OF 3</p>
                                <h1 className="page-title text-2xl font-extrabold text-[#2563EB]">
                                    Create New Password
                                </h1>
                                <p className="page-copy text-xs text-[#2563EB] opacity-80 mt-1">
                                    Set a strong new password for account <span className="font-extrabold">{f.email}</span>.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="new_password" className="block text-xs font-bold text-[#2563EB]">
                                        New Password <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="new_password"
                                            required
                                            minLength={8}
                                            maxLength={64}
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Enter your new password"
                                            className="field text-xs py-2 font-semibold"
                                            value={f.password}
                                            onChange={(e) => setF({ ...f, password: e.target.value })}
                                        />
                                    </div>

                                    {/* Password Strength Meter Bar */}
                                    {f.password && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between text-[11px] font-bold text-[#2563EB]">
                                                <span>Password Strength:</span>
                                                <span className={`font-extrabold ${regPwdScore >= 3 ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                                    {regStrengthLabel}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full border border-[#2563EB] bg-white overflow-hidden flex">
                                                <div
                                                    className={`h-full transition-all duration-300 ${regPwdScore >= 3 ? 'bg-[#22C55E]' : 'bg-[#2563EB]'}`}
                                                    style={{ width: `${(regPwdScore / 4) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Real-time Requirement Checklist */}
                                    <div className="mt-2.5 rounded-xl border border-[#2563EB] bg-white p-3 space-y-1.5 text-xs">
                                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] mb-1">
                                            Password Security Requirements:
                                        </p>

                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${regHasLength ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{regHasLength ? '✓' : '•'}</span>
                                            <span>8 to 64 characters in length</span>
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${(regHasUpper && regHasLower) ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{(regHasUpper && regHasLower) ? '✓' : '•'}</span>
                                            <span>Contains uppercase (A-Z) & lowercase (a-z) letters</span>
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${(regHasNumber && regHasSpecial) ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{(regHasNumber && regHasSpecial) ? '✓' : '•'}</span>
                                            <span>Contains numbers (0-9) & special characters (!@#$...)</span>
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${(regNoSpaces && regNotWeak && regNoPersonal) ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{(regNoSpaces && regNotWeak && regNoPersonal) ? '✓' : '•'}</span>
                                            <span>No personal info (email), spaces, or common passwords</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirm_new_password" className="block text-xs font-bold text-[#2563EB]">
                                        Confirm New Password <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="confirm_new_password"
                                            required
                                            minLength={8}
                                            maxLength={64}
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Re-enter your new password"
                                            className="field text-xs py-2 font-semibold"
                                            value={f.password_confirmation}
                                            onChange={(e) => setF({ ...f, password_confirmation: e.target.value })}
                                        />
                                    </div>
                                    {f.password_confirmation && (
                                        <div className={`mt-1 flex items-center gap-1.5 text-[11px] font-bold ${regMatchesConfirm ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                            <span className="font-black">{regMatchesConfirm ? '✓ Passwords match' : '• Passwords do not match'}</span>
                                        </div>
                                    )}
                                </div>

                                {error && <Error>{error}</Error>}

                                <Button
                                    type="submit"
                                    loading={loading}
                                    disabled={!regIsPasswordValid || !regMatchesConfirm || loading}
                                    className="w-full py-3 text-xs font-extrabold mt-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Save New Password
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Mode 6: FORGOT PASSWORD SUCCESS */}
                    {mode === 'forgot-success' && (
                        <div className="panel no-hover space-y-6 bg-white p-6 text-center shadow-lg sm:p-8">
                            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-[#22C55E] bg-[#22C55E] text-white">
                                <Icon name="check" size={32} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-extrabold text-[#2563EB]">Password Reset Complete</h1>
                                <p className="mt-2 text-xs font-bold text-[#2563EB] opacity-85">
                                    Your password has been successfully updated. You can now log in using your new credentials.
                                </p>
                            </div>

                            <Button
                                type="button"
                                className="w-full py-3 text-xs font-extrabold"
                                onClick={() => {
                                    setMode('login');
                                    setError('');
                                    setSuccessMessage('');
                                }}
                            >
                                Sign In Now
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

function DonorDonationForm() {
    const { user } = useAuth();
    const categories = [
        { value: 'food', label: 'Food & Meals' },
        { value: 'clothing', label: 'Clothing & Apparel' },
        { value: 'books', label: 'Educational & Books' },
        { value: 'medical', label: 'Medical & Health Supplies' },
        { value: 'electronics', label: 'Electronics & Tech' },
        { value: 'household', label: 'Household & Bedding' },
        { value: 'hygiene', label: 'Personal Care & Hygiene' },
        { value: 'emergency', label: 'Emergency & Disaster Relief' },
        { value: 'other', label: 'Other Useful Items' },
    ];

    const conditionPresets = [
        { value: 'New / Sealed', label: 'New / Sealed' },
        { value: 'Like New', label: 'Like New' },
        { value: 'Gently Used', label: 'Gently Used' },
        { value: 'Fair / Functional', label: 'Fair / Functional' },
    ];

    const pickupPresets = [
        'Campus Student Center - Main Entrance',
        'University Library Lobby',
        'North Dormitory Reception',
        'South Dining Hall Hub',
        'Custom Location / Address',
    ];

    const timeSlotOptions = [
        'Morning (8:00 AM - 12:00 PM)',
        'Afternoon (12:00 PM - 5:00 PM)',
        'Evening (5:00 PM - 9:00 PM)',
        'Weekend (Sat - Sun)',
    ];

    const availabilityPresets = [
        'Available Immediately',
        'This Week (Mon - Fri)',
        'Weekend Only (Sat - Sun)',
        'Custom Schedule',
    ];

    const initialFormState = {
        item_name: '',
        category: 'food',
        quantity: 1,
        condition_type: 'Gently Used',
        condition_notes: '',
        availability_type: 'Available Immediately',
        availability_start: '',
        availability_end: '',
        pickup_preset: 'Campus Student Center - Main Entrance',
        pickup_custom: '',
        selected_slots: ['Morning (8:00 AM - 12:00 PM)'],
        handoff_notes: '',
    };

    const [f, setF] = useState(initialFormState);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [serverError, setServerError] = useState('');
    const fileInputRef = useRef(null);

    const getEffectiveAvailability = () => {
        if (f.availability_type === 'Custom Schedule') {
            if (f.availability_start && f.availability_end) {
                return `${f.availability_start.replace('T', ' ')} to ${f.availability_end.replace('T', ' ')}`;
            } else if (f.availability_start) {
                return `From ${f.availability_start.replace('T', ' ')}`;
            } else if (f.availability_end) {
                return `Until ${f.availability_end.replace('T', ' ')}`;
            }
            return 'Custom Schedule';
        }
        return f.availability_type;
    };

    const getEffectivePickupLocation = () => {
        if (f.pickup_preset === 'Custom Location / Address') {
            return f.pickup_custom.trim();
        }
        return f.pickup_preset;
    };

    const getEffectiveHandoffSlots = () => {
        const slotsStr = f.selected_slots.join(', ');
        if (f.handoff_notes.trim()) {
            return slotsStr ? `${slotsStr} (${f.handoff_notes.trim()})` : f.handoff_notes.trim();
        }
        return slotsStr;
    };

    const handleFileChange = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrors((prev) => ({ ...prev, image: 'Please select a valid image file (PNG, JPG, JPEG, WEBP).' }));
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, image: 'Image size exceeds maximum limit of 4 MB.' }));
            return;
        }
        setErrors((prev) => ({ ...prev, image: null }));
        setImageFile(file);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(file));
    };

    const removePhoto = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleTimeSlot = (slot) => {
        setF((prev) => {
            const exists = prev.selected_slots.includes(slot);
            const updated = exists
                ? prev.selected_slots.filter((s) => s !== slot)
                : [...prev.selected_slots, slot];
            return { ...prev, selected_slots: updated };
        });
    };

    const validateForm = () => {
        const errs = {};
        if (!f.item_name.trim()) errs.item_name = 'Item name is required.';
        else if (f.item_name.length > 255) errs.item_name = 'Item name cannot exceed 255 characters.';

        if (!f.category) errs.category = 'Category is required.';

        const qty = Number(f.quantity);
        if (isNaN(qty) || qty < 1) errs.quantity = 'Quantity must be at least 1.';

        if (f.condition_notes.length > 2000) errs.condition_notes = 'Condition notes cannot exceed 2000 characters.';

        const location = getEffectivePickupLocation();
        if (!location) errs.pickup_location = 'Pickup location is required. Please specify location details.';
        else if (location.length > 255) errs.pickup_location = 'Pickup location cannot exceed 255 characters.';

        const avail = getEffectiveAvailability();
        if (!avail) errs.availability_window = 'Availability window is required.';
        else if (avail.length > 255) errs.availability_window = 'Availability window cannot exceed 255 characters.';

        const handoff = getEffectiveHandoffSlots();
        if (handoff.length > 2000) errs.preferred_handoff_slots = 'Preferred handoff schedule cannot exceed 2000 characters.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReviewClick = (e) => {
        e.preventDefault();
        setServerError('');
        if (validateForm()) {
            setShowReviewModal(true);
        }
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        setServerError('');
        try {
            const data = new FormData();
            data.append('item_name', f.item_name.trim());
            data.append('category', f.category);
            data.append('quantity', f.quantity);

            const finalConditionNotes = f.condition_type
                ? `[Condition: ${f.condition_type}] ${f.condition_notes.trim()}`.trim()
                : f.condition_notes.trim();
            data.append('condition_notes', finalConditionNotes);

            data.append('availability_window', getEffectiveAvailability());
            data.append('pickup_location', getEffectivePickupLocation());
            data.append('preferred_handoff_slots', getEffectiveHandoffSlots());

            if (imageFile) {
                data.append('image', imageFile);
            }

            const response = await api.post('/donations', data);
            setSubmittedData(response.data?.data || {
                item_name: f.item_name,
                category: f.category,
                quantity: f.quantity,
                pickup_location: getEffectivePickupLocation(),
            });
            setSubmitSuccess(true);
            setShowReviewModal(false);
        } catch (err) {
            setServerError(err.response?.data?.message || 'Could not save this donation entry. Please check your inputs and try again.');
            setShowReviewModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setF(initialFormState);
        removePhoto();
        setErrors({});
        setServerError('');
        setSubmitSuccess(false);
        setSubmittedData(null);
    };

    if (submitSuccess) {
        return (
            <main className="page max-w-4xl">
                <div className="panel no-hover p-6 sm:p-10 text-center">
                    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#22C55E] text-white shadow-md">
                        <Icon name="check" size={32} />
                    </div>
                    <p className="eyebrow text-[#22C55E]">Donation Listed</p>
                    <h1 className="page-title text-[#2563EB] mt-1">Thank you for your generosity!</h1>
                    <p className="page-copy mx-auto mt-3 max-w-xl text-[#2563EB]">
                        Your donation item <span className="font-extrabold text-[#2563EB]">"{submittedData?.item_name || f.item_name}"</span> has been registered and is now available to match with campus needs.
                    </p>

                    <div className="mt-6 rounded-2xl border border-[#2563EB] bg-white p-5 text-left max-w-md mx-auto">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3 mb-3">
                            <span className="font-extrabold text-sm text-[#2563EB]">Donation Summary</span>
                            <Badge status="pending_match" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs font-bold text-[#2563EB]">
                            <div>Item: <span className="font-normal block">{submittedData?.item_name || f.item_name}</span></div>
                            <div>Category: <span className="font-normal block uppercase">{f.category}</span></div>
                            <div>Quantity: <span className="font-normal block">{f.quantity} unit(s)</span></div>
                            <div>Pickup Location: <span className="font-normal block">{getEffectivePickupLocation()}</span></div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link to="/donations" className="no-underline">
                            <Button variant="primary">
                                <Icon name="donation" className="mr-2" /> View My Donations
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={resetForm}>
                            <Icon name="plus" className="mr-2" /> Make Another Donation
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page max-w-4xl">
            <p className="eyebrow">SHARE A RESOURCE</p>
            <h1 className="page-title">List something useful</h1>
            <p className="page-copy">Complete the details below so ReliefLink can connect the right people quickly.</p>

            <form className="mt-8 grid gap-6" onSubmit={handleReviewClick} noValidate>
                {/* Section 1: Item Details */}
                <div className="panel no-hover p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-2 border-b border-[#2563EB] pb-3">
                        <Icon name="donation" size={20} className="text-[#2563EB]" />
                        <h2 className="text-base font-extrabold text-[#2563EB]">1. Item Basic Information</h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Item Name */}
                        <div className="sm:col-span-2">
                            <div className="flex items-center justify-between text-sm font-bold text-[#2563EB]">
                                <label htmlFor="item_name">
                                    Item Name <span className="text-[#22C55E]">*</span>
                                </label>
                                <span className="text-xs font-normal text-[#2563EB] opacity-80">
                                    {f.item_name.length} / 255
                                </span>
                            </div>
                            <input
                                id="item_name"
                                required
                                maxLength={255}
                                placeholder="e.g. Calculus Textbook 11th Edition, Winter Jacket, Rice 5kg"
                                className="field mt-2"
                                type="text"
                                value={f.item_name}
                                onChange={(e) => {
                                    setF({ ...f, item_name: e.target.value });
                                    if (errors.item_name) setErrors({ ...errors, item_name: null });
                                }}
                            />
                            {errors.item_name && (
                                <p className="mt-1 text-xs font-bold text-[#2563EB]">{errors.item_name}</p>
                            )}
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-bold text-[#2563EB]">
                                Category <span className="text-[#22C55E]">*</span>
                            </label>
                            <select
                                id="category"
                                className="field mt-2"
                                value={f.category}
                                onChange={(e) => {
                                    setF({ ...f, category: e.target.value });
                                    if (errors.category) setErrors({ ...errors, category: null });
                                }}
                            >
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-xs font-bold text-[#2563EB]">{errors.category}</p>
                            )}
                        </div>

                        {/* Quantity Counter & Validation */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-bold text-[#2563EB]">
                                Quantity <span className="text-[#22C55E]">*</span>
                            </label>
                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#2563EB] bg-white font-extrabold text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
                                    onClick={() => {
                                        const qty = Math.max(1, Number(f.quantity) - 1);
                                        setF({ ...f, quantity: qty });
                                        if (errors.quantity) setErrors({ ...errors, quantity: null });
                                    }}
                                >
                                    -
                                </button>
                                <input
                                    id="quantity"
                                    required
                                    min={1}
                                    type="number"
                                    className="field text-center font-bold"
                                    value={f.quantity}
                                    onChange={(e) => {
                                        const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                                        setF({ ...f, quantity: val });
                                        if (errors.quantity) setErrors({ ...errors, quantity: null });
                                    }}
                                />
                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#2563EB] bg-white font-extrabold text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
                                    onClick={() => {
                                        const qty = Number(f.quantity) + 1;
                                        setF({ ...f, quantity: qty });
                                        if (errors.quantity) setErrors({ ...errors, quantity: null });
                                    }}
                                >
                                    +
                                </button>
                            </div>
                            {errors.quantity && (
                                <p className="mt-1 text-xs font-bold text-[#2563EB]">{errors.quantity}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: Condition & Notes */}
                <div className="panel no-hover p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-2 border-b border-[#2563EB] pb-3">
                        <Icon name="info" size={20} className="text-[#2563EB]" />
                        <h2 className="text-base font-extrabold text-[#2563EB]">2. Item Condition & Details</h2>
                    </div>

                    <div className="grid gap-5">
                        {/* Condition Selector Chips */}
                        <div>
                            <label className="block text-sm font-bold text-[#2563EB] mb-2">
                                Item Condition
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {conditionPresets.map((cond) => (
                                    <button
                                        key={cond.value}
                                        type="button"
                                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                                            f.condition_type === cond.value
                                                ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                                : 'border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white'
                                        }`}
                                        onClick={() => setF({ ...f, condition_type: cond.value })}
                                    >
                                        {cond.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Condition Notes */}
                        <div>
                            <div className="flex items-center justify-between text-sm font-bold text-[#2563EB]">
                                <label htmlFor="condition_notes">Condition Description & Additional Notes</label>
                                <span className="text-xs font-normal text-[#2563EB] opacity-80">
                                    {f.condition_notes.length} / 2000
                                </span>
                            </div>
                            <textarea
                                id="condition_notes"
                                maxLength={2000}
                                rows={3}
                                placeholder="Describe item state, expiry dates if food, size/dimensions, included accessories, or special handling instructions..."
                                className="field mt-2"
                                value={f.condition_notes}
                                onChange={(e) => {
                                    setF({ ...f, condition_notes: e.target.value });
                                    if (errors.condition_notes) setErrors({ ...errors, condition_notes: null });
                                }}
                            />
                            {errors.condition_notes && (
                                <p className="mt-1 text-xs font-bold text-[#2563EB]">{errors.condition_notes}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Logistics & Availability */}
                <div className="panel no-hover p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-2 border-b border-[#2563EB] pb-3">
                        <Icon name="location" size={20} className="text-[#2563EB]" />
                        <h2 className="text-base font-extrabold text-[#2563EB]">3. Logistics & Preferred Schedule</h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Availability Window */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-[#2563EB] mb-2">
                                Availability Window <span className="text-[#22C55E]">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {availabilityPresets.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                            f.availability_type === preset
                                                ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                                : 'border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white'
                                        }`}
                                        onClick={() => setF({ ...f, availability_type: preset })}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>

                            {f.availability_type === 'Custom Schedule' && (
                                <div className="mt-3 grid gap-3 sm:grid-cols-2 rounded-xl border border-[#2563EB] p-3 bg-white">
                                    <div>
                                        <label htmlFor="avail_start" className="block text-xs font-bold text-[#2563EB]">
                                            Available From
                                        </label>
                                        <input
                                            id="avail_start"
                                            type="datetime-local"
                                            className="field mt-1 text-xs"
                                            value={f.availability_start}
                                            onChange={(e) => setF({ ...f, availability_start: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="avail_end" className="block text-xs font-bold text-[#2563EB]">
                                            Available Until
                                        </label>
                                        <input
                                            id="avail_end"
                                            type="datetime-local"
                                            className="field mt-1 text-xs"
                                            value={f.availability_end}
                                            onChange={(e) => setF({ ...f, availability_end: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                            {errors.availability_window && (
                                <p className="mt-1 text-xs font-bold text-[#2563EB]">{errors.availability_window}</p>
                            )}
                        </div>

                        {/* Pickup Location */}
                        <div className="sm:col-span-2">
                            <label htmlFor="pickup_preset" className="block text-sm font-bold text-[#2563EB]">
                                Pickup Location <span className="text-[#22C55E]">*</span>
                            </label>
                            <select
                                id="pickup_preset"
                                className="field mt-2"
                                value={f.pickup_preset}
                                onChange={(e) => {
                                    setF({ ...f, pickup_preset: e.target.value });
                                    if (errors.pickup_location) setErrors({ ...errors, pickup_location: null });
                                }}
                            >
                                {pickupPresets.map((loc) => (
                                    <option key={loc} value={loc}>
                                        {loc}
                                    </option>
                                ))}
                            </select>

                            {f.pickup_preset === 'Custom Location / Address' && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-[#2563EB]">
                                        <span>Custom Pickup Address / Details</span>
                                        <span>{f.pickup_custom.length} / 255</span>
                                    </div>
                                    <input
                                        maxLength={255}
                                        placeholder="e.g. Science Building Room 204, Student Center Information Desk..."
                                        className="field mt-1"
                                        type="text"
                                        value={f.pickup_custom}
                                        onChange={(e) => {
                                            setF({ ...f, pickup_custom: e.target.value });
                                            if (errors.pickup_location) setErrors({ ...errors, pickup_location: null });
                                        }}
                                    />
                                </div>
                            )}
                            {errors.pickup_location && (
                                <p className="mt-1 text-xs font-bold text-[#2563EB]">{errors.pickup_location}</p>
                            )}
                        </div>

                        {/* Preferred Handoff Schedule Slots */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-[#2563EB] mb-2">
                                Preferred Handoff Time Slots
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {timeSlotOptions.map((slot) => {
                                    const active = f.selected_slots.includes(slot);
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                                active
                                                    ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                                    : 'border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white'
                                            }`}
                                            onClick={() => toggleTimeSlot(slot)}
                                        >
                                            {active ? '✓ ' : '+ '} {slot}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold text-[#2563EB]">
                                <span>Specific Handoff Notes (Optional)</span>
                                <span>{f.handoff_notes.length} / 2000</span>
                            </div>
                            <input
                                maxLength={2000}
                                placeholder="e.g. Prefer meeting near entrance security desk, available on 10 minutes notice..."
                                className="field mt-1"
                                type="text"
                                value={f.handoff_notes}
                                onChange={(e) => setF({ ...f, handoff_notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Photo Upload with Preview */}
                <div className="panel no-hover p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-2 border-b border-[#2563EB] pb-3">
                        <Icon name="image" size={20} className="text-[#2563EB]" />
                        <h2 className="text-base font-extrabold text-[#2563EB]">4. Donation Photo (Optional)</h2>
                    </div>

                    {!imagePreview ? (
                        <div
                            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition cursor-pointer ${
                                isDragging
                                    ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#2563EB]'
                                    : 'border-[#2563EB] bg-white text-[#2563EB] hover:border-[#22C55E]'
                            }`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleFileChange(e.dataTransfer.files[0]);
                                }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-[#2563EB] bg-white text-[#2563EB]">
                                <Icon name="upload" size={24} />
                            </div>
                            <p className="font-extrabold text-sm text-[#2563EB]">
                                Drag & drop item photo here, or <span className="underline">browse files</span>
                            </p>
                            <p className="mt-1 text-xs text-[#2563EB] opacity-80">
                                Supports PNG, JPG, JPEG, WEBP (Max size: 4 MB)
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                            />
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#2563EB] p-4 bg-white flex flex-col sm:flex-row items-center gap-4">
                            <img
                                src={imagePreview}
                                alt="Donation preview"
                                className="h-32 w-32 shrink-0 rounded-xl border border-[#2563EB] object-cover shadow-sm"
                            />
                            <div className="flex-1 text-center sm:text-left text-[#2563EB]">
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <Icon name="check" size={16} className="text-[#22C55E]" />
                                    <p className="font-extrabold text-sm text-[#2563EB]">Photo Ready for Upload</p>
                                </div>
                                <p className="mt-1 text-xs font-bold text-[#2563EB] truncate max-w-xs">
                                    Filename: {imageFile?.name}
                                </p>
                                <p className="text-xs text-[#2563EB] opacity-80">
                                    Size: {(imageFile?.size ? imageFile.size / (1024 * 1024) : 0).toFixed(2)} MB / Max 4.0 MB
                                </p>

                                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="py-1 px-3 text-xs"
                                        onClick={removePhoto}
                                    >
                                        <Icon name="close" className="mr-1" size={14} /> Remove Photo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="py-1 px-3 text-xs"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Icon name="upload" className="mr-1" size={14} /> Change Photo
                                    </Button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                />
                            </div>
                        </div>
                    )}
                    {errors.image && (
                        <p className="mt-2 text-xs font-bold text-[#2563EB]">{errors.image}</p>
                    )}
                </div>

                {/* Submission & Errors */}
                <div>
                    <Error>{serverError}</Error>
                    <div className="mt-4 flex items-center justify-end gap-4">
                        <Button type="submit" variant="primary" className="w-full sm:w-auto px-8 py-3 text-base">
                            <Icon name="check" className="mr-2" /> Review & Submit Donation
                        </Button>
                    </div>
                </div>
            </form>

            {/* Confirmation & Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel no-hover max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <div className="flex items-center gap-2">
                                <Icon name="donation" size={20} className="text-[#2563EB]" />
                                <h2 className="text-lg font-extrabold text-[#2563EB]">Confirm Donation Details</h2>
                            </div>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setShowReviewModal(false)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <p className="mt-3 text-xs font-bold text-[#2563EB] opacity-90">
                            Please verify your donation entry below before finalizing registration.
                        </p>

                        <div className="mt-4 space-y-3 rounded-2xl border border-[#2563EB] bg-white p-4 text-xs font-bold">
                            <div className="border-b border-[#2563EB]/30 pb-2">
                                <span className="text-[#2563EB] opacity-70 block">Item Name & Category</span>
                                <span className="text-sm font-extrabold">{f.item_name}</span>
                                <span className="ml-2 uppercase text-[10px] rounded border border-[#22C55E] bg-[#22C55E] text-white px-1.5 py-0.5">
                                    {f.category}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-b border-[#2563EB]/30 pb-2">
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Quantity</span>
                                    <span>{f.quantity} unit(s)</span>
                                </div>
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Condition</span>
                                    <span>{f.condition_type}</span>
                                </div>
                            </div>

                            {f.condition_notes && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Condition Description</span>
                                    <p className="font-normal whitespace-pre-wrap">{f.condition_notes}</p>
                                </div>
                            )}

                            <div className="border-b border-[#2563EB]/30 pb-2">
                                <span className="text-[#2563EB] opacity-70 block">Availability Window</span>
                                <span>{getEffectiveAvailability()}</span>
                            </div>

                            <div className="border-b border-[#2563EB]/30 pb-2">
                                <span className="text-[#2563EB] opacity-70 block">Pickup Location</span>
                                <span>{getEffectivePickupLocation()}</span>
                            </div>

                            <div>
                                <span className="text-[#2563EB] opacity-70 block">Preferred Handoff Schedule</span>
                                <span>{getEffectiveHandoffSlots()}</span>
                            </div>

                            {imagePreview && (
                                <div className="pt-2 border-t border-[#2563EB]/30">
                                    <span className="text-[#2563EB] opacity-70 block mb-1">Uploaded Photo</span>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-20 w-20 rounded-lg border border-[#2563EB] object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowReviewModal(false)}
                            >
                                <Icon name="edit" className="mr-1" /> Edit Details
                            </Button>
                            <Button
                                type="button"
                                variant="success"
                                loading={submitting}
                                onClick={handleFinalSubmit}
                            >
                                <Icon name="check" className="mr-1" /> Confirm & Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function BeneficiaryRequestForm() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const initialFormState = {
        request_type: 'physical', // 'physical' | 'financial'
        category: '',
        item_details: '', // Assistance Needed
        quantity_needed: 1, // Quantity Needed
        unit: 'pieces (pcs)', // Unit
        amount_requested: '', // Amount Requested
        currency: 'PHP', // Currency
        purpose_of_funds: '', // Purpose of Funds
        justification: '', // Reason for Request
        preferred_assistance_date: '', // Preferred Assistance Date
        urgency: 'medium', // Priority Level
        additional_info: '',
        alternative_categories: '',
        pickup_location: 'Campus Student Center - Main Entrance',
        custom_location: '',
        availability_window: 'Weekdays 2:00 PM - 5:00 PM',
        image: null,
    };

    const [f, setF] = useState(initialFormState);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [actionBanner, setActionBanner] = useState('');

    // Modals & Panels
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [submittedRequestData, setSubmittedRequestData] = useState(null);

    // Auto-restore draft from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('relieflink_request_draft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setF((prev) => ({ ...prev, ...parsed, image: null }));
                setActionBanner('Restored your previously saved request draft.');
                setTimeout(() => setActionBanner(''), 4000);
            } catch (err) {
                console.error('Failed to parse request draft', err);
            }
        }
    }, []);

    // File change handler
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check: max 4MB
        if (file.size > 4 * 1024 * 1024) {
            setError('The selected file exceeds the 4MB maximum size limit.');
            return;
        }

        // Type check
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image (PNG, JPG, WEBP) or PDF document.');
            return;
        }

        setError('');
        setF((prev) => ({ ...prev, image: file }));
        if (file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const removeFile = () => {
        setF((prev) => ({ ...prev, image: null }));
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    // Save draft
    const handleSaveDraft = () => {
        const draftPayload = {
            request_type: f.request_type,
            category: f.category,
            item_details: f.item_details,
            quantity_needed: f.quantity_needed,
            unit: f.unit,
            amount_requested: f.amount_requested,
            currency: f.currency,
            purpose_of_funds: f.purpose_of_funds,
            justification: f.justification,
            preferred_assistance_date: f.preferred_assistance_date,
            urgency: f.urgency,
            additional_info: f.additional_info,
            alternative_categories: f.alternative_categories,
            pickup_location: f.pickup_location,
            custom_location: f.custom_location,
            availability_window: f.availability_window,
        };
        localStorage.setItem('relieflink_request_draft', JSON.stringify(draftPayload));
        setActionBanner('Draft saved successfully to your browser.');
        setTimeout(() => setActionBanner(''), 4000);
    };

    // Clear form
    const handleClearForm = () => {
        setF(initialFormState);
        removeFile();
        localStorage.removeItem('relieflink_request_draft');
        setShowClearModal(false);
        setActionBanner('Form has been cleared.');
        setTimeout(() => setActionBanner(''), 3000);
    };

    // Sequential Field Validation Logic
    const isPhysical = f.request_type === 'physical';
    const isFinancial = f.request_type === 'financial';

    // Step 1: Type is chosen
    const typeValid = !!f.request_type;

    // Step 2: Category
    const categoryValid = typeValid && !!f.category.trim();

    // Step 3 (Physical: Assistance Needed / Financial: Amount Requested)
    const itemDetailsValid = categoryValid && (isPhysical ? !!f.item_details.trim() : true);
    const amountValid = categoryValid && (isFinancial ? Number(f.amount_requested) > 0 : true);

    // Step 4 (Physical: Quantity / Financial: Currency)
    const quantityValid = itemDetailsValid && (isPhysical ? Number(f.quantity_needed) >= 1 : true);
    const currencyValid = amountValid && (isFinancial ? !!f.currency.trim() : true);

    // Step 5 (Physical: Unit / Financial: Purpose of Funds)
    const unitValid = quantityValid && (isPhysical ? !!f.unit.trim() : true);
    const purposeValid = currencyValid && (isFinancial ? !!f.purpose_of_funds.trim() : true);

    // Step 6: Reason for Request
    const step5Passed = isPhysical ? unitValid : purposeValid;
    const reasonValid = step5Passed && !!f.justification.trim();

    // Step 7: Preferred Assistance Date
    const dateValid = reasonValid && !!f.preferred_assistance_date.trim();

    // Step 8: Priority Level
    const priorityValid = dateValid && !!f.urgency;

    // Overall Validity
    const isFormComplete = priorityValid;

    // Submit form to API
    const handleFinalSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        setError('');

        const finalLocation =
            f.pickup_location === 'other' ? f.custom_location.trim() || 'Custom Location' : f.pickup_location;

        try {
            const data = new FormData();
            data.append('request_type', f.request_type);
            data.append('category', f.category);
            data.append('urgency', f.urgency);
            data.append('justification', f.justification.trim());
            data.append('preferred_assistance_date', f.preferred_assistance_date.trim());

            if (isPhysical) {
                data.append('item_details', f.item_details.trim());
                data.append('quantity_needed', f.quantity_needed);
                data.append('unit', f.unit.trim());
                if (f.alternative_categories.trim()) {
                    data.append('alternative_categories', f.alternative_categories.trim());
                }
                data.append('pickup_location', finalLocation);
                data.append('availability_window', f.availability_window);
            } else {
                data.append('amount_requested', f.amount_requested);
                data.append('currency', f.currency.trim());
                data.append('purpose_of_funds', f.purpose_of_funds.trim());
                data.append('quantity_needed', 1);
            }

            if (f.additional_info.trim()) {
                data.append('additional_info', f.additional_info.trim());
            }
            if (f.image) {
                data.append('image', f.image);
            }

            const res = await api.post('/requests', data);

            // Remove saved draft
            localStorage.removeItem('relieflink_request_draft');

            const createdObj = res.data.data || res.data || {};
            setSubmittedRequestData({
                id: createdObj.id || Date.now(),
                request_type: f.request_type,
                category: f.category,
                item_details: f.item_details,
                quantity_needed: f.quantity_needed,
                unit: f.unit,
                amount_requested: f.amount_requested,
                currency: f.currency,
                purpose_of_funds: f.purpose_of_funds,
                urgency: f.urgency,
                justification: f.justification,
                preferred_assistance_date: f.preferred_assistance_date,
                status: 'pending_review',
                created_at: new Date().toISOString(),
            });
        } catch (e) {
            const valErrors = e.response?.data?.errors;
            if (valErrors) {
                setError(Object.values(valErrors).flat().join(' '));
            } else {
                setError(e.response?.data?.message || 'Could not submit support request. Please verify all inputs.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Reset to create another request
    const handleCreateAnother = () => {
        setSubmittedRequestData(null);
        setF(initialFormState);
        removeFile();
        setError('');
        setActionBanner('');
    };

    return (
        <main className="page max-w-4xl space-y-6">
            <div>
                <p className="eyebrow">BENEFICIARY WORKSPACE</p>
                <h1 className="page-title">Create Support Request</h1>
                <p className="page-copy">
                    Submit a student assistance request for educational supplies, living essentials, or campus financial aid.
                </p>
            </div>

            {/* Banner Notifications */}
            {actionBanner && (
                <div className="rounded-xl border border-[#22C55E] bg-white p-3.5 text-sm font-extrabold text-[#22C55E] flex items-center gap-2 shadow-sm">
                    <Icon name="check" size={18} />
                    <span>{actionBanner}</span>
                </div>
            )}
            {error && <Error>{error}</Error>}

            {/* Beneficiary Profile Reference Card (Auto-linked) */}
            <div className="panel no-hover p-5 bg-[#2563EB]/5 border border-[#2563EB]/30">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#2563EB] uppercase tracking-wider mb-2">
                    <Icon name="users" size={16} />
                    <span>Beneficiary Student Profile Details (Automatic from Account)</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div>
                        <span className="font-bold text-[#2563EB]/70 block">Full Name</span>
                        <span className="font-extrabold text-[#2563EB]">{user?.name || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-bold text-[#2563EB]/70 block">Student ID</span>
                        <span className="font-extrabold text-[#2563EB]">{user?.student_id_number || user?.campus_id || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-bold text-[#2563EB]/70 block">School Email</span>
                        <span className="font-extrabold text-[#2563EB]">{user?.school_email || user?.email || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-bold text-[#2563EB]/70 block">Department</span>
                        <span className="font-extrabold text-[#2563EB]">{user?.department || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-bold text-[#2563EB]/70 block">Course / Program</span>
                        <span className="font-extrabold text-[#2563EB]">{user?.course || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-bold text-[#2563EB]/70 block">Year Level</span>
                        <span className="font-extrabold text-[#2563EB]">{user?.year_level || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Workflow Pipeline Indicator */}
            <div className="rounded-2xl border border-[#2563EB] bg-white p-4">
                <div className="mb-2 text-xs font-extrabold text-[#2563EB]">
                    Request Workflow & Verification Stages
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-extrabold">
                    <div className="rounded-xl border border-[#22C55E] bg-[#22C55E] text-white p-2">
                        1. Submitted
                    </div>
                    <div className="rounded-xl border border-[#2563EB] bg-white text-[#2563EB] p-2">
                        2. Under Review
                    </div>
                    <div className="rounded-xl border border-[#2563EB] bg-white text-[#2563EB] p-2">
                        3. Approved
                    </div>
                    <div className="rounded-xl border border-[#2563EB] bg-white text-[#2563EB] p-2">
                        4. Matched
                    </div>
                    <div className="rounded-xl border border-[#2563EB] bg-white text-[#2563EB] p-2">
                        5. Fulfilled
                    </div>
                </div>
            </div>

            {/* Interactive Post-Submission Success View */}
            {submittedRequestData ? (
                <div className="panel no-hover p-8 text-center text-[#2563EB] space-y-6">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="check" size={32} />
                    </div>

                    <div>
                        <span className="rounded-full border border-[#22C55E] bg-[#22C55E]/10 px-4 py-1.5 text-xs font-extrabold text-[#22C55E] uppercase tracking-wider">
                            Request submitted successfully.
                        </span>
                        <h2 className="mt-4 text-2xl font-black text-[#2563EB]">
                            Reference ID: #REQ-{String(submittedRequestData.id).padStart(3, '0')}
                        </h2>
                        <p className="mt-1 text-xs font-semibold text-[#2563EB]/80 max-w-md mx-auto">
                            Your support request has been securely recorded in the ReliefLink database and forwarded to campus operations for review and matching.
                        </p>
                    </div>

                    {/* Summary Card */}
                    <div className="mx-auto max-w-md rounded-xl border border-[#2563EB] bg-white p-5 text-left text-xs font-bold space-y-2.5 shadow-sm">
                        <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                            <span className="text-[#2563EB]/70">Request Type</span>
                            <span className="font-extrabold uppercase text-[#2563EB]">
                                {submittedRequestData.request_type === 'financial' ? 'Financial Assistance' : 'Physical Item'}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                            <span className="text-[#2563EB]/70">Category</span>
                            <span className="font-extrabold uppercase">{title(submittedRequestData.category)}</span>
                        </div>
                        {submittedRequestData.request_type === 'financial' ? (
                            <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                <span className="text-[#2563EB]/70">Amount Requested</span>
                                <span className="font-extrabold text-[#22C55E]">
                                    {submittedRequestData.currency} {Number(submittedRequestData.amount_requested).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ) : (
                            <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                <span className="text-[#2563EB]/70">Assistance Needed</span>
                                <span>{submittedRequestData.quantity_needed} {submittedRequestData.unit} of {submittedRequestData.item_details}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                            <span className="text-[#2563EB]/70">Priority Level</span>
                            <span className="uppercase text-[#22C55E]">{submittedRequestData.urgency}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                            <span className="text-[#2563EB]/70">Preferred Assistance Date</span>
                            <span>{submittedRequestData.preferred_assistance_date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#2563EB]/70">Current Status</span>
                            <Badge status={submittedRequestData.status} />
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#2563EB]/20">
                        <Link to="/requests" className="no-underline">
                            <Button variant="primary" className="py-2.5 px-6 text-xs font-extrabold">
                                View My Requests
                            </Button>
                        </Link>
                        <Button variant="secondary" className="py-2.5 px-6 text-xs font-extrabold" onClick={handleCreateAnother}>
                            + Submit Another Request
                        </Button>
                    </div>
                </div>
            ) : (
                /* Request Form */
                <form
                    className="panel no-hover p-6 sm:p-8 space-y-8"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isFormComplete) {
                            setError('Please complete all sequentially required fields before submitting.');
                            return;
                        }
                        setShowConfirmModal(true);
                    }}
                >
                    {/* STEP 1: Request Type Selection */}
                    <div>
                        <div className="flex items-center gap-2 border-b border-[#2563EB] pb-2 mb-4">
                            <Icon name="request" className="text-[#2563EB]" size={18} />
                            <h2 className="text-base font-extrabold text-[#2563EB]">
                                1. Select Request Type <span className="text-[#22C55E]">*</span>
                            </h2>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label
                                className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 transition ${
                                    f.request_type === 'physical'
                                        ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-md'
                                        : 'border-[#2563EB]/40 bg-white text-[#2563EB] hover:bg-[#2563EB]/5'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="request_type"
                                    value="physical"
                                    checked={f.request_type === 'physical'}
                                    onChange={(e) => setF({ ...f, request_type: e.target.value, category: '' })}
                                    className="hidden"
                                />
                                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${f.request_type === 'physical' ? 'border-white bg-white/20 text-white' : 'border-[#2563EB] bg-white text-[#2563EB]'}`}>
                                    <Icon name="donation" size={20} />
                                </span>
                                <div>
                                    <h3 className="text-sm font-extrabold">Physical Item Request</h3>
                                    <p className={`text-xs ${f.request_type === 'physical' ? 'text-white/80' : 'text-[#2563EB]/70'}`}>
                                        Books, meals, school supplies, clothes, medical gear, tech
                                    </p>
                                </div>
                            </label>

                            <label
                                className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 transition ${
                                    f.request_type === 'financial'
                                        ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-md'
                                        : 'border-[#2563EB]/40 bg-white text-[#2563EB] hover:bg-[#2563EB]/5'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="request_type"
                                    value="financial"
                                    checked={f.request_type === 'financial'}
                                    onChange={(e) => setF({ ...f, request_type: e.target.value, category: '' })}
                                    className="hidden"
                                />
                                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${f.request_type === 'financial' ? 'border-white bg-white/20 text-white' : 'border-[#2563EB] bg-white text-[#2563EB]'}`}>
                                    <Icon name="report" size={20} />
                                </span>
                                <div>
                                    <h3 className="text-sm font-extrabold">Financial Assistance Request</h3>
                                    <p className={`text-xs ${f.request_type === 'financial' ? 'text-white/80' : 'text-[#2563EB]/70'}`}>
                                        Tuition aid, transport allowance, study grants, emergency funds
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* STEP 2: Category Selection */}
                    <div>
                        <div className="flex items-center gap-2 border-b border-[#2563EB] pb-2 mb-4">
                            <Icon name="categories" className="text-[#2563EB]" size={18} />
                            <h2 className="text-base font-extrabold text-[#2563EB]">
                                2. Assistance Category <span className="text-[#22C55E]">*</span>
                            </h2>
                        </div>

                        <div>
                            <label htmlFor="req_category" className="block text-xs font-bold text-[#2563EB] mb-1">
                                Category <span className="text-[#22C55E]">*</span>
                            </label>
                            <select
                                id="req_category"
                                disabled={!typeValid}
                                className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                value={f.category}
                                onChange={(e) => setF({ ...f, category: e.target.value })}
                            >
                                <option value="">-- Select Assistance Category --</option>
                                {isPhysical ? (
                                    <>
                                        <option value="Food & Meals">Food & Meals</option>
                                        <option value="Educational & Books">Educational & Books</option>
                                        <option value="Clothing & Apparel">Clothing & Apparel</option>
                                        <option value="School Supplies">School Supplies</option>
                                        <option value="Medical & Health Supplies">Medical & Health Supplies</option>
                                        <option value="Electronics & Tech">Electronics & Tech</option>
                                        <option value="Household & Bedding">Household & Bedding</option>
                                        <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
                                        <option value="Emergency & Disaster Relief">Emergency & Disaster Relief</option>
                                        <option value="Other Useful Items">Other Useful Items</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Tuition & Academic Fees">Tuition & Academic Fees</option>
                                        <option value="Books & Study Materials Grant">Books & Study Materials Grant</option>
                                        <option value="Daily Living & Food Allowance">Daily Living & Food Allowance</option>
                                        <option value="Transportation Allowance">Transportation Allowance</option>
                                        <option value="Medical & Health Assistance">Medical & Health Assistance</option>
                                        <option value="Emergency Student Relief Fund">Emergency Student Relief Fund</option>
                                        <option value="General Financial Aid">General Financial Aid</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* STEP 3 & 4: Specific Assistance Details (Physical vs Financial) */}
                    <div>
                        <div className="flex items-center gap-2 border-b border-[#2563EB] pb-2 mb-4">
                            <Icon name="info" className="text-[#2563EB]" size={18} />
                            <h2 className="text-base font-extrabold text-[#2563EB]">
                                3. {isPhysical ? 'Physical Item Specifications' : 'Financial Aid Details'}
                            </h2>
                        </div>

                        {isPhysical ? (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="req_item_details" className="block text-xs font-bold text-[#2563EB] mb-1">
                                        Assistance Needed (Item / Supply Name) <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <input
                                        id="req_item_details"
                                        type="text"
                                        disabled={!categoryValid}
                                        placeholder="e.g. Spiral Notebooks (80 leaves), Scientific Calculator, Winter Jacket Size M..."
                                        className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                        value={f.item_details}
                                        onChange={(e) => setF({ ...f, item_details: e.target.value })}
                                    />
                                    {!categoryValid && (
                                        <p className="text-[11px] font-semibold text-[#2563EB]/60 mt-1">Select a category above to unlock this field.</p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="req_qty" className="block text-xs font-bold text-[#2563EB] mb-1">
                                            Quantity Needed <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <input
                                            id="req_qty"
                                            type="number"
                                            min={1}
                                            disabled={!itemDetailsValid}
                                            className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                            value={f.quantity_needed}
                                            onChange={(e) => setF({ ...f, quantity_needed: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="req_unit" className="block text-xs font-bold text-[#2563EB] mb-1">
                                            Unit of Measure <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <select
                                            id="req_unit"
                                            disabled={!quantityValid}
                                            className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                            value={f.unit}
                                            onChange={(e) => setF({ ...f, unit: e.target.value })}
                                        >
                                            <option value="pieces (pcs)">pieces (pcs)</option>
                                            <option value="sets">sets</option>
                                            <option value="boxes">boxes</option>
                                            <option value="packs">packs</option>
                                            <option value="books">books</option>
                                            <option value="pairs">pairs</option>
                                            <option value="bundles">bundles</option>
                                            <option value="kg">kilograms (kg)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="req_amount" className="block text-xs font-bold text-[#2563EB] mb-1">
                                            Amount Requested <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <input
                                            id="req_amount"
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            disabled={!categoryValid}
                                            placeholder="e.g. 2500.00"
                                            className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                            value={f.amount_requested}
                                            onChange={(e) => setF({ ...f, amount_requested: e.target.value })}
                                        />
                                        {!categoryValid && (
                                            <p className="text-[11px] font-semibold text-[#2563EB]/60 mt-1">Select a category above to unlock this field.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="req_currency" className="block text-xs font-bold text-[#2563EB] mb-1">
                                            Currency <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <select
                                            id="req_currency"
                                            disabled={!amountValid}
                                            className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                            value={f.currency}
                                            onChange={(e) => setF({ ...f, currency: e.target.value })}
                                        >
                                            <option value="PHP">PHP (₱ - Philippine Peso)</option>
                                            <option value="USD">USD ($ - US Dollar)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="req_purpose" className="block text-xs font-bold text-[#2563EB] mb-1">
                                        Purpose of Funds <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <input
                                        id="req_purpose"
                                        type="text"
                                        disabled={!currencyValid}
                                        placeholder="e.g. Final semester tuition assessment balance, monthly bus transit pass..."
                                        className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                        value={f.purpose_of_funds}
                                        onChange={(e) => setF({ ...f, purpose_of_funds: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* STEP 5 & 6: Reason for Request & Preferred Assistance Date */}
                    <div>
                        <div className="flex items-center gap-2 border-b border-[#2563EB] pb-2 mb-4">
                            <Icon name="history" className="text-[#2563EB]" size={18} />
                            <h2 className="text-base font-extrabold text-[#2563EB]">
                                4. Reason for Request & Schedule
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="req_just" className="block text-xs font-bold text-[#2563EB]">
                                        Reason for Request <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <span className="text-[11px] font-bold text-[#2563EB]/70">
                                        {f.justification.length} / 2000 chars
                                    </span>
                                </div>
                                <textarea
                                    id="req_just"
                                    rows={3}
                                    maxLength={2000}
                                    disabled={!step5Passed}
                                    placeholder="Please describe why this assistance is needed and how it will support your academic/personal wellbeing..."
                                    className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                    value={f.justification}
                                    onChange={(e) => setF({ ...f, justification: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="req_pref_date" className="block text-xs font-bold text-[#2563EB] mb-1">
                                        Preferred Assistance Date <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <input
                                        id="req_pref_date"
                                        type="text"
                                        disabled={!reasonValid}
                                        placeholder="e.g. Within 7 days, By Nov 15, 2026, Before midterm exams..."
                                        className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                        value={f.preferred_assistance_date}
                                        onChange={(e) => setF({ ...f, preferred_assistance_date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="req_urgency" className="block text-xs font-bold text-[#2563EB] mb-1">
                                        Priority Level <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <select
                                        id="req_urgency"
                                        disabled={!dateValid}
                                        className="field w-full text-xs font-semibold disabled:opacity-50 disabled:bg-gray-100"
                                        value={f.urgency}
                                        onChange={(e) => setF({ ...f, urgency: e.target.value })}
                                    >
                                        <option value="low">Low - Routine Need</option>
                                        <option value="medium">Medium - Standard Need</option>
                                        <option value="high">High - Urgent Support</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 7: Optional Supporting Document & Additional Information */}
                    <div>
                        <div className="flex items-center gap-2 border-b border-[#2563EB] pb-2 mb-4">
                            <Icon name="upload" className="text-[#2563EB]" size={18} />
                            <h2 className="text-base font-extrabold text-[#2563EB]">
                                5. Optional Supporting Document & Notes
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border-2 border-dashed border-[#2563EB]/40 bg-white p-5 text-center">
                                {previewUrl ? (
                                    <div className="space-y-3">
                                        <img
                                            src={previewUrl}
                                            alt="Request Preview"
                                            className="mx-auto h-36 max-w-xs rounded-xl border border-[#2563EB] object-cover"
                                        />
                                        <div className="flex justify-center">
                                            <Button type="button" variant="secondary" className="py-1 px-3 text-xs" onClick={removeFile}>
                                                <Icon name="close" className="mr-1" size={14} /> Remove File
                                            </Button>
                                        </div>
                                    </div>
                                ) : f.image ? (
                                    <div className="space-y-2 text-xs font-bold text-[#2563EB]">
                                        <p>📄 Document Attached: {f.image.name}</p>
                                        <Button type="button" variant="secondary" className="py-1 px-3 text-xs" onClick={removeFile}>
                                            Remove File
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <Icon name="upload" className="mx-auto mb-2 text-[#2563EB]" size={32} />
                                        <p className="text-xs font-bold text-[#2563EB]">
                                            Upload Supporting Document / Verification Proof (Optional)
                                        </p>
                                        <p className="mt-1 text-[11px] text-[#2563EB]/70">
                                            e.g. Assessment form, book list, syllabus, medical certificate (PNG, JPG, PDF max 4MB)
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp, application/pdf"
                                            className="hidden"
                                            id="req_file_upload"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="req_file_upload" className="mt-3 inline-block">
                                            <span className="rounded-xl border border-[#2563EB] bg-white px-4 py-2 text-xs font-extrabold text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition cursor-pointer">
                                                Select File
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="req_add_info" className="block text-xs font-bold text-[#2563EB] mb-1">
                                    Additional Information (Optional)
                                </label>
                                <textarea
                                    id="req_add_info"
                                    rows={2}
                                    placeholder="Any special handling instructions, alternatives, or schedule preferences..."
                                    className="field w-full text-xs font-semibold"
                                    value={f.additional_info}
                                    onChange={(e) => setF({ ...f, additional_info: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Control Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2563EB]/30 pt-5">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="secondary" className="text-xs py-2 px-3" onClick={handleSaveDraft}>
                                Save Draft
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className="text-xs py-2 px-3"
                                onClick={() => setShowClearModal(true)}
                            >
                                Clear Form
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || !isFormComplete}
                            loading={loading}
                            className="text-xs py-2.5 px-6 font-extrabold disabled:opacity-50"
                        >
                            Submit Support Request
                        </Button>
                    </div>
                </form>
            )}

            {/* Clear Form Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel no-hover max-h-[90vh] w-full max-w-md overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <h3 className="text-lg font-extrabold text-[#2563EB]">Clear Request Form?</h3>
                        <p className="mt-2 text-xs font-bold text-[#2563EB]">
                            Are you sure you want to clear all entered details and saved draft? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3 border-t border-[#2563EB]/30 pt-3">
                            <Button variant="secondary" onClick={() => setShowClearModal(false)}>
                                Keep Editing
                            </Button>
                            <Button variant="primary" onClick={handleClearForm}>
                                Clear Form
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Summary Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel no-hover max-h-[90vh] w-full max-w-md overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <h3 className="text-lg font-extrabold text-[#2563EB]">Confirm Request Details</h3>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-2.5 text-xs font-bold">
                            <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                <span className="opacity-70">Request Type</span>
                                <span className="font-extrabold uppercase">
                                    {f.request_type === 'financial' ? 'Financial Assistance' : 'Physical Item'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                <span className="opacity-70">Category</span>
                                <span className="font-extrabold uppercase">{f.category}</span>
                            </div>
                            {isPhysical ? (
                                <>
                                    <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                        <span className="opacity-70">Assistance Needed</span>
                                        <span>{f.item_details}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                        <span className="opacity-70">Quantity Needed</span>
                                        <span>{f.quantity_needed} {f.unit}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                        <span className="opacity-70">Amount Requested</span>
                                        <span className="text-[#22C55E]">
                                            {f.currency} {Number(f.amount_requested).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                        <span className="opacity-70">Purpose of Funds</span>
                                        <span>{f.purpose_of_funds}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between border-b border-[#2563EB]/20 pb-2">
                                <span className="opacity-70">Priority Level</span>
                                <span className="uppercase text-[#22C55E]">{f.urgency}</span>
                            </div>
                            <div className="border-b border-[#2563EB]/20 pb-2">
                                <span className="opacity-70 block">Preferred Assistance Date</span>
                                <span>{f.preferred_assistance_date}</span>
                            </div>
                            <div>
                                <span className="opacity-70 block">Reason for Request</span>
                                <p className="font-normal text-[11px] whitespace-pre-wrap">{f.justification}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-[#2563EB]/30 pt-3">
                            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                                Back & Edit
                            </Button>
                            <Button variant="primary" loading={loading} disabled={loading} onClick={handleFinalSubmit}>
                                Confirm & Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function ResourceForm({ donation }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (donation && user.role !== 'donor') return <Navigate to={getRoleDashboard(user.role)} replace />;
    if (!donation && user.role !== 'beneficiary') return <Navigate to={getRoleDashboard(user.role)} replace />;

    return donation ? <DonorDonationForm /> : <BeneficiaryRequestForm />;
}

function EditModal({item, kind, admin, close, done}){
    const [f, setF] = useState({
        ...item,
        name: item.name || '',
        email: item.email || '',
        role: item.role || 'donor',
        contact_number: item.contact_number || '',
        address: item.address || '',
        student_id_number: item.student_id_number || '',
        school_email: item.school_email || '',
        department: item.department || '',
        course: item.course || '',
        year_level: item.year_level || '',
        country: item.country || '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const isUserKind = kind === 'users';

    const save = async e => {
        e.preventDefault();
        setError('');

        if (isUserKind) {
            if (!f.name?.trim()) {
                setError('Full Name is required.');
                return;
            }
            if (!f.email?.trim()) {
                setError('Email Address is required.');
                return;
            }
            if (!item.id && !f.password) {
                setError('Password is required.');
                return;
            }
            if (f.password) {
                if (f.password.length < 8) {
                    setError('Password must be at least 8 characters long.');
                    return;
                }
                if (f.password !== f.password_confirmation) {
                    setError('Password and confirmation do not match.');
                    return;
                }
            }
            if (f.role === 'beneficiary') {
                if (!f.student_id_number?.trim()) {
                    setError('Student ID Number is required for Beneficiary.');
                    return;
                }
                if (!f.school_email?.trim()) {
                    setError('School Email Address is required for Beneficiary.');
                    return;
                }
                if (!f.department?.trim()) {
                    setError('Department is required for Beneficiary.');
                    return;
                }
                if (!f.course?.trim()) {
                    setError('Course / Program is required for Beneficiary.');
                    return;
                }
                if (!f.year_level?.trim()) {
                    setError('Year Level is required for Beneficiary.');
                    return;
                }
            }
            if (f.role === 'staff' || f.role === 'admin') {
                if (!f.campus_id?.trim()) {
                    setError('Campus ID Number is required for ' + (f.role === 'admin' ? 'Administrator' : 'Staff') + '.');
                    return;
                }
            }
        }

        setSaving(true);
        const payload = { ...f };
        if (isUserKind) {
            if (payload.role === 'beneficiary') {
                payload.address = '';
                payload.campus_id = '';
            } else if (payload.role === 'donor') {
                payload.student_id_number = '';
                payload.school_email = '';
                payload.department = '';
                payload.course = '';
                payload.year_level = '';
                payload.campus_id = '';
            } else {
                payload.address = '';
                payload.student_id_number = '';
                payload.school_email = '';
                payload.department = '';
                payload.course = '';
                payload.year_level = '';
            }
            if (!payload.password) {
                delete payload.password;
                delete payload.password_confirmation;
            }
        }

        try {
            const path = admin && isUserKind ? `/admin/users${item.id ? `/${item.id}` : ''}` : `/${kind}/${item.id}`;
            await (item.id ? api.patch(path, payload) : api.post(path, payload));
            await done();
            close();
        } catch (e) {
            const valMsg = e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' ') : null;
            setError(valMsg || e.response?.data?.message || 'Could not save changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
            <form className="panel no-hover w-full max-w-lg p-6 bg-white max-h-[90vh] overflow-y-auto space-y-4" onSubmit={save}>
                <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                    <h2 className="text-lg font-extrabold text-[#2563EB]">{item.id ? (isUserKind ? 'Edit Member Account' : 'Edit entry') : (isUserKind ? 'Add New Member' : 'Add entry')}</h2>
                    <button type="button" title="Close" className="nav-link p-1" onClick={close}><Icon name="close"/></button>
                </div>

                {isUserKind ? (
                    <div className="space-y-3 text-left">
                        <div>
                            <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                Full Name <span className="text-[#22C55E]">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className="field w-full text-xs font-semibold"
                                placeholder="Enter full name"
                                value={f.name || ''}
                                onChange={e => setF({...f, name: e.target.value})}
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                    Email Address <span className="text-[#22C55E]">*</span>
                                </label>
                                <input
                                    required
                                    type="email"
                                    className="field w-full text-xs font-semibold"
                                    placeholder="Enter email address"
                                    value={f.email || ''}
                                    onChange={e => setF({...f, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    className="field w-full text-xs font-semibold"
                                    placeholder="+63 912 345 6789"
                                    value={f.contact_number || ''}
                                    onChange={e => setF({...f, contact_number: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                    Account Role <span className="text-[#22C55E]">*</span>
                                </label>
                                <select
                                    required
                                    className="field w-full text-xs font-semibold"
                                    value={f.role || 'donor'}
                                    onChange={e => setF({...f, role: e.target.value})}
                                >
                                    <option value="donor">Donor</option>
                                    <option value="beneficiary">Beneficiary</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                        </div>

                        {/* Beneficiary-specific fields */}
                        {f.role === 'beneficiary' && (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                            Student ID Number <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="field w-full text-xs font-semibold"
                                            placeholder="Enter student ID number"
                                            value={f.student_id_number || ''}
                                            onChange={e => setF({...f, student_id_number: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                            School Email Address <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="field w-full text-xs font-semibold"
                                            placeholder="Enter school email"
                                            value={f.school_email || ''}
                                            onChange={e => setF({...f, school_email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                            Department <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="field w-full text-xs font-semibold"
                                            placeholder="Enter department"
                                            value={f.department || ''}
                                            onChange={e => setF({...f, department: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                            Course / Program <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="field w-full text-xs font-semibold"
                                            placeholder="Enter course / program"
                                            value={f.course || ''}
                                            onChange={e => setF({...f, course: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                            Year Level <span className="text-[#22C55E]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="field w-full text-xs font-semibold"
                                            placeholder="e.g. 1st Year"
                                            value={f.year_level || ''}
                                            onChange={e => setF({...f, year_level: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                            Country / Region
                                        </label>
                                        <input
                                            type="text"
                                            className="field w-full text-xs font-semibold"
                                            placeholder="e.g. Philippines"
                                            value={f.country || ''}
                                            onChange={e => setF({...f, country: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Donor-specific fields */}
                        {f.role === 'donor' && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">Address</label>
                                    <input
                                        type="text"
                                        className="field w-full text-xs font-semibold"
                                        placeholder="Enter address"
                                        value={f.address || ''}
                                        onChange={e => setF({...f, address: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                        Country / Region
                                    </label>
                                    <input
                                        type="text"
                                        className="field w-full text-xs font-semibold"
                                        placeholder="e.g. Philippines"
                                        value={f.country || ''}
                                        onChange={e => setF({...f, country: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Staff / Admin specific fields */}
                        {(f.role === 'staff' || f.role === 'admin') && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                        Campus ID Number <span className="text-[#22C55E]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="field w-full text-xs font-semibold"
                                        placeholder="e.g. 2024-019852"
                                        value={f.campus_id || ''}
                                        onChange={e => setF({...f, campus_id: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                        Country / Region
                                    </label>
                                    <input
                                        type="text"
                                        className="field w-full text-xs font-semibold"
                                        placeholder="e.g. Philippines"
                                        value={f.country || ''}
                                        onChange={e => setF({...f, country: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password & Confirm Password */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                    {item.id ? 'New Password' : 'Password'} {!item.id && <span className="text-[#22C55E]">*</span>}
                                </label>
                                <input
                                    required={!item.id}
                                    type="password"
                                    minLength={8}
                                    className="field w-full text-xs font-semibold"
                                    placeholder={item.id ? 'Leave empty to keep' : 'Min. 8 characters'}
                                    value={f.password || ''}
                                    onChange={e => setF({...f, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                                    {item.id ? 'Confirm New Password' : 'Confirm Password'} {!item.id && <span className="text-[#22C55E]">*</span>}
                                </label>
                                <input
                                    required={!item.id || !!f.password}
                                    type="password"
                                    minLength={8}
                                    className="field w-full text-xs font-semibold"
                                    placeholder="Re-enter password"
                                    value={f.password_confirmation || ''}
                                    onChange={e => setF({...f, password_confirmation: e.target.value})}
                                />
                            </div>
                        </div>
                        {f.password && f.password_confirmation && (
                            <p className={`text-[11px] font-bold ${f.password === f.password_confirmation ? 'text-[#22C55E]' : 'text-red-500'}`}>
                                {f.password === f.password_confirmation ? '✓ Passwords match' : '✕ Passwords do not match'}
                            </p>
                        )}
                    </div>
                ) : (
                    Object.entries(f).filter(([k]) => !['id','status','created_at','beneficiary','donor','profile_photo_url','profile_photo_path','email_verified_at','updated_at'].includes(k)).map(([k, v]) => (typeof v === 'string' || typeof v === 'number') && (
                        <label key={k} className="mt-3 block text-sm font-bold text-left text-[#2563EB]">
                            {title(k)}
                            {k === 'role' ? (
                                <select className="field mt-1 w-full" value={v} onChange={e => setF({...f, [k]: e.target.value})}>
                                    <option value="donor">donor</option>
                                    <option value="beneficiary">beneficiary</option>
                                    <option value="staff">staff</option>
                                    <option value="admin">admin</option>
                                </select>
                            ) : (
                                <input required={k !== 'password'} className="field mt-1 w-full" type={k === 'password' ? 'password' : 'text'} value={v ?? ''} onChange={e => setF({...f, [k]: e.target.value})}/>
                            )}
                        </label>
                    ))
                )}

                <Error>{error}</Error>

                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-[#2563EB]/20 pt-3">
                    <Button type="button" variant="secondary" onClick={close}><Icon name="close"/><span className="ml-1.5">Cancel</span></Button>
                    <Button loading={saving}><Icon name="save"/><span className="ml-1.5">{item.id ? 'Save Changes' : 'Create Account'}</span></Button>
                </div>
            </form>
        </div>
    );
}

function PeopleManager(){
    const {user} = useAuth();
    const [state, setState] = useState({loading: true, data: [], error: ''});
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');
    const [editing, setEditing] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const load = () => {
        if(!user) return;
        setState(s => ({...s, loading: true}));
        api.get('/admin/users')
            .then(r => setState({loading: false, data: r.data.data || r.data || [], error: ''}))
            .catch(() => setState({loading: false, data: [], error: 'Could not load members.'}));
    };

    useEffect(load, [user]);

    if(!user) return <Navigate to="/login"/>;
    if(user.role !== 'admin') return <Navigate to={getRoleDashboard(user.role)} replace/>;

    let filtered = state.data.filter(u => {
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.contact_number && u.contact_number.toLowerCase().includes(q)) ||
            (u.campus_id && u.campus_id.toLowerCase().includes(q)) ||
            (u.student_id_number && u.student_id_number.toLowerCase().includes(q)) ||
            (u.school_email && u.school_email.toLowerCase().includes(q)) ||
            (u.department && u.department.toLowerCase().includes(q)) ||
            (u.course && u.course.toLowerCase().includes(q)) ||
            (u.country && u.country.toLowerCase().includes(q)) ||
            (u.country_code && u.country_code.toLowerCase().includes(q));
        return matchesRole && matchesSearch;
    });

    filtered.sort((a, b) => {
        if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
        if (sortBy === 'email_asc') return (a.email || '').localeCompare(b.email || '');
        if (sortBy === 'role') return (a.role || '').localeCompare(b.role || '');
        if (sortBy === 'date_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalMembers = state.data.length;
    const totalDonors = state.data.filter(u => u.role === 'donor').length;
    const totalBeneficiaries = state.data.filter(u => u.role === 'beneficiary').length;
    const totalAdmins = state.data.filter(u => u.role === 'admin').length;

    const confirmDelete = async () => {
        if(!deletingUser) return;
        setDeleting(true);
        const memberName = deletingUser.name;
        try {
            await api.delete(`/admin/users/${deletingUser.id}`);
            setDeletingUser(null);
            setSuccessMessage(`Member account "${memberName}" was successfully deleted.`);
            setTimeout(() => setSuccessMessage(''), 5000);
            load();
        } catch(e) {
            setState(s => ({...s, error: e.response?.data?.message || 'Could not delete user account.'}));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">ADMINISTRATOR WORKSPACE</p>
                    <h1 className="page-title">Members & Accounts</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Manage user roles, inspect account profiles, and authorize campus accounts.
                    </p>
                </div>
                <Button onClick={() => setEditing({name: '', email: '', role: 'donor', contact_number: '', address: '', student_id_number: '', school_email: '', department: '', course: '', year_level: '', country: '', password: '', password_confirmation: ''})}>
                    <Icon name="plus"/><span className="ml-2">Add Member</span>
                </Button>
            </div>

            <Error>{state.error}</Error>
            {successMessage && (
                <div className="rounded-xl border border-[#22C55E] bg-white p-4 text-sm font-bold text-[#22C55E] shadow-sm flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="text-[#22C55E] hover:underline font-extrabold text-xs">Dismiss</button>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Total Members</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{totalMembers}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="users"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Donors</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{totalDonors}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="donation"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Beneficiaries</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{totalBeneficiaries}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="request"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Administrators</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{totalAdmins}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="profile"/>
                    </span>
                </article>
            </div>

            <div className="panel no-hover p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Search Members</label>
                    <input
                        type="text"
                        placeholder="Search by name, email, contact, ID number, or role..."
                        className="field w-full text-sm"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="min-w-[160px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Filter by Role</label>
                    <select
                        className="field w-full text-sm"
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Roles</option>
                        <option value="donor">Donors</option>
                        <option value="beneficiary">Beneficiaries</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Administrators</option>
                    </select>
                </div>

                <div className="min-w-[160px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Sort By</label>
                    <select
                        className="field w-full text-sm"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                        <option value="email_asc">Email (A-Z)</option>
                        <option value="role">Role</option>
                        <option value="date_desc">Newest First</option>
                    </select>
                </div>
            </div>

            {state.loading ? (
                <div className="panel no-hover p-8 text-center font-bold text-[#2563EB]">
                    Loading member accounts...
                </div>
            ) : !filtered.length ? (
                <div className="panel no-hover p-8 text-center">
                    <p className="font-bold text-[#2563EB] text-lg">No member accounts found.</p>
                    <p className="text-xs text-[#2563EB]/80 font-semibold mt-1">Try adjusting your search query or role filter.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="hidden sm:block table-wrap no-hover">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Email Address</th>
                                    <th>Contact Number</th>
                                    <th>Account Type</th>
                                    <th>ID Number</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(userItem => {
                                    const initial = userItem.name ? userItem.name.charAt(0).toUpperCase() : 'U';
                                    return (
                                        <tr key={userItem.id}>
                                            <td>
                                                <div className="flex items-center gap-2.5">
                                                    {userItem.profile_photo_url ? (
                                                        <img
                                                            src={userItem.profile_photo_url}
                                                            alt={userItem.name}
                                                            className="h-8 w-8 rounded-full object-cover border border-[#2563EB]/20 shrink-0"
                                                        />
                                                    ) : (
                                                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2563EB] text-xs font-extrabold text-white shrink-0">
                                                            {initial}
                                                        </span>
                                                    )}
                                                    <div className="min-w-0">
                                                        <strong className="block text-xs font-bold text-[#2563EB] truncate max-w-[150px]" title={userItem.name}>
                                                            {userItem.name}
                                                        </strong>
                                                        {userItem.role === 'donor' && userItem.campus_id && (
                                                            <span className="text-[10px] font-semibold text-[#2563EB]/70 block truncate max-w-[150px]">
                                                                ID: {userItem.campus_id}
                                                            </span>
                                                        )}
                                                        {userItem.role === 'beneficiary' && userItem.student_id_number && (
                                                            <span className="text-[10px] font-semibold text-[#2563EB]/70 block truncate max-w-[150px]">
                                                                SID: {userItem.student_id_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="max-w-[200px] truncate" title={userItem.email}>
                                                <span className="text-xs font-medium text-[#2563EB]">{userItem.email}</span>
                                            </td>
                                            <td>
                                                <span className="text-xs font-semibold text-[#2563EB]/80">
                                                    {userItem.contact_number || '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <Badge status={userItem.role}/>
                                            </td>
                                            <td>
                                                <span className="text-xs font-mono font-bold text-[#2563EB]">
                                                    {userItem.role === 'donor'
                                                        ? (userItem.campus_id || '—')
                                                        : userItem.role === 'beneficiary'
                                                            ? (userItem.student_id_number || '—')
                                                            : '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="rounded bg-[#22C55E] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                                                    Active
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-xs font-semibold text-[#2563EB]/80">
                                                    {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Button title="View Details" variant="secondary" onClick={() => setViewingUser(userItem)}>
                                                        <Icon name="eye"/>
                                                        <span className="ml-1 text-xs">View</span>
                                                    </Button>
                                                    <Button title="Edit Member" variant="secondary" onClick={() => setEditing(userItem)}>
                                                        <Icon name="edit"/>
                                                        <span className="ml-1 text-xs">Edit</span>
                                                    </Button>
                                                    <Button title="Delete Member" variant="secondary" onClick={() => setDeletingUser(userItem)}>
                                                        <Icon name="delete"/>
                                                        <span className="ml-1 text-xs">Delete</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 sm:hidden">
                        {paginated.map(userItem => {
                            const initial = userItem.name ? userItem.name.charAt(0).toUpperCase() : 'U';
                            return (
                                <article key={userItem.id} className="panel no-hover p-4 space-y-3 bg-white">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            {userItem.profile_photo_url ? (
                                                <img
                                                    src={userItem.profile_photo_url}
                                                    alt={userItem.name}
                                                    className="h-10 w-10 rounded-full object-cover border border-[#2563EB]/20 shrink-0"
                                                />
                                            ) : (
                                                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2563EB] text-sm font-extrabold text-white shrink-0">
                                                    {initial}
                                                </span>
                                            )}
                                            <div>
                                                <strong className="text-base text-[#2563EB] block">{userItem.name}</strong>
                                                <span className="text-xs font-medium text-[#2563EB]/80 break-all">{userItem.email}</span>
                                            </div>
                                        </div>
                                        <Badge status={userItem.role}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#2563EB]/80 border-t border-[#2563EB]/15 pt-2">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider text-[#2563EB]/60 block">Contact</span>
                                            <span>{userItem.contact_number || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider text-[#2563EB]/60 block">ID Number</span>
                                            <span className="font-mono">
                                                {userItem.role === 'donor'
                                                    ? (userItem.campus_id || '—')
                                                    : userItem.role === 'beneficiary'
                                                        ? (userItem.student_id_number || '—')
                                                        : '—'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider text-[#2563EB]/60 block">Joined</span>
                                            <span>{userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1 border-t border-[#2563EB]/15">
                                        <Button title="View Details" variant="secondary" onClick={() => setViewingUser(userItem)}>
                                            <Icon name="eye"/>
                                            <span className="ml-1 text-xs">View</span>
                                        </Button>
                                        <Button title="Edit Member" variant="secondary" onClick={() => setEditing(userItem)}>
                                            <Icon name="edit"/>
                                            <span className="ml-1 text-xs">Edit</span>
                                        </Button>
                                        <Button title="Delete Member" variant="secondary" onClick={() => setDeletingUser(userItem)}>
                                            <Icon name="delete"/>
                                            <span className="ml-1 text-xs">Delete</span>
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="panel no-hover p-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xs font-bold text-[#2563EB]">
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} members
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &larr; Previous
                                </Button>
                                <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next &rarr;
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewingUser && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel no-hover w-full max-w-lg p-6 bg-white space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Member Account Details</h2>
                            <button className="nav-link p-1" onClick={() => setViewingUser(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <div className="flex items-center gap-4 py-2">
                            {viewingUser.profile_photo_url ? (
                                <img
                                    src={viewingUser.profile_photo_url}
                                    alt={viewingUser.name}
                                    className="h-16 w-16 rounded-2xl border-2 border-[#2563EB] object-cover shrink-0"
                                />
                            ) : (
                                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#2563EB] text-xl font-extrabold text-white shrink-0">
                                    {viewingUser.name ? viewingUser.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            )}
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-extrabold text-[#2563EB] truncate">{viewingUser.name}</h3>
                                <p className="text-xs font-semibold text-[#2563EB]/80 truncate">{viewingUser.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge status={viewingUser.role}/>
                                    <span className="rounded bg-[#22C55E] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 border-t border-b border-[#2563EB]/20 py-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                <span className="font-bold text-[#2563EB]/70">Account ID:</span>
                                <span className="font-extrabold text-[#2563EB]">#{viewingUser.id}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                <span className="font-bold text-[#2563EB]/70">Full Name:</span>
                                <span className="font-extrabold text-[#2563EB]">{viewingUser.name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                <span className="font-bold text-[#2563EB]/70">Email Address:</span>
                                <span className="font-semibold text-[#2563EB]">{viewingUser.email}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                <span className="font-bold text-[#2563EB]/70">Contact Number:</span>
                                <span className="font-semibold text-[#2563EB]">{viewingUser.contact_number || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                <span className="font-bold text-[#2563EB]/70">Country / Code:</span>
                                <span className="font-semibold text-[#2563EB]">{viewingUser.country || 'Not provided'}{viewingUser.country_code ? ` (${viewingUser.country_code})` : ''}</span>
                            </div>
                            {viewingUser.role === 'donor' && (<>
                                <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                    <span className="font-bold text-[#2563EB]/70">Address:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingUser.address || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                    <span className="font-bold text-[#2563EB]/70">Valid ID Number:</span>
                                    <span className="font-mono font-bold text-[#2563EB]">{viewingUser.campus_id || 'N/A'}</span>
                                </div>
                            </>)}
                            {viewingUser.role === 'beneficiary' && (<>
                                <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                    <span className="font-bold text-[#2563EB]/70">Student ID Number:</span>
                                    <span className="font-mono font-bold text-[#2563EB]">{viewingUser.student_id_number || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                    <span className="font-bold text-[#2563EB]/70">School Email:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingUser.school_email || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                    <span className="font-bold text-[#2563EB]/70">Department:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingUser.department || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                    <span className="font-bold text-[#2563EB]/70">Course:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingUser.course || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                    <span className="font-bold text-[#2563EB]/70">Year Level:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingUser.year_level || 'Not provided'}</span>
                                </div>
                            </>)}
                            {(viewingUser.role === 'admin' || viewingUser.role === 'staff') && (
                                <div className="flex justify-between py-1 border-b border-[#2563EB]/10">
                                    <span className="font-bold text-[#2563EB]/70">Campus ID Number:</span>
                                    <span className="font-mono font-bold text-[#2563EB]">{viewingUser.campus_id || 'N/A'}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-1">
                                <span className="font-bold text-[#2563EB]/70">Registration Date:</span>
                                <span className="font-semibold text-[#2563EB]">
                                    {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setViewingUser(null)}>
                                Close
                            </Button>
                            <Button onClick={() => { setEditing(viewingUser); setViewingUser(null); }}>
                                <Icon name="edit"/>
                                <span className="ml-1">Edit Account</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deletingUser && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel no-hover w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Confirm Delete Member</h2>
                            <button className="nav-link p-1" onClick={() => setDeletingUser(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to delete member <strong>{deletingUser.name}</strong> (<em>{deletingUser.email}</em>)?
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            This action cannot be undone and will permanently remove this account from the ReliefLink directory.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-3">
                            <Button loading={deleting} onClick={confirmDelete}>
                                <Icon name="delete"/>
                                <span className="ml-1">Confirm Delete</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setDeletingUser(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {editing && <EditModal item={editing} kind="users" admin={true} close={() => setEditing(null)} done={load}/>}
        </main>
    );
}

function DonationManager(){
    const {user} = useAuth();
    const [state, setState] = useState({loading: true, data: [], error: ''});
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [editing, setEditing] = useState(null);
    const [viewingDonation, setViewingDonation] = useState(null);
    const [deletingDonation, setDeletingDonation] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const load = () => {
        if(!user) return;
        setState(s => ({...s, loading: true}));
        const endpoint = ['admin', 'staff'].includes(user.role) ? '/admin/donations' : '/donations?mine=1';
        api.get(endpoint)
            .then(r => setState({loading: false, data: r.data.data || r.data || [], error: ''}))
            .catch(() => setState({loading: false, data: [], error: 'Could not load donation records.'}));
    };

    useEffect(load, [user]);

    if(!user) return <Navigate to="/login"/>;
    if(!['donor','staff','admin'].includes(user.role)) return <Navigate to={getRoleDashboard(user.role)} replace/>;

    let filtered = state.data.filter(d => {
        const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            (d.item_name && d.item_name.toLowerCase().includes(q)) ||
            (d.category && d.category.toLowerCase().includes(q)) ||
            (d.donor?.name && d.donor.name.toLowerCase().includes(q)) ||
            (d.pickup_location && d.pickup_location.toLowerCase().includes(q)) ||
            (d.condition_notes && d.condition_notes.toLowerCase().includes(q));
        return matchesCategory && matchesStatus && matchesSearch;
    });

    filtered.sort((a, b) => {
        if (sortBy === 'name_asc') return (a.item_name || a.category || '').localeCompare(b.item_name || b.category || '');
        if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
        if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
        if (sortBy === 'quantity_desc') return (b.quantity || 1) - (a.quantity || 1);
        if (sortBy === 'date_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalCount = state.data.length;
    const pendingCount = state.data.filter(d => d.status === 'proposed' || d.status?.includes('pending')).length;
    const matchedCount = state.data.filter(d => d.status === 'matched' || d.status === 'confirmed').length;
    const fulfilledCount = state.data.filter(d => d.status === 'fulfilled' || d.status === 'completed').length;

    const confirmDelete = async () => {
        if(!deletingDonation) return;
        setDeleting(true);
        const itemName = deletingDonation.item_name || title(deletingDonation.category);
        try {
            await api.delete(user.role === 'admin' ? `/admin/donations/${deletingDonation.id}` : `/donations/${deletingDonation.id}`);
            setDeletingDonation(null);
            setSuccessMessage(`Donation item "${itemName}" was successfully deleted.`);
            setTimeout(() => setSuccessMessage(''), 5000);
            load();
        } catch(e) {
            setState(s => ({...s, error: e.response?.data?.message || 'Could not delete donation record.'}));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">{user.role === 'admin' ? 'ADMINISTRATOR WORKSPACE' : 'DONOR WORKSPACE'}</p>
                    <h1 className="page-title">Donations & Listed Resources</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        View, track, inspect, and manage community resource contributions.
                    </p>
                </div>
                {user.role === 'donor' && (
                    <NavLink to="/donate" className="rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-white hover:text-[#2563EB] transition inline-flex items-center gap-2">
                        <Icon name="plus"/>
                        <span>Make a Donation</span>
                    </NavLink>
                )}
            </div>

            <Error>{state.error}</Error>
            {successMessage && (
                <div className="rounded-xl border border-[#22C55E] bg-white p-4 text-sm font-bold text-[#22C55E] shadow-sm flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="text-[#22C55E] hover:underline font-extrabold text-xs">Dismiss</button>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Total Donations</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{totalCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="donation"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Pending / Proposed</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{pendingCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="approvals"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Matched Items</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{matchedCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="match"/>
                    </span>
</article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Fulfilled</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{fulfilledCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="check"/>
                    </span>
                </article>
            </div>

            <div className="panel no-hover p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Search Donations</label>
                    <input
                        type="text"
                        placeholder="Search by resource, donor, category..."
                        className="field w-full text-sm"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Category</label>
                    <select
                        className="field w-full text-sm"
                        value={categoryFilter}
                        onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Categories</option>
                        <option value="food">Food</option>
                        <option value="clothing">Clothing</option>
                        <option value="hygiene">Hygiene</option>
                        <option value="school supplies">School Supplies</option>
                        <option value="books">Books</option>
                        <option value="technology">Technology</option>
                    </select>
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Status</label>
                    <select
                        className="field w-full text-sm"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="proposed">Proposed</option>
                        <option value="pending_match">Pending Match</option>
                        <option value="matched">Matched</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="fulfilled">Fulfilled</option>
                    </select>
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Sort By</label>
                    <select
                        className="field w-full text-sm"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="date_desc">Newest First</option>
                        <option value="name_asc">Resource Name</option>
                        <option value="category">Category</option>
                        <option value="status">Status</option>
                        <option value="quantity_desc">Quantity (High to Low)</option>
                    </select>
                </div>
            </div>

            {state.loading ? (
                <div className="panel no-hover p-8 text-center font-bold text-[#2563EB]">
                    Loading donation records...
                </div>
            ) : !filtered.length ? (
                <div className="panel no-hover p-8 text-center">
                    <p className="font-bold text-[#2563EB] text-lg">No donation records found.</p>
                    <p className="text-xs text-[#2563EB]/80 font-semibold mt-1">Try adjusting your search terms or filters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="hidden sm:block table-wrap no-hover">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Resource</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Donor</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(item => (
                                    <tr key={item.id}>
                                        <td className="max-w-[200px] truncate" title={item.item_name || title(item.category)}>
                                            <strong>{item.item_name || title(item.category)}</strong>
                                        </td>
                                        <td>{title(item.category)}</td>
                                        <td>{item.quantity || 1} units</td>
                                        <td className="max-w-[180px] truncate" title={item.donor?.name || 'Donor'}>
                                            <span className="text-sm font-semibold text-[#2563EB]">{item.donor?.name || 'Campus Donor'}</span>
                                        </td>
                                        <td><Badge status={item.status}/></td>
                                        <td>
                                            <div className="flex flex-wrap gap-2">
                                                <Button title="View Donation" variant="secondary" onClick={() => setViewingDonation(item)}>
                                                    <Icon name="eye"/>
                                                    <span className="ml-1 text-xs">View</span>
                                                </Button>
                                                {((user.role === 'donor' && item.status?.startsWith('pending')) || user.role === 'admin') && (
                                                    <Button title="Edit Donation" variant="secondary" onClick={() => setEditing(item)}>
                                                        <Icon name="edit"/>
                                                        <span className="ml-1 text-xs">Edit</span>
                                                    </Button>
                                                )}
                                                {((user.role === 'donor' && item.status?.startsWith('pending')) || user.role === 'admin') && (
                                                    <Button title="Delete Donation" variant="secondary" onClick={() => setDeletingDonation(item)}>
                                                        <Icon name="delete"/>
                                                        <span className="ml-1 text-xs">Delete</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 sm:hidden">
                        {paginated.map(item => (
                            <article key={item.id} className="panel no-hover p-4 space-y-3 bg-white">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <strong className="text-base text-[#2563EB] block">{item.item_name || title(item.category)}</strong>
                                        <span className="text-xs font-semibold text-[#2563EB]/80">{title(item.category)} • {item.quantity || 1} units</span>
                                    </div>
                                    <Badge status={item.status}/>
                                </div>
                                <div className="text-xs font-semibold text-[#2563EB]/70 border-t border-[#2563EB]/20 pt-2 flex items-center justify-between">
                                    <span>Donor: {item.donor?.name || 'Campus Donor'}</span>
                                    <span>Listed: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Button title="View Donation" variant="secondary" onClick={() => setViewingDonation(item)}>
                                        <Icon name="eye"/>
                                        <span className="ml-1 text-xs">View</span>
                                    </Button>
                                    {((user.role === 'donor' && item.status?.startsWith('pending')) || user.role === 'admin') && (
                                        <Button title="Edit Donation" variant="secondary" onClick={() => setEditing(item)}>
                                            <Icon name="edit"/>
                                            <span className="ml-1 text-xs">Edit</span>
                                        </Button>
                                    )}
                                    {((user.role === 'donor' && item.status?.startsWith('pending')) || user.role === 'admin') && (
                                        <Button title="Delete Donation" variant="secondary" onClick={() => setDeletingDonation(item)}>
                                            <Icon name="delete"/>
                                            <span className="ml-1 text-xs">Delete</span>
                                        </Button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="panel no-hover p-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xs font-bold text-[#2563EB]">
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} donations
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &larr; Previous
                                </Button>
                                <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next &rarr;
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewingDonation && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel no-hover w-full max-w-lg p-6 bg-white space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Donation Details Inspection</h2>
                            <button className="nav-link p-1" onClick={() => setViewingDonation(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        {viewingDonation.image_url && (
                            <img src={viewingDonation.image_url} alt={viewingDonation.item_name} className="h-44 w-full rounded-xl object-cover border border-[#2563EB]"/>
                        )}
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">{title(viewingDonation.category)}</span>
                            <h3 className="text-xl font-extrabold text-[#2563EB] mt-0.5">{viewingDonation.item_name || title(viewingDonation.category)}</h3>
                        </div>
                        <div className="space-y-2 border-t border-b border-[#2563EB]/20 py-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[#2563EB]/70">Status:</span>
                                <Badge status={viewingDonation.status}/>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Quantity Available:</span>
                                <span className="font-extrabold text-[#2563EB]">{viewingDonation.quantity || 1} units</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Donor Name:</span>
                                <span className="font-semibold text-[#2563EB]">{viewingDonation.donor?.name || 'Campus Donor'}</span>
                            </div>
                            {viewingDonation.donor?.email && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-[#2563EB]/70">Donor Email:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingDonation.donor.email}</span>
                                </div>
                            )}
                            {viewingDonation.pickup_location && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-[#2563EB]/70">Pickup Location:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingDonation.pickup_location}</span>
                                </div>
                            )}
                            {viewingDonation.availability_window && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-[#2563EB]/70">Availability Window:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingDonation.availability_window}</span>
                                </div>
                            )}
                            {viewingDonation.condition_notes && (
                                <div className="pt-1">
                                    <span className="font-bold text-[#2563EB]/70 block">Condition Notes:</span>
                                    <p className="mt-1 text-xs text-[#2563EB] bg-[#2563EB]/5 p-2 rounded-lg border border-[#2563EB]/20">{viewingDonation.condition_notes}</p>
                                </div>
                            )}
                            <div className="flex justify-between pt-1">
                                <span className="font-bold text-[#2563EB]/70">Date Listed:</span>
                                <span className="font-semibold text-[#2563EB]">
                                    {viewingDonation.created_at ? new Date(viewingDonation.created_at).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setViewingDonation(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deletingDonation && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel no-hover w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Confirm Delete Donation</h2>
                            <button className="nav-link p-1" onClick={() => setDeletingDonation(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to delete donation item <strong>"{deletingDonation.item_name || title(deletingDonation.category)}"</strong>?
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            This action cannot be undone and will permanently remove this resource listing.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-3">
                            <Button loading={deleting} onClick={confirmDelete}>
                                <Icon name="delete"/>
                                <span className="ml-1">Confirm Delete</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setDeletingDonation(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {editing && <EditModal item={editing} kind="donations" admin={user.role === 'admin'} close={() => setEditing(null)} done={load}/>}
        </main>
    );
}

function RequestManager(){
    const {user} = useAuth();
    const [state, setState] = useState({loading: true, data: [], error: ''});
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [editing, setEditing] = useState(null);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [cancellingRequest, setCancellingRequest] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [deletingRequest, setDeletingRequest] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const load = () => {
        if(!user) return;
        setState(s => ({...s, loading: true}));
        const endpoint = user.role === 'admin' ? '/admin/requests' : '/requests?mine=1';
        api.get(endpoint)
            .then(r => setState({loading: false, data: r.data.data || r.data || [], error: ''}))
            .catch(() => setState({loading: false, data: [], error: 'Could not load support requests.'}));
    };

    useEffect(load, [user]);

    if(!user) return <Navigate to="/login"/>;
    if(!['beneficiary','admin'].includes(user.role)) return <Navigate to={getRoleDashboard(user.role)} replace/>;

    let filtered = state.data.filter(r => {
        const matchesType = typeFilter === 'all' || (r.request_type || 'physical') === typeFilter;
        const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            (r.category && r.category.toLowerCase().includes(q)) ||
            (r.item_details && r.item_details.toLowerCase().includes(q)) ||
            (r.purpose_of_funds && r.purpose_of_funds.toLowerCase().includes(q)) ||
            (r.beneficiary?.name && r.beneficiary.name.toLowerCase().includes(q)) ||
            (r.urgency && r.urgency.toLowerCase().includes(q)) ||
            (r.justification && r.justification.toLowerCase().includes(q));
        return matchesType && matchesCategory && matchesStatus && matchesSearch;
    });

    const urgencyWeight = { high: 3, medium: 2, low: 1 };

    filtered.sort((a, b) => {
        if (sortBy === 'urgency_desc') return (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0);
        if (sortBy === 'date_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
        if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalCount = state.data.length;
    const pendingCount = state.data.filter(r => ['pending_review', 'under_review', 'proposed'].includes(r.status)).length;
    const approvedCount = state.data.filter(r => ['approved', 'matched', 'partially_fulfilled'].includes(r.status)).length;
    const fulfilledCount = state.data.filter(r => ['fulfilled', 'completed'].includes(r.status)).length;

    const handleApproveDecline = async (id, status) => {
        setActionLoading(true);
        try {
            await api.patch(`/admin/requests/${id}`, { status });
            if (viewingRequest?.id === id) {
                setViewingRequest(prev => prev ? ({ ...prev, status }) : null);
            }
            setSuccessMessage(`Request status updated to ${status}.`);
            setTimeout(() => setSuccessMessage(''), 4000);
            load();
        } catch(e) {
            setState(s => ({...s, error: e.response?.data?.message || 'Could not update request status.'}));
        } finally {
            setActionLoading(false);
        }
    };

    const confirmCancel = async () => {
        if (!cancellingRequest || !cancellationReason.trim()) return;
        setCancelling(true);
        try {
            await api.patch(`/requests/${cancellingRequest.id}/cancel`, { reason: cancellationReason.trim() });
            setCancellingRequest(null);
            setCancellationReason('');
            setSuccessMessage('Support request was successfully cancelled.');
            setTimeout(() => setSuccessMessage(''), 4000);
            load();
        } catch (e) {
            setState(s => ({...s, error: e.response?.data?.message || 'Could not cancel request.'}));
        } finally {
            setCancelling(false);
        }
    };

    const confirmDelete = async () => {
        if(!deletingRequest) return;
        setDeleting(true);
        const reqName = title(deletingRequest.category);
        try {
            await api.delete(user.role === 'admin' ? `/admin/requests/${deletingRequest.id}` : `/requests/${deletingRequest.id}`);
            setDeletingRequest(null);
            setSuccessMessage(`Support request for "${reqName}" was successfully deleted.`);
            setTimeout(() => setSuccessMessage(''), 5000);
            load();
        } catch(e) {
            setState(s => ({...s, error: e.response?.data?.message || 'Could not delete request.'}));
        } finally {
            setDeleting(false);
        }
    };

    const openSupportingDocument = async (req) => {
        try {
            const response = await api.get(`/requests/${req.id}/document`, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data);
            window.open(objectUrl, '_blank', 'noopener,noreferrer');
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        } catch (err) {
            setState(s => ({...s, error: err.response?.data?.message || 'The supporting document could not be opened.'}));
        }
    };

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">{user.role === 'admin' ? 'ADMINISTRATOR WORKSPACE' : 'BENEFICIARY WORKSPACE'}</p>
                    <h1 className="page-title">Support Requests & Needs</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Review, track, manage, and monitor status updates for campus support requests.
                    </p>
                </div>
                {user.role === 'beneficiary' && (
                    <NavLink to="/request-help" className="rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-white hover:text-[#2563EB] transition inline-flex items-center gap-2">
                        <Icon name="plus"/>
                        <span>+ Create Support Request</span>
                    </NavLink>
                )}
            </div>

            <Error>{state.error}</Error>
            {successMessage && (
                <div className="rounded-xl border border-[#22C55E] bg-white p-4 text-sm font-bold text-[#22C55E] shadow-sm flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="text-[#22C55E] hover:underline font-extrabold text-xs">Dismiss</button>
                </div>
            )}

            {/* KPI Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Total Requests</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{totalCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="request"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Pending / Review</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{pendingCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="approvals"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Approved / Active</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{approvedCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-white text-[#22C55E]">
                        <Icon name="check"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Fulfilled</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{fulfilledCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="check"/>
                    </span>
                </article>
            </div>

            {/* Filter & Search Bar */}
            <div className="panel no-hover p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Search Requests</label>
                    <input
                        type="text"
                        placeholder="Search category, item, purpose, requester..."
                        className="field w-full text-sm"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="min-w-[130px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Type</label>
                    <select
                        className="field w-full text-sm"
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Types</option>
                        <option value="physical">Physical Item</option>
                        <option value="financial">Financial Assistance</option>
                    </select>
                </div>

                <div className="min-w-[140px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Category</label>
                    <select
                        className="field w-full text-sm"
                        value={categoryFilter}
                        onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Categories</option>
                        <option value="Food & Meals">Food & Meals</option>
                        <option value="Educational & Books">Educational & Books</option>
                        <option value="Clothing & Apparel">Clothing & Apparel</option>
                        <option value="School Supplies">School Supplies</option>
                        <option value="Medical & Health Supplies">Medical Supplies</option>
                        <option value="Electronics & Tech">Electronics & Tech</option>
                        <option value="Tuition & Academic Fees">Tuition Aid</option>
                        <option value="Transportation Allowance">Transport Allowance</option>
                        <option value="Daily Living & Food Allowance">Living Allowance</option>
                    </select>
                </div>

                <div className="min-w-[140px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Status</label>
                    <select
                        className="field w-full text-sm"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="matched">Matched</option>
                        <option value="partially_fulfilled">Partially Fulfilled</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="min-w-[140px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Sort By</label>
                    <select
                        className="field w-full text-sm"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="date_desc">Newest First</option>
                        <option value="urgency_desc">Priority (High First)</option>
                        <option value="category">Category</option>
                        <option value="status">Status</option>
                    </select>
                </div>
            </div>

            {state.loading ? (
                <div className="panel no-hover p-8 text-center font-bold text-[#2563EB]">
                    Loading support requests from database...
                </div>
            ) : !filtered.length ? (
                <div className="panel no-hover p-8 text-center">
                    <p className="font-bold text-[#2563EB] text-lg">No support requests found.</p>
                    <p className="text-xs text-[#2563EB]/80 font-semibold mt-1">Try adjusting your search query or status filter.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="hidden sm:block table-wrap no-hover">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Type</th>
                                    <th>Assistance / Category</th>
                                    <th>Needed & Remaining</th>
                                    <th>Priority</th>
                                    <th>Preferred Date</th>
                                    <th>Status & Progress</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(item => {
                                    const isFin = item.request_type === 'financial';
                                    const reqAmount = Number(item.amount_requested || 0);
                                    const remAmount = Number(item.remaining_amount ?? reqAmount);
                                    const reqQty = Number(item.quantity_needed || 1);
                                    const remQty = Number(item.remaining_quantity ?? reqQty);
                                    const progressPercent = isFin
                                        ? (reqAmount > 0 ? Math.round(((reqAmount - remAmount) / reqAmount) * 100) : 0)
                                        : (reqQty > 0 ? Math.round(((reqQty - remQty) / reqQty) * 100) : 0);

                                    return (
                                        <tr key={item.id}>
                                            <td className="font-extrabold text-[#2563EB]">
                                                #REQ-{String(item.id).padStart(3, '0')}
                                            </td>
                                            <td>
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${isFin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-[#2563EB]'}`}>
                                                    {isFin ? 'Financial' : 'Physical'}
                                                </span>
                                            </td>
                                            <td className="max-w-[180px] truncate" title={item.item_details || item.purpose_of_funds || item.category}>
                                                <strong className="block text-xs">{title(item.category)}</strong>
                                                <span className="text-[11px] font-semibold text-[#2563EB]/70 truncate block">
                                                    {isFin ? (item.purpose_of_funds || 'Financial aid') : (item.item_details || 'Assistance item')}
                                                </span>
                                            </td>
                                            <td className="text-xs">
                                                {isFin ? (
                                                    <div>
                                                        <span className="font-extrabold text-[#22C55E]">
                                                            {item.currency || 'PHP'} {reqAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                        <span className="block text-[10px] font-semibold text-[#2563EB]/70">
                                                            Remaining: {item.currency || 'PHP'} {remAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="font-extrabold text-[#2563EB]">
                                                            {reqQty} {item.unit || 'unit(s)'}
                                                        </span>
                                                        <span className="block text-[10px] font-semibold text-[#2563EB]/70">
                                                            Remaining: {remQty} {item.unit || 'unit(s)'}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td><Badge status={item.urgency}/></td>
                                            <td className="text-xs font-semibold text-[#2563EB]/80 max-w-[120px] truncate">
                                                {item.preferred_assistance_date || 'Flexible'}
                                            </td>
                                            <td>
                                                <div className="space-y-1">
                                                    <Badge status={item.status}/>
                                                    <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-[#22C55E] h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Button title="View Request Details" variant="secondary" onClick={() => setViewingRequest(item)}>
                                                        <Icon name="eye"/>
                                                        <span className="ml-1 text-xs">View</span>
                                                    </Button>
                                                    {user.role === 'admin' && ['pending_review', 'under_review'].includes(item.status) && (
                                                        <>
                                                            <Button title="Approve Request" loading={actionLoading} onClick={() => handleApproveDecline(item.id, 'approved')}>
                                                                <Icon name="check"/>
                                                                <span className="ml-1 text-xs">Approve</span>
                                                            </Button>
                                                            <Button title="Decline Request" variant="secondary" loading={actionLoading} onClick={() => handleApproveDecline(item.id, 'rejected')}>
                                                                <Icon name="decline"/>
                                                                <span className="ml-1 text-xs">Decline</span>
                                                            </Button>
                                                        </>
                                                    )}
                                                    {user.role === 'beneficiary' && ['pending_review', 'under_review', 'approved'].includes(item.status) && (
                                                        <Button title="Cancel Request" variant="secondary" onClick={() => setCancellingRequest(item)}>
                                                            <Icon name="close"/>
                                                            <span className="ml-1 text-xs">Cancel</span>
                                                        </Button>
                                                    )}
                                                    {user.role === 'admin' && (
                                                        <Button title="Delete Request" variant="secondary" onClick={() => setDeletingRequest(item)}>
                                                            <Icon name="delete"/>
                                                            <span className="ml-1 text-xs">Delete</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="grid gap-3 sm:hidden">
                        {paginated.map(item => {
                            const isFin = item.request_type === 'financial';
                            return (
                                <article key={item.id} className="panel no-hover p-4 space-y-3 bg-white">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-xs font-black text-[#2563EB]">#REQ-{String(item.id).padStart(3, '0')}</span>
                                            <strong className="text-sm text-[#2563EB] block">{title(item.category)}</strong>
                                            <span className="text-xs font-semibold text-[#2563EB]/80">
                                                {isFin ? `${item.currency || 'PHP'} ${Number(item.amount_requested).toLocaleString()}` : `${item.quantity_needed} ${item.unit || 'unit(s)'} of ${item.item_details}`}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge status={item.status}/>
                                            <Badge status={item.urgency}/>
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold text-[#2563EB]/70 border-t border-[#2563EB]/20 pt-2 flex items-center justify-between">
                                        <span>Target: {item.preferred_assistance_date || 'Flexible'}</span>
                                        <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Button title="View Details" variant="secondary" onClick={() => setViewingRequest(item)}>
                                            <Icon name="eye"/>
                                            <span className="ml-1 text-xs">View</span>
                                        </Button>
                                        {user.role === 'beneficiary' && ['pending_review', 'approved'].includes(item.status) && (
                                            <Button title="Cancel" variant="secondary" onClick={() => setCancellingRequest(item)}>
                                                <Icon name="close"/>
                                                <span className="ml-1 text-xs">Cancel</span>
                                            </Button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="panel no-hover p-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xs font-bold text-[#2563EB]">
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} requests
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &larr; Previous
                                </Button>
                                <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next &rarr;
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Request Details Inspection Modal */}
            {viewingRequest && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel no-hover w-full max-w-xl p-6 bg-white space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <div>
                                <span className="text-xs font-black text-[#2563EB]">
                                    #REQ-{String(viewingRequest.id).padStart(3, '0')}
                                </span>
                                <h2 className="text-lg font-black text-[#2563EB]">Support Request Inspection</h2>
                            </div>
                            <button className="nav-link p-1" onClick={() => setViewingRequest(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${viewingRequest.request_type === 'financial' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-[#2563EB]'}`}>
                                {viewingRequest.request_type === 'financial' ? 'Financial Assistance' : 'Physical Item Request'}
                            </span>
                            <Badge status={viewingRequest.urgency}/>
                            <Badge status={viewingRequest.status}/>
                        </div>

                        {/* Beneficiary Student Information Section */}
                        {viewingRequest.beneficiary && (
                            <div className="rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 p-3.5 text-xs space-y-1.5">
                                <span className="font-extrabold text-[#2563EB] uppercase tracking-wider block">Student Beneficiary Profile</span>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div><span className="font-bold text-[#2563EB]/70">Name:</span> <span className="font-semibold">{viewingRequest.beneficiary.name}</span></div>
                                    <div><span className="font-bold text-[#2563EB]/70">Student ID:</span> <span className="font-semibold">{viewingRequest.beneficiary.student_id_number || viewingRequest.student_id_number || 'N/A'}</span></div>
                                    <div><span className="font-bold text-[#2563EB]/70">Department:</span> <span className="font-semibold">{viewingRequest.beneficiary.department || 'N/A'}</span></div>
                                    <div><span className="font-bold text-[#2563EB]/70">Course:</span> <span className="font-semibold">{viewingRequest.beneficiary.course || 'N/A'}</span></div>
                                    <div><span className="font-bold text-[#2563EB]/70">Year Level:</span> <span className="font-semibold">{viewingRequest.beneficiary.year_level || 'N/A'}</span></div>
                                    <div><span className="font-bold text-[#2563EB]/70">School Email:</span> <span className="font-semibold">{viewingRequest.beneficiary.school_email || viewingRequest.beneficiary.email || 'N/A'}</span></div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2.5 border-t border-b border-[#2563EB]/20 py-3 text-xs font-bold">
                            <div className="flex justify-between">
                                <span className="text-[#2563EB]/70">Category:</span>
                                <span className="font-black text-[#2563EB]">{title(viewingRequest.category)}</span>
                            </div>
                            {viewingRequest.request_type === 'financial' ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-[#2563EB]/70">Amount Requested:</span>
                                        <span className="font-black text-[#22C55E]">
                                            {viewingRequest.currency || 'PHP'} {Number(viewingRequest.amount_requested).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#2563EB]/70">Remaining Amount:</span>
                                        <span className="font-black text-[#2563EB]">
                                            {viewingRequest.currency || 'PHP'} {Number(viewingRequest.remaining_amount ?? viewingRequest.amount_requested).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {viewingRequest.purpose_of_funds && (
                                        <div className="pt-1">
                                            <span className="text-[#2563EB]/70 block mb-1">Purpose of Funds:</span>
                                            <p className="font-normal text-[11px] bg-white p-2.5 rounded border border-[#2563EB]/20">{viewingRequest.purpose_of_funds}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-[#2563EB]/70">Assistance Needed:</span>
                                        <span className="font-black text-[#2563EB]">{viewingRequest.item_details || 'Standard Need'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#2563EB]/70">Quantity Needed:</span>
                                        <span>{viewingRequest.quantity_needed} {viewingRequest.unit || 'unit(s)'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#2563EB]/70">Remaining Quantity:</span>
                                        <span>{viewingRequest.remaining_quantity ?? viewingRequest.quantity_needed} {viewingRequest.unit || 'unit(s)'}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between">
                                <span className="text-[#2563EB]/70">Preferred Assistance Date:</span>
                                <span>{viewingRequest.preferred_assistance_date || 'Flexible'}</span>
                            </div>
                            {viewingRequest.justification && (
                                <div className="pt-1">
                                    <span className="text-[#2563EB]/70 block mb-1">Reason for Request:</span>
                                    <p className="font-normal text-[11px] bg-white p-2.5 rounded border border-[#2563EB]/20 leading-relaxed whitespace-pre-wrap">{viewingRequest.justification}</p>
                                </div>
                            )}
                            {viewingRequest.additional_info && (
                                <div className="pt-1">
                                    <span className="text-[#2563EB]/70 block mb-1">Additional Notes:</span>
                                    <p className="font-normal text-[11px]">{viewingRequest.additional_info}</p>
                                </div>
                            )}
                            {viewingRequest.cancellation_reason && (
                                <div className="pt-1 text-red-600">
                                    <span className="font-extrabold block">Cancellation Reason:</span>
                                    <p className="font-normal text-[11px]">{viewingRequest.cancellation_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Supporting Document Viewer Button */}
                        {viewingRequest.supporting_document_url && (
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
                                    <Icon name="upload" size={16} />
                                    <span>Supporting Verification Document Attached</span>
                                </div>
                                <Button variant="secondary" className="text-xs py-1.5 px-3" onClick={() => openSupportingDocument(viewingRequest)}>
                                    View Document
                                </Button>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            {user.role === 'admin' && ['pending_review', 'under_review'].includes(viewingRequest.status) && (
                                <div className="flex items-center gap-2">
                                    <Button loading={actionLoading} onClick={() => handleApproveDecline(viewingRequest.id, 'approved')}>
                                        <Icon name="check"/>
                                        <span className="ml-1">Approve Request</span>
                                    </Button>
                                    <Button variant="secondary" loading={actionLoading} onClick={() => handleApproveDecline(viewingRequest.id, 'rejected')}>
                                        <Icon name="decline"/>
                                        <span className="ml-1">Decline</span>
                                    </Button>
                                </div>
                            )}
                            <Button variant="secondary" onClick={() => setViewingRequest(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Request Modal (Beneficiary) */}
            {cancellingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel no-hover max-h-[90vh] w-full max-w-md overflow-y-auto p-6 text-[#2563EB] shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h3 className="text-lg font-extrabold text-[#2563EB]">Cancel Support Request?</h3>
                            <button className="nav-link p-1" onClick={() => setCancellingRequest(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-[#2563EB]/80">
                            Please provide a reason for cancelling request <strong>#REQ-{String(cancellingRequest.id).padStart(3, '0')}</strong>:
                        </p>
                        <textarea
                            required
                            rows={3}
                            placeholder="e.g. Need was fulfilled by another scholarship program, no longer needed..."
                            className="field w-full text-xs font-semibold"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 pt-3 border-t border-[#2563EB]/20">
                            <Button variant="secondary" onClick={() => setCancellingRequest(null)}>
                                Keep Request
                            </Button>
                            <Button
                                variant="primary"
                                loading={cancelling}
                                disabled={!cancellationReason.trim()}
                                onClick={confirmCancel}
                            >
                                Confirm Cancellation
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Request Modal (Admin) */}
            {deletingRequest && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel no-hover w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Confirm Delete Request</h2>
                            <button className="nav-link p-1" onClick={() => setDeletingRequest(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to delete support request for <strong>"{title(deletingRequest.category)}"</strong>?
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            This action cannot be undone and will permanently remove this request listing from the database.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-3">
                            <Button loading={deleting} onClick={confirmDelete}>
                                <Icon name="delete"/>
                                <span className="ml-1">Confirm Delete</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setDeletingRequest(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {editing && <EditModal item={editing} kind="requests" admin={user.role === 'admin'} close={() => setEditing(null)} done={load}/>}
        </main>
    );
}

function List({kind}){
    if(kind === 'users') return <PeopleManager/>;
    if(kind === 'donations') return <DonationManager/>;
    if(kind === 'requests') return <RequestManager/>;

    const {user} = useAuth();
    const [state, setState] = useState({loading: true, data: [], error: ''});
    const [editing, setEditing] = useState(null);

    const load = () => {
        if(!user) return;
        api.get(user.role === 'admin' ? `/admin/${kind}` : `/${kind}?mine=1`)
            .then(r => setState({loading: false, data: r.data.data, error: ''}))
            .catch(() => setState({loading: false, data: [], error: 'Could not load this information.'}));
    };

    useEffect(load, [user, kind]);

    if(!user) return <Navigate to="/login"/>;
    if(kind === 'donations' && !['donor','staff','admin'].includes(user.role)) return <Navigate to={getRoleDashboard(user.role)} replace/>;
    if(kind === 'requests' && !['beneficiary','staff','admin'].includes(user.role)) return <Navigate to={getRoleDashboard(user.role)} replace/>;

    const own = user.role !== 'admin' && kind !== 'users';

    const remove = async id => {
        if(window.confirm('Delete this item?')) {
            try {
                await api.delete(`/${kind}/${id}`);
                load();
            } catch(e) {
                setState(s => ({...s, error: e.response?.data?.message || 'Could not delete this item.'}));
            }
        }
    };

    const columns = ['Resource','Category','Status','Details','Actions'];

    return (
        <main className="page">
            <p className="eyebrow">Your ReliefLink workspace</p>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="page-title">{labels[kind]}</h1>
            </div>
            <Error>{state.error}</Error>
            <div className="mt-8">
                {state.loading ? (
                    <p className="font-bold text-[#2563EB]">Loading workspace data…</p>
                ) : !state.data.length ? (
                    <Empty/>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
                            <tbody>
                                {state.data.map(x => {
                                    const canEdit = own && x.status?.startsWith('pending');
                                    return (
                                        <tr key={x.id}>
                                            <td><strong>{x.item_name || title(x.category)}</strong></td>
                                            <td>{x.category}</td><td><Badge status={x.status}/></td><td>{x.justification || x.condition_notes || `${x.quantity || x.quantity_needed} units`}</td>
                                            <td>
                                                <div className="flex flex-wrap gap-2">
                                                    {canEdit && <Button title="Edit record" variant="secondary" onClick={() => setEditing(x)}><Icon name="edit"/><span className="ml-1">Edit</span></Button>}
                                                    {canEdit && <Button title="Delete record" variant="secondary" onClick={() => remove(x.id)}><Icon name="delete"/><span className="ml-1">Delete</span></Button>}
                                                    {user.role === 'admin' && kind === 'requests' && x.status === 'pending_review' && (
                                                        <>
                                                            <Button title="Approve request" onClick={async () => {await api.patch(`/admin/requests/${x.id}`, {status: 'approved'}); load();}}><Icon name="check"/><span className="ml-1">Approve</span></Button>
                                                            <Button title="Decline request" variant="secondary" onClick={async () => {await api.patch(`/admin/requests/${x.id}`, {status: 'rejected'}); load();}}><Icon name="decline"/><span className="ml-1">Decline</span></Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {editing && <EditModal item={editing} kind={kind} admin={user.role === 'admin'} close={() => setEditing(null)} done={load}/>}
        </main>
    );
}

function Matches(){
    const {user} = useAuth();
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [schedule, setSchedule] = useState(null);
    const [viewingMatch, setViewingMatch] = useState(null);
    const [confirmingMatch, setConfirmingMatch] = useState(null);
    const [decliningMatch, setDecliningMatch] = useState(null);
    const [error, setError] = useState('');
    const [matchMessage, setMatchMessage] = useState('');
    const [working, setWorking] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const load = () => {
        if(!user) return;
        api.get(user.role === 'admin' ? '/admin/matches' : '/matches?mine=1')
            .then(r => setData(r.data.data || r.data || []))
            .catch(() => setError('Could not load matches.'));
    };

    useEffect(() => {
        load();
    }, [user]);

    if(!user) return <Navigate to="/login"/>;

    const action = async fn => {
        setWorking(true);
        setError('');
        try {
            await fn();
            load();
        } catch(e) {
            setError(e.response?.data?.message || 'Action failed.');
        } finally {
            setWorking(false);
        }
    };

    const handleRunMatches = async () => {
        setWorking(true);
        setError('');
        setMatchMessage('');
        try {
            const r = await api.post('/admin/matches/run');
            const createdCount = r.data.created || 0;
            setMatchMessage(createdCount > 0 ? `Successfully generated ${createdCount} new match(es)!` : 'Match algorithm finished. No new matches found.');
            load();
        } catch(e) {
            setError(e.response?.data?.message || 'Could not run matching engine.');
        } finally {
            setWorking(false);
        }
    };

    let filtered = data.filter(m => {
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || m.donation?.category === categoryFilter || m.request?.category === categoryFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            (m.donation?.item_name && m.donation.item_name.toLowerCase().includes(q)) ||
            (m.donation?.category && m.donation.category.toLowerCase().includes(q)) ||
            (m.request?.category && m.request.category.toLowerCase().includes(q)) ||
            (m.donation?.donor?.name && m.donation.donor.name.toLowerCase().includes(q)) ||
            (m.request?.beneficiary?.name && m.request.beneficiary.name.toLowerCase().includes(q)) ||
            (m.handoff_notes && m.handoff_notes.toLowerCase().includes(q));
        return matchesStatus && matchesCategory && matchesSearch;
    });

    filtered.sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
        if (sortBy === 'quantity_desc') return (b.matched_quantity || 1) - (a.matched_quantity || 1);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalMatches = data.length;
    const proposedMatches = data.filter(m => m.status === 'proposed').length;
    const confirmedMatches = data.filter(m => m.status === 'confirmed').length;
    const fulfilledMatches = data.filter(m => m.status === 'fulfilled' || m.status === 'completed').length;

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">CONNECTION PROGRESS</p>
                    <h1 className="page-title">Matches with Meaning</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Authorize, schedule, and track matches connecting campus resource donations with student needs.
                    </p>
                </div>
                {user.role === 'admin' && (
                    <Button loading={working} onClick={handleRunMatches}>
                        <Icon name="match"/>
                        <span className="ml-2">Run Match Engine</span>
                    </Button>
                )}
            </div>

            <Error>{error}</Error>
            {matchMessage && (
                <div className="rounded-xl border border-[#22C55E] bg-white p-4 text-sm font-bold text-[#22C55E] shadow-sm flex items-center justify-between">
                    <span>{matchMessage}</span>
                    <button onClick={() => setMatchMessage('')} className="text-[#22C55E] hover:underline font-extrabold text-xs">Dismiss</button>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Total Matches</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{totalMatches}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="match"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Proposed (Review)</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{proposedMatches}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="approvals"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Confirmed</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{confirmedMatches}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-white text-[#22C55E]">
                        <Icon name="check"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Fulfilled</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{fulfilledMatches}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="check"/>
                    </span>
                </article>
            </div>

            <div className="panel p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Search Matches</label>
                    <input
                        type="text"
                        placeholder="Search by donation, request, donor, beneficiary..."
                        className="field w-full text-sm"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Status</label>
                    <select
                        className="field w-full text-sm"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="proposed">Proposed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Declined</option>
                        <option value="fulfilled">Fulfilled</option>
                    </select>
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Category</label>
                    <select
                        className="field w-full text-sm"
                        value={categoryFilter}
                        onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Categories</option>
                        <option value="food">Food</option>
                        <option value="clothing">Clothing</option>
                        <option value="hygiene">Hygiene</option>
                        <option value="school supplies">School Supplies</option>
                        <option value="books">Books</option>
                        <option value="technology">Technology</option>
                    </select>
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Sort By</label>
                    <select
                        className="field w-full text-sm"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="date_desc">Newest First</option>
                        <option value="status">Status</option>
                        <option value="quantity_desc">Quantity (High to Low)</option>
                    </select>
                </div>
            </div>

            {!filtered.length ? (
                <div className="panel p-8 text-center">
                    <p className="font-bold text-[#2563EB] text-lg">No matches found.</p>
                    <p className="text-xs text-[#2563EB]/80 font-semibold mt-1">
                        {user.role === 'admin' ? 'Click "Run Match Engine" above to find new pairings.' : 'Check back soon for match updates.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginated.map(x => (
                        <article className="panel p-5 space-y-4 bg-white" key={x.id}>
                            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#2563EB]/15 pb-3">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 text-base font-extrabold text-[#2563EB]">
                                        <span>{x.donation?.item_name || title(x.donation?.category)}</span>
                                        <span className="text-[#22C55E] flex items-center"><Icon name="arrow"/></span>
                                        <span>{title(x.request?.category)}</span>
                                    </div>
                                    <p className="text-xs font-bold text-[#2563EB]/70">
                                        Matched Quantity: <strong className="text-[#2563EB]">{x.matched_quantity} units</strong>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge status={x.status}/>
                                </div>
                            </div>

                            <div className="grid gap-3 text-xs font-semibold sm:grid-cols-2 lg:grid-cols-3">
                                <div className="rounded-lg border border-[#2563EB]/20 p-2.5 bg-white">
                                    <span className="text-[#2563EB]/70 block font-bold uppercase text-[10px]">Donor Info</span>
                                    <p className="text-[#2563EB] font-bold mt-0.5">{x.donation?.donor?.name || 'Campus Donor'}</p>
                                    <span className="text-[10px] text-[#2563EB]/80 mt-1 block">
                                        Handoff Status: {x.donor_completed_at ? <strong className="text-[#22C55E]">Confirmed</strong> : 'Awaiting'}
                                    </span>
                                </div>

                                <div className="rounded-lg border border-[#2563EB]/20 p-2.5 bg-white">
                                    <span className="text-[#2563EB]/70 block font-bold uppercase text-[10px]">Beneficiary Info</span>
                                    <p className="text-[#2563EB] font-bold mt-0.5">{x.request?.beneficiary?.name || 'Student Requester'}</p>
                                    <span className="text-[10px] text-[#2563EB]/80 mt-1 block">
                                        Handoff Status: {x.beneficiary_completed_at ? <strong className="text-[#22C55E]">Confirmed</strong> : 'Awaiting'}
                                    </span>
                                </div>

                                <div className="rounded-lg border border-[#2563EB]/20 p-2.5 bg-white sm:col-span-2 lg:col-span-1">
                                    <span className="text-[#2563EB]/70 block font-bold uppercase text-[10px]">Handoff Schedule</span>
                                    <p className="text-[#2563EB] font-bold mt-0.5">
                                        {x.handoff_scheduled_at ? new Date(x.handoff_scheduled_at).toLocaleString() : 'Not scheduled yet'}
                                    </p>
                                    {x.handoff_notes && <p className="text-[10px] text-[#2563EB]/80 truncate mt-0.5">{x.handoff_notes}</p>}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2563EB]/15">
                                <Button variant="secondary" onClick={() => setViewingMatch(x)}>
                                    <Icon name="eye"/>
                                    <span className="ml-1 text-xs">View Details</span>
                                </Button>

                                <div className="flex flex-wrap items-center gap-2">
                                    {user.role === 'admin' && x.status === 'proposed' && (
                                        <>
                                            <Button loading={working} onClick={() => setConfirmingMatch(x)}>
                                                <Icon name="check"/>
                                                <span className="ml-1 text-xs">Confirm Match</span>
                                            </Button>
                                            <Button variant="secondary" loading={working} onClick={() => setDecliningMatch(x)}>
                                                <Icon name="decline"/>
                                                <span className="ml-1 text-xs">Decline</span>
                                            </Button>
                                        </>
                                    )}
                                    {x.status === 'confirmed' && (
                                        <>
                                            <Button variant="secondary" onClick={() => setSchedule(x)}>
                                                <span className="text-xs">Schedule Handoff</span>
                                            </Button>
                                            <Button loading={working} onClick={() => action(() => api.patch(`/matches/${x.id}/complete`))}>
                                                <Icon name="check"/>
                                                <span className="ml-1 text-xs">Confirm Completion</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}

                    {totalPages > 1 && (
                        <div className="panel p-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xs font-bold text-[#2563EB]">
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} matches
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &larr; Previous
                                </Button>
                                <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next &rarr;
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewingMatch && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-2xl p-6 bg-white space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Match Inspection Details</h2>
                            <button className="nav-link p-1" onClick={() => setViewingMatch(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>

                        <div className="flex items-center justify-between border-b border-[#2563EB]/15 pb-3">
                            <div>
                                <span className="text-xs font-bold text-[#2563EB]/70 uppercase">Match ID: #{viewingMatch.id}</span>
                                <h3 className="text-xl font-extrabold text-[#2563EB] mt-0.5">
                                    {viewingMatch.donation?.item_name || title(viewingMatch.donation?.category)} &rarr; {title(viewingMatch.request?.category)}
                                </h3>
                            </div>
                            <Badge status={viewingMatch.status}/>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-[#2563EB] p-4 space-y-2 bg-white text-xs">
                                <p className="font-extrabold text-sm text-[#2563EB] border-b border-[#2563EB]/20 pb-2">Donated Resource</p>
                                <div><span className="font-bold text-[#2563EB]/70">Item Name:</span> <strong className="text-[#2563EB]">{viewingMatch.donation?.item_name || 'N/A'}</strong></div>
                                <div><span className="font-bold text-[#2563EB]/70">Category:</span> <span className="text-[#2563EB]">{title(viewingMatch.donation?.category)}</span></div>
                                <div><span className="font-bold text-[#2563EB]/70">Donor Name:</span> <span className="text-[#2563EB] font-semibold">{viewingMatch.donation?.donor?.name || 'Campus Donor'}</span></div>
                                {viewingMatch.donation?.donor?.email && <div><span className="font-bold text-[#2563EB]/70">Donor Email:</span> <span className="text-[#2563EB]">{viewingMatch.donation.donor.email}</span></div>}
                                {viewingMatch.donation?.pickup_location && <div><span className="font-bold text-[#2563EB]/70">Pickup Location:</span> <span className="text-[#2563EB]">{viewingMatch.donation.pickup_location}</span></div>}
                                {viewingMatch.donation?.condition_notes && (
                                    <div className="pt-1"><span className="font-bold text-[#2563EB]/70 block">Notes:</span><p className="text-[#2563EB] bg-[#2563EB]/5 p-2 rounded border border-[#2563EB]/20">{viewingMatch.donation.condition_notes}</p></div>
                                )}
                            </div>

                            <div className="rounded-xl border border-[#2563EB] p-4 space-y-2 bg-white text-xs">
                                <p className="font-extrabold text-sm text-[#2563EB] border-b border-[#2563EB]/20 pb-2">Support Request</p>
                                <div><span className="font-bold text-[#2563EB]/70">Category Needed:</span> <strong className="text-[#2563EB]">{title(viewingMatch.request?.category)}</strong></div>
                                <div><span className="font-bold text-[#2563EB]/70">Urgency:</span> <Badge status={viewingMatch.request?.urgency}/></div>
                                <div><span className="font-bold text-[#2563EB]/70">Requester Name:</span> <span className="text-[#2563EB] font-semibold">{viewingMatch.request?.beneficiary?.name || 'Student Requester'}</span></div>
                                {viewingMatch.request?.beneficiary?.email && <div><span className="font-bold text-[#2563EB]/70">Requester Email:</span> <span className="text-[#2563EB]">{viewingMatch.request.beneficiary.email}</span></div>}
                                <div><span className="font-bold text-[#2563EB]/70">Quantity Needed:</span> <span className="text-[#2563EB] font-bold">{viewingMatch.request?.quantity_needed} units</span></div>
                                {viewingMatch.request?.justification && (
                                    <div className="pt-1"><span className="font-bold text-[#2563EB]/70 block">Justification:</span><p className="text-[#2563EB] bg-[#2563EB]/5 p-2 rounded border border-[#2563EB]/20">{viewingMatch.request.justification}</p></div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#2563EB]/30 p-4 text-xs space-y-2 bg-white">
                            <p className="font-extrabold text-sm text-[#2563EB]">Match Summary & Logistics</p>
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Matched Quantity:</span>
                                <strong className="text-[#2563EB]">{viewingMatch.matched_quantity} units</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Scheduled Time:</span>
                                <span className="font-semibold text-[#2563EB]">
                                    {viewingMatch.handoff_scheduled_at ? new Date(viewingMatch.handoff_scheduled_at).toLocaleString() : 'Not scheduled yet'}
                                </span>
                            </div>
                            {viewingMatch.handoff_notes && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-[#2563EB]/70">Logistics Notes:</span>
                                    <span className="font-semibold text-[#2563EB]">{viewingMatch.handoff_notes}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            {user.role === 'admin' && viewingMatch.status === 'proposed' && (
                                <div className="flex items-center gap-2">
                                    <Button loading={working} onClick={() => { setConfirmingMatch(viewingMatch); setViewingMatch(null); }}>
                                        <Icon name="check"/>
                                        <span className="ml-1">Confirm Match</span>
                                    </Button>
                                    <Button variant="secondary" loading={working} onClick={() => { setDecliningMatch(viewingMatch); setViewingMatch(null); }}>
                                        <Icon name="decline"/>
                                        <span className="ml-1">Decline</span>
                                    </Button>
                                </div>
                            )}
                            <Button variant="secondary" onClick={() => setViewingMatch(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {confirmingMatch && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Confirm Match Pair</h2>
                            <button className="nav-link p-1" onClick={() => setConfirmingMatch(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to authorize and confirm the match between <strong>"{confirmingMatch.donation?.item_name || title(confirmingMatch.donation?.category)}"</strong> and request for <strong>"{title(confirmingMatch.request?.category)}"</strong>?
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            This will notify both the donor and beneficiary to arrange handoff details.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-3">
                            <Button loading={working} onClick={() => {
                                const target = confirmingMatch;
                                setConfirmingMatch(null);
                                action(() => api.patch(`/admin/matches/${target.id}`, {status: 'confirmed'}));
                            }}>
                                <Icon name="check"/>
                                <span className="ml-1">Authorize & Confirm</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setConfirmingMatch(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {decliningMatch && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Decline Proposed Match</h2>
                            <button className="nav-link p-1" onClick={() => setDecliningMatch(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to decline this proposed match between <strong>"{decliningMatch.donation?.item_name || title(decliningMatch.donation?.category)}"</strong> and request for <strong>"{title(decliningMatch.request?.category)}"</strong>?
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            The resources will remain in the pool for subsequent matching rounds.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-3">
                            <Button loading={working} onClick={() => {
                                const target = decliningMatch;
                                setDecliningMatch(null);
                                action(() => api.patch(`/admin/matches/${target.id}`, {status: 'rejected'}));
                            }}>
                                <Icon name="decline"/>
                                <span className="ml-1">Decline Match</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setDecliningMatch(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {schedule && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <form className="panel w-full max-w-sm p-6 bg-white space-y-4" onSubmit={e => {
                        e.preventDefault();
                        const when = e.target.when.value;
                        const notes = e.target.notes.value;
                        setSchedule(null);
                        action(() => api.patch(`/matches/${schedule.id}/schedule`, {handoff_scheduled_at: when, handoff_notes: notes}));
                    }}>
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Schedule Handoff</h2>
                            <button type="button" className="nav-link p-1" onClick={() => setSchedule(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <label className="block text-xs font-bold text-[#2563EB]">
                            Date and Time
                            <input name="when" className="field mt-1 text-sm" type="datetime-local" required defaultValue={schedule.handoff_scheduled_at ? new Date(schedule.handoff_scheduled_at).toISOString().slice(0,16) : ''}/>
                        </label>
                        <label className="block text-[#2563EB] text-xs font-bold">
                            Handoff Location & Notes
                            <textarea name="notes" className="field mt-1 text-sm" rows="3" placeholder="e.g. Student Center Entrance, 2:00 PM" defaultValue={schedule.handoff_notes || ''}/>
                        </label>
                        <div className="flex gap-3 pt-2">
                            <Button loading={working}>Save Schedule</Button>
                            <Button type="button" variant="secondary" onClick={() => setSchedule(null)}>Cancel</Button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}

function Dashboard(){
    const {user} = useAuth();
    const [s, setS] = useState();
    const [activities, setActivities] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [runningMatch, setRunningMatch] = useState(false);
    const [matchMessage, setMatchMessage] = useState('');

    const loadData = () => {
        if(user?.role !== 'admin') return;
        setLoading(true);
        Promise.all([
            api.get('/admin/stats').then(r => setS(r.data)),
            api.get('/admin/activities').then(r => setActivities((r.data.data || r.data || []).slice(0, 8))).catch(() => {}),
            api.get('/admin/requests?status=pending_review').then(r => setPendingRequests((r.data.data || r.data || []).slice(0, 5))).catch(() => {})
        ]).catch(() => setError('Could not load complete dashboard statistics.'))
          .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, [user]);

    if(user?.role !== 'admin') return <Navigate to={getRoleDashboard(user?.role)} replace/>;

    const handleRunMatches = async () => {
        setRunningMatch(true);
        setMatchMessage('');
        setError('');
        try {
            const res = await api.post('/admin/matches/run');
            const count = res.data.created || 0;
            setMatchMessage(count > 0 ? `Successfully generated ${count} new match(es)!` : 'Match algorithm completed. No new matches found at this time.');
            loadData();
        } catch(e) {
            setError(e.response?.data?.message || 'Error running match engine.');
        } finally {
            setRunningMatch(false);
        }
    };

    const getRoleTotal = (roleName) => {
        if (!s?.role_counts) return 0;
        const found = s.role_counts.find(r => r.role === roleName);
        return found ? found.total : 0;
    };

    const chartTooltip = { contentStyle: { background: '#FFFFFF', border: '1px solid #2563EB', borderRadius: '12px', color: '#2563EB' }, labelStyle: { color: '#2563EB', fontWeight: 700 } };
    const donationTrend = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(); date.setDate(date.getDate() - (6 - index));
        const key = date.toISOString().slice(0, 10);
        const found = s?.donation_trends?.find(item => String(item.date).slice(0, 10) === key);
        return { day: date.toLocaleDateString(undefined, { weekday: 'short' }), donations: Number(found?.total || 0) };
    });
    const requestStatusData = ['pending_review', 'approved', 'fulfilled', 'rejected'].map(status => ({
        name: title(status), total: Number(s?.request_statuses?.find(item => item.status === status)?.total || 0),
    }));
    const communityData = [
        { name: 'Donors', value: getRoleTotal('donor'), color: '#2563EB' },
        { name: 'Beneficiaries', value: getRoleTotal('beneficiary'), color: '#22C55E' },
        { name: 'Staff', value: getRoleTotal('staff'), color: '#2563EB99' },
        { name: 'Administrators', value: getRoleTotal('admin'), color: '#22C55E99' },
    ];
    const matchStatusData = ['proposed', 'confirmed', 'fulfilled', 'rejected'].map(status => ({
        name: title(status), total: Number(s?.match_statuses?.find(item => item.status === status)?.total || 0),
    }));

    return (
        <main className="page space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="eyebrow">ADMINISTRATOR WORKSPACE</p>
                    <h1 className="page-title">Campus Impact & Overview</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Real-time monitoring, priority queues, pending approvals, and administrative controls.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E] bg-white px-3 py-1 text-xs font-extrabold text-[#22C55E]">
                        <span className="h-2 w-2 rounded-full bg-[#22C55E]"></span>
                        System Active
                    </span>
                </div>
            </div>

            <Error>{error}</Error>
            {matchMessage && (
                <div className="rounded-xl border border-[#22C55E] bg-white p-4 text-sm font-bold text-[#22C55E] shadow-sm flex items-center justify-between">
                    <span>{matchMessage}</span>
                    <button onClick={() => setMatchMessage('')} className="text-[#22C55E] hover:underline font-extrabold text-xs">Dismiss</button>
                </div>
            )}

            <section className="panel no-hover p-4 sm:p-5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]/70 mb-3">Quick Actions</p>
                <div className="flex flex-wrap items-center gap-3">
                    <Button loading={runningMatch} onClick={handleRunMatches}>
                        <Icon name="match"/>
                        <span className="ml-2">Run Match Engine</span>
                    </Button>
                    <NavLink to="/requests" className="nav-link border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition">
                        <Icon name="request"/>
                        <span>Review Requests</span>
                    </NavLink>
                    <NavLink to="/matches" className="nav-link border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition">
                        <Icon name="match"/>
                        <span>Manage Matches</span>
                    </NavLink>
                    <NavLink to="/users" className="nav-link border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition">
                        <Icon name="users"/>
                        <span>Manage People</span>
                    </NavLink>
                    <NavLink to="/reports" className="nav-link border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition">
                        <Icon name="report"/>
                        <span>View Reports</span>
                    </NavLink>
                    <NavLink to="/admin/announcements" className="nav-link border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition">
                        <Icon name="announcements"/>
                        <span>Post Announcement</span>
                    </NavLink>
                </div>
            </section>

            {loading && !s ? (
                <p className="mt-8 font-bold text-[#2563EB]">Loading dashboard statistics…</p>
            ) : s && (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                        <article className="panel p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2563EB]/70 uppercase tracking-wide">Donations</span>
                                <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#2563EB] text-[#2563EB]">
                                    <Icon name="donation"/>
                                </span>
                            </div>
                            <div className="mt-4">
                                <strong className="text-3xl font-extrabold text-[#2563EB]">{s.total_donations}</strong>
                                <p className="mt-1 text-xs font-semibold text-[#2563EB]/70">Total items listed</p>
                            </div>
                        </article>

                        <article className="panel p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2563EB]/70 uppercase tracking-wide">Requests</span>
                                <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#2563EB] text-[#2563EB]">
                                    <Icon name="request"/>
                                </span>
                            </div>
                            <div className="mt-4">
                                <strong className="text-3xl font-extrabold text-[#2563EB]">{s.total_requests}</strong>
                                <p className="mt-1 text-xs font-semibold text-[#2563EB]/70">Total support requests</p>
                            </div>
                        </article>

                        <article className="panel p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2563EB]/70 uppercase tracking-wide">Pending Review</span>
                                <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#2563EB] text-[#2563EB]">
                                    <Icon name="approvals"/>
                                </span>
                            </div>
                            <div className="mt-4">
                                <strong className="text-3xl font-extrabold text-[#2563EB]">{s.pending_reviews}</strong>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[#2563EB]/70">Awaiting approval</span>
                                    {s.pending_reviews > 0 && (
                                        <span className="rounded bg-[#22C55E] px-1.5 py-0.5 text-[10px] font-extrabold text-white">Action needed</span>
                                    )}
                                </div>
                            </div>
                        </article>

                        <article className="panel p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2563EB]/70 uppercase tracking-wide">Proposed Matches</span>
                                <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#2563EB] text-[#2563EB]">
                                    <Icon name="match"/>
                                </span>
                            </div>
                            <div className="mt-4">
                                <strong className="text-3xl font-extrabold text-[#2563EB]">{s.proposed_matches}</strong>
                                <p className="mt-1 text-xs font-semibold text-[#2563EB]/70">Ready for review</p>
                            </div>
                        </article>

                        <article className="panel p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wide">Fulfillment</span>
                                <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#22C55E] bg-[#22C55E] text-white">
                                    <Icon name="check"/>
                                </span>
                            </div>
                            <div className="mt-4">
                                <strong className="text-3xl font-extrabold text-[#22C55E]">{s.fulfillment_rate}%</strong>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-[#22C55E] bg-white">
                                    <div className="h-full bg-[#22C55E]" style={{ width: `${Math.min(100, Math.max(0, s.fulfillment_rate))}%` }}></div>
                                </div>
                            </div>
                        </article>
                    </div>

                    <section className="grid gap-6 xl:grid-cols-2">
                        <article className="panel no-hover p-5 sm:p-6 min-h-[320px]">
                            <div className="flex items-start justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]/70">Donation Trends</p>
                                    <h2 className="mt-1 text-lg font-extrabold text-[#2563EB]">New donations over the last 7 days</h2>
                                </div>
                                <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] text-[#2563EB]"><Icon name="donation"/></span>
                            </div>
                            <div className="mt-5 h-[220px]" role="img" aria-label="Line chart showing donations submitted over the last seven days">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={donationTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                        <CartesianGrid stroke="#2563EB" strokeOpacity={0.15} vertical={false}/>
                                        <XAxis dataKey="day" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={{ stroke: '#2563EB' }} tickLine={false}/>
                                        <YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/>
                                        <Tooltip {...chartTooltip}/>
                                        <Line type="monotone" dataKey="donations" name="Donations" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#22C55E', stroke: '#FFFFFF', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#22C55E' }}/>
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </article>

                        <article className="panel no-hover p-5 sm:p-6 min-h-[320px]">
                            <div className="flex items-start justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]/70">Support Requests</p>
                                    <h2 className="mt-1 text-lg font-extrabold text-[#2563EB]">Request status overview</h2>
                                </div>
                                <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white"><Icon name="request"/></span>
                            </div>
                            <div className="mt-5 h-[220px]" role="img" aria-label="Bar chart showing support requests by status">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={requestStatusData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                        <CartesianGrid stroke="#2563EB" strokeOpacity={0.15} vertical={false}/>
                                        <XAxis dataKey="name" tick={{ fill: '#2563EB', fontSize: 10, fontWeight: 700 }} axisLine={{ stroke: '#2563EB' }} tickLine={false}/>
                                        <YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/>
                                        <Tooltip {...chartTooltip}/>
                                        <Bar dataKey="total" name="Requests" radius={[8, 8, 0, 0]} fill="#2563EB">
                                            {requestStatusData.map((entry, index) => <Cell key={entry.name} fill={index === 2 ? '#22C55E' : '#2563EB'} fillOpacity={index === 1 ? 0.8 : 1}/>) }
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </article>

                        <article className="panel no-hover p-5 sm:p-6 min-h-[320px]">
                            <div className="flex items-start justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]/70">Community Distribution</p>
                                    <h2 className="mt-1 text-lg font-extrabold text-[#2563EB]">People by ReliefLink role</h2>
                                </div>
                                <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] text-[#2563EB]"><Icon name="users"/></span>
                            </div>
                            <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto]">
                                <div className="h-[210px]" role="img" aria-label="Pie chart showing distribution of donors, beneficiaries, staff, and administrators">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Tooltip {...chartTooltip}/>
                                            <Pie data={communityData} dataKey="value" nameKey="name" innerRadius="56%" outerRadius="80%" paddingAngle={3} stroke="#FFFFFF" strokeWidth={3}>
                                                {communityData.map(item => <Cell key={item.name} fill={item.color}/>) }
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                                    {communityData.map(item => <div key={item.name} className="rounded-xl border border-[#2563EB]/25 bg-white px-3 py-2"><span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-[#2563EB]/70"><i className="h-2 w-2 rounded-full" style={{ background: item.color }}/>{item.name}</span><strong className="mt-1 block text-lg text-[#2563EB]">{item.value}</strong></div>)}
                                </div>
                            </div>
                        </article>

                        <article className="panel no-hover p-5 sm:p-6 min-h-[320px]">
                            <div className="flex items-start justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]/70">Matching & Fulfillment</p>
                                    <h2 className="mt-1 text-lg font-extrabold text-[#2563EB]">Match pipeline performance</h2>
                                </div>
                                <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white"><Icon name="match"/></span>
                            </div>
                            <div className="mt-5 h-[220px]" role="img" aria-label="Bar chart showing proposed, confirmed, fulfilled, and rejected matches">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={matchStatusData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                        <CartesianGrid stroke="#2563EB" strokeOpacity={0.15} vertical={false}/>
                                        <XAxis dataKey="name" tick={{ fill: '#2563EB', fontSize: 10, fontWeight: 700 }} axisLine={{ stroke: '#2563EB' }} tickLine={false}/>
                                        <YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/>
                                        <Tooltip {...chartTooltip}/>
                                        <Legend wrapperStyle={{ color: '#2563EB', fontSize: 11, fontWeight: 700 }}/>
                                        <Bar dataKey="total" name="Matches" radius={[8, 8, 0, 0]} fill="#22C55E">
                                            {matchStatusData.map((entry, index) => <Cell key={entry.name} fill={index === 2 ? '#22C55E' : '#2563EB'} fillOpacity={index === 0 ? 0.85 : 1}/>) }
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </article>
                    </section>

                    <div className="panel no-hover p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                            <div>
                                <h3 className="text-base font-extrabold text-[#2563EB]">Community Directory Overview</h3>
                                <p className="text-xs text-[#2563EB]/70 font-semibold mt-0.5">Active user distribution across roles</p>
                            </div>
                            <NavLink to="/users" className="text-xs font-extrabold text-[#2563EB] hover:underline">Manage All Members &rarr;</NavLink>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-[#2563EB] p-4 flex items-center justify-between bg-white" style={{ border: '1px solid #2563EB' }}>
                                <div>
                                    <p className="text-xs font-bold text-[#2563EB]/70 uppercase">Registered Donors</p>
                                    <strong className="text-2xl font-extrabold text-[#2563EB] mt-1 block">{getRoleTotal('donor')}</strong>
                                </div>
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB] text-white"><Icon name="donation"/></span>
                            </div>
                            <div className="rounded-xl border border-[#2563EB] p-4 flex items-center justify-between bg-white" style={{ border: '1px solid #2563EB' }}>
                                <div>
                                    <p className="text-xs font-bold text-[#2563EB]/70 uppercase">Beneficiaries</p>
                                    <strong className="text-2xl font-extrabold text-[#2563EB] mt-1 block">{getRoleTotal('beneficiary')}</strong>
                                </div>
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB] text-white"><Icon name="users"/></span>
                            </div>
                            <div className="rounded-xl border border-[#2563EB] p-4 flex items-center justify-between bg-white" style={{ border: '1px solid #2563EB' }}>
                                <div>
                                    <p className="text-xs font-bold text-[#2563EB]/70 uppercase">Administrators</p>
                                    <strong className="text-2xl font-extrabold text-[#2563EB] mt-1 block">{getRoleTotal('admin')}</strong>
                                </div>
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB] text-white"><Icon name="person"/></span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-6">
                            <section className="panel no-hover p-5 sm:p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2563EB]/20 pb-4">
                                    <div>
                                        <h2 className="text-base font-extrabold text-[#2563EB]">Pending Support Requests</h2>
                                        <p className="text-xs text-[#2563EB]/70 font-semibold">Requests needing admin review & authorization</p>
                                    </div>
                                    <NavLink className="text-xs font-extrabold text-[#2563EB] hover:underline" to="/requests">View All &rarr;</NavLink>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {!pendingRequests.length ? (
                                        <p className="py-4 text-center text-sm font-bold text-[#22C55E]">✓ All submitted requests have been reviewed!</p>
                                    ) : (
                                        pendingRequests.map(req => (
                                            <div key={req.id} className="rounded-xl border border-[#2563EB] p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge status={req.urgency}/>
                                                        <strong className="text-sm text-[#2563EB]">{title(req.category)}</strong>
                                                    </div>
                                                    <p className="mt-1 text-xs text-[#2563EB]/80 font-medium">
                                                        Beneficiary: <strong>{req.beneficiary?.name || 'Student'}</strong> • Quantity: {req.quantity_needed}
                                                    </p>
                                                    {req.justification && (
                                                        <p className="mt-1 text-xs text-[#2563EB]/70 italic line-clamp-2">"{req.justification}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section className="panel no-hover p-5 sm:p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2563EB]/20 pb-4">
                                    <div>
                                        <h2 className="text-base font-extrabold text-[#2563EB]">Priority Matching Queue</h2>
                                        <p className="text-xs text-[#2563EB]/70 font-semibold">Approved requests waiting for available donor items</p>
                                    </div>
                                    <NavLink className="text-xs font-extrabold text-[#2563EB] hover:underline" to="/matches">Run Match Engine &rarr;</NavLink>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {!s.priority_queue?.length ? (
                                        <p className="py-4 text-center text-sm font-semibold text-[#2563EB]">No approved requests waiting for a match.</p>
                                    ) : (
                                        s.priority_queue.map(x => (
                                            <div key={x.id} className="flex items-center justify-between rounded-xl border border-[#2563EB] p-3.5 bg-white">
                                                <div className="flex items-center gap-3">
                                                    <Badge status={x.urgency}/>
                                                    <div>
                                                        <strong className="text-sm text-[#2563EB] block">{title(x.category)}</strong>
                                                        <span className="text-xs font-semibold text-[#2563EB]/70">{x.quantity_needed} units required</span>
                                                    </div>
                                                </div>
                                                <NavLink to="/matches" className="text-xs font-extrabold text-[#2563EB] hover:underline">
                                                    Find Match
                                                </NavLink>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <section className="panel no-hover p-5 sm:p-6 flex flex-col h-full">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2563EB]/20 pb-4">
                                    <div>
                                        <h2 className="text-base font-extrabold text-[#2563EB]">Recent System Activity</h2>
                                        <p className="text-xs text-[#2563EB]/70 font-semibold">Audit logs & administrative operations</p>
                                    </div>
                                    <NavLink className="text-xs font-extrabold text-[#2563EB] hover:underline" to="/activities">View Log &rarr;</NavLink>
                                </div>

                                <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                                    {!activities.length ? (
                                        <p className="py-6 text-center text-sm font-semibold text-[#2563EB]">No recent activity logs recorded.</p>
                                    ) : (
                                        activities.map(act => (
                                            <div key={act.id} className="flex items-start gap-3 rounded-xl border border-[#2563EB] p-3.5 bg-white">
                                                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#2563EB] text-white">
                                                    <Icon name="activity"/>
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-extrabold text-[#2563EB]">
                                                        {act.user?.name || 'System'} <span className="font-semibold text-[#2563EB]/80">{act.action}</span>
                                                    </p>
                                                    {act.description && (
                                                        <p className="mt-0.5 text-xs text-[#2563EB]/70 truncate">{act.description}</p>
                                                    )}
                                                    <span className="mt-1 block text-[10px] font-bold text-[#2563EB]/60">
                                                        {new Date(act.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}

function AnalyticsChart({ title, description, ariaLabel, hasData = true, children }) {
    return (
        <article className="panel p-5">
            <h3 className="font-extrabold text-[#2563EB]">{title}</h3>
            <p className="mt-1 text-xs font-semibold text-[#2563EB]/65">{description}</p>
            <div className="mt-4 h-60" role="img" aria-label={ariaLabel}>{hasData ? children : <div className="grid h-full place-items-center rounded-xl border border-dashed border-[#2563EB]/25 bg-[#2563EB]/5 p-6 text-center"><div><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-[#22C55E]"><Icon name="activity" size={18}/></span><p className="mt-3 text-sm font-extrabold text-[#2563EB]">No operational data yet</p><p className="mt-1 text-xs font-semibold text-[#2563EB]/65">This chart will update as staff activity is recorded.</p></div></div>}</div>
        </article>
    );
}

function StaffDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [donations, setDonations] = useState([]);
    const [matches, setMatches] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);

    const loadData = () => {
        setLoading(true);
        setError('');
        setError('');
        Promise.all([
            api.get('/admin/stats').then((r) => setStats(r.data)),
            api.get('/admin/requests').then((r) => setRequests(r.data.data || [])),
            api.get('/admin/donations').then((r) => setDonations(r.data.data || [])),
            api.get('/admin/matches').then((r) => setMatches(r.data.data || [])),
            api.get('/admin/activities').then((r) => setActivities(r.data.data || [])),
        ])
            .catch(() => setError('The live operations feed could not be updated. Please refresh to try again.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleExportCsv = () => {
        setExporting(true);
        window.location.href = '/api/admin/export-csv';
        setTimeout(() => setExporting(false), 2000);
    };

    const pendingRequests = requests.filter((r) => r.status === 'pending_review');
    const urgentRequests = requests.filter((r) => r.urgency === 'high' || r.urgency === 'critical');
    const activeHandoffs = matches.filter((m) => m.status === 'proposed' || m.status === 'confirmed');
    const lowStockItems = donations.filter((d) => d.quantity <= 2 && d.status === 'pending_match');
    const readyStock = donations.filter((d) => d.status === 'pending_match' && d.quantity > 2);
    const priorityRequests = [...pendingRequests]
        .sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 }[a.urgency] ?? 4) - ({ critical: 0, high: 1, medium: 2, low: 3 }[b.urgency] ?? 4))
        .slice(0, 4);
    const formatTime = (value) => value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : 'Just now';
    const chartDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        return date;
    });
    const dayLabel = (date) => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
    const sameDay = (value, date) => value && new Date(value).toDateString() === date.toDateString();
    const verificationTrend = chartDays.map((date) => ({
        day: dayLabel(date),
        reviewed: requests.filter((request) => request.status === 'approved' && sameDay(request.updated_at || request.created_at, date)).length,
        submitted: requests.filter((request) => sameDay(request.created_at, date)).length,
    }));
    const warehouseOverview = [
        { name: 'Available', value: donations.filter((donation) => donation.status === 'pending_match').reduce((total, donation) => total + Number(donation.quantity || 0), 0) },
        { name: 'Reserved', value: donations.filter((donation) => donation.status === 'matched').reduce((total, donation) => total + Number(donation.quantity || 0), 0) },
        { name: 'Dispatched', value: matches.filter((match) => ['fulfilled', 'completed'].includes(match.status)).reduce((total, match) => total + Number(match.quantity || match.matched_quantity || 0), 0) },
    ];
    const handoffOverview = [
        { name: 'Proposed', value: matches.filter((match) => match.status === 'proposed').length },
        { name: 'Confirmed', value: matches.filter((match) => match.status === 'confirmed').length },
        { name: 'Completed', value: matches.filter((match) => ['fulfilled', 'completed'].includes(match.status)).length },
    ];
    const walkInTrend = chartDays.map((date) => ({
        day: dayLabel(date),
        assisted: requests.filter((request) => request.is_walk_in && sameDay(request.created_at, date)).length,
    }));
    const chartTooltip = {
        contentStyle: { backgroundColor: '#FFFFFF', border: '1px solid #2563EB', borderRadius: '12px', color: '#2563EB', fontSize: '12px', fontWeight: 700 },
        labelStyle: { color: '#2563EB', fontWeight: 800 },
        itemStyle: { color: '#2563EB' },
    };

    return (
        <main className="shell staff-workspace py-6 sm:py-8 space-y-5 text-[#2563EB]">
            {/* Header Banner */}
            <div className="panel p-6 sm:p-7 bg-[#2563EB] text-white flex flex-wrap items-center justify-between gap-6 shadow-md">
                <div className="space-y-2 max-w-xl">
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                        CAMPUS OPERATIONAL PORTAL
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                        Staff Operations Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold opacity-90 text-white leading-relaxed">
                        {user?.name || 'Staff member'}, monitor verification, warehouse, dispatch, and walk-in operations from one live workspace.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" onClick={handleExportCsv} loading={exporting}>
                        <Icon name="report" />
                        <span className="ml-1 text-xs">Export CSV Audit Report</span>
                    </Button>
                    <Button variant="secondary" onClick={loadData} loading={loading}>
                        <Icon name="refresh" />
                        <span className="ml-1 text-xs">Refresh Feed</span>
                    </Button>
                </div>
            </div>

            {error && <Error>{error}</Error>}

            {/* Operational Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    onClick={() => navigate('/staff/verifications')}
                    className="panel no-hover p-5 bg-white space-y-2 border-l-4 border-l-[#2563EB] cursor-pointer hover:shadow-lg transition"
                >
                    <div className="flex justify-between items-center text-xs font-bold text-[#2563EB]/70">
                        <span>Pending Verifications</span>
                        <Icon name="approvals" />
                    </div>
                    <p className="text-3xl font-black text-[#2563EB]">{pendingRequests.length}</p>
                    <p className="text-[11px] font-semibold text-[#2563EB]/80">Requests awaiting first review &rarr;</p>
                </div>

                <div
                    onClick={() => navigate('/staff/inventory')}
                    className="panel no-hover p-5 bg-white space-y-2 border-l-4 border-l-[#2563EB] cursor-pointer hover:shadow-lg transition"
                >
                    <div className="flex justify-between items-center text-xs font-bold text-[#2563EB]/70">
                        <span>Warehouse Items</span>
                        <Icon name="donation" />
                    </div>
                    <p className="text-3xl font-black text-[#2563EB]">{donations.length}</p>
                    <p className="text-[11px] font-semibold text-[#2563EB]/80">Items available for staff handling &rarr;</p>
                </div>

                <div
                    onClick={() => navigate('/staff/handoffs')}
                    className="panel no-hover p-5 bg-white space-y-2 border-l-4 border-l-[#22C55E] cursor-pointer hover:shadow-lg transition"
                >
                    <div className="flex justify-between items-center text-xs font-bold text-[#2563EB]/70">
                        <span>Active Handoffs</span>
                        <Icon name="fulfillment" />
                    </div>
                    <p className="text-3xl font-black text-[#22C55E]">{activeHandoffs.length}</p>
                    <p className="text-[11px] font-semibold text-[#2563EB]/80">Execute PIN clearance &rarr;</p>
                </div>

                <div
                    onClick={() => navigate('/staff/desk')}
                    className="panel no-hover p-5 bg-white space-y-2 border-l-4 border-l-[#2563EB] cursor-pointer hover:shadow-lg transition"
                >
                    <div className="flex justify-between items-center text-xs font-bold text-[#2563EB]/70">
                        <span>Walk-In Relief Desk</span>
                        <Icon name="request" />
                    </div>
                    <p className="text-3xl font-black text-[#2563EB]">Open Desk</p>
                    <p className="text-[11px] font-semibold text-[#2563EB]/80">Process offline aid &rarr;</p>
                </div>
            </div>

            {/* Operational Warnings Strip */}
            {(lowStockItems.length > 0 || pendingRequests.length > 5) && (
                <div className="space-y-3">
                    {lowStockItems.length > 0 && (
                        <div className="p-4 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#2563EB] flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">⚠️ LOW WAREHOUSE STOCK WARNING:</span>
                                <span className="text-xs font-semibold">
                                    {lowStockItems.length} category item(s) running low (quantity ≤ 2).
                                </span>
                            </div>
                            <Button size="sm" onClick={() => navigate('/staff/inventory')}>
                                Restock / Physical Intake
                            </Button>
                        </div>
                    )}
                    {pendingRequests.length > 5 && (
                        <div className="p-4 rounded-xl border border-[#2563EB]/35 bg-[#2563EB]/5 text-[#2563EB] flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">⏳ VERIFICATION BOTTLENECK:</span>
                                <span className="text-xs font-semibold">
                                    {pendingRequests.length} student aid requests awaiting review.
                                </span>
                            </div>
                            <Button size="sm" onClick={() => navigate('/staff/verifications')}>
                                Clear Verification Queue
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <section className="space-y-4" aria-label="Staff operations analytics">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div><p className="eyebrow">LIVE OPERATIONS ANALYTICS</p><h2 className="mt-1 text-xl font-extrabold">Staff operations at a glance</h2></div>
                    <p className="text-xs font-semibold text-[#2563EB]/65">Current data from the staff workspace feed</p>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                    <AnalyticsChart title="Verification activity trend" description="Requests submitted and completed reviews over the last seven days." ariaLabel="Line chart showing verification activity over the last seven days" hasData={verificationTrend.some((point) => point.submitted || point.reviewed)}><ResponsiveContainer width="100%" height="100%"><LineChart data={verificationTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="day" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Legend wrapperStyle={{ color: '#2563EB', fontSize: '12px', fontWeight: 700 }}/><Line type="monotone" dataKey="submitted" name="Submitted" stroke="#2563EB" strokeWidth={3} dot={{ r: 3, fill: '#2563EB' }}/><Line type="monotone" dataKey="reviewed" name="Reviewed" stroke="#22C55E" strokeWidth={3} dot={{ r: 3, fill: '#22C55E' }}/></LineChart></ResponsiveContainer></AnalyticsChart>
                    <AnalyticsChart title="Warehouse inventory overview" description="Current quantity by operational stock stage." ariaLabel="Bar chart showing available, reserved, and dispatched inventory" hasData={warehouseOverview.some((point) => point.value)}><ResponsiveContainer width="100%" height="100%"><BarChart data={warehouseOverview} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="name" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Bar dataKey="value" name="Items" radius={[8, 8, 0, 0]}>{warehouseOverview.map((entry, index) => <Cell key={entry.name} fill={index === 1 ? '#22C55E' : '#2563EB'} fillOpacity={index === 2 ? 0.55 : 1}/>)}</Bar></BarChart></ResponsiveContainer></AnalyticsChart>
                    <AnalyticsChart title="Handoff & dispatch status" description="Track handoffs through the physical release workflow." ariaLabel="Bar chart showing proposed, confirmed, and completed handoffs" hasData={handoffOverview.some((point) => point.value)}><ResponsiveContainer width="100%" height="100%"><BarChart data={handoffOverview} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="name" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Bar dataKey="value" name="Handoffs" fill="#22C55E" radius={[8, 8, 0, 0]}/></BarChart></ResponsiveContainer></AnalyticsChart>
                    <AnalyticsChart title="Walk-in relief desk activity" description="In-person assistance logged by day during the last seven days." ariaLabel="Line chart showing daily walk-in assistance" hasData={walkInTrend.some((point) => point.assisted)}><ResponsiveContainer width="100%" height="100%"><LineChart data={walkInTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="day" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Line type="monotone" dataKey="assisted" name="Assisted" stroke="#22C55E" strokeWidth={3} dot={{ r: 3, fill: '#22C55E' }}/></LineChart></ResponsiveContainer></AnalyticsChart>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-5" aria-label="Operational worklist and audit trail">
                <div className="panel overflow-hidden xl:col-span-3">
                    <div className="flex items-center justify-between border-b border-[#2563EB]/15 p-5">
                        <div>
                            <h2 className="font-extrabold text-[#2563EB]">Priority verification queue</h2>
                            <p className="mt-1 text-xs font-semibold text-[#2563EB]/65">Highest-priority pending requests, ordered for review.</p>
                        </div>
                        <button onClick={() => navigate('/staff/verifications')} className="text-xs font-extrabold text-[#2563EB] underline">View all</button>
                    </div>
                    {loading ? (
                        <div className="space-y-3 p-5"><div className="h-14 animate-pulse rounded-lg bg-[#2563EB]/10"/><div className="h-14 animate-pulse rounded-lg bg-[#2563EB]/10"/></div>
                    ) : priorityRequests.length ? (
                        <div className="divide-y divide-[#2563EB]/10">
                            {priorityRequests.map((request) => (
                                <button key={request.id} onClick={() => navigate('/staff/verifications')} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-[#2563EB]/5">
                                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${['high', 'critical'].includes(request.urgency) ? 'bg-[#22C55E]' : 'bg-[#2563EB]'}`}/>
                                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold">{request.beneficiary?.name || 'Student request'} <span className="font-semibold text-[#2563EB]/55">· {request.category}</span></span><span className="mt-0.5 block text-xs font-semibold text-[#2563EB]/65">{request.quantity_needed} unit{request.quantity_needed === 1 ? '' : 's'} requested · {formatTime(request.created_at)}</span></span>
                                    <span className="hidden rounded-full border border-[#2563EB]/20 px-2 py-1 text-[10px] font-extrabold capitalize sm:inline">{request.urgency || 'standard'}</span><Icon name="arrow" size={16}/>
                                </button>
                            ))}
                        </div>
                    ) : <div className="p-7"><Empty>No requests are waiting for verification.</Empty></div>}
                </div>
                <div className="panel overflow-hidden xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-[#2563EB]/15 p-5"><div><h2 className="font-extrabold text-[#2563EB]">Recent activity</h2><p className="mt-1 text-xs font-semibold text-[#2563EB]/65">Latest audited operations.</p></div><Icon name="activity"/></div>
                    {loading ? <div className="space-y-3 p-5"><div className="h-10 animate-pulse rounded bg-[#2563EB]/10"/><div className="h-10 animate-pulse rounded bg-[#2563EB]/10"/></div> : activities.length ? <div className="divide-y divide-[#2563EB]/10">{activities.slice(0, 5).map((activity) => <div key={activity.id} className="flex gap-3 p-4"><span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2563EB]/10"><Icon name="activity" size={14}/></span><div className="min-w-0"><p className="text-xs font-bold leading-relaxed text-[#2563EB]">{activity.user?.name || 'Staff member'} {activity.action || activity.description || 'updated an operational record'}</p><p className="mt-1 text-[11px] font-semibold text-[#2563EB]/60">{formatTime(activity.created_at)}</p></div></div>)}</div> : <div className="p-7"><Empty>No recent operational activity.</Empty></div>}
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3" aria-label="Operational status">
                <div className="panel no-hover p-5"><div className="flex items-start justify-between"><div><h2 className="font-extrabold">Warehouse readiness</h2><p className="mt-1 text-xs font-semibold text-[#2563EB]/65">Stock ready to be matched</p></div><Icon name="box"/></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#2563EB]/10"><div className="h-full rounded-full bg-[#22C55E]" style={{ width: `${donations.length ? Math.max(8, Math.round((readyStock.length / donations.length) * 100)) : 0}%` }}/></div><div className="mt-3 flex items-end justify-between"><p className="text-2xl font-black text-[#22C55E]">{loading ? '—' : readyStock.length}</p><p className="text-right text-xs font-bold text-[#2563EB]/70">of {loading ? '—' : donations.length} items</p></div><button onClick={() => navigate('/staff/inventory')} className="mt-4 text-xs font-extrabold text-[#2563EB] underline">Manage inventory →</button></div>
                <div className="panel no-hover p-5"><div className="flex items-start justify-between"><div><h2 className="font-extrabold">Dispatch status</h2><p className="mt-1 text-xs font-semibold text-[#2563EB]/65">Proposed and confirmed handoffs</p></div><Icon name="fulfillment"/></div><p className="mt-5 text-2xl font-black text-[#22C55E]">{loading ? '—' : activeHandoffs.length}</p><p className="mt-2 text-xs font-semibold text-[#2563EB]/70">Complete a handoff only after the recipient PIN is verified.</p><button onClick={() => navigate('/staff/handoffs')} className="mt-4 text-xs font-extrabold text-[#2563EB] underline">Open dispatch hub →</button></div>
                <div className="rounded-2xl bg-[#2563EB] p-5 text-white"><div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-white/70">Walk-in relief desk</p><h2 className="mt-1 font-extrabold">Ready to serve</h2></div><span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-[#22C55E]"><Icon name="check"/></span></div><p className="mt-4 text-sm font-semibold leading-relaxed text-white/85">Log verified in-person needs and make an immediate allocation when stock is available.</p><button onClick={() => navigate('/staff/desk')} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-[#2563EB]">Launch desk <Icon name="arrow" size={15}/></button></div>
            </section>

            {/* Quick Operational Navigation Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    onClick={() => navigate('/staff/verifications')}
                    className="panel no-hover p-6 bg-white space-y-3 hover:border-[#2563EB] transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="space-y-2">
                        <span className="p-2.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] inline-block font-bold text-xs">
                            MODULE 1
                        </span>
                        <h3 className="font-extrabold text-base text-[#2563EB]">Request Verifications</h3>
                        <p className="text-xs text-[#2563EB]/80 font-semibold leading-relaxed">
                            Inspect student credentials, set financial hardship/emergency tiers, attach staff notes, and approve requests.
                        </p>
                    </div>
                    <span className="text-xs font-extrabold text-[#2563EB] underline mt-4">Open Queue ({pendingRequests.length}) &rarr;</span>
                </div>

                <div
                    onClick={() => navigate('/staff/inventory')}
                    className="panel no-hover p-6 bg-white space-y-3 hover:border-[#2563EB] transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="space-y-2">
                        <span className="p-2.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] inline-block font-bold text-xs">
                            MODULE 2
                        </span>
                        <h3 className="font-extrabold text-base text-[#2563EB]">Warehouse & Inventory</h3>
                        <p className="text-xs text-[#2563EB]/80 font-semibold leading-relaxed">
                            Assign physical shelf/bin storage locations, log condition grades, record expiration dates, and intake stock.
                        </p>
                    </div>
                    <span className="text-xs font-extrabold text-[#2563EB] underline mt-4">View Storage Bins &rarr;</span>
                </div>

                <div
                    onClick={() => navigate('/staff/desk')}
                    className="panel no-hover p-6 bg-white space-y-3 hover:border-[#2563EB] transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="space-y-2">
                        <span className="p-2.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] inline-block font-bold text-xs">
                            MODULE 3
                        </span>
                        <h3 className="font-extrabold text-base text-[#2563EB]">Walk-In Relief Desk</h3>
                        <p className="text-xs text-[#2563EB]/80 font-semibold leading-relaxed">
                            Process offline students visiting the campus relief office in person. Log immediate needs & instant allocation.
                        </p>
                    </div>
                    <span className="text-xs font-extrabold text-[#2563EB] underline mt-4">Launch Walk-In Desk &rarr;</span>
                </div>

                <div
                    onClick={() => navigate('/staff/handoffs')}
                    className="panel no-hover p-6 bg-white space-y-3 hover:border-[#22C55E] transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="space-y-2">
                        <span className="p-2.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E] inline-block font-bold text-xs">
                            MODULE 4
                        </span>
                        <h3 className="font-extrabold text-base text-[#22C55E]">Handoff & Dispatch</h3>
                        <p className="text-xs text-[#2563EB]/80 font-semibold leading-relaxed">
                            Coordinate physical pickup depot windows and clear handoffs using recipient 6-digit PIN verification.
                        </p>
                    </div>
                    <span className="text-xs font-extrabold text-[#22C55E] underline mt-4">Dispatch Hub ({activeHandoffs.length}) &rarr;</span>
                </div>
            </div>
        </main>
    );
}

function StaffVerificationDesk() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending_review');
    const [tierFilter, setTierFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [inspecting, setInspecting] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmingAction, setConfirmingAction] = useState(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        verification_tier: 'identity_verified',
        verification_notes: '',
        student_id_number: '',
        verification_decision_reason: '',
        verification_checklist: { identity: false, eligibility: false, justification: false },
    });

    const loadData = () => {
        setLoading(true);
        api.get('/admin/requests')
            .then((r) => setRequests(r.data.data || []))
            .catch(() => setError('Failed to load requests verification feed.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const openModal = async (req) => {
        setInspecting(req);
        setForm({
            verification_tier: req.verification_tier || 'identity_verified',
            verification_notes: req.verification_notes || '',
            student_id_number: req.student_id_number || '',
            verification_decision_reason: req.verification_decision_reason || '',
            verification_checklist: { identity: false, eligibility: false, justification: false, ...(req.verification_checklist || {}) },
        });
        setError('');
        if (req.status === 'pending_review' && req.verification_state !== 'under_review' && req.verification_state !== 'needs_revision') {
            try {
                const response = await api.patch(`/admin/requests/${req.id}`, {
                    status: 'pending_review',
                    verification_state: 'under_review',
                    verification_tier: req.verification_tier || 'unverified',
                    verification_notes: req.verification_notes || '',
                    student_id_number: req.student_id_number || '',
                    verification_checklist: req.verification_checklist || {},
                });
                const updated = response.data.data || response.data;
                setInspecting(updated);
                setRequests((current) => current.map((item) => item.id === updated.id ? updated : item));
            } catch {
                setError('Unable to mark this request as under review. You can still inspect its submitted information.');
            }
        }
    };

    const openSupportingDocument = async (req) => {
        try {
            const response = await api.get(`/requests/${req.id}/document`, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data);
            window.open(objectUrl, '_blank', 'noopener,noreferrer');
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        } catch (err) {
            setError(err.response?.data?.message || 'The supporting document could not be opened.');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (user && inspecting && inspecting.beneficiary_id === user.id) {
            setError('Anti-Fraud Guard: You cannot verify or approve your own aid request.');
            return;
        }

        const verificationState = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'needs_revision';
        if (status !== 'approved' && !form.verification_decision_reason.trim()) {
            setError('Please add a clear reason before rejecting or requesting a revision.');
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            await api.patch(`/admin/requests/${id}`, {
                status,
                verification_tier: form.verification_tier,
                verification_notes: form.verification_notes,
                student_id_number: form.student_id_number,
                verification_state: verificationState,
                verification_checklist: form.verification_checklist,
                verification_decision_reason: form.verification_decision_reason,
            });
            setInspecting(null);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update request verification status.');
        } finally {
            setActionLoading(false);
        }
    };

    let filtered = requests.filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (tierFilter !== 'all' && (r.verification_tier || 'unverified') !== tierFilter) return false;
        if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
        if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
        if (dateFilter === 'today' && new Date(r.created_at).toDateString() !== new Date().toDateString()) return false;
        if (dateFilter === 'week' && Date.now() - new Date(r.created_at).getTime() > 7 * 24 * 60 * 60 * 1000) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            const name = (r.beneficiary?.name || '').toLowerCase();
            const just = (r.justification || '').toLowerCase();
            const idNum = (r.student_id_number || '').toLowerCase();
            const cat = (r.category || '').toLowerCase();
            if (!name.includes(q) && !just.includes(q) && !idNum.includes(q) && !cat.includes(q)) return false;
        }
        return true;
    });
    filtered = [...filtered].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.urgency] ?? 3) - ({ high: 0, medium: 1, low: 2 }[b.urgency] ?? 3));
    const summary = {
        pending: requests.filter((r) => r.status === 'pending_review' && r.verification_state !== 'needs_revision').length,
        review: requests.filter((r) => r.verification_state === 'under_review').length,
        approved: requests.filter((r) => r.status === 'approved').length,
        rejected: requests.filter((r) => r.status === 'rejected').length,
        attention: requests.filter((r) => r.urgency === 'high' || r.verification_state === 'needs_revision').length,
    };
    const categories = [...new Set(requests.map((r) => r.category).filter(Boolean))];

    return (
        <main className="shell staff-workspace py-8 space-y-6 text-[#2563EB]">
            <div className="panel no-hover p-6 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                    <div>
                        <span className="eyebrow">MODULE 1: ELIGIBILITY & PROOF</span>
                        <h1 className="text-2xl font-extrabold text-[#2563EB]">Student Request Verifications Desk</h1>
                        <p className="text-xs font-semibold text-[#2563EB]/80 mt-1">
                            Review student credentials, check anti-fraud guards, set verification tiers, and approve aid.
                        </p>
                    </div>
                    <Button variant="secondary" onClick={loadData} loading={loading}>
                        <Icon name="refresh" />
                        <span className="ml-1 text-xs">Refresh Queue</span>
                    </Button>
                </div>

                <section aria-label="Verification summary" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {[
                        ['Pending', summary.pending, 'Awaiting first review', 'approvals', 'blue'],
                        ['Under review', summary.review, 'Currently being checked', 'clock', 'blue'],
                        ['Approved', summary.approved, 'Eligible for matching', 'check', 'green'],
                        ['Rejected', summary.rejected, 'Decision recorded', 'decline', 'blue'],
                        ['Needs attention', summary.attention, 'Urgent or revision needed', 'alert', 'green'],
                    ].map(([label, count, detail, icon, tone]) => <button key={label} onClick={() => label === 'Approved' ? setStatusFilter('approved') : label === 'Rejected' ? setStatusFilter('rejected') : label === 'Pending' ? setStatusFilter('pending_review') : setStatusFilter('all')} className="rounded-xl border border-[#2563EB]/20 bg-white p-3 text-left transition hover:border-[#2563EB] hover:shadow-sm"><div className="flex items-start justify-between gap-2"><span className="text-[10px] font-extrabold uppercase tracking-wide text-[#2563EB]/65">{label}</span><Icon name={icon} size={15} className={tone === 'green' ? 'text-[#22C55E]' : ''}/></div><p className={`mt-2 text-2xl font-black ${tone === 'green' ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>{loading ? '—' : count}</p><p className="mt-0.5 text-[10px] font-semibold text-[#2563EB]/60">{detail}</p></button>)}
                </section>

                {/* Filters Bar */}
                <div className="rounded-xl border border-[#2563EB]/15 bg-[#2563EB]/5 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-extrabold">Find and triage requests</h2><p className="mt-0.5 text-[11px] font-semibold text-[#2563EB]/65">{filtered.length} request{filtered.length === 1 ? '' : 's'} match the current view.</p></div><button onClick={() => { setSearch(''); setStatusFilter('pending_review'); setTierFilter('all'); setCategoryFilter('all'); setUrgencyFilter('all'); setDateFilter('all'); }} className="text-xs font-extrabold underline">Reset filters</button></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Search Student / Justification</label>
                        <input
                            type="text"
                            placeholder="Search by student name, ID, or text..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input text-xs w-full mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Filter Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input text-xs w-full mt-1"
                        >
                            <option value="all">All Request Statuses</option>
                            <option value="pending_review">Pending Verification</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Filter Verification Tier</label>
                        <select
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                            className="input text-xs w-full mt-1"
                        >
                            <option value="all">All Verification Tiers</option>
                            <option value="unverified">Unverified</option>
                            <option value="identity_verified">Identity Verified</option>
                            <option value="financial_hardship">Financial Hardship</option>
                            <option value="emergency">Emergency / Disaster</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Category</label>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input text-xs w-full mt-1"><option value="all">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Urgency</label>
                        <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="input text-xs w-full mt-1"><option value="all">All urgency levels</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select>
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Submitted</label>
                        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input text-xs w-full mt-1"><option value="all">Any date</option><option value="today">Today</option><option value="week">Last 7 days</option></select>
                    </div>
                </div>
                </div>

                {/* Requests Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-[#2563EB]/20 bg-[#2563EB]/5 text-[#2563EB] font-extrabold uppercase">
                                <th className="p-3">Student / Beneficiary</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Urgency</th>
                                <th className="p-3">Tier</th>
                                <th className="p-3">Verified By</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2563EB]/10 font-semibold">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8"><div className="space-y-2"><div className="h-4 animate-pulse rounded bg-[#2563EB]/10"/><div className="h-4 animate-pulse rounded bg-[#2563EB]/10"/><div className="h-4 animate-pulse rounded bg-[#2563EB]/10"/></div></td></tr>
                            ) : !filtered.length ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-[#2563EB]/70">
                                        <div className="mx-auto max-w-sm"><p className="font-extrabold text-[#2563EB]">No requests found</p><p className="mt-1 text-xs font-semibold">Try clearing a filter or refresh the verification queue.</p></div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((req) => {
                                    const isSelf = user && req.beneficiary_id === user.id;
                                    return (
                                        <tr key={req.id} className="hover:bg-[#2563EB]/5 transition">
                                            <td className="p-3">
                                                <div className="font-extrabold text-[#2563EB]">{req.beneficiary?.name || 'Student'}</div>
                                                <div className="text-[10px] text-[#2563EB]/70">{req.beneficiary?.email}</div>
                                                {req.student_id_number && (
                                                    <div className="text-[10px] font-bold text-[#22C55E]">ID: {req.student_id_number}</div>
                                                )}
                                            </td>
                                            <td className="p-3 font-bold">{req.category}</td>
                                            <td className="p-3">
                                                <span className="uppercase text-[10px] font-black px-2 py-0.5 rounded bg-[#2563EB] text-white">
                                                    {req.urgency}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#2563EB]/30 bg-[#2563EB]/10">
                                                    {(req.verification_tier || 'unverified').replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-3 text-[11px] text-[#2563EB]/80">
                                                {req.verified_by?.name || '—'}
                                            </td>
                                            <td className="p-3">
                                                <Badge status={req.status} />
                                            </td>
                                            <td className="p-3 text-right">
                                                {isSelf ? (
                                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                                                        Self-Approval Blocked
                                                    </span>
                                                ) : (
                                                    <Button size="sm" onClick={() => openModal(req)}>
                                                        <Icon name="eye" size={14}/><span className="ml-1">View & Verify</span>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inspection & Verification Modal */}
            {inspecting && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel no-hover w-full max-w-xl p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h3 className="text-lg font-extrabold text-[#2563EB]">Verification Desk Inspection</h3>
                            <button className="nav-link p-1" onClick={() => setInspecting(null)}>
                                <Icon name="close" />
                            </button>
                        </div>

                        {error && <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs font-bold">{error}</div>}

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-[#2563EB]/60">Student Applicant</span>
                                <p className="font-extrabold text-sm text-[#2563EB]">{inspecting.beneficiary?.name}</p>
                                <p className="text-[11px] text-[#2563EB]/70">{inspecting.beneficiary?.email}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-[#2563EB]/60">Requested Category & Quantity</span>
                                <p className="font-extrabold text-sm text-[#2563EB]">{inspecting.category} ({inspecting.quantity_needed} units)</p>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-extrabold uppercase text-[#2563EB]/60">Student Justification Note</span>
                            <p className="text-xs text-[#2563EB] font-semibold bg-[#2563EB]/5 p-3 rounded-lg border border-[#2563EB]/20 mt-1 leading-relaxed">
                                "{inspecting.justification}"
                            </p>
                        </div>

                        <div className="rounded-xl border border-dashed border-[#2563EB]/30 p-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB]/10"><Icon name="request" size={16}/></span><div><p className="text-xs font-extrabold">Supporting documents</p><p className="text-[10px] font-semibold text-[#2563EB]/65">{inspecting.supporting_document_url ? 'A private supporting document is attached.' : 'No documents are attached to this request.'}</p></div></div>{inspecting.supporting_document_url && <Button type="button" variant="secondary" className="mt-3 text-xs" onClick={() => openSupportingDocument(inspecting)}><Icon name="view" size={14}/><span className="ml-1">Open securely</span></Button>}</div>

                        <div className="space-y-3 pt-2 border-t border-[#2563EB]/20">
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#2563EB]">Staff Verification Protocol</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Student ID Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. STU-2026-8891"
                                        value={form.student_id_number}
                                        onChange={(e) => setForm({ ...form, student_id_number: e.target.value })}
                                        className="input text-xs w-full mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Assign Verification Tier</label>
                                    <select
                                        value={form.verification_tier}
                                        onChange={(e) => setForm({ ...form, verification_tier: e.target.value })}
                                        className="input text-xs w-full mt-1"
                                    >
                                        <option value="unverified">Unverified</option>
                                        <option value="identity_verified">Identity Verified</option>
                                        <option value="financial_hardship">Verified Financial Hardship</option>
                                        <option value="emergency">Emergency Crisis Relief</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Staff Internal Audit Notes</label>
                                <textarea
                                    rows="2"
                                    placeholder="Enter verification notes or proof inspection details..."
                                    value={form.verification_notes}
                                    onChange={(e) => setForm({ ...form, verification_notes: e.target.value })}
                                    className="input text-xs w-full mt-1"
                                />
                            </div>

                            <div className="rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-3">
                                <div className="flex items-center justify-between gap-3"><div><h5 className="text-xs font-extrabold">Verification checklist</h5><p className="mt-0.5 text-[10px] font-semibold text-[#2563EB]/65">Complete the checks used for this decision.</p></div><span className="text-xs font-extrabold text-[#22C55E]">{Object.values(form.verification_checklist).filter(Boolean).length}/3</span></div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-3">{[['identity', 'Student identity checked'], ['eligibility', 'Eligibility confirmed'], ['justification', 'Need is documented']].map(([key, label]) => <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[11px] font-bold"><input type="checkbox" checked={Boolean(form.verification_checklist[key])} onChange={(e) => setForm({ ...form, verification_checklist: { ...form.verification_checklist, [key]: e.target.checked } })} className="accent-[#22C55E]"/>{label}</label>)}</div>
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Decision reason <span className="normal-case text-[#2563EB]/55">(required for reject or revision)</span></label>
                                <textarea rows="2" placeholder="Explain what is missing, why the request is ineligible, or record the decision basis..." value={form.verification_decision_reason} onChange={(e) => setForm({ ...form, verification_decision_reason: e.target.value })} className="input text-xs w-full mt-1"/>
                            </div>

                            <div className="rounded-lg border border-[#2563EB]/15 p-3 text-[11px] font-semibold text-[#2563EB]/75"><span className="font-extrabold text-[#2563EB]">Request history: </span>submitted {new Date(inspecting.created_at).toLocaleString()}{inspecting.verified_by?.name ? ` · last reviewed by ${inspecting.verified_by.name}` : ' · no earlier verification recorded'}{inspecting.verification_decided_at ? ` · decision updated ${new Date(inspecting.verification_decided_at).toLocaleString()}` : ''}.</div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[#2563EB]/20">
                            {confirmingAction ? <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2563EB] bg-[#2563EB]/5 p-3"><p className="text-xs font-bold">Confirm: {confirmingAction === 'approved' ? 'approve this request' : confirmingAction === 'rejected' ? 'reject this request' : 'request more information'}?</p><div className="flex gap-2"><Button variant="secondary" onClick={() => setConfirmingAction(null)}>Cancel</Button><Button loading={actionLoading} onClick={() => { handleUpdateStatus(inspecting.id, confirmingAction); setConfirmingAction(null); }}>{confirmingAction === 'approved' ? 'Confirm approval' : 'Confirm decision'}</Button></div></div> : <><Button variant="secondary" onClick={() => setConfirmingAction('pending_review')} disabled={actionLoading}>Request revision</Button><Button variant="secondary" onClick={() => setConfirmingAction('rejected')} disabled={actionLoading}>Reject request</Button><Button onClick={() => setConfirmingAction('approved')} disabled={actionLoading}><Icon name="check"/><span className="ml-1">Verify & approve</span></Button></>}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function StaffWarehouseInventory() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');

    // Modals
    const [showIntakeModal, setShowIntakeModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const [intakeForm, setIntakeForm] = useState({
        donor_name: 'Anonymous Donor',
        item_name: '',
        category: 'Food & Meals',
        quantity: 1,
        storage_location: 'Main Warehouse Depot A - Shelf 1',
        condition_grade: 'good',
        intake_notes: '',
        expiry_date: '',
    });

    const [editForm, setEditForm] = useState({
        storage_location: '',
        condition_grade: 'good',
        quantity: 1,
        intake_notes: '',
        expiry_date: '',
    });

    const loadData = () => {
        setLoading(true);
        Promise.all([api.get('/admin/donations'), api.get('/admin/inventory-movements')])
            .then(([stockResponse, movementResponse]) => { setDonations(stockResponse.data.data || []); setMovements(movementResponse.data.data || []); })
            .catch(() => setError('Failed to load inventory stock.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateIntake = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        try {
            await api.post('/admin/donations/intake', intakeForm);
            setShowIntakeModal(false);
            setIntakeForm({
                donor_name: 'Anonymous Donor',
                item_name: '',
                category: 'Food & Meals',
                quantity: 1,
                storage_location: 'Main Warehouse Depot A - Shelf 1',
                condition_grade: 'good',
                intake_notes: '',
                expiry_date: '',
            });
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process physical item intake.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveStock = async (e) => {
        e.preventDefault();
        if (!editingStock) return;
        setActionLoading(true);
        setError('');
        try {
            await api.patch(`/admin/donations/${editingStock.id}/stock`, editForm);
            setEditingStock(null);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update stock location/quantity.');
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (item) => {
        setEditingStock(item);
        setEditForm({
            storage_location: item.storage_location || item.pickup_location || 'Warehouse Bin A1',
            condition_grade: item.condition_grade || 'good',
            quantity: item.quantity || 1,
            intake_notes: item.intake_notes || '',
            expiry_date: item.expiry_date || '',
        });
        setError('');
    };

    let filtered = donations.filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
        if (gradeFilter !== 'all' && (item.condition_grade || 'good') !== gradeFilter) return false;
        const daysUntilExpiry = item.expiry_date ? Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / 86400000) : null;
        const availableQuantity = item.available_quantity ?? item.quantity;
        const isLow = availableQuantity > 0 && availableQuantity <= 2;
        const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
        const isExpiring = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        if (stockFilter === 'low' && !isLow) return false;
        if (stockFilter === 'out' && (item.available_quantity ?? item.quantity) !== 0) return false;
        if (stockFilter === 'expiring' && !isExpiring) return false;
        if (stockFilter === 'expired' && !isExpired) return false;
        if (stockFilter === 'damaged' && item.condition_grade !== 'damaged') return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            const name = (item.item_name || '').toLowerCase();
            const loc = (item.storage_location || item.pickup_location || '').toLowerCase();
            const cat = (item.category || '').toLowerCase();
            if (!name.includes(q) && !loc.includes(q) && !cat.includes(q)) return false;
        }
        return true;
    });
    const stockSummary = {
        total: donations.length,
        available: donations.reduce((total, item) => total + (item.available_quantity ?? item.quantity), 0),
        low: donations.filter((item) => { const availableQuantity = item.available_quantity ?? item.quantity; return availableQuantity > 0 && availableQuantity <= 2; }).length,
        expiring: donations.filter((item) => item.expiry_date && new Date(item.expiry_date).getTime() - Date.now() <= 30 * 86400000 && new Date(item.expiry_date).getTime() >= Date.now()).length,
        attention: donations.filter((item) => item.condition_grade === 'damaged' || (item.expiry_date && new Date(item.expiry_date) < new Date())).length,
    };
    const stockSignal = (item) => {
        if (item.condition_grade === 'damaged') return 'Damaged';
        if (item.expiry_date && new Date(item.expiry_date) < new Date()) return 'Expired';
        if (item.expiry_date && new Date(item.expiry_date).getTime() - Date.now() <= 30 * 86400000) return 'Expiring soon';
        if ((item.available_quantity ?? item.quantity) === 0) return item.reserved_quantity ? 'Reserved' : 'Out of stock';
        if ((item.available_quantity ?? item.quantity) <= 2) return 'Low stock';
        return item.status === 'pending_match' ? 'Available' : 'Reserved';
    };

    return (
        <main className="shell staff-workspace py-8 space-y-6 text-[#2563EB]">
            <div className="panel no-hover p-6 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                    <div>
                        <span className="eyebrow">MODULE 2: PHYSICAL STORAGE</span>
                        <h1 className="text-2xl font-extrabold text-[#2563EB]">Warehouse & Inventory Control</h1>
                        <p className="text-xs font-semibold text-[#2563EB]/80 mt-1">
                            Track physical storage bin tagging, shelf locations, item condition grades, and physical intake.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setShowIntakeModal(true)}>
                            <Icon name="plus" />
                            <span className="ml-1 text-xs">+ Intake Physical Stock</span>
                        </Button>
                        <Button variant="secondary" onClick={loadData} loading={loading}>
                            <Icon name="refresh" />
                        </Button>
                    </div>
                </div>

                <Error>{error}</Error>

                <section aria-label="Inventory summary" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {[
                        ['Stocked items', stockSummary.total, 'Unique inventory records', 'box', 'all'],
                        ['Available units', stockSummary.available, 'Ready for matching', 'check', 'all'],
                        ['Low stock', stockSummary.low, 'Two units or fewer', 'alert', 'low'],
                        ['Expiring soon', stockSummary.expiring, 'Within 30 days', 'clock', 'expiring'],
                        ['Needs attention', stockSummary.attention, 'Damaged or expired', 'alert', 'damaged'],
                    ].map(([label, value, detail, icon, filter]) => <button key={label} onClick={() => setStockFilter(filter)} className="rounded-xl border border-[#2563EB]/20 bg-white p-3 text-left transition hover:border-[#2563EB] hover:shadow-sm"><div className="flex items-start justify-between gap-2"><span className="text-[10px] font-extrabold uppercase tracking-wide text-[#2563EB]/65">{label}</span><Icon name={icon} size={15} className={filter !== 'all' ? 'text-[#22C55E]' : ''}/></div><p className={`mt-2 text-2xl font-black ${filter !== 'all' ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>{loading ? '—' : value}</p><p className="mt-0.5 text-[10px] font-semibold text-[#2563EB]/60">{detail}</p></button>)}
                </section>

                {/* Filters */}
                <div className="rounded-xl border border-[#2563EB]/15 bg-[#2563EB]/5 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-extrabold">Stock overview</h2><p className="mt-0.5 text-[11px] font-semibold text-[#2563EB]/65">{filtered.length} inventory item{filtered.length === 1 ? '' : 's'} match the current view.</p></div><button onClick={() => { setSearch(''); setCategoryFilter('all'); setGradeFilter('all'); setStockFilter('all'); }} className="text-xs font-extrabold underline">Reset filters</button></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Search Item or Shelf Bin</label>
                        <input
                            type="text"
                            placeholder="Search by item name, shelf bin..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input text-xs w-full mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="input text-xs w-full mt-1"
                        >
                            <option value="all">All Categories</option>
                            <option value="Food & Meals">Food & Meals</option>
                            <option value="Clothing & Apparel">Clothing & Apparel</option>
                            <option value="Educational & Books">Educational & Books</option>
                            <option value="Medical & Health">Medical & Health</option>
                            <option value="Electronics & Tech">Electronics & Tech</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Condition Grade</label>
                        <select
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            className="input text-xs w-full mt-1"
                        >
                            <option value="all">All Condition Grades</option>
                            <option value="new">New</option>
                            <option value="like_new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="damaged">Damaged</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Stock health</label>
                        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="input text-xs w-full mt-1"><option value="all">All stock health</option><option value="low">Low stock</option><option value="out">Out of stock</option><option value="expiring">Expiring soon</option><option value="expired">Expired</option><option value="damaged">Damaged</option></select>
                    </div>
                </div>
                </div>

                {/* Stock Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-[#2563EB]/20 bg-[#2563EB]/5 text-[#2563EB] font-extrabold uppercase">
                                <th className="p-3">Donated Item Name</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Physical Storage Bin</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Condition Grade</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2563EB]/10 font-semibold">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8"><div className="space-y-2"><div className="h-4 animate-pulse rounded bg-[#2563EB]/10"/><div className="h-4 animate-pulse rounded bg-[#2563EB]/10"/></div></td></tr>
                            ) : !filtered.length ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-[#2563EB]/70">
                                        <div className="mx-auto max-w-sm"><p className="font-extrabold text-[#2563EB]">No inventory items found</p><p className="mt-1 text-xs font-semibold">Try clearing a filter or record a new physical intake.</p></div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#2563EB]/5 transition">
                                        <td className="p-3">
                                            <div className="font-extrabold text-[#2563EB]">{item.item_name}</div>
                                            <div className="text-[10px] text-[#2563EB]/70">Donor: {item.donor?.name || 'Donor'}</div>
                                        </td>
                                        <td className="p-3 font-bold">{item.category}</td>
                                        <td className="p-3">
                                            <span className="font-extrabold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded border border-[#2563EB]/20">
                                                {item.storage_location || item.pickup_location || 'Warehouse Depot 1'}
                                            </span>
                                        </td>
                                        <td className="p-3"><p className="font-black text-sm">{item.quantity} <span className="text-[10px] font-bold text-[#2563EB]/60">on hand</span></p><p className="mt-1 text-[10px] font-bold text-[#2563EB]/65">{item.available_quantity ?? item.quantity} available{item.reserved_quantity ? ` · ${item.reserved_quantity} reserved` : ''}</p></td>
                                        <td className="p-3">
                                            <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                                {(item.condition_grade || 'good').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-3"><span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-extrabold ${['Low stock','Expiring soon','Damaged','Expired'].includes(stockSignal(item)) ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]' : 'border-[#2563EB]/20 text-[#2563EB]'}`}>{stockSignal(item)}</span>{item.expiry_date && <p className="mt-1 text-[10px] font-semibold text-[#2563EB]/60">Expires {new Date(item.expiry_date).toLocaleDateString()}</p>}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => setViewingItem(item)}>Details</Button><Button size="sm" onClick={() => openEditModal(item)}>Adjust</Button></div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingItem && <div className="fixed inset-0 z-50 grid place-items-center bg-[#2563EB]/40 p-4 backdrop-blur-sm"><div className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6"><div className="flex items-start justify-between border-b border-[#2563EB]/20 pb-3"><div><p className="eyebrow">Inventory item record</p><h3 className="text-lg font-extrabold">{viewingItem.item_name}</h3></div><button className="nav-link p-1" onClick={() => setViewingItem(null)} aria-label="Close item details"><Icon name="close"/></button></div><div className="mt-5 grid gap-4 text-xs sm:grid-cols-2"><div className="rounded-xl bg-[#2563EB]/5 p-4"><p className="text-[10px] font-extrabold uppercase text-[#2563EB]/60">Stock and location</p><p className="mt-2 text-xl font-black">{viewingItem.quantity} units</p><p className="mt-1 font-bold">{viewingItem.storage_location || viewingItem.pickup_location || 'Location not set'}</p><p className="mt-1 text-[#2563EB]/65">{viewingItem.category} · {stockSignal(viewingItem)}</p></div><div className="rounded-xl border border-[#2563EB]/20 p-4"><p className="text-[10px] font-extrabold uppercase text-[#2563EB]/60">Condition and handling</p><p className="mt-2 font-extrabold capitalize">{(viewingItem.condition_grade || 'good').replace('_', ' ')}</p><p className="mt-1 text-[#2563EB]/70">{viewingItem.condition_notes || viewingItem.intake_notes || 'No inspection notes recorded.'}</p>{viewingItem.expiry_date && <p className="mt-2 font-bold text-[#22C55E]">Expiry: {new Date(viewingItem.expiry_date).toLocaleDateString()}</p>}</div></div><div className="mt-5"><div className="flex items-center justify-between"><div><h4 className="font-extrabold">Movement history</h4><p className="mt-1 text-[11px] font-semibold text-[#2563EB]/65">Every recorded intake or stock adjustment.</p></div><span className="text-xs font-extrabold">{movements.filter((movement) => movement.donation_id === viewingItem.id).length} records</span></div><div className="mt-3 divide-y divide-[#2563EB]/10 rounded-xl border border-[#2563EB]/15">{movements.filter((movement) => movement.donation_id === viewingItem.id).length ? movements.filter((movement) => movement.donation_id === viewingItem.id).map((movement) => <div key={movement.id} className="flex items-center justify-between gap-3 p-3"><div><p className="text-xs font-extrabold capitalize">{movement.movement_type.replace('_', ' ')} <span className="font-semibold text-[#2563EB]/65">· {movement.staff?.name || 'Staff'}</span></p><p className="mt-1 text-[10px] font-semibold text-[#2563EB]/60">{movement.reason || 'No reason recorded'} · {new Date(movement.created_at).toLocaleString()}</p></div><span className="text-xs font-black text-[#22C55E]">{movement.quantity_delta > 0 ? '+' : ''}{movement.quantity_delta}</span></div>) : <div className="p-5 text-center text-xs font-semibold text-[#2563EB]/65">No movements have been recorded for this item yet.</div>}</div></div><div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => { setViewingItem(null); openEditModal(viewingItem); }}>Adjust stock</Button><Button onClick={() => setViewingItem(null)}>Close</Button></div></div></div>}

            {/* Modal: Physical Intake */}
            {showIntakeModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <form onSubmit={handleCreateIntake} className="panel no-hover w-full max-w-lg p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h3 className="text-lg font-extrabold text-[#2563EB]">Physical Inventory Item Intake</h3>
                            <button type="button" className="nav-link p-1" onClick={() => setShowIntakeModal(false)}>
                                <Icon name="close" />
                            </button>
                        </div>

                        {error && <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs font-bold">{error}</div>}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Item Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Calculus Textbook, Winter Jacket"
                                    value={intakeForm.item_name}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, item_name: e.target.value })}
                                    className="input text-xs w-full mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Category *</label>
                                <select
                                    value={intakeForm.category}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, category: e.target.value })}
                                    className="input text-xs w-full mt-1"
                                >
                                    <option value="Food & Meals">Food & Meals</option>
                                    <option value="Clothing & Apparel">Clothing & Apparel</option>
                                    <option value="Educational & Books">Educational & Books</option>
                                    <option value="Medical & Health">Medical & Health</option>
                                    <option value="Electronics & Tech">Electronics & Tech</option>
                                    <option value="Household & Bedding">Household & Bedding</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Quantity *</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={intakeForm.quantity}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, quantity: parseInt(e.target.value) || 1 })}
                                    className="input text-xs w-full mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Condition Grade *</label>
                                <select
                                    value={intakeForm.condition_grade}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, condition_grade: e.target.value })}
                                    className="input text-xs w-full mt-1"
                                >
                                    <option value="new">New</option>
                                    <option value="like_new">Like New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Donor Name</label>
                                <input
                                    type="text"
                                    value={intakeForm.donor_name}
                                    onChange={(e) => setIntakeForm({ ...intakeForm, donor_name: e.target.value })}
                                    className="input text-xs w-full mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Storage Shelf / Bin Location *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Depot A / Shelf 3B / Bin 12"
                                value={intakeForm.storage_location}
                                onChange={(e) => setIntakeForm({ ...intakeForm, storage_location: e.target.value })}
                                className="input text-xs w-full mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Expiry Date <span className="normal-case text-[#2563EB]/55">(for consumable or medical stock)</span></label>
                            <input type="date" value={intakeForm.expiry_date} onChange={(e) => setIntakeForm({ ...intakeForm, expiry_date: e.target.value })} className="input text-xs w-full mt-1"/>
                        </div>

                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Intake Inspection Notes</label>
                            <textarea
                                rows="2"
                                placeholder="Physical condition notes upon staff intake..."
                                value={intakeForm.intake_notes}
                                onChange={(e) => setIntakeForm({ ...intakeForm, intake_notes: e.target.value })}
                                className="input text-xs w-full mt-1"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#2563EB]/20">
                            <Button variant="secondary" type="button" onClick={() => setShowIntakeModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={actionLoading}>
                                Complete Physical Intake
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: Edit Stock / Bin */}
            {editingStock && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <form onSubmit={handleSaveStock} className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h3 className="text-lg font-extrabold text-[#2563EB]">Update Stock & Storage Bin</h3>
                            <button type="button" className="nav-link p-1" onClick={() => setEditingStock(null)}>
                                <Icon name="close" />
                            </button>
                        </div>

                        {error && <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs font-bold">{error}</div>}

                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Storage Bin / Location Tag</label>
                            <input
                                type="text"
                                required
                                value={editForm.storage_location}
                                onChange={(e) => setEditForm({ ...editForm, storage_location: e.target.value })}
                                className="input text-xs w-full mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Quantity in Stock</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={editForm.quantity}
                                    onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                                    className="input text-xs w-full mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Condition Grade</label>
                                <select
                                    value={editForm.condition_grade}
                                    onChange={(e) => setEditForm({ ...editForm, condition_grade: e.target.value })}
                                    className="input text-xs w-full mt-1"
                                >
                                    <option value="new">New</option>
                                    <option value="like_new">Like New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Staff Notes</label>
                            <textarea
                                rows="2"
                                value={editForm.intake_notes}
                                onChange={(e) => setEditForm({ ...editForm, intake_notes: e.target.value })}
                                className="input text-xs w-full mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Expiry Date</label>
                            <input type="date" value={editForm.expiry_date || ''} onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })} className="input text-xs w-full mt-1"/>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#2563EB]/20">
                            <Button variant="secondary" type="button" onClick={() => setEditingStock(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={actionLoading}>
                                Save Stock Adjustments
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}

function StaffWalkInDesk() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        student_name: '',
        student_email: '',
        student_id_number: '',
        category: 'Food & Meals',
        quantity_needed: 1,
        urgency: 'high',
        justification: '',
        verification_tier: 'identity_verified',
        instant_donation_id: '',
        staff_internal_notes: '',
        referral_destination: '',
    });

    useEffect(() => {
        Promise.all([api.get('/admin/donations'), api.get('/admin/requests')])
            .then(([donationResponse, requestResponse]) => { setDonations(donationResponse.data.data || []); setRequests(requestResponse.data.data || []); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const availableDonations = donations.filter((d) => d.status === 'pending_match' && (d.available_quantity ?? d.quantity) >= form.quantity_needed && d.category === form.category);
    const existingStudentRequests = requests.filter((request) => (form.student_email && request.beneficiary?.email?.toLowerCase() === form.student_email.toLowerCase()) || (form.student_id_number && request.student_id_number?.toLowerCase() === form.student_id_number.toLowerCase()));
    const walkIns = requests.filter((request) => request.is_walk_in);
    const deskSummary = { waiting: walkIns.filter((request) => request.walk_in_status === 'waiting').length, processing: walkIns.filter((request) => request.walk_in_status === 'processing').length, completed: walkIns.filter((request) => ['allocated', 'completed'].includes(request.walk_in_status)).length, urgent: walkIns.filter((request) => request.urgency === 'high' && !['allocated', 'completed'].includes(request.walk_in_status)).length, referred: walkIns.filter((request) => request.walk_in_status === 'referred').length };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await api.post('/admin/requests/walk-in', form);
            setSuccessMessage(`Walk-in aid request logged successfully for ${res.data.data?.beneficiary?.name || 'student'}!`);
            setReceipt(res.data.data || res.data);
            setForm({
                student_name: '',
                student_email: '',
                student_id_number: '',
                category: 'Food & Meals',
                quantity_needed: 1,
                urgency: 'high',
                justification: '',
                verification_tier: 'identity_verified',
                instant_donation_id: '',
                staff_internal_notes: '',
                referral_destination: '',
            });
            const requestResponse = await api.get('/admin/requests');
            setRequests(requestResponse.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit walk-in desk request.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <main className="shell staff-workspace py-8 space-y-6 text-[#2563EB]">
            <div className="panel no-hover w-full max-w-6xl mx-auto p-6 sm:p-8 bg-white space-y-6">
                <div className="border-b border-[#2563EB]/20 pb-4 space-y-1">
                    <span className="eyebrow">MODULE 3: ON-SITE ASSISTANCE</span>
                    <h1 className="text-2xl font-extrabold text-[#2563EB]">Walk-In Student Relief Desk</h1>
                    <p className="text-xs font-semibold text-[#2563EB]/80">
                        Process offline student requests on behalf of beneficiaries visiting the campus relief office in person.
                    </p>
                </div>

                <section aria-label="Walk-in desk summary" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {[
                        ['Waiting', deskSummary.waiting, 'Queued for aid', 'clock', 'blue'],
                        ['In progress', deskSummary.processing, 'Being assisted now', 'activity', 'blue'],
                        ['Completed', deskSummary.completed, 'Allocated or handed off', 'check', 'green'],
                        ['Priority', deskSummary.urgent, 'Urgent follow-up needed', 'alert', 'green'],
                        ['Referred', deskSummary.referred, 'Directed to another service', 'arrow', 'blue'],
                    ].map(([label, value, detail, icon, tone]) => <article key={label} className="rounded-xl border border-[#2563EB]/20 bg-white p-3"><div className="flex items-start justify-between"><span className="text-[10px] font-extrabold uppercase tracking-wide text-[#2563EB]/65">{label}</span><Icon name={icon} size={15} className={tone === 'green' ? 'text-[#22C55E]' : ''}/></div><p className={`mt-2 text-2xl font-black ${tone === 'green' ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>{loading ? '—' : value}</p><p className="mt-0.5 text-[10px] font-semibold text-[#2563EB]/60">{detail}</p></article>)}
                </section>

                <section aria-label="Walk-in assistance steps" className="rounded-xl border border-[#2563EB]/15 bg-[#2563EB]/5 p-3"><div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-7">{['Identify student', 'Verify eligibility', 'Assess need', 'Match aid', 'Allocate or queue', 'Confirm assistance', 'Record activity'].map((step, index) => <div key={step} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[10px] font-extrabold"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#2563EB] text-white">{index + 1}</span>{step}</div>)}</div></section>

                {successMessage && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                        ✓ {successMessage}
                    </div>
                )}

                {error && <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">{error}</div>}

                {receipt && <div className="rounded-xl border border-[#22C55E] bg-[#22C55E]/10 p-4 text-xs"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-extrabold text-[#22C55E]">Walk-in assistance recorded · Receipt #{receipt.id}</p><p className="mt-1 font-semibold text-[#2563EB]/75">Status: {(receipt.walk_in_status || 'waiting').replace('_', ' ')} · {receipt.category} · {receipt.quantity_needed} unit{receipt.quantity_needed === 1 ? '' : 's'}</p></div><button onClick={() => setReceipt(null)} className="text-xs font-extrabold underline">Dismiss receipt</button></div></div>}

                {existingStudentRequests.length > 0 && <div className="rounded-xl border border-[#2563EB] bg-[#2563EB]/5 p-4"><div className="flex items-start gap-3"><Icon name="info" className="mt-0.5"/><div><p className="text-xs font-extrabold">Existing request found for this student</p><p className="mt-1 text-[11px] font-semibold text-[#2563EB]/70">Review the active record before creating another request to avoid duplicate assistance.</p><div className="mt-2 flex flex-wrap gap-2">{existingStudentRequests.map((request) => <span key={request.id} className="rounded-full border border-[#2563EB]/20 bg-white px-2 py-1 text-[10px] font-extrabold">#{request.id} · {request.category} · {request.status.replace('_', ' ')}</span>)}</div></div></div></div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#2563EB] text-[10px] font-extrabold text-white">1</span><div><h2 className="text-sm font-extrabold">Identify and verify the student</h2><p className="text-[10px] font-semibold text-[#2563EB]/65">Check campus details before recording a new request.</p></div></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Student Full Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="Student name"
                                value={form.student_name}
                                onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                                className="input text-xs w-full mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Student Campus Email *</label>
                            <input
                                type="email"
                                required
                                placeholder="student@university.edu"
                                value={form.student_email}
                                onChange={(e) => setForm({ ...form, student_email: e.target.value })}
                                className="input text-xs w-full mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Student ID Number *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. STU-2026-9041"
                                value={form.student_id_number}
                                onChange={(e) => setForm({ ...form, student_id_number: e.target.value })}
                                className="input text-xs w-full mt-1"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#2563EB] text-[10px] font-extrabold text-white">2</span><div><h2 className="text-sm font-extrabold">Assess the immediate need</h2><p className="text-[10px] font-semibold text-[#2563EB]/65">Document urgency and on-site eligibility checks.</p></div></div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Aid Category *</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="input text-xs w-full mt-1"
                            >
                                <option value="Food & Meals">Food & Meals</option>
                                <option value="Clothing & Apparel">Clothing & Apparel</option>
                                <option value="Educational & Books">Educational & Books</option>
                                <option value="Medical & Health">Medical & Health</option>
                                <option value="Electronics & Tech">Electronics & Tech</option>
                                <option value="Household & Bedding">Household & Bedding</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Quantity Needed *</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.quantity_needed}
                                onChange={(e) => setForm({ ...form, quantity_needed: parseInt(e.target.value) || 1 })}
                                className="input text-xs w-full mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Urgency Level *</label>
                            <select
                                value={form.urgency}
                                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                                className="input text-xs w-full mt-1"
                            >
                                <option value="low">Low Urgency</option>
                                <option value="medium">Medium Urgency</option>
                                <option value="high">High Urgency (Crisis)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Walk-In Hardship Justification *</label>
                        <textarea
                            rows="3"
                            required
                            placeholder="Explain the student's on-site request..."
                            value={form.justification}
                            onChange={(e) => setForm({ ...form, justification: e.target.value })}
                            className="input text-xs w-full mt-1"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2"><div><label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Eligibility verification</label><select value={form.verification_tier} onChange={(e) => setForm({ ...form, verification_tier: e.target.value })} className="input text-xs w-full mt-1"><option value="identity_verified">Identity verified on site</option><option value="financial_hardship">Financial hardship verified</option><option value="emergency">Emergency relief</option><option value="unverified">Requires verification</option></select></div><div><label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Referral destination <span className="normal-case text-[#2563EB]/55">(if needed)</span></label><input value={form.referral_destination} onChange={(e) => setForm({ ...form, referral_destination: e.target.value })} placeholder="e.g. Student Services / Financial Aid" className="input text-xs w-full mt-1"/></div></div>

                    <div><label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Internal staff remarks</label><textarea rows="2" value={form.staff_internal_notes} onChange={(e) => setForm({ ...form, staff_internal_notes: e.target.value })} placeholder="Record checks completed, context, or follow-up instructions..." className="input text-xs w-full mt-1"/></div>

                    <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#2563EB] text-[10px] font-extrabold text-white">3</span><div><h2 className="text-sm font-extrabold">Match available aid</h2><p className="text-[10px] font-semibold text-[#2563EB]/65">Only stock that fits this category and quantity is shown.</p></div></div>

                    <div className="p-4 rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 space-y-3">
                        <span className="text-xs font-extrabold uppercase text-[#2563EB]">Optional Instant On-the-Spot Allocation</span>
                        <p className="text-xs text-[#2563EB]/80 font-semibold">
                            Select an available warehouse item to hand off immediately during this walk-in session.
                        </p>
                        <select
                            value={form.instant_donation_id}
                            onChange={(e) => setForm({ ...form, instant_donation_id: e.target.value })}
                            className="input text-xs w-full"
                        >
                            <option value="">-- No Instant Allocation (Add to Priority Queue) --</option>
                            {availableDonations.map((d) => (
                                <option key={d.id} value={d.id}>
                                    [{d.category}] {d.item_name} — Qty: {d.quantity} ({d.storage_location || 'Warehouse Bin'})
                                </option>
                            ))}
                        </select>
                        {!loading && !availableDonations.length && <p className="rounded-lg border border-[#2563EB]/15 bg-white p-2 text-[10px] font-semibold text-[#2563EB]/70">No matching inventory is available for this category and quantity. The request will be added to the priority queue unless it is referred.</p>}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" loading={actionLoading}>
                            <Icon name="check" />
                            <span className="ml-1 text-xs">Log & Process Walk-In Request</span>
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}

function StaffHandoffDispatch() {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [hubFilter, setHubFilter] = useState('all');

    // Modal
    const [verifyingMatch, setVerifyingMatch] = useState(null);
    const [pinInput, setPinInput] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [handoffChecks, setHandoffChecks] = useState({ identity: false, item: false, quantity: false });
    const [handoffNotes, setHandoffNotes] = useState('');

    const loadData = () => {
        setLoading(true);
        api.get('/admin/matches')
            .then((r) => setMatches(r.data.data || []))
            .catch(() => setError('Failed to load dispatch matches.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const openPinModal = (m) => {
        setVerifyingMatch(m);
        setPinInput('');
        setHandoffChecks({ identity: false, item: false, quantity: false });
        setHandoffNotes('');
        setError('');
        setSuccessMessage('');
    };

    const handleVerifyPin = async (e) => {
        e.preventDefault();
        if (!verifyingMatch) return;
        setActionLoading(true);
        setError('');

        try {
            await api.post(`/admin/matches/${verifyingMatch.id}/verify-handoff`, {
                pin: pinInput,
                pickup_notes: handoffNotes,
            });
            setSuccessMessage(`Handoff Match #${verifyingMatch.id} successfully verified and cleared!`);
            setVerifyingMatch(null);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid PIN entered. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    let activeMatches = matches.filter((m) => m.status === 'proposed' || m.status === 'confirmed');

    let filtered = activeMatches.filter((m) => {
        if (statusFilter !== 'all' && m.status !== statusFilter) return false;
        if (hubFilter !== 'all' && (m.pickup_hub || 'Main Relief Desk Hub') !== hubFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const item = (m.donation?.item_name || '').toLowerCase();
        const recipient = (m.request?.beneficiary?.name || '').toLowerCase();
        const donor = (m.donation?.donor?.name || '').toLowerCase();
        const pin = (m.verification_pin || '').toLowerCase();
        return item.includes(q) || recipient.includes(q) || donor.includes(q) || pin.includes(q);
    });
    const hubs = [...new Set(matches.map((match) => match.pickup_hub || 'Main Relief Desk Hub'))];
    const dispatchSummary = { pending: activeMatches.filter((match) => match.status === 'proposed').length, ready: activeMatches.filter((match) => match.status === 'confirmed').length, inProgress: verifyingMatch ? 1 : 0, completed: matches.filter((match) => match.status === 'fulfilled').length, expired: matches.filter((match) => match.pin_expires_at && new Date(match.pin_expires_at) < new Date() && match.status !== 'fulfilled').length };

    return (
        <main className="shell staff-workspace py-8 space-y-6 text-[#2563EB]">
            <div className="panel no-hover p-6 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                    <div>
                        <span className="eyebrow">MODULE 4: DISPATCH & 2FA CLEARANCE</span>
                        <h1 className="text-2xl font-extrabold text-[#2563EB]">Handoff & Physical Dispatch Desk</h1>
                        <p className="text-xs font-semibold text-[#2563EB]/80 mt-1">
                            Verify physical item handoffs at campus pickup depots using student 6-digit PIN codes.
                        </p>
                    </div>
                    <Button variant="secondary" onClick={loadData} loading={loading}>
                        <Icon name="refresh" />
                    </Button>
                </div>

                <section aria-label="Dispatch summary" className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[['Pending',dispatchSummary.pending,'Awaiting pickup','clock','blue'],['Ready',dispatchSummary.ready,'Ready for release','check','green'],['In progress',dispatchSummary.inProgress,'PIN verification open','activity','blue'],['Completed',dispatchSummary.completed,'Fulfilled handoffs','check','green'],['Expired',dispatchSummary.expired,'Require reschedule','alert','green']].map(([label,value,detail,icon,tone])=><article key={label} className="rounded-xl border border-[#2563EB]/20 bg-white p-3"><div className="flex justify-between"><span className="text-[10px] font-extrabold uppercase tracking-wide text-[#2563EB]/65">{label}</span><Icon name={icon} size={15} className={tone==='green'?'text-[#22C55E]':''}/></div><p className={`mt-2 text-2xl font-black ${tone==='green'?'text-[#22C55E]':'text-[#2563EB]'}`}>{loading?'—':value}</p><p className="mt-0.5 text-[10px] font-semibold text-[#2563EB]/60">{detail}</p></article>)}</section>
                <section className="rounded-xl border border-[#2563EB]/15 bg-[#2563EB]/5 p-3"><div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-7">{['Locate handoff','Review recipient & item','Verify identity','Enter PIN','Confirm quantity','Complete release','Record audit'].map((step,index)=><div key={step} className="flex items-center gap-2 rounded-lg bg-white px-2 py-2 text-[10px] font-extrabold"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#2563EB] text-white">{index+1}</span>{step}</div>)}</div></section>

                {successMessage && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                        ✓ {successMessage}
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                    <input
                        type="text"
                        placeholder="Search by student recipient, item name, or 6-digit PIN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input text-xs w-full"
                    />
                    <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="input text-xs w-full"><option value="all">All active statuses</option><option value="proposed">Pending</option><option value="confirmed">Ready for pickup</option></select>
                    <select value={hubFilter} onChange={(e)=>setHubFilter(e.target.value)} className="input text-xs w-full"><option value="all">All pickup locations</option>{hubs.map((hub)=><option key={hub} value={hub}>{hub}</option>)}</select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-[#2563EB]/20 bg-[#2563EB]/5 text-[#2563EB] font-extrabold uppercase">
                                <th className="p-3">Match ID & Item</th>
                                <th className="p-3">Donor</th>
                                <th className="p-3">Student Beneficiary</th>
                                <th className="p-3">Pickup Location</th>
                                <th className="p-3">Release readiness</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2563EB]/10 font-semibold">
                            {loading ? <tr><td colSpan="7" className="p-8"><div className="h-4 animate-pulse rounded bg-[#2563EB]/10"/></td></tr> : !filtered.length ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-[#2563EB]/70">
                                        No active handoffs scheduled currently.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m) => (
                                    <tr key={m.id} className="hover:bg-[#2563EB]/5 transition">
                                        <td className="p-3 font-extrabold text-[#2563EB]">
                                            Match #{m.id} — {m.donation?.item_name || 'Item'}
                                        </td>
                                        <td className="p-3 text-[#2563EB]/80">{m.donation?.donor?.name || 'Donor'}</td>
                                        <td className="p-3">
                                            <div className="font-extrabold text-[#2563EB]">{m.request?.beneficiary?.name || 'Recipient'}</div>
                                            <div className="text-[10px] text-[#2563EB]/70">{m.request?.beneficiary?.email}</div>
                                        </td>
                                        <td className="p-3 text-[11px] font-bold">
                                            {m.pickup_hub || m.donation?.storage_location || 'Campus Center Desk'}
                                        </td>
                                        <td className="p-3"><span className={`rounded-full border px-2 py-1 text-[10px] font-extrabold ${m.pin_locked_at || (m.pin_expires_at && new Date(m.pin_expires_at)<new Date()) ? 'border-[#22C55E] text-[#22C55E]' : 'border-[#2563EB]/20 text-[#2563EB]'}`}>{m.pin_locked_at ? 'PIN locked' : m.pin_expires_at && new Date(m.pin_expires_at)<new Date() ? 'PIN expired' : 'PIN awaiting entry'}</span><p className="mt-1 text-[10px] font-semibold text-[#2563EB]/60">{m.matched_quantity} unit{m.matched_quantity===1?'':'s'} · ID check required</p></td>
                                        <td className="p-3">
                                            <Badge status={m.status} />
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button size="sm" onClick={() => openPinModal(m)}>
                                                Verify 6-Digit PIN & Handoff
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PIN Verification Modal */}
            {verifyingMatch && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <form onSubmit={handleVerifyPin} className="panel no-hover w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h3 className="text-lg font-extrabold text-[#2563EB]">PIN Handoff Clearance</h3>
                            <button type="button" className="nav-link p-1" onClick={() => setVerifyingMatch(null)}>
                                <Icon name="close" />
                            </button>
                        </div>

                        {error && <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs font-bold">{error}</div>}

                        <div className="space-y-2 text-xs">
                            <p className="font-extrabold text-sm text-[#2563EB]">
                                Handing Off: {verifyingMatch.donation?.item_name} ({verifyingMatch.matched_quantity} unit)
                            </p>
                            <p className="text-[#2563EB]/80 font-semibold">
                                Recipient: <strong>{verifyingMatch.request?.beneficiary?.name}</strong>
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-3"><p className="text-xs font-extrabold">Release checklist</p><div className="mt-2 space-y-2">{[['identity','Student ID and recipient identity match'],['item','Correct item is physically present'],['quantity',`Correct quantity (${verifyingMatch.matched_quantity}) is ready`]].map(([key,label])=><label key={key} className="flex items-center gap-2 text-[11px] font-bold"><input type="checkbox" checked={handoffChecks[key]} onChange={(e)=>setHandoffChecks({...handoffChecks,[key]:e.target.checked})} className="accent-[#22C55E]"/>{label}</label>)}</div></div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase text-[#2563EB]">Enter Recipient's 6-Digit PIN Code *</label>
                            <input
                                type="text"
                                maxLength="6"
                                required
                                autoFocus
                                placeholder="e.g. 849201"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                className="input text-center text-2xl font-mono tracking-widest font-black w-full"
                            />
                            <p className="text-[10px] text-[#2563EB]/70 text-center mt-1">The PIN is never displayed to staff and is rate-limited after invalid attempts.</p>
                        </div>

                        <div><label className="text-[10px] font-extrabold uppercase text-[#2563EB]/70">Handoff remarks</label><textarea rows="2" value={handoffNotes} onChange={(e)=>setHandoffNotes(e.target.value)} placeholder="Record condition, recipient confirmation, or exception notes..." className="input text-xs w-full mt-1"/></div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#2563EB]/20">
                            <Button variant="secondary" type="button" onClick={() => setVerifyingMatch(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={actionLoading} disabled={!Object.values(handoffChecks).every(Boolean) || pinInput.length !== 6}>
                                Complete & Clear Handoff
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}

function DonorDashboard(){
    const {user} = useAuth();
    const [donations, setDonations] = useState([]);
    const [matches, setMatches] = useState([]);
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [inspectingItem, setInspectingItem] = useState(null);

    const loadData = () => {
        setLoading(true);
        setError('');
        Promise.all([
            api.get('/donations?mine=1').then(r => setDonations(r.data.data || [])),
            api.get('/matches?mine=1').then(r => setMatches(r.data.data || [])),
            api.get('/requests').then(r => setNeeds((r.data.data || []).slice(0, 3)))
        ]).catch(() => setError('Your donation dashboard could not be refreshed. Please try again.')).finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const activeMatches = matches.filter(m => m.status === 'proposed' || m.status === 'confirmed');
    const confirmedCount = matches.filter(m => m.status === 'confirmed').length;
    const completedCount = matches.filter(m => m.status === 'fulfilled' || m.status === 'completed').length;
    const pendingMatchCount = donations.filter(d => d.status === 'pending_match').length;
    const matchedCount = donations.filter(d => d.status === 'matched').length;

    const fulfillmentRate = donations.length > 0 ? Math.round((completedCount / donations.length) * 100) : 0;
    const chartDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        return date;
    });
    const donationTrend = chartDays.map((date) => ({
        day: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
        donations: donations.filter((donation) => donation.created_at && new Date(donation.created_at).toDateString() === date.toDateString()).length,
    }));
    const statusDistribution = [
        { name: 'Available', value: pendingMatchCount, color: '#2563EB', opacity: 0.45 },
        { name: 'Matched', value: matchedCount, color: '#2563EB', opacity: 1 },
        { name: 'Handoff', value: activeMatches.length, color: '#22C55E', opacity: 0.6 },
        { name: 'Completed', value: completedCount, color: '#22C55E', opacity: 1 },
    ];
    const fulfillmentPerformance = [
        { name: 'Listed', value: donations.length, color: '#2563EB' },
        { name: 'Matched', value: matchedCount, color: '#2563EB' },
        { name: 'Handoff', value: activeMatches.length, color: '#22C55E' },
        { name: 'Delivered', value: completedCount, color: '#22C55E' },
    ];
    const chartTooltip = { contentStyle: { backgroundColor: '#FFFFFF', border: '1px solid #2563EB', borderRadius: '12px', color: '#2563EB', fontSize: '12px', fontWeight: 700 }, labelStyle: { color: '#2563EB', fontWeight: 800 }, itemStyle: { color: '#2563EB' } };

    let filteredDonations = donations.filter(d => {
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'pending' && d.status === 'pending_match') ||
            (statusFilter === 'active' && d.status === 'matched') ||
            (statusFilter === 'completed' && (d.status === 'completed' || d.status === 'fulfilled'));
        const q = search.toLowerCase();
        const matchesSearch = !search || 
            (d.item_name && d.item_name.toLowerCase().includes(q)) ||
            (d.category && d.category.toLowerCase().includes(q)) ||
            (d.pickup_location && d.pickup_location.toLowerCase().includes(q));
        return matchesStatus && matchesSearch;
    });

    return (
        <main className="page space-y-8">
            {/* Header Banner */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">DONOR WORKSPACE</p>
                    <h1 className="page-title">Welcome back, {user?.name}</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Thank you for sharing resources to support students and campus community members.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E] bg-white px-3 py-1 text-xs font-extrabold text-[#22C55E]">
                        <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                        Verified Donor
                    </span>
                    <Button variant="secondary" onClick={loadData} loading={loading}>
                        <Icon name="activity"/>
                        <span className="ml-1 text-xs">Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Quick Action Navigation Bar */}
            <section className="panel p-4 sm:p-5 bg-white space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]/70">Quick Actions</p>
                <div className="flex flex-wrap items-center gap-3">
                    <Link to="/donate" className="rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs font-extrabold text-white no-underline hover:bg-white hover:text-[#2563EB] transition flex items-center gap-1.5">
                        <Icon name="donation"/>
                        <span>+ Make a New Donation</span>
                    </Link>
                    <Link to="/donor/needs" className="rounded-xl border border-[#2563EB] bg-white px-4 py-2.5 text-xs font-extrabold text-[#2563EB] no-underline hover:bg-[#2563EB] hover:text-white transition flex items-center gap-1.5">
                        <Icon name="request"/>
                        <span>Browse Community Needs</span>
                    </Link>
                    <Link to="/donor/fulfillment" className="rounded-xl border border-[#2563EB] bg-white px-4 py-2.5 text-xs font-extrabold text-[#2563EB] no-underline hover:bg-[#2563EB] hover:text-white transition flex items-center gap-1.5">
                        <Icon name="approvals"/>
                        <span>Delivery & Handoffs ({activeMatches.length})</span>
                    </Link>
                    <Link to="/donor/history" className="rounded-xl border border-[#2563EB] bg-white px-4 py-2.5 text-xs font-extrabold text-[#2563EB] no-underline hover:bg-[#2563EB] hover:text-white transition flex items-center gap-1.5">
                        <Icon name="activity"/>
                        <span>Donation History</span>
                    </Link>
                </div>
            </section>

            {/* Summary Statistics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel p-5 flex flex-col justify-between bg-white transition hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Total Listed</span>
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                            <Icon name="donation"/>
                        </span>
                    </div>
                    <div className="mt-3">
                        <strong className="text-3xl font-extrabold text-[#2563EB]">{donations.length}</strong>
                        <p className="mt-1 text-xs font-semibold text-[#2563EB]/70">Resources contributed</p>
                    </div>
                </article>

                <article className="panel p-5 flex flex-col justify-between bg-white transition hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Active Matches</span>
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                            <Icon name="match"/>
                        </span>
                    </div>
                    <div className="mt-3">
                        <strong className="text-3xl font-extrabold text-[#2563EB]">{activeMatches.length}</strong>
                        <p className="mt-1 text-xs font-semibold text-[#2563EB]/70">Pairings in progress</p>
                    </div>
                </article>

                <article className="panel p-5 flex flex-col justify-between bg-white transition hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Confirmed Handoffs</span>
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                            <Icon name="approvals"/>
                        </span>
                    </div>
                    <div className="mt-3">
                        <strong className="text-3xl font-extrabold text-[#22C55E]">{confirmedCount}</strong>
                        <p className="mt-1 text-xs font-semibold text-[#2563EB]/70">Scheduled pickups</p>
                    </div>
                </article>

                <article className="panel p-5 flex flex-col justify-between bg-white transition hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Completed</span>
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                            <Icon name="check"/>
                        </span>
                    </div>
                    <div className="mt-3">
                        <strong className="text-3xl font-extrabold text-[#22C55E]">{completedCount}</strong>
                        <p className="mt-1 text-xs font-semibold text-[#2563EB]/70">Successfully delivered</p>
                    </div>
                </article>
            </div>

            {error && <Error>{error}</Error>}

            <section className="space-y-4" aria-label="Donation analytics">
                <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="eyebrow">DONATION ANALYTICS</p><h2 className="mt-1 text-xl font-extrabold text-[#2563EB]">Your donation impact at a glance</h2></div><p className="text-xs font-semibold text-[#2563EB]/65">Live data from your donations and fulfillment activity</p></div>
                <div className="grid gap-4 xl:grid-cols-3">
                    <AnalyticsChart title="Donation activity trend" description="Resources you listed during the last seven days." ariaLabel="Line chart showing donation activity over the last seven days" hasData={donationTrend.some((point) => point.donations)}><ResponsiveContainer width="100%" height="100%"><LineChart data={donationTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="day" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Line type="monotone" dataKey="donations" name="Donations" stroke="#2563EB" strokeWidth={3} dot={{ r: 3, fill: '#2563EB' }}/></LineChart></ResponsiveContainer></AnalyticsChart>
                    <AnalyticsChart title="Donation status distribution" description="Where your listed resources are in the fulfillment workflow." ariaLabel="Donut chart showing donation status distribution" hasData={statusDistribution.some((point) => point.value)}><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip {...chartTooltip}/><Legend wrapperStyle={{ color: '#2563EB', fontSize: '11px', fontWeight: 700 }}/><Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius="48%" outerRadius="76%" paddingAngle={3}>{statusDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} fillOpacity={entry.opacity}/>)}</Pie></PieChart></ResponsiveContainer></AnalyticsChart>
                    <AnalyticsChart title="Fulfillment performance" description="Listed resources progressing through matching and delivery." ariaLabel="Bar chart showing donation fulfillment performance" hasData={fulfillmentPerformance.some((point) => point.value)}><ResponsiveContainer width="100%" height="100%"><BarChart data={fulfillmentPerformance} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="name" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Bar dataKey="value" name="Resources" radius={[8, 8, 0, 0]}>{fulfillmentPerformance.map((entry) => <Cell key={entry.name} fill={entry.color}/>)}</Bar></BarChart></ResponsiveContainer></AnalyticsChart>
                </div>
            </section>

            {/* Impact & Progress Tracker */}
            <section className="panel p-5 sm:p-6 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/15 pb-4">
                    <div>
                        <h2 className="text-base font-extrabold text-[#2563EB]">Donation Impact & Fulfillment Rate</h2>
                        <p className="text-xs text-[#2563EB]/70 font-semibold mt-0.5">Tracking how your donations progress from listing to delivery</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-[#22C55E]">{fulfillmentRate}%</span>
                        <span className="text-xs font-bold text-[#2563EB]/70">Fulfillment Success</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="h-3 w-full overflow-hidden rounded-full border border-[#22C55E] bg-white p-0.5">
                        <div 
                            className="h-full rounded-full bg-[#22C55E] transition-all duration-500" 
                            style={{ width: `${Math.min(100, Math.max(0, fulfillmentRate))}%` }}
                        />
                    </div>
                    <p className="text-xs font-semibold text-[#2563EB]/70">Listed <span className="mx-1">→</span> Available for matching <span className="mx-1">→</span> Matched <span className="mx-1">→</span> Handoff <span className="mx-1">→</span> Completed</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 pt-2">
                        <div className="rounded-xl border border-[#2563EB]/20 p-3 bg-white">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/70">Listed Resources</span>
                            <strong className="block text-lg font-extrabold text-[#2563EB] mt-0.5">{donations.length} items</strong>
                        </div>
                        <div className="rounded-xl border border-[#2563EB]/20 p-3 bg-[#2563EB]/5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/70">Available for Matching</span>
                            <strong className="block text-lg font-extrabold text-[#2563EB] mt-0.5">{pendingMatchCount} items</strong>
                        </div>
                        <div className="rounded-xl border border-[#2563EB]/20 p-3 bg-white">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/70">Matched Resources</span>
                            <strong className="block text-lg font-extrabold text-[#2563EB] mt-0.5">{matchedCount} items</strong>
                        </div>
                        <div className="rounded-xl border border-[#2563EB]/20 p-3 bg-[#2563EB]/5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/70">In Active Handoff</span>
                            <strong className="block text-lg font-extrabold text-[#2563EB] mt-0.5">{activeMatches.length} items</strong>
                        </div>
                        <div className="rounded-xl border border-[#22C55E]/30 p-3 bg-[#22C55E]/5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#22C55E]">Completed Deliveries</span>
                            <strong className="block text-lg font-extrabold text-[#22C55E] mt-0.5">{completedCount} items</strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* Active Handoff Deliveries Alert Panel */}
            <section className="panel p-5 sm:p-6 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/15 pb-4">
                    <div>
                        <h2 className="text-base font-extrabold text-[#2563EB]">Active Handoffs & Action Required</h2>
                        <p className="text-xs text-[#2563EB]/70 font-semibold mt-0.5">Matched donations needing scheduled pickup or completion confirmation</p>
                    </div>
                    <Link to="/donor/fulfillment" className="text-xs font-extrabold text-[#2563EB] hover:underline">
                        View All Deliveries &rarr;
                    </Link>
                </div>

                {!activeMatches.length ? (
                    <div className="p-6 text-center bg-white border border-[#22C55E]/30 rounded-xl space-y-2">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#22C55E] text-white mx-auto">
                            <Icon name="check"/>
                        </span>
                        <p className="text-sm font-bold text-[#2563EB]">No pending handoffs requiring immediate action.</p>
                        <p className="text-xs text-[#2563EB]/70 font-semibold max-w-md mx-auto">
                            When an administrator pairs your donation with a recipient, pickup details will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeMatches.map(m => (
                            <div key={m.id} className="rounded-xl border border-[#2563EB]/30 p-4 flex flex-wrap items-center justify-between gap-4 bg-[#2563EB]/5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge status={m.status}/>
                                        <span className="text-xs font-bold text-[#2563EB]">{m.matched_quantity} units matched</span>
                                    </div>
                                    <h3 className="text-base font-extrabold text-[#2563EB]">
                                        {m.donation?.item_name || title(m.request?.category || m.donation?.category)}
                                    </h3>
                                    {m.handoff_scheduled_at && (
                                        <p className="text-xs font-semibold text-[#2563EB]/80">
                                            📅 Scheduled: {new Date(m.handoff_scheduled_at).toLocaleString()}
                                        </p>
                                    )}
                                    {m.handoff_notes && (
                                        <p className="text-xs italic text-[#2563EB]/70">📍 Location/Notes: {m.handoff_notes}</p>
                                    )}
                                </div>
                                <div>
                                    <Link to="/donor/fulfillment" className="inline-block rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2 text-xs font-extrabold text-white no-underline hover:bg-white hover:text-[#2563EB] transition">
                                        Manage Handoff
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Listed Resources Section with Filters */}
            <section className="panel p-5 sm:p-6 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/15 pb-4">
                    <div>
                        <h2 className="text-base font-extrabold text-[#2563EB]">Your Listed Resources</h2>
                        <p className="text-xs text-[#2563EB]/70 font-semibold mt-0.5">Manage and monitor all donations you have contributed</p>
                    </div>
                    <Link to="/donate" className="text-xs font-extrabold text-[#2563EB] hover:underline">
                        + Add New Donation
                    </Link>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            {key:'all',label:`All (${donations.length})`},
                            {key:'pending',label:`Available (${pendingMatchCount})`},
                            {key:'active',label:`Matched (${matchedCount})`},
                            {key:'completed',label:`Completed (${completedCount})`}
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                                    statusFilter === tab.key
                                        ? 'bg-[#2563EB] text-white border border-[#2563EB]'
                                        : 'bg-white text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#2563EB]/10'
                                }`}
                                onClick={() => setStatusFilter(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search listed items..."
                            className="field w-full text-xs"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <p className="py-6 font-bold text-[#2563EB] text-center">Loading listed resources...</p>
                ) : !filteredDonations.length ? (
                    <div className="py-8 text-center bg-white space-y-2">
                        <p className="font-bold text-[#2563EB]">No donations found matching your filter.</p>
                        <p className="text-xs text-[#2563EB]/70 font-semibold">
                            {statusFilter !== 'all' ? 'Try changing your filter tab above.' : 'Click "Make a New Donation" to list your first item!'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#2563EB]/20 text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">
                                    <th className="py-3 px-3">Item Name</th>
                                    <th className="py-3 px-3">Category</th>
                                    <th className="py-3 px-3">Quantity</th>
                                    <th className="py-3 px-3">Pickup Location</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2563EB]/10 text-xs">
                                {filteredDonations.map(d => (
                                    <tr key={d.id} className="hover:bg-[#2563EB]/5 transition">
                                        <td className="py-3 px-3 font-extrabold text-[#2563EB]">
                                            {d.item_name}
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-[#2563EB]/80">
                                            {title(d.category)}
                                        </td>
                                        <td className="py-3 px-3 font-bold text-[#2563EB]">
                                            {d.quantity} {d.unit || 'units'}
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-[#2563EB]/70">
                                            {d.pickup_location || 'Campus Center'}
                                        </td>
                                        <td className="py-3 px-3">
                                            <Badge status={d.status}/>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <Button variant="secondary" onClick={() => setInspectingItem(d)}>
                                                <span className="text-xs">View</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Community Needs Preview Section */}
            <section className="panel p-5 sm:p-6 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/15 pb-4">
                    <div>
                        <h2 className="text-base font-extrabold text-[#2563EB]">Community Support Needs</h2>
                        <p className="text-xs text-[#2563EB]/70 font-semibold mt-0.5">Students and campus members currently requesting aid</p>
                    </div>
                    <Link to="/donor/needs" className="text-xs font-extrabold text-[#2563EB] hover:underline">
                        View All Campus Needs ({needs.length}) &rarr;
                    </Link>
                </div>

                {!needs.length ? (
                    <p className="py-4 text-xs font-semibold text-[#2563EB]/70">No open campus needs listed at this time.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-3">
                        {needs.map(req => (
                            <article key={req.id} className="rounded-xl border border-[#2563EB]/30 p-4 flex flex-col justify-between bg-white hover:border-[#2563EB] transition">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <Badge status={req.urgency}/>
                                        <span className="text-xs font-bold text-[#2563EB]">{req.quantity_needed} units needed</span>
                                    </div>
                                    <h3 className="mt-3 text-sm font-extrabold text-[#2563EB]">{title(req.category)}</h3>
                                    <p className="mt-1.5 text-xs text-[#2563EB]/80 font-medium line-clamp-2">
                                        {req.justification || 'Support needed for campus essentials.'}
                                    </p>
                                </div>
                                <div className="mt-4 border-t border-[#2563EB]/15 pt-3">
                                    <Link to="/donate" className="block w-full text-center rounded-xl border border-[#2563EB] bg-[#2563EB] px-3 py-2 text-xs font-extrabold text-white no-underline hover:bg-white hover:text-[#2563EB] transition">
                                        + Donate for this Need
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Donation Details Inspection Modal */}
            {inspectingItem && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-lg p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Donation Details</h2>
                            <button className="nav-link p-1" onClick={() => setInspectingItem(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Status</span>
                                <Badge status={inspectingItem.status}/>
                            </div>

                            <div className="bg-[#2563EB]/5 p-4 rounded-xl border border-[#2563EB]/15 space-y-2">
                                <h3 className="text-lg font-extrabold text-[#2563EB]">{inspectingItem.item_name}</h3>
                                <p className="text-xs font-bold text-[#2563EB]/80">
                                    Category: <span className="font-semibold text-[#2563EB]">{title(inspectingItem.category)}</span>
                                </p>
                                <p className="text-xs font-bold text-[#2563EB]/80">
                                    Quantity: <span className="font-semibold text-[#2563EB]">{inspectingItem.quantity} {inspectingItem.unit || 'units'}</span>
                                </p>
                                <p className="text-xs font-bold text-[#2563EB]/80">
                                    Pickup Location: <span className="font-semibold text-[#2563EB]">{inspectingItem.pickup_location || 'Campus Center'}</span>
                                </p>
                                {inspectingItem.condition_notes && (
                                    <p className="text-xs font-bold text-[#2563EB]/80">
                                        Condition / Notes: <span className="font-semibold text-[#2563EB]">{inspectingItem.condition_notes}</span>
                                    </p>
                                )}
                                {inspectingItem.created_at && (
                                    <p className="text-xs font-bold text-[#2563EB]/60 pt-1 border-t border-[#2563EB]/10">
                                        Listed on: {new Date(inspectingItem.created_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" onClick={() => setInspectingItem(null)}>
                                Close Inspection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function BeneficiaryDashboard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Selected item detail modal
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

    const loadDashboardData = () => {
        setLoading(true);
        setError('');
        Promise.all([
            api.get('/requests?mine=1').then((r) => setRequests(r.data.data || r.data || [])),
            api.get('/matches?mine=1').then((r) => setMatches(r.data.data || r.data || [])),
        ])
            .catch((err) => {
                setError(err.response?.data?.message || 'Could not load your dashboard data.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Summary Metrics
    const totalRequestsCount = requests.length;
    const pendingCount = requests.filter((r) => ['pending_review', 'pending'].includes(r.status)).length;
    const approvedCount = requests.filter((r) => r.status === 'approved').length;
    const matchedCount = matches.length;
    const receivedCount = matches.filter((m) => ['fulfilled', 'completed'].includes(m.status)).length;
    const activeMatchedRequestIds = new Set(matches.filter((match) => ['proposed', 'confirmed', 'matched'].includes(match.status)).map((match) => String(match.request_id || match.request?.id)).filter(Boolean));

    // Request Status Pipeline Breakdown
    const statusCounts = {
        pending_review: requests.filter((r) => ['pending_review', 'pending'].includes(r.status)).length,
        approved: requests.filter((r) => r.status === 'approved' && !activeMatchedRequestIds.has(String(r.id))).length,
        matched: activeMatchedRequestIds.size,
        fulfilled: receivedCount,
        rejected: requests.filter((r) => ['rejected', 'cancelled'].includes(r.status)).length,
    };

    // Upcoming Scheduled Handoffs (Matches with schedule or in active status)
    const upcomingHandoffs = matches.filter((m) => m.status === 'proposed' || m.status === 'confirmed');

    // Recent Support Updates Feed
    const recentMatches = [...matches]
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
        .slice(0, 4);

    const formatDate = (isoStr) => {
        if (!isoStr) return 'N/A';
        return new Date(isoStr).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (isoStr) => {
        if (!isoStr) return 'Not scheduled yet';
        return new Date(isoStr).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const chartDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        return date;
    });
    const sameDay = (value, date) => value && new Date(value).toDateString() === date.toDateString();
    const requestTrend = chartDays.map((date) => ({
        day: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
        requests: requests.filter((request) => sameDay(request.created_at, date)).length,
    }));
    const statusDistribution = [
        { name: 'Pending', value: statusCounts.pending_review, color: '#2563EB', opacity: 0.45 },
        { name: 'Approved', value: statusCounts.approved, color: '#22C55E', opacity: 0.6 },
        { name: 'Matched', value: statusCounts.matched, color: '#2563EB', opacity: 1 },
        { name: 'Fulfilled', value: statusCounts.fulfilled, color: '#22C55E', opacity: 1 },
        { name: 'Closed', value: statusCounts.rejected, color: '#2563EB', opacity: 0.2 },
    ];
    const receivedByCategory = Object.entries(matches.filter((match) => ['fulfilled', 'completed'].includes(match.status)).reduce((categories, match) => {
        const category = title(match.donation?.category || match.request?.category || 'Support');
        categories[category] = (categories[category] || 0) + Number(match.matched_quantity || match.quantity || 1);
        return categories;
    }, {})).map(([name, value]) => ({ name, value })).slice(0, 5);
    const completionRate = totalRequestsCount ? Math.round((receivedCount / totalRequestsCount) * 100) : 0;
    const mostRequestedCategory = Object.entries(requests.reduce((categories, request) => {
        const category = title(request.category || 'Support');
        categories[category] = (categories[category] || 0) + 1;
        return categories;
    }, {})).sort((a, b) => b[1] - a[1])[0];
    const chartTooltip = { contentStyle: { backgroundColor: '#FFFFFF', border: '1px solid #2563EB', borderRadius: '12px', color: '#2563EB', fontSize: '12px', fontWeight: 700 }, labelStyle: { color: '#2563EB', fontWeight: 800 }, itemStyle: { color: '#2563EB' } };

    return (
        <main className="page max-w-7xl">
            <p className="eyebrow">BENEFICIARY WORKSPACE</p>
            <h1 className="page-title">Hello, {user?.name || 'Beneficiary'}</h1>
            <p className="page-copy">
                Track your support requests, view match updates, and arrange handoffs.
            </p>

            {error && <Error>{error}</Error>}

            {/* Quick Actions Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/request-help" className="no-underline">
                    <Button variant="primary" className="py-2.5 px-4 text-xs font-extrabold">
                        <Icon name="plus" className="mr-1.5" size={14} /> + Create New Request
                    </Button>
                </Link>
                <Link to="/requests" className="no-underline">
                    <Button variant="secondary" className="py-2.5 px-4 text-xs font-extrabold">
                        <Icon name="requests" className="mr-1.5" size={14} /> View My Requests ({totalRequestsCount})
                    </Button>
                </Link>
                <Link to="/matches" className="no-underline">
                    <Button variant="secondary" className="py-2.5 px-4 text-xs font-extrabold">
                        <Icon name="link" className="mr-1.5" size={14} /> View My Matches ({matchedCount})
                    </Button>
                </Link>
                <Link to="/beneficiary/fulfillment" className="no-underline">
                    <Button variant="secondary" className="py-2.5 px-4 text-xs font-extrabold">
                        <Icon name="fulfillment" className="mr-1.5" size={14} /> Support / Fulfillment
                    </Button>
                </Link>
            </div>

            {/* Summary KPI Cards Grid (5 Cards) */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Total Requests */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between transition hover:shadow-lg">
                    <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] opacity-75">
                            Total Requests
                        </p>
                        <h3 className="mt-1 text-3xl font-black text-[#2563EB]">{totalRequestsCount}</h3><p className="mt-1 text-[10px] font-semibold text-[#2563EB]/65">All submitted support needs</p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="requests" size={20} />
                    </div>
                </div>

                {/* Pending / Review */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between transition hover:shadow-lg">
                    <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">
                            Pending Review
                        </p>
                        <h3 className="mt-1 text-3xl font-black text-[#2563EB]">{pendingCount}</h3><p className="mt-1 text-[10px] font-semibold text-[#2563EB]/65">Awaiting staff review</p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="clock" size={20} />
                    </div>
                </div>

                {/* Approved */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between transition hover:shadow-lg">
                    <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#22C55E]">
                            Approved Requests
                        </p>
                        <h3 className="mt-1 text-3xl font-black text-[#22C55E]">{approvedCount}</h3><p className="mt-1 text-[10px] font-semibold text-[#2563EB]/65">Eligible for matching</p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="check" size={20} />
                    </div>
                </div>

                {/* Matched Support */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between transition hover:shadow-lg">
                    <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">
                            Matched Support
                        </p>
                        <h3 className="mt-1 text-3xl font-black text-[#2563EB]">{matchedCount}</h3><p className="mt-1 text-[10px] font-semibold text-[#2563EB]/65">Connected to available aid</p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="heart" size={20} />
                    </div>
                </div>

                {/* Received Supplies */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between transition hover:shadow-lg">
                    <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#22C55E]">
                            Received Supplies
                        </p>
                        <h3 className="mt-1 text-3xl font-black text-[#22C55E]">{receivedCount}</h3><p className="mt-1 text-[10px] font-semibold text-[#2563EB]/65">Completed support handoffs</p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="fulfillment" size={20} />
                    </div>
                </div>
            </div>

            <section className="mt-8 space-y-4" aria-label="Request and support analytics">
                <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="eyebrow">REQUEST & SUPPORT ANALYTICS</p><h2 className="mt-1 text-xl font-extrabold text-[#2563EB]">Your support journey at a glance</h2></div><p className="text-xs font-semibold text-[#2563EB]/65">Live data from your requests and support matches</p></div>
                <div className="grid gap-4 xl:grid-cols-2">
                    <AnalyticsChart title="Request activity trend" description="Requests you submitted over the last seven days." ariaLabel="Line chart showing request activity over the last seven days" hasData={requestTrend.some((point) => point.requests)}><ResponsiveContainer width="100%" height="100%"><LineChart data={requestTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="day" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Line type="monotone" dataKey="requests" name="Requests" stroke="#2563EB" strokeWidth={3} dot={{ r: 3, fill: '#2563EB' }}/></LineChart></ResponsiveContainer></AnalyticsChart>
                    <AnalyticsChart title="Request status distribution" description="A clear view of where your requests are in the support process." ariaLabel="Donut chart showing request status distribution" hasData={statusDistribution.some((point) => point.value)}><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip {...chartTooltip}/><Legend wrapperStyle={{ color: '#2563EB', fontSize: '12px', fontWeight: 700 }}/><Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="78%" paddingAngle={3}>{statusDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} fillOpacity={entry.opacity}/>)}</Pie></PieChart></ResponsiveContainer></AnalyticsChart>
                    <AnalyticsChart title="Support & fulfillment progress" description="Follow the steps from request to completed assistance." ariaLabel="Bar chart showing support and fulfillment progress" hasData={totalRequestsCount > 0}><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ stage: 'Review', value: statusCounts.pending_review }, { stage: 'Approved', value: statusCounts.approved }, { stage: 'Matched', value: statusCounts.matched }, { stage: 'Fulfilled', value: statusCounts.fulfilled }]} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="stage" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Bar dataKey="value" name="Requests" fill="#22C55E" radius={[8, 8, 0, 0]}/></BarChart></ResponsiveContainer></AnalyticsChart>
                    <AnalyticsChart title="Received supplies overview" description="Completed support grouped by category." ariaLabel="Bar chart showing received supplies by category" hasData={receivedByCategory.length > 0}><ResponsiveContainer width="100%" height="100%"><BarChart data={receivedByCategory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#2563EB" strokeOpacity={0.12} vertical={false}/><XAxis dataKey="name" tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: '#2563EB', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/><Tooltip {...chartTooltip}/><Bar dataKey="value" name="Units received" fill="#2563EB" radius={[8, 8, 0, 0]}/></BarChart></ResponsiveContainer></AnalyticsChart>
                </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Personal support insights">
                <div className="panel p-5 transition hover:shadow-lg"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/65">Most requested category</p><p className="mt-2 text-lg font-extrabold text-[#2563EB]">{mostRequestedCategory?.[0] || 'No requests yet'}</p><p className="mt-1 text-xs font-semibold text-[#2563EB]/65">{mostRequestedCategory ? `${mostRequestedCategory[1]} request${mostRequestedCategory[1] === 1 ? '' : 's'} submitted` : 'Submit a request to see this insight.'}</p></div>
                <div className="panel p-5 transition hover:shadow-lg"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/65">Request completion rate</p><p className="mt-2 text-3xl font-black text-[#22C55E]">{completionRate}%</p><p className="mt-1 text-xs font-semibold text-[#2563EB]/65">Completed support compared with all requests.</p></div>
                <div className="panel p-5 transition hover:shadow-lg"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/65">Currently matched requests</p><p className="mt-2 text-3xl font-black text-[#2563EB]">{statusCounts.matched}</p><p className="mt-1 text-xs font-semibold text-[#2563EB]/65">Support currently moving toward fulfillment.</p></div>
            </section>

            {/* Request Status Overview Pipeline Breakdown */}
            <div className="panel mt-8 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                    <h2 className="text-base font-extrabold text-[#2563EB] flex items-center gap-2">
                        <Icon name="activity" size={18} /> Request Status Overview
                    </h2>
                    <span className="text-xs font-bold text-[#2563EB] opacity-75">
                        {totalRequestsCount} Total Submitted
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-center text-xs font-bold">
                    {/* Pending */}
                    <div className="rounded-xl border border-[#2563EB]/40 bg-white p-3">
                        <span className="text-[#2563EB] opacity-70 block text-[11px]">Under Review</span>
                        <span className="mt-1 block text-lg font-extrabold text-[#2563EB]">
                            {statusCounts.pending_review}
                        </span>
                    </div>

                    {/* Approved */}
                    <div className="rounded-xl border border-[#22C55E] bg-white p-3">
                        <span className="text-[#22C55E] opacity-80 block text-[11px]">Approved</span>
                        <span className="mt-1 block text-lg font-extrabold text-[#22C55E]">
                            {statusCounts.approved}
                        </span>
                    </div>

                    {/* Matched */}
                    <div className="rounded-xl border border-[#2563EB] bg-[#2563EB] p-3 text-white">
                        <span className="opacity-90 block text-[11px]">Matched</span>
                        <span className="mt-1 block text-lg font-extrabold">{statusCounts.matched}</span>
                    </div>

                    {/* Fulfilled */}
                    <div className="rounded-xl border border-[#22C55E] bg-[#22C55E] p-3 text-white">
                        <span className="opacity-90 block text-[11px]">Fulfilled</span>
                        <span className="mt-1 block text-lg font-extrabold">{statusCounts.fulfilled}</span>
                    </div>

                    {/* Rejected */}
                    <div className="rounded-xl border border-[#2563EB]/30 bg-white p-3">
                        <span className="text-[#2563EB] opacity-70 block text-[11px]">Rejected / Cancelled</span>
                        <span className="mt-1 block text-lg font-extrabold text-[#2563EB]">
                            {statusCounts.rejected}
                        </span>
                    </div>
                </div>
                <div className="mt-5 rounded-xl border border-[#2563EB]/15 bg-[#2563EB]/5 p-4">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/70"><span>Request to fulfillment pathway</span><span>{completionRate}% completed</span></div>
                    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white"><span className="bg-[#2563EB]/45" style={{ width: `${totalRequestsCount ? (statusCounts.pending_review / totalRequestsCount) * 100 : 0}%` }}/><span className="bg-[#22C55E]/60" style={{ width: `${totalRequestsCount ? (statusCounts.approved / totalRequestsCount) * 100 : 0}%` }}/><span className="bg-[#2563EB]" style={{ width: `${totalRequestsCount ? (statusCounts.matched / totalRequestsCount) * 100 : 0}%` }}/><span className="bg-[#22C55E]" style={{ width: `${totalRequestsCount ? (statusCounts.fulfilled / totalRequestsCount) * 100 : 0}%` }}/></div>
                    <p className="mt-3 text-xs font-semibold text-[#2563EB]/70">Under Review <span className="mx-1">→</span> Approved <span className="mx-1">→</span> Matched <span className="mx-1">→</span> Fulfilled</p>
                </div>
            </div>

            {/* Grid 2 Columns: Upcoming Handoffs & Support Updates Feed */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {/* Column 1: Upcoming Handoffs */}
                <div className="panel p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-base font-extrabold text-[#2563EB] flex items-center gap-2">
                                <Icon name="calendar" size={18} /> Upcoming Scheduled Handoffs
                            </h2>
                            <Link to="/beneficiary/fulfillment" className="text-xs font-extrabold text-[#22C55E] no-underline hover:text-[#2563EB]">
                                View All ({upcomingHandoffs.length})
                            </Link>
                        </div>

                        {loading ? (
                            <div className="mt-4 space-y-3 animate-pulse">
                                <div className="h-16 rounded-xl bg-[#2563EB]/10" />
                                <div className="h-16 rounded-xl bg-[#2563EB]/10" />
                            </div>
                        ) : !upcomingHandoffs.length ? (
                            <div className="mt-6 text-center py-6">
                                <Icon name="clock" className="mx-auto mb-2 text-[#2563EB]" size={28} />
                                <p className="text-xs font-bold text-[#2563EB]">No upcoming handoffs currently scheduled.</p>
                                <p className="mt-1 text-[11px] text-[#2563EB] opacity-75 max-w-xs mx-auto">
                                    When a resource donation is matched with your request, handoff meeting details will appear here.
                                </p>
                                <Link to="/requests" className="mt-4 inline-block no-underline"><Button variant="secondary" className="px-3 py-2 text-xs">View my requests</Button></Link>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {upcomingHandoffs.slice(0, 3).map((m) => {
                                    const itemName = m.donation?.item_name || title(m.request?.category || 'Item');
                                    return (
                                        <div
                                            key={m.id}
                                            className="rounded-xl border border-[#2563EB]/30 bg-white p-3.5 flex items-center justify-between text-xs font-bold text-[#2563EB]"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge status={m.status} />
                                                    <span className="font-mono text-[11px]">#{m.id}</span>
                                                </div>
                                                <h4 className="mt-1 text-sm font-extrabold text-[#2563EB]">{itemName}</h4>
                                                <p className="mt-0.5 text-[11px] text-[#22C55E]">
                                                    📅 {formatDateTime(m.handoff_scheduled_at)}
                                                </p>
                                                {m.handoff_notes && (
                                                    <p className="text-[10px] text-[#2563EB] opacity-80 truncate max-w-xs">
                                                        📍 {m.handoff_notes}
                                                    </p>
                                                )}
                                            </div>
                                            <Link to="/beneficiary/fulfillment" className="no-underline">
                                                <Button variant="secondary" className="py-1 px-2.5 text-[11px]">
                                                    Manage
                                                </Button>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Match & Support Updates Feed */}
                <div className="panel p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-base font-extrabold text-[#2563EB] flex items-center gap-2">
                                <Icon name="heart" size={18} /> Match & Support Updates
                            </h2>
                            <Link to="/matches" className="text-xs font-extrabold text-[#22C55E] no-underline hover:text-[#2563EB]">
                                View Matches ({matches.length})
                            </Link>
                        </div>

                        {loading ? (
                            <div className="mt-4 space-y-3 animate-pulse">
                                <div className="h-16 rounded-xl bg-[#2563EB]/10" />
                                <div className="h-16 rounded-xl bg-[#2563EB]/10" />
                            </div>
                        ) : !matches.length ? (
                            <div className="mt-6 text-center py-6">
                                <Icon name="link" className="mx-auto mb-2 text-[#2563EB]" size={28} />
                                <p className="text-xs font-bold text-[#2563EB]">No support matches established yet.</p>
                                <p className="mt-1 text-[11px] text-[#2563EB] opacity-75 max-w-xs mx-auto">
                                    ReliefLink matches student requests with campus donors automatically. Submit requests to receive support.
                                </p>
                                <Link to="/request-help" className="mt-4 inline-block no-underline"><Button variant="primary" className="px-3 py-2 text-xs">Create a request</Button></Link>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {recentMatches.map((m) => {
                                    const itemName = m.donation?.item_name || title(m.request?.category || 'Support Item');
                                    return (
                                        <div
                                            key={m.id}
                                            className="rounded-xl border border-[#2563EB]/30 bg-white p-3.5 flex items-center justify-between text-xs font-bold text-[#2563EB]"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge status={m.status} />
                                                    <span className="text-[11px] text-[#2563EB] opacity-75">
                                                        Matched {formatDate(m.created_at)}
                                                    </span>
                                                </div>
                                                <h4 className="mt-1 text-sm font-extrabold text-[#2563EB]">{itemName}</h4>
                                                <p className="text-[11px] text-[#2563EB] opacity-90 font-normal">
                                                    Donor: {m.donation?.donor?.name || 'Campus Donor'} • {m.matched_quantity} unit(s)
                                                </p>
                                            </div>
                                            <Link to="/matches" className="no-underline">
                                                <Button variant="primary" className="py-1 px-2.5 text-[11px]">
                                                    Details
                                                </Button>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Support Requests Section */}
            <section className="panel mt-8 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                    <h2 className="text-base font-extrabold text-[#2563EB] flex items-center gap-2">
                        <Icon name="requests" size={18} /> Recent Support Requests
                    </h2>
                    <Link to="/requests" className="text-xs font-extrabold text-[#22C55E] no-underline hover:text-[#2563EB]">
                        View All Requests ({totalRequestsCount})
                    </Link>
                </div>

                {loading ? (
                    <div className="mt-4 space-y-3 animate-pulse">
                        <div className="h-10 w-full rounded bg-[#2563EB]/10" />
                        <div className="h-10 w-full rounded bg-[#2563EB]/10" />
                        <div className="h-10 w-full rounded bg-[#2563EB]/10" />
                    </div>
                ) : !requests.length ? (
                    <div className="mt-6 text-center py-8">
                        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#2563EB] text-white">
                            <Icon name="plus" size={24} />
                        </div>
                        <h3 className="text-sm font-extrabold text-[#2563EB]">No support requests submitted yet</h3>
                        <p className="mt-1 text-xs text-[#2563EB] opacity-80 max-w-sm mx-auto">
                            Submit a request for food, books, apparel, or school supplies to get connected with campus aid.
                        </p>
                        <div className="mt-4">
                            <Link to="/request-help" className="no-underline">
                                <Button variant="primary" className="text-xs py-2 px-4">
                                    + Create New Request
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4">
                        {/* Table for Desktop & Tablet */}
                        <div className="hidden sm:block table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Ref ID</th>
                                        <th>Type</th>
                                        <th>Category / Need</th>
                                        <th>Assistance Needed</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Date Created</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.slice(0, 5).map((r) => {
                                        const refId = `#REQ-${String(r.id).padStart(3, '0')}`;
                                        const isFinancial = r.request_type === 'financial';
                                        return (
                                            <tr key={r.id}>
                                                <td className="font-mono text-xs font-bold text-[#2563EB]">{refId}</td>
                                                <td>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isFinancial ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' : 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20'}`}>
                                                        {isFinancial ? 'Financial' : 'Physical'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong className="font-extrabold text-[#2563EB]">
                                                        {title(r.category)}
                                                    </strong>
                                                </td>
                                                <td className="font-bold text-[#2563EB]">
                                                    {isFinancial
                                                        ? `₱${Number(r.amount_requested || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                        : `${r.quantity_needed} ${r.unit || 'unit(s)'}`}
                                                </td>
                                                <td>
                                                    <span className="rounded-full border border-[#2563EB] bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#2563EB] uppercase">
                                                        {r.urgency || 'Normal'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Badge status={r.status} />
                                                </td>
                                                <td className="text-xs font-bold text-[#2563EB]">{formatDate(r.created_at)}</td>
                                                <td className="text-right">
                                                    <Button
                                                        variant="secondary"
                                                        className="py-1 px-2.5 text-xs"
                                                        onClick={() => setSelectedRequestDetails(r)}
                                                    >
                                                        <Icon name="info" className="mr-1" size={13} /> Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards View for Mobile */}
                        <div className="sm:hidden space-y-3">
                            {requests.slice(0, 5).map((r) => {
                                const refId = `#REQ-${String(r.id).padStart(3, '0')}`;
                                const isFinancial = r.request_type === 'financial';
                                return (
                                    <div key={r.id} className="panel p-4 space-y-2 text-xs font-bold text-[#2563EB]">
                                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px]">{refId}</span>
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold ${isFinancial ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#2563EB]/10 text-[#2563EB]'}`}>
                                                    {isFinancial ? 'Financial' : 'Physical'}
                                                </span>
                                            </div>
                                            <Badge status={r.status} />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-sm">{title(r.category)}</h4>
                                            <p className="text-[11px] opacity-80 mt-0.5">
                                                Assistance Needed: {isFinancial ? `₱${Number(r.amount_requested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `${r.quantity_needed} ${r.unit || 'unit(s)'}`} • Priority: {title(r.urgency || 'normal')}
                                            </p>
                                            <p className="text-[10px] opacity-70 mt-0.5">Submitted {formatDate(r.created_at)}</p>
                                        </div>
                                        <div className="flex justify-end pt-2 border-t border-[#2563EB]/20">
                                            <Button
                                                variant="secondary"
                                                className="py-1 px-3 text-xs"
                                                onClick={() => setSelectedRequestDetails(r)}
                                            >
                                                <Icon name="info" className="mr-1" size={13} /> View Details
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* Selected Request Details Modal */}
            {selectedRequestDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <div className="flex items-center gap-2">
                                <Icon name="requests" size={20} className="text-[#2563EB]" />
                                <h2 className="text-lg font-extrabold text-[#2563EB]">
                                    Request #REQ-{String(selectedRequestDetails.id).padStart(3, '0')}
                                </h2>
                            </div>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setSelectedRequestDetails(null)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-xs font-bold">
                            <div className="flex items-center justify-between border-b border-[#2563EB]/30 pb-2">
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Assistance Category</span>
                                    <span className="text-base font-extrabold">{title(selectedRequestDetails.category)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[#2563EB] opacity-70 block">Status</span>
                                    <Badge status={selectedRequestDetails.status} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-b border-[#2563EB]/30 pb-2">
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Request Type</span>
                                    <span className="text-[#2563EB] font-extrabold">{selectedRequestDetails.request_type === 'financial' ? 'Financial Assistance' : 'Physical Goods'}</span>
                                </div>
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">
                                        {selectedRequestDetails.request_type === 'financial' ? 'Amount Requested' : 'Quantity Needed'}
                                    </span>
                                    <span className="text-[#22C55E] font-black text-sm">
                                        {selectedRequestDetails.request_type === 'financial'
                                            ? `₱${Number(selectedRequestDetails.amount_requested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                            : `${selectedRequestDetails.quantity_needed} ${selectedRequestDetails.unit || 'unit(s)'}`}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Priority Level</span>
                                    <span className="uppercase text-[#2563EB] font-extrabold">{selectedRequestDetails.urgency || 'Normal'}</span>
                                </div>
                            </div>

                            {selectedRequestDetails.purpose_of_funds && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Purpose of Funds</span>
                                    <p className="font-normal text-[#2563EB]">{selectedRequestDetails.purpose_of_funds}</p>
                                </div>
                            )}

                            {selectedRequestDetails.preferred_assistance_date && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Preferred Assistance Date</span>
                                    <p className="font-extrabold text-[#2563EB]">📅 {selectedRequestDetails.preferred_assistance_date}</p>
                                </div>
                            )}

                            {selectedRequestDetails.justification && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Reason for Request / Justification</span>
                                    <p className="font-normal whitespace-pre-wrap">{selectedRequestDetails.justification}</p>
                                </div>
                            )}

                            {selectedRequestDetails.alternative_categories && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Alternative Acceptable Categories</span>
                                    <p className="font-normal">{selectedRequestDetails.alternative_categories}</p>
                                </div>
                            )}

                            {selectedRequestDetails.additional_info && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Additional Information</span>
                                    <p className="font-normal whitespace-pre-wrap">{selectedRequestDetails.additional_info}</p>
                                </div>
                            )}

                            <div>
                                <span className="text-[#2563EB] opacity-70 block">Date Submitted</span>
                                <span>{formatDate(selectedRequestDetails.created_at)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-[#2563EB]/30 pt-3">
                            <Button variant="secondary" onClick={() => setSelectedRequestDetails(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function DonorNeeds() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter, Search, Sort & Pagination States
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const [page, setPage] = useState(1);
    const pageSize = 9;

    // Modals
    const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);
    const [donatingRequest, setDonatingRequest] = useState(null);

    // Quick Donation Form State inside modal
    const [donationForm, setDonationForm] = useState({
        item_name: '',
        quantity: 1,
        amount: 100,
        condition_type: 'Gently Used',
        condition_notes: '',
        pickup_location: 'Campus Student Center - Main Entrance',
        availability_window: 'Available Immediately',
        preferred_handoff_slots: 'Morning (8:00 AM - 12:00 PM)',
    });
    const [donationPhoto, setDonationPhoto] = useState(null);
    const [donationPhotoPreview, setDonationPhotoPreview] = useState('');
    const [donationSubmitting, setDonationSubmitting] = useState(false);
    const [donationError, setDonationError] = useState('');
    const [donationSuccess, setDonationSuccess] = useState(false);
    const donationFileInputRef = useRef(null);

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'food', label: 'Food & Meals' },
        { value: 'clothing', label: 'Clothing & Apparel' },
        { value: 'books', label: 'Educational & Books' },
        { value: 'medical', label: 'Medical & Health Supplies' },
        { value: 'electronics', label: 'Electronics & Tech' },
        { value: 'household', label: 'Household & Bedding' },
        { value: 'hygiene', label: 'Personal Care & Hygiene' },
        { value: 'emergency', label: 'Emergency & Disaster Relief' },
        { value: 'tuition', label: 'Tuition & Academic Fees' },
        { value: 'living_allowance', label: 'Living & Food Allowance' },
        { value: 'transportation', label: 'Transportation & Commute' },
        { value: 'other', label: 'Other Useful Needs' },
    ];

    const loadRequests = () => {
        setLoading(true);
        setError('');
        api.get('/requests')
            .then((r) => {
                setRequests(r.data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Could not load community needs.');
                setLoading(false);
            });
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Filter & Sort Logic
    const filteredRequests = requests.filter((req) => {
        // Search query filter
        if (search.trim()) {
            const q = search.toLowerCase();
            const catMatch = (req.category || '').toLowerCase().includes(q);
            const justMatch = (req.justification || '').toLowerCase().includes(q);
            const altMatch = (req.alternative_categories || '').toLowerCase().includes(q);
            const purpMatch = (req.purpose_of_funds || '').toLowerCase().includes(q);
            if (!catMatch && !justMatch && !altMatch && !purpMatch) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && (req.request_type || 'physical') !== typeFilter) {
            return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && req.category !== categoryFilter) {
            return false;
        }

        // Urgency filter
        if (urgencyFilter !== 'all' && req.urgency !== urgencyFilter) {
            return false;
        }

        return true;
    });

    const sortedRequests = [...filteredRequests].sort((a, b) => {
        if (sortBy === 'latest') {
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === 'urgency_desc') {
            const urgencyWeight = { high: 3, medium: 2, low: 1 };
            return (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0);
        }
        if (sortBy === 'amount_desc') {
            const aVal = a.request_type === 'financial' ? Number(a.amount_requested || 0) : Number(a.quantity_needed || 0);
            const bVal = b.request_type === 'financial' ? Number(b.amount_requested || 0) : Number(b.quantity_needed || 0);
            return bVal - aVal;
        }
        return 0;
    });

    // Pagination calculations
    const totalPages = Math.ceil(sortedRequests.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedRequests = sortedRequests.slice(startIndex, startIndex + pageSize);

    const resetFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setCategoryFilter('all');
        setUrgencyFilter('all');
        setSortBy('latest');
        setPage(1);
    };

    const openQuickDonateModal = (req) => {
        const isFinancial = req.request_type === 'financial';
        const remainingQty = Math.max(1, (req.quantity_needed || 1) - (req.matched_quantity || 0));
        const remainingAmt = Math.max(1, (Number(req.amount_requested) || 0) - (Number(req.matched_amount) || 0));

        setDonatingRequest(req);
        setDonationForm({
            item_name: isFinancial ? `Financial Aid for ${title(req.category)}` : `Donation for ${title(req.category)} Need`,
            quantity: remainingQty,
            amount: remainingAmt || 100,
            condition_type: 'Gently Used',
            condition_notes: '',
            pickup_location: isFinancial ? 'Campus Financial Office / Online Transfer' : 'Campus Student Center - Main Entrance',
            availability_window: 'Available Immediately',
            preferred_handoff_slots: 'Morning (8:00 AM - 12:00 PM)',
        });
        setDonationPhoto(null);
        setDonationPhotoPreview('');
        setDonationError('');
        setDonationSuccess(false);
    };

    const handlePhotoChange = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setDonationError('Please select a valid image file (PNG, JPG, WEBP).');
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            setDonationError('Image size exceeds maximum limit of 4 MB.');
            return;
        }
        setDonationError('');
        setDonationPhoto(file);
        if (donationPhotoPreview) URL.revokeObjectURL(donationPhotoPreview);
        setDonationPhotoPreview(URL.createObjectURL(file));
    };

    const handleQuickDonationSubmit = async (e) => {
        e.preventDefault();
        if (!donatingRequest) return;
        setDonationSubmitting(true);
        setDonationError('');

        try {
            const isFinancial = donatingRequest.request_type === 'financial';
            const data = new FormData();
            data.append('donation_type', isFinancial ? 'financial' : 'physical');
            data.append('category', donatingRequest.category);
            data.append('request_id', donatingRequest.id);

            if (isFinancial) {
                data.append('item_name', donationForm.item_name.trim() || `Financial Aid for ${title(donatingRequest.category)}`);
                data.append('amount', donationForm.amount);
                data.append('currency', 'PHP');
                const notes = `[For Request #${donatingRequest.id}] ${donationForm.condition_notes.trim()}`.trim();
                data.append('condition_notes', notes);
                data.append('pickup_location', donationForm.pickup_location || 'Campus Financial Office / Online Transfer');
            } else {
                data.append('item_name', donationForm.item_name.trim());
                data.append('quantity', donationForm.quantity);
                const notes = donationForm.condition_type
                    ? `[For Request #${donatingRequest.id}] [Condition: ${donationForm.condition_type}] ${donationForm.condition_notes.trim()}`.trim()
                    : `[For Request #${donatingRequest.id}] ${donationForm.condition_notes.trim()}`.trim();
                data.append('condition_notes', notes);
                data.append('pickup_location', donationForm.pickup_location);
            }

            data.append('availability_window', donationForm.availability_window);
            data.append('preferred_handoff_slots', donationForm.preferred_handoff_slots);

            if (donationPhoto) {
                data.append('image', donationPhoto);
            }

            await api.post('/donations', data);
            setDonationSuccess(true);
            loadRequests();
        } catch (err) {
            setDonationError(err.response?.data?.message || 'Could not submit donation. Please try again.');
        } finally {
            setDonationSubmitting(false);
        }
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return 'Recently';
        const d = new Date(isoStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <main className="page max-w-7xl">
            <p className="eyebrow">COMMUNITY IMPACT</p>
            <h1 className="page-title">Requests & Campus Needs</h1>
            <p className="page-copy">
                Explore student support requests and campus needs to provide physical goods or direct financial assistance.
            </p>

            {/* Controls Bar: Search, Filters & Sorting */}
            <div className="panel mt-8 p-4 sm:p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                        <label htmlFor="search_needs" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Search Needs
                        </label>
                        <div className="relative">
                            <input
                                id="search_needs"
                                type="text"
                                placeholder="Search by topic, category, justification..."
                                className="field pr-9 text-xs"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2563EB]">
                                <Icon name="search" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label htmlFor="filter_type" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Request Type
                        </label>
                        <select
                            id="filter_type"
                            className="field text-xs"
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Request Types</option>
                            <option value="physical">Physical Goods</option>
                            <option value="financial">Financial Assistance</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label htmlFor="filter_category" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Filter by Category
                        </label>
                        <select
                            id="filter_category"
                            className="field text-xs"
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Urgency Filter */}
                    <div>
                        <label htmlFor="filter_urgency" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Priority Level
                        </label>
                        <select
                            id="filter_urgency"
                            className="field text-xs"
                            value={urgencyFilter}
                            onChange={(e) => {
                                setUrgencyFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Priority Levels</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>
                    </div>
                </div>

                {/* Filter Summary & Reset Action */}
                {(search || typeFilter !== 'all' || categoryFilter !== 'all' || urgencyFilter !== 'all' || sortBy !== 'latest') && (
                    <div className="flex items-center justify-between border-t border-[#2563EB]/20 pt-3 text-xs font-bold text-[#2563EB]">
                        <span>
                            Showing filtered results ({sortedRequests.length} item{sortedRequests.length === 1 ? '' : 's'})
                        </span>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 font-extrabold text-[#22C55E] underline hover:text-[#2563EB]"
                            onClick={resetFilters}
                        >
                            <Icon name="close" size={14} /> Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message Banner */}
            {error && <Error>{error}</Error>}

            {/* Cards Grid */}
            <div className="mt-8">
                {loading ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="panel p-6 animate-pulse space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="h-6 w-20 rounded-full bg-[#2563EB]/20" />
                                    <div className="h-5 w-24 rounded bg-[#2563EB]/20" />
                                </div>
                                <div className="h-7 w-3/4 rounded bg-[#2563EB]/20" />
                                <div className="h-16 w-full rounded bg-[#2563EB]/10" />
                                <div className="h-10 w-full rounded-xl bg-[#2563EB]/20" />
                            </div>
                        ))}
                    </div>
                ) : !paginatedRequests.length ? (
                    <div className="panel p-10 text-center">
                        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#2563EB] text-white">
                            <Icon name="search" size={24} />
                        </div>
                        <p className="font-extrabold text-base text-[#2563EB]">No matching campus needs found</p>
                        <p className="mt-1 text-xs text-[#2563EB] opacity-80">
                            Try broadening your search term or clearing active filters to see all available requests.
                        </p>
                        <Button variant="secondary" className="mt-4 text-xs" onClick={resetFilters}>
                            Reset Search & Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedRequests.map((req) => {
                                const isFinancial = req.request_type === 'financial';
                                const neededQty = req.quantity_needed || 1;
                                const matchedQty = req.matched_quantity || 0;
                                const remainingQty = req.remaining_quantity !== undefined ? req.remaining_quantity : Math.max(0, neededQty - matchedQty);

                                const requestedAmt = Number(req.amount_requested || 0);
                                const matchedAmt = Number(req.matched_amount || 0);
                                const remainingAmt = req.remaining_amount !== undefined ? Number(req.remaining_amount) : Math.max(0, requestedAmt - matchedAmt);

                                const progressPercent = isFinancial
                                    ? (requestedAmt > 0 ? Math.min(100, Math.round((matchedAmt / requestedAmt) * 100)) : 0)
                                    : (neededQty > 0 ? Math.min(100, Math.round((matchedQty / neededQty) * 100)) : 0);

                                return (
                                    <article
                                        key={req.id}
                                        className="panel p-5 flex flex-col justify-between h-full min-h-[360px] transition-all hover:border-[#22C55E]"
                                    >
                                        <div>
                                            {/* Top Row: Type & Urgency & Remaining Badge */}
                                            <div className="flex items-center justify-between gap-2 border-b border-[#2563EB]/20 pb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isFinancial ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' : 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20'}`}>
                                                        {isFinancial ? 'Financial Aid' : 'Physical Item'}
                                                    </span>
                                                    <Badge status={req.urgency} />
                                                </div>
                                                <span className="rounded-full border border-[#2563EB] bg-white px-2.5 py-1 text-xs font-black text-[#2563EB]">
                                                    {isFinancial
                                                        ? `₱${remainingAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })} needed`
                                                        : `${remainingQty} ${req.unit || 'unit(s)'} needed`}
                                                </span>
                                            </div>

                                            {/* Category Title & Date */}
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-extrabold text-[#2563EB] truncate max-w-[200px]">
                                                        {title(req.category)}
                                                    </h3>
                                                    <span className="text-[11px] font-bold text-[#2563EB] opacity-75">
                                                        {formatDate(req.created_at)}
                                                    </span>
                                                </div>
                                                {req.purpose_of_funds && (
                                                    <p className="mt-1 text-xs font-bold text-[#22C55E] truncate">
                                                        Purpose: {req.purpose_of_funds}
                                                    </p>
                                                )}
                                                {req.preferred_assistance_date && (
                                                    <p className="mt-0.5 text-[11px] font-bold text-[#2563EB]/80">
                                                        📅 Needed by: {req.preferred_assistance_date}
                                                    </p>
                                                )}
                                                {req.alternative_categories && !isFinancial && (
                                                    <p className="mt-0.5 text-xs font-bold text-[#2563EB] opacity-80 truncate">
                                                        Alt: {req.alternative_categories}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Justification Description */}
                                            <p className="mt-3 text-xs text-[#2563EB] line-clamp-3 leading-relaxed">
                                                {req.justification}
                                            </p>
                                        </div>

                                        {/* Bottom Section: Progress Bar & Actions */}
                                        <div className="mt-5 border-t border-[#2563EB]/20 pt-4 space-y-3">
                                            {/* Fulfillment Progress Bar */}
                                            <div>
                                                <div className="flex items-center justify-between text-[11px] font-extrabold text-[#2563EB] mb-1">
                                                    <span>Fulfillment Progress</span>
                                                    <span>
                                                        {isFinancial
                                                            ? `₱${matchedAmt.toLocaleString(undefined, { minimumFractionDigits: 0 })} / ₱${requestedAmt.toLocaleString(undefined, { minimumFractionDigits: 0 })} (${progressPercent}%)`
                                                            : `${matchedQty} / ${neededQty} ${req.unit || 'units'} (${progressPercent}%)`}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full border border-[#2563EB] bg-white">
                                                    <div
                                                        className="h-full bg-[#22C55E] transition-all duration-300"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <Button
                                                    variant="secondary"
                                                    className="w-full text-xs py-2 px-2"
                                                    onClick={() => setSelectedDetailRequest(req)}
                                                >
                                                    <Icon name="info" className="mr-1" size={14} /> Details
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    className="w-full text-xs py-2 px-2"
                                                    onClick={() => openQuickDonateModal(req)}
                                                >
                                                    <Icon name="heart" className="mr-1" size={14} /> Donate
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#2563EB] pt-4 text-xs font-bold text-[#2563EB]">
                                <div>
                                    Showing {startIndex + 1}–{Math.min(startIndex + pageSize, sortedRequests.length)} of {sortedRequests.length} campus needs
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        className="py-1 px-3 text-xs"
                                        disabled={currentPage <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Button>

                                    <span className="px-2">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <Button
                                        variant="secondary"
                                        className="py-1 px-3 text-xs"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {selectedDetailRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <div className="flex items-center gap-2">
                                <Icon name="request" size={20} className="text-[#2563EB]" />
                                <h2 className="text-lg font-extrabold text-[#2563EB]">Request Details & Context</h2>
                            </div>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setSelectedDetailRequest(null)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4 text-xs font-bold">
                            <div className="flex items-center justify-between border-b border-[#2563EB]/30 pb-3">
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Assistance Category</span>
                                    <span className="text-base font-extrabold">{title(selectedDetailRequest.category)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[#2563EB] opacity-70 block">Priority Level</span>
                                    <Badge status={selectedDetailRequest.urgency} />
                                </div>
                            </div>

                            {/* Request Type and Numeric Overview */}
                            <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#2563EB] bg-white p-3 text-center">
                                {selectedDetailRequest.request_type === 'financial' ? (
                                    <>
                                        <div>
                                            <span className="text-[#2563EB] opacity-70 block text-[10px]">Amount Requested</span>
                                            <span className="text-sm font-extrabold text-[#2563EB]">
                                                ₱{Number(selectedDetailRequest.amount_requested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[#2563EB] opacity-70 block text-[10px]">Matched Aid</span>
                                            <span className="text-sm font-extrabold text-[#22C55E]">
                                                ₱{Number(selectedDetailRequest.matched_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[#2563EB] opacity-70 block text-[10px]">Remaining</span>
                                            <span className="text-sm font-extrabold text-[#2563EB]">
                                                ₱{Math.max(0, (Number(selectedDetailRequest.amount_requested) || 0) - (Number(selectedDetailRequest.matched_amount) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <span className="text-[#2563EB] opacity-70 block text-[10px]">Quantity Needed</span>
                                            <span className="text-sm font-extrabold text-[#2563EB]">
                                                {selectedDetailRequest.quantity_needed} {selectedDetailRequest.unit || 'unit(s)'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[#2563EB] opacity-70 block text-[10px]">Matched Units</span>
                                            <span className="text-sm font-extrabold text-[#22C55E]">
                                                {selectedDetailRequest.matched_quantity || 0}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[#2563EB] opacity-70 block text-[10px]">Remaining</span>
                                            <span className="text-sm font-extrabold text-[#2563EB]">
                                                {Math.max(0, (selectedDetailRequest.quantity_needed || 0) - (selectedDetailRequest.matched_quantity || 0))}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {selectedDetailRequest.purpose_of_funds && (
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block mb-1">Purpose of Funds</span>
                                    <p className="rounded-xl border border-[#2563EB] bg-white p-3 font-medium text-[#22C55E]">
                                        {selectedDetailRequest.purpose_of_funds}
                                    </p>
                                </div>
                            )}

                            {selectedDetailRequest.preferred_assistance_date && (
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block mb-1">Preferred Assistance Date</span>
                                    <p className="font-extrabold text-[#2563EB]">
                                        📅 {selectedDetailRequest.preferred_assistance_date}
                                    </p>
                                </div>
                            )}

                            <div>
                                <span className="text-[#2563EB] opacity-70 block mb-1">Reason for Request / Justification</span>
                                <p className="rounded-xl border border-[#2563EB] bg-white p-3 font-normal leading-relaxed whitespace-pre-wrap">
                                    {selectedDetailRequest.justification}
                                </p>
                            </div>

                            {selectedDetailRequest.alternative_categories && (
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block mb-1">Acceptable Alternatives</span>
                                    <p className="font-normal text-[#2563EB]">
                                        {selectedDetailRequest.alternative_categories}
                                    </p>
                                </div>
                            )}

                            {selectedDetailRequest.additional_info && (
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block mb-1">Additional Information / Bank Notes</span>
                                    <p className="rounded-xl border border-[#2563EB] bg-white p-3 font-normal whitespace-pre-wrap">
                                        {selectedDetailRequest.additional_info}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-[#2563EB]/30 pt-3 text-[11px]">
                                <span>Date Posted: {formatDate(selectedDetailRequest.created_at)}</span>
                                <span>Status: {title(selectedDetailRequest.status)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#2563EB]/30 pt-4">
                            <Button variant="secondary" onClick={() => setSelectedDetailRequest(null)}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const req = selectedDetailRequest;
                                    setSelectedDetailRequest(null);
                                    openQuickDonateModal(req);
                                }}
                            >
                                <Icon name="heart" className="mr-1" /> Donate for this Need
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Donation Modal */}
            {donatingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <div className="flex items-center gap-2">
                                <Icon name="heart" size={20} className="text-[#22C55E]" />
                                <h2 className="text-lg font-extrabold text-[#2563EB]">
                                    Donate for {title(donatingRequest.category)} Need
                                </h2>
                            </div>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setDonatingRequest(null)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        {donationSuccess ? (
                            <div className="py-6 text-center">
                                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#22C55E] text-white">
                                    <Icon name="check" size={28} />
                                </div>
                                <h3 className="text-base font-extrabold text-[#2563EB]">Donation Submitted Successfully!</h3>
                                <p className="mt-2 text-xs text-[#2563EB] max-w-xs mx-auto">
                                    Your donation has been created and logged in the system. It will now be processed to fulfill this campus need.
                                </p>
                                <div className="mt-6 flex justify-center gap-3">
                                    <Button variant="primary" onClick={() => setDonatingRequest(null)}>
                                        Done
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form className="mt-4 space-y-4" onSubmit={handleQuickDonationSubmit}>
                                <div className="rounded-xl border border-[#2563EB] bg-white p-3 text-xs font-bold">
                                    <span className="text-[#2563EB] opacity-70 block">Target Request</span>
                                    <span>
                                        {title(donatingRequest.category)} — {donatingRequest.request_type === 'financial'
                                            ? `₱${Math.max(0, (Number(donatingRequest.amount_requested) || 0) - (Number(donatingRequest.matched_amount) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining needed`
                                            : `${donatingRequest.quantity_needed - (donatingRequest.matched_quantity || 0)} ${donatingRequest.unit || 'unit(s)'} remaining needed`}
                                    </span>
                                </div>

                                {donatingRequest.request_type === 'financial' ? (
                                    <>
                                        {/* Financial Donation Amount */}
                                        <div>
                                            <label htmlFor="q_amount" className="block text-xs font-bold text-[#2563EB]">
                                                Donation Amount (₱ PHP) <span className="text-[#22C55E]">*</span>
                                            </label>
                                            <input
                                                id="q_amount"
                                                required
                                                min={1}
                                                step="0.01"
                                                type="number"
                                                className="field mt-1 text-xs font-black text-lg text-[#22C55E]"
                                                value={donationForm.amount}
                                                onChange={(e) => setDonationForm({ ...donationForm, amount: Math.max(1, parseFloat(e.target.value) || 0) })}
                                            />
                                        </div>

                                        {/* Donation Note / Description */}
                                        <div>
                                            <label htmlFor="q_item_name" className="block text-xs font-bold text-[#2563EB]">
                                                Donation Title / Reference
                                            </label>
                                            <input
                                                id="q_item_name"
                                                type="text"
                                                className="field mt-1 text-xs"
                                                value={donationForm.item_name}
                                                onChange={(e) => setDonationForm({ ...donationForm, item_name: e.target.value })}
                                            />
                                        </div>

                                        {/* Transfer / Cashier Method Notes */}
                                        <div>
                                            <label htmlFor="q_cond_notes" className="block text-xs font-bold text-[#2563EB]">
                                                Payment / Transfer Method & Notes
                                            </label>
                                            <textarea
                                                id="q_cond_notes"
                                                rows={2}
                                                placeholder="e.g. Bank Transfer Ref #, GCash Ref #, or Campus Cashier deposit details"
                                                className="field mt-1 text-xs"
                                                value={donationForm.condition_notes}
                                                onChange={(e) => setDonationForm({ ...donationForm, condition_notes: e.target.value })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Physical Item Name */}
                                        <div>
                                            <label htmlFor="q_item_name" className="block text-xs font-bold text-[#2563EB]">
                                                Donation Item Name <span className="text-[#22C55E]">*</span>
                                            </label>
                                            <input
                                                id="q_item_name"
                                                required
                                                type="text"
                                                className="field mt-1 text-xs"
                                                value={donationForm.item_name}
                                                onChange={(e) => setDonationForm({ ...donationForm, item_name: e.target.value })}
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label htmlFor="q_quantity" className="block text-xs font-bold text-[#2563EB]">
                                                Donation Quantity <span className="text-[#22C55E]">*</span>
                                            </label>
                                            <input
                                                id="q_quantity"
                                                required
                                                min={1}
                                                type="number"
                                                className="field mt-1 text-xs font-bold"
                                                value={donationForm.quantity}
                                                onChange={(e) => setDonationForm({ ...donationForm, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                            />
                                        </div>

                                        {/* Condition */}
                                        <div>
                                            <label htmlFor="q_condition" className="block text-xs font-bold text-[#2563EB]">
                                                Item Condition
                                            </label>
                                            <select
                                                id="q_condition"
                                                className="field mt-1 text-xs"
                                                value={donationForm.condition_type}
                                                onChange={(e) => setDonationForm({ ...donationForm, condition_type: e.target.value })}
                                            >
                                                <option value="New / Sealed">New / Sealed</option>
                                                <option value="Like New">Like New</option>
                                                <option value="Gently Used">Gently Used</option>
                                                <option value="Fair / Functional">Fair / Functional</option>
                                            </select>
                                        </div>

                                        {/* Pickup Location */}
                                        <div>
                                            <label htmlFor="q_pickup" className="block text-xs font-bold text-[#2563EB]">
                                                Pickup / Drop-off Location
                                            </label>
                                            <input
                                                id="q_pickup"
                                                type="text"
                                                className="field mt-1 text-xs"
                                                value={donationForm.pickup_location}
                                                onChange={(e) => setDonationForm({ ...donationForm, pickup_location: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Photo / Receipt Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-[#2563EB]">
                                        {donatingRequest.request_type === 'financial' ? 'Payment Receipt / Deposit Slip (Optional)' : 'Item Photo (Optional)'}
                                    </label>
                                    {!donationPhotoPreview ? (
                                        <div
                                            className="mt-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2563EB] bg-white p-3 text-center cursor-pointer hover:border-[#22C55E]"
                                            onClick={() => donationFileInputRef.current?.click()}
                                        >
                                            <Icon name="upload" size={18} className="text-[#2563EB]" />
                                            <span className="text-[11px] font-bold text-[#2563EB]">Click to upload photo or receipt (Max 4MB)</span>
                                            <input
                                                ref={donationFileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => e.target.files?.[0] && handlePhotoChange(e.target.files[0])}
                                            />
                                        </div>
                                    ) : (
                                        <div className="mt-1 flex items-center justify-between rounded-xl border border-[#2563EB] p-2 bg-white">
                                            <img src={donationPhotoPreview} alt="Preview" className="h-12 w-12 rounded border object-cover" />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="py-1 px-2 text-[10px]"
                                                onClick={() => {
                                                    setDonationPhoto(null);
                                                    setDonationPhotoPreview('');
                                                }}
                                            >
                                                Remove Photo
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {donationError && <Error>{donationError}</Error>}

                                <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#2563EB]/30 pt-3">
                                    <Button type="button" variant="secondary" onClick={() => setDonatingRequest(null)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="success" loading={donationSubmitting}>
                                        <Icon name="check" className="mr-1" /> Submit Donation
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

function FulfillmentPage({ role }) {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('active');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals
    const [schedulingMatch, setSchedulingMatch] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({ scheduled_at: '', notes: '' });
    const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
    const [scheduleError, setScheduleError] = useState('');

    const [cancellingMatch, setCancellingMatch] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelSubmitting, setCancelSubmitting] = useState(false);
    const [cancelError, setCancelError] = useState('');

    const [completingMatchId, setCompletingMatchId] = useState(null);
    const [selectedMatchDetails, setSelectedMatchDetails] = useState(null);
    const [actionMessage, setActionMessage] = useState('');

    const loadMatches = () => {
        setLoading(true);
        setError('');
        api.get('/matches?mine=1')
            .then((r) => {
                setMatches(r.data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Failed to load handoff records.');
                setLoading(false);
            });
    };

    useEffect(() => {
        loadMatches();
    }, []);

    const activeMatches = matches.filter((m) => m.status === 'proposed' || m.status === 'confirmed');
    const historyMatches = matches.filter((m) => m.status === 'fulfilled' || m.status === 'rejected');

    const currentList = activeTab === 'active' ? activeMatches : historyMatches;

    const filteredMatches = currentList.filter((m) => {
        if (search.trim()) {
            const q = search.toLowerCase();
            const itemName = (m.donation?.item_name || '').toLowerCase();
            const catName = (m.request?.category || '').toLowerCase();
            const notes = (m.handoff_notes || '').toLowerCase();
            const donorName = (m.donation?.donor?.name || '').toLowerCase();
            const recipName = (m.request?.beneficiary?.name || '').toLowerCase();
            if (
                !itemName.includes(q) &&
                !catName.includes(q) &&
                !notes.includes(q) &&
                !donorName.includes(q) &&
                !recipName.includes(q)
            ) {
                return false;
            }
        }
        if (statusFilter !== 'all') {
            if (statusFilter === 'pending' && (m.status !== 'proposed' || m.handoff_scheduled_at)) return false;
            if (statusFilter === 'scheduled' && (!m.handoff_scheduled_at || m.status === 'fulfilled')) return false;
            if (statusFilter === 'fulfilled' && m.status !== 'fulfilled') return false;
            if (statusFilter === 'rejected' && m.status !== 'rejected') return false;
        }
        return true;
    });

    const openScheduleModal = (m) => {
        setSchedulingMatch(m);
        let defaultDate = '';
        if (m.handoff_scheduled_at) {
            const d = new Date(m.handoff_scheduled_at);
            const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            defaultDate = iso;
        }
        setScheduleForm({
            scheduled_at: defaultDate,
            notes: m.handoff_notes || m.donation?.pickup_location || 'Campus Student Center - Main Entrance',
        });
        setScheduleError('');
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!schedulingMatch) return;
        if (!scheduleForm.scheduled_at) {
            setScheduleError('Please select a valid date and time for the handoff.');
            return;
        }

        setScheduleSubmitting(true);
        setScheduleError('');
        try {
            await api.patch(`/matches/${schedulingMatch.id}/schedule`, {
                handoff_scheduled_at: scheduleForm.scheduled_at,
                handoff_notes: scheduleForm.notes.trim(),
            });
            setActionMessage('Handoff schedule saved successfully.');
            setTimeout(() => setActionMessage(''), 4000);
            setSchedulingMatch(null);
            loadMatches();
        } catch (err) {
            setScheduleError(err.response?.data?.message || 'Could not save schedule. Ensure date is in the future.');
        } finally {
            setScheduleSubmitting(false);
        }
    };

    const handleConfirmCompletion = async (m) => {
        if (completingMatchId) return;
        setCompletingMatchId(m.id);
        setActionMessage('');
        try {
            await api.patch(`/matches/${m.id}/complete`);
            setActionMessage('Your completion confirmation has been recorded.');
            setTimeout(() => setActionMessage(''), 4000);
            loadMatches();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not confirm completion.');
        } finally {
            setCompletingMatchId(null);
        }
    };

    const openCancelModal = (m) => {
        setCancellingMatch(m);
        setCancelReason('');
        setCancelError('');
    };

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!cancellingMatch) return;
        if (!cancelReason.trim()) {
            setCancelError('Please state the reason for cancelling or reporting an issue.');
            return;
        }
        setCancelSubmitting(true);
        setCancelError('');
        try {
            await api.patch(`/matches/${cancellingMatch.id}/cancel`, {
                reason: cancelReason.trim(),
            });
            setActionMessage('Handoff status updated.');
            setTimeout(() => setActionMessage(''), 4000);
            setCancellingMatch(null);
            loadMatches();
        } catch (err) {
            setCancelError(err.response?.data?.message || 'Could not process cancellation.');
        } finally {
            setCancelSubmitting(false);
        }
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return null;
        const d = new Date(isoStr);
        return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isDonor = role === 'donor';

    const getWorkflowStage = (m) => {
        if (m.status === 'fulfilled') return 4;
        const myConfirmed = isDonor ? !!m.donor_completed_at : !!m.beneficiary_completed_at;
        if (myConfirmed) return 3;
        if (m.handoff_scheduled_at || m.status === 'confirmed') return 2;
        return 1;
    };

    return (
        <main className="page max-w-7xl">
            <p className="eyebrow">{isDonor ? 'DONATION DELIVERY' : 'SUPPORT ARRIVAL'}</p>
            <h1 className="page-title">{isDonor ? 'Fulfillment & Handoffs' : 'Support Fulfillment'}</h1>
            <p className="page-copy">
                Track active resource deliveries, schedule meeting times, and confirm handoff completion.
            </p>

            {/* Action Feedback Banner */}
            {actionMessage && (
                <div className="mt-4 rounded-xl border border-[#22C55E] bg-white p-3.5 text-sm font-extrabold text-[#22C55E] flex items-center gap-2">
                    <Icon name="check" size={18} />
                    <span>{actionMessage}</span>
                </div>
            )}
            {error && <Error>{error}</Error>}

            {/* Tabs Header */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB] pb-3">
                <div className="flex gap-2">
                    <button
                        type="button"
                        className={`rounded-xl border px-4 py-2.5 text-sm font-extrabold transition ${
                            activeTab === 'active'
                                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                                : 'border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white'
                        }`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Handoffs ({activeMatches.length})
                    </button>
                    <button
                        type="button"
                        className={`rounded-xl border px-4 py-2.5 text-sm font-extrabold transition ${
                            activeTab === 'history'
                                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                                : 'border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white'
                        }`}
                        onClick={() => setActiveTab('history')}
                    >
                        Handoff History ({historyMatches.length})
                    </button>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search handoffs..."
                            className="field pr-8 text-xs py-1.5"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2563EB]">
                            <Icon name="search" size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="panel p-6 animate-pulse space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-6 w-32 rounded bg-[#2563EB]/20" />
                                    <div className="h-6 w-20 rounded-full bg-[#2563EB]/20" />
                                </div>
                                <div className="h-5 w-1/2 rounded bg-[#2563EB]/10" />
                                <div className="h-10 w-full rounded bg-[#2563EB]/10" />
                            </div>
                        ))}
                    </div>
                ) : !filteredMatches.length ? (
                    <Empty>
                        {activeTab === 'active'
                            ? 'No active handoffs currently in progress.'
                            : 'No completed or cancelled handoff records found.'}
                    </Empty>
                ) : (
                    <div className="space-y-6">
                        {filteredMatches.map((m) => {
                            const stage = getWorkflowStage(m);
                            const itemName = m.donation?.item_name || title(m.request?.category || 'Item');
                            const categoryName = title(m.request?.category || m.donation?.category || '');
                            const counterparty = isDonor ? m.request?.beneficiary : m.donation?.donor;
                            const counterpartyRole = isDonor ? 'Recipient' : 'Donor';
                            const isMyConfirmed = isDonor ? !!m.donor_completed_at : !!m.beneficiary_completed_at;
                            const isOtherConfirmed = isDonor ? !!m.beneficiary_completed_at : !!m.donor_completed_at;

                            return (
                                <article
                                    key={m.id}
                                    className="panel p-5 sm:p-7 flex flex-col justify-between space-y-5 transition hover:border-[#22C55E]"
                                >
                                    {/* Header Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2563EB]/20 pb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge status={m.status} />
                                                <span className="rounded-full border border-[#2563EB] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#2563EB]">
                                                    {m.matched_quantity} unit(s)
                                                </span>
                                            </div>
                                            <h3 className="mt-2 text-xl font-extrabold text-[#2563EB]">
                                                {itemName}
                                                {categoryName && (
                                                    <span className="ml-2 text-xs uppercase font-bold text-[#2563EB] opacity-75">
                                                        ({categoryName})
                                                    </span>
                                                )}
                                            </h3>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs font-bold text-[#2563EB] opacity-80 block">
                                                Match ID: #{m.id}
                                            </span>
                                            <span className="text-[11px] font-semibold text-[#2563EB] opacity-70">
                                                Created {formatDate(m.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Workflow Pipeline (4 Stages) */}
                                    {m.status !== 'rejected' && (
                                        <div className="rounded-2xl border border-[#2563EB] bg-white p-4">
                                            <div className="mb-2 text-xs font-extrabold text-[#2563EB]">
                                                Handoff Workflow Progress
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-extrabold">
                                                {/* Step 1: Matched */}
                                                <div
                                                    className={`rounded-xl p-2 border ${
                                                        stage >= 1
                                                            ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                                            : 'border-[#2563EB] bg-white text-[#2563EB]'
                                                    }`}
                                                >
                                                    1. Matched
                                                </div>
                                                {/* Step 2: Scheduled */}
                                                <div
                                                    className={`rounded-xl p-2 border ${
                                                        stage >= 2
                                                            ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                                            : 'border-[#2563EB] bg-white text-[#2563EB]'
                                                    }`}
                                                >
                                                    2. Scheduled
                                                </div>
                                                {/* Step 3: Confirmed */}
                                                <div
                                                    className={`rounded-xl p-2 border ${
                                                        stage >= 3
                                                            ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                                            : 'border-[#2563EB] bg-white text-[#2563EB]'
                                                    }`}
                                                >
                                                    3. Delivered
                                                </div>
                                                {/* Step 4: Fulfilled */}
                                                <div
                                                    className={`rounded-xl p-2 border ${
                                                        stage >= 4
                                                            ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                                            : 'border-[#2563EB] bg-white text-[#2563EB]'
                                                    }`}
                                                >
                                                    4. Completed
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Details Grid */}
                                    <div className="grid gap-4 sm:grid-cols-3 text-xs font-bold text-[#2563EB]">
                                        {/* Column 1: Counterparty Info */}
                                        <div className="rounded-xl border border-[#2563EB]/30 p-3 bg-white">
                                            <span className="text-[#2563EB] opacity-70 block mb-1">
                                                {counterpartyRole} Information
                                            </span>
                                            <p className="text-sm font-extrabold">
                                                {counterparty?.name || (isDonor ? 'Campus Beneficiary' : 'Resource Donor')}
                                            </p>
                                            {counterparty?.email && (
                                                <p className="text-[11px] font-normal text-[#2563EB] opacity-80 mt-1 truncate">
                                                    Email: {counterparty.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Column 2: Scheduled Time & Location */}
                                        <div className="rounded-xl border border-[#2563EB]/30 p-3 bg-white">
                                            <span className="text-[#2563EB] opacity-70 block mb-1">Schedule & Location</span>
                                            {m.handoff_scheduled_at ? (
                                                <p className="text-sm font-extrabold text-[#22C55E]">
                                                    📅 {formatDate(m.handoff_scheduled_at)}
                                                </p>
                                            ) : (
                                                <p className="text-xs font-bold text-[#2563EB]">Not scheduled yet</p>
                                            )}
                                            {m.handoff_notes && (
                                                <p className="mt-1 text-[11px] font-normal text-[#2563EB] truncate">
                                                    Location: {m.handoff_notes}
                                                </p>
                                            )}
                                        </div>

                                        {/* Column 3: Completion Confirmation Tracking */}
                                        <div className="rounded-xl border border-[#2563EB]/30 p-3 bg-white">
                                            <span className="text-[#2563EB] opacity-70 block mb-1">Confirmation Status</span>
                                            <div className="space-y-1 text-[11px]">
                                                <div>
                                                    Your status:{' '}
                                                    {isMyConfirmed ? (
                                                        <span className="font-extrabold text-[#22C55E]">✓ Confirmed</span>
                                                    ) : (
                                                        <span className="font-extrabold text-[#2563EB]">Pending Confirmation</span>
                                                    )}
                                                </div>
                                                <div>
                                                    {counterpartyRole} status:{' '}
                                                    {isOtherConfirmed ? (
                                                        <span className="font-extrabold text-[#22C55E]">✓ Confirmed</span>
                                                    ) : (
                                                        <span className="font-extrabold text-[#2563EB]">Pending Confirmation</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Controls Footer */}
                                    {m.status !== 'fulfilled' && m.status !== 'rejected' && (
                                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2563EB]/20 pt-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Schedule / Reschedule */}
                                                <Button
                                                    variant="primary"
                                                    className="text-xs py-2 px-3"
                                                    onClick={() => openScheduleModal(m)}
                                                >
                                                    <Icon name="calendar" className="mr-1.5" size={14} />
                                                    {m.handoff_scheduled_at ? 'Reschedule Meeting' : 'Schedule Meeting'}
                                                </Button>

                                                <span className="text-xs font-bold text-[#2563EB]/75">Staff records completion after secure identity and PIN verification.</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* View Details */}
                                                <Button
                                                    variant="secondary"
                                                    className="text-xs py-2 px-3"
                                                    onClick={() => setSelectedMatchDetails(m)}
                                                >
                                                    <Icon name="info" className="mr-1" size={14} /> Handoff Details
                                                </Button>

                                                {/* Report Issue / Cancel */}
                                                <Button
                                                    variant="secondary"
                                                    className="text-xs py-2 px-3"
                                                    onClick={() => openCancelModal(m)}
                                                >
                                                    <Icon name="decline" className="mr-1" size={14} /> Cancel / Report Issue
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {m.status === 'fulfilled' && (
                                        <div className="flex items-center justify-between border-t border-[#2563EB]/20 pt-4 text-xs font-bold text-[#22C55E]">
                                            <div className="flex items-center gap-2">
                                                <Icon name="check" size={18} />
                                                <span>This handoff was completed and confirmed by both parties.</span>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                className="text-xs py-1.5 px-3"
                                                onClick={() => setSelectedMatchDetails(m)}
                                            >
                                                <Icon name="info" className="mr-1" size={14} /> Details
                                            </Button>
                                        </div>
                                    )}

                                    {m.status === 'rejected' && (
                                        <div className="border-t border-[#2563EB]/20 pt-3 text-xs font-bold text-[#2563EB]">
                                            <span className="block font-extrabold text-[#2563EB]">Handoff Cancelled / Issue Reported</span>
                                            {m.handoff_notes && (
                                                <p className="mt-1 font-normal text-[#2563EB] opacity-90">{m.handoff_notes}</p>
                                            )}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Schedule / Reschedule Modal */}
            {schedulingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel max-h-[90vh] w-full max-w-md overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <div className="flex items-center gap-2">
                                <Icon name="calendar" size={20} className="text-[#2563EB]" />
                                <h2 className="text-lg font-extrabold text-[#2563EB]">
                                    {schedulingMatch.handoff_scheduled_at ? 'Reschedule Handoff Meeting' : 'Schedule Handoff Meeting'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setSchedulingMatch(null)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <form className="mt-4 space-y-4" onSubmit={handleScheduleSubmit}>
                            <div className="rounded-xl border border-[#2563EB] bg-white p-3 text-xs font-bold">
                                <span className="text-[#2563EB] opacity-70 block">Item Handoff</span>
                                <span>
                                    {schedulingMatch.donation?.item_name || title(schedulingMatch.request?.category)} ({schedulingMatch.matched_quantity} units)
                                </span>
                            </div>

                            {/* Scheduled Date & Time */}
                            <div>
                                <label htmlFor="sched_date" className="block text-xs font-bold text-[#2563EB]">
                                    Handoff Date & Time <span className="text-[#22C55E]">*</span>
                                </label>
                                <input
                                    id="sched_date"
                                    required
                                    type="datetime-local"
                                    className="field mt-1 text-xs"
                                    value={scheduleForm.scheduled_at}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })}
                                />
                            </div>

                            {/* Location & Instructions */}
                            <div>
                                <label htmlFor="sched_notes" className="block text-xs font-bold text-[#2563EB]">
                                    Meeting Location & Instructions <span className="text-[#22C55E]">*</span>
                                </label>
                                <textarea
                                    id="sched_notes"
                                    required
                                    maxLength={2000}
                                    rows={3}
                                    placeholder="e.g. Campus Student Center Main Lobby near info desk, look for blue jacket..."
                                    className="field mt-1 text-xs"
                                    value={scheduleForm.notes}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                                />
                            </div>

                            {scheduleError && <Error>{scheduleError}</Error>}

                            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#2563EB]/30 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setSchedulingMatch(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" loading={scheduleSubmitting}>
                                    <Icon name="check" className="mr-1" /> Save Schedule
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel / Report Issue Modal */}
            {cancellingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel max-h-[90vh] w-full max-w-md overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <div className="flex items-center gap-2">
                                <Icon name="decline" size={20} className="text-[#2563EB]" />
                                <h2 className="text-lg font-extrabold text-[#2563EB]">Cancel / Report Issue</h2>
                            </div>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setCancellingMatch(null)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <form className="mt-4 space-y-4" onSubmit={handleCancelSubmit}>
                            <p className="text-xs font-bold text-[#2563EB]">
                                Specify why this handoff cannot proceed. This will update the match status.
                            </p>

                            <div>
                                <label htmlFor="cancel_reason" className="block text-xs font-bold text-[#2563EB]">
                                    Reason / Issue Details <span className="text-[#22C55E]">*</span>
                                </label>
                                <textarea
                                    id="cancel_reason"
                                    required
                                    maxLength={1000}
                                    rows={4}
                                    placeholder="Please describe why the handoff is being cancelled or what issue occurred..."
                                    className="field mt-1 text-xs"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                />
                            </div>

                            {cancelError && <Error>{cancelError}</Error>}

                            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#2563EB]/30 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setCancellingMatch(null)}>
                                    Back
                                </Button>
                                <Button type="submit" variant="primary" loading={cancelSubmitting}>
                                    Confirm Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Handoff Details Modal */}
            {selectedMatchDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <div className="flex items-center gap-2">
                                <Icon name="fulfillment" size={20} className="text-[#2563EB]" />
                                <h2 className="text-lg font-extrabold text-[#2563EB]">Handoff Record Details</h2>
                            </div>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setSelectedMatchDetails(null)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-xs font-bold">
                            <div className="flex items-center justify-between border-b border-[#2563EB]/30 pb-2">
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Item Name</span>
                                    <span className="text-sm font-extrabold">
                                        {selectedMatchDetails.donation?.item_name || title(selectedMatchDetails.request?.category)}
                                    </span>
                                </div>
                                <Badge status={selectedMatchDetails.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-b border-[#2563EB]/30 pb-2">
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Matched Quantity</span>
                                    <span>{selectedMatchDetails.matched_quantity} unit(s)</span>
                                </div>
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Match Created</span>
                                    <span>{formatDate(selectedMatchDetails.created_at)}</span>
                                </div>
                            </div>

                            <div className="border-b border-[#2563EB]/30 pb-2">
                                <span className="text-[#2563EB] opacity-70 block">Donor Account</span>
                                <span>{selectedMatchDetails.donation?.donor?.name || 'Campus Donor'} ({selectedMatchDetails.donation?.donor?.email || 'N/A'})</span>
                            </div>

                            <div className="border-b border-[#2563EB]/30 pb-2">
                                <span className="text-[#2563EB] opacity-70 block">Recipient Account</span>
                                <span>{selectedMatchDetails.request?.beneficiary?.name || 'Campus Recipient'} ({selectedMatchDetails.request?.beneficiary?.email || 'N/A'})</span>
                            </div>

                            <div className="border-b border-[#2563EB]/30 pb-2">
                                <span className="text-[#2563EB] opacity-70 block">Scheduled Time</span>
                                <span>{formatDate(selectedMatchDetails.handoff_scheduled_at) || 'Not scheduled'}</span>
                            </div>

                            <div>
                                <span className="text-[#2563EB] opacity-70 block">Meeting Location & Notes</span>
                                <p className="font-normal whitespace-pre-wrap">{selectedMatchDetails.handoff_notes || 'No location notes provided.'}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-[#2563EB]/30 pt-3">
                            <Button variant="secondary" onClick={() => setSelectedMatchDetails(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function HistoryPage({ role }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter, Search, Date Range, Sort & Pagination States
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [page, setPage] = useState(1);
    const pageSize = 8;

    // Detail & Receipt Modals
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [receiptModal, setReceiptModal] = useState(null);

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'food', label: 'Food & Meals' },
        { value: 'clothing', label: 'Clothing & Apparel' },
        { value: 'books', label: 'Educational & Books' },
        { value: 'medical', label: 'Medical & Health Supplies' },
        { value: 'electronics', label: 'Electronics & Tech' },
        { value: 'household', label: 'Household & Bedding' },
        { value: 'hygiene', label: 'Personal Care & Hygiene' },
        { value: 'emergency', label: 'Emergency & Disaster Relief' },
        { value: 'other', label: 'Other Useful Items' },
    ];

    const loadData = () => {
        setLoading(true);
        setError('');
        const endpoint = role === 'donor' ? '/donations?mine=1' : '/requests?mine=1';
        api.get(endpoint)
            .then((r) => {
                setItems(r.data.data || r.data || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Could not load your history records.');
                setLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, [role]);

    const isDonor = role === 'donor';

    // Summary KPI Counts
    const totalCount = items.length;
    const completedCount = items.filter((x) => ['fulfilled', 'matched', 'confirmed'].includes(x.status)).length;
    const activeCount = items.filter((x) => ['pending_match', 'proposed', 'pending_review', 'approved'].includes(x.status)).length;
    const cancelledCount = items.filter((x) => ['cancelled', 'rejected'].includes(x.status)).length;

    // Filter Logic
    const filtered = items.filter((x) => {
        const itemName = (x.item_name || title(x.category) || '').toLowerCase();
        const cat = (x.category || '').toLowerCase();
        const refId = String(x.id);
        const q = search.toLowerCase().trim();

        if (q && !itemName.includes(q) && !cat.includes(q) && !refId.includes(q)) {
            return false;
        }

        if (categoryFilter !== 'all' && cat !== categoryFilter.toLowerCase()) {
            return false;
        }

        if (statusFilter !== 'all') {
            const st = (x.status || '').toLowerCase();
            if (statusFilter === 'completed' && !['fulfilled', 'matched', 'confirmed'].includes(st)) return false;
            if (statusFilter === 'active' && !['pending_match', 'proposed', 'pending_review', 'approved'].includes(st)) return false;
            if (statusFilter === 'cancelled' && !['cancelled', 'rejected'].includes(st)) return false;
            if (
                statusFilter !== 'completed' &&
                statusFilter !== 'active' &&
                statusFilter !== 'cancelled' &&
                st !== statusFilter.toLowerCase()
            ) {
                return false;
            }
        }

        const createdDate = new Date(x.created_at);
        if (dateFrom && createdDate < new Date(dateFrom)) return false;
        if (dateTo) {
            const toDateObj = new Date(dateTo);
            toDateObj.setHours(23, 59, 59, 999);
            if (createdDate > toDateObj) return false;
        }

        return true;
    });

    // Sorting Logic
    filtered.sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'date_asc') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        if (sortBy === 'name_asc') {
            return (a.item_name || title(a.category)).localeCompare(b.item_name || title(b.category));
        }
        if (sortBy === 'name_desc') {
            return (b.item_name || title(b.category)).localeCompare(a.item_name || title(a.category));
        }
        if (sortBy === 'qty_desc') {
            return (b.quantity || b.quantity_needed || 0) - (a.quantity || a.quantity_needed || 0);
        }
        return 0;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    const resetFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
        setSortBy('date_desc');
        setPage(1);
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return 'N/A';
        return new Date(isoStr).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handlePrintReceipt = (item) => {
        setReceiptModal(item);
        setTimeout(() => window.print(), 350);
    };

    return (
        <main className="page max-w-7xl">
            <p className="eyebrow">HISTORICAL ARCHIVE</p>
            <h1 className="page-title">{isDonor ? 'Donation History' : 'Request History'}</h1>
            <p className="page-copy">
                View your past {isDonor ? 'donations' : 'aid requests'} and historical activity records.
            </p>

            {/* Summary KPI Statistics Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB] opacity-75">
                            Total {isDonor ? 'Donations' : 'Requests'}
                        </p>
                        <h3 className="mt-1 text-2xl font-extrabold text-[#2563EB]">{totalCount}</h3>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="history" size={24} />
                    </div>
                </div>

                {/* Completed */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#22C55E]">
                            Completed
                        </p>
                        <h3 className="mt-1 text-2xl font-extrabold text-[#22C55E]">{completedCount}</h3>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="check" size={24} />
                    </div>
                </div>

                {/* Active */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">
                            Active / Open
                        </p>
                        <h3 className="mt-1 text-2xl font-extrabold text-[#2563EB]">{activeCount}</h3>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="activity" size={24} />
                    </div>
                </div>

                {/* Cancelled */}
                <div className="panel p-5 text-[#2563EB] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB] opacity-75">
                            Cancelled / Issues
                        </p>
                        <h3 className="mt-1 text-2xl font-extrabold text-[#2563EB]">{cancelledCount}</h3>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="decline" size={24} />
                    </div>
                </div>
            </div>

            {/* Filter, Search & Sort Panel */}
            <div className="panel mt-8 p-4 sm:p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Search */}
                    <div className="relative lg:col-span-1">
                        <label htmlFor="h_search" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Search Records
                        </label>
                        <div className="relative">
                            <input
                                id="h_search"
                                type="text"
                                placeholder="Search ID, item, category..."
                                className="field pr-8 text-xs"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2563EB]">
                                <Icon name="search" size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label htmlFor="h_category" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Category
                        </label>
                        <select
                            id="h_category"
                            className="field text-xs"
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label htmlFor="h_status" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Status
                        </label>
                        <select
                            id="h_status"
                            className="field text-xs"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed / Fulfilled</option>
                            <option value="active">Active / Pending</option>
                            <option value="cancelled">Cancelled / Rejected</option>
                        </select>
                    </div>

                    {/* Date From */}
                    <div>
                        <label htmlFor="h_date_from" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Date From
                        </label>
                        <input
                            id="h_date_from"
                            type="date"
                            className="field text-xs"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    {/* Date To & Sort */}
                    <div>
                        <label htmlFor="h_sort" className="block text-xs font-bold text-[#2563EB] mb-1">
                            Sort By
                        </label>
                        <select
                            id="h_sort"
                            className="field text-xs"
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="date_desc">Latest Date First</option>
                            <option value="date_asc">Oldest Date First</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                            <option value="qty_desc">Quantity (High to Low)</option>
                        </select>
                    </div>
                </div>

                {/* Filter Summary & Reset Action */}
                {(search || categoryFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo || sortBy !== 'date_desc') && (
                    <div className="flex items-center justify-between border-t border-[#2563EB]/20 pt-3 text-xs font-bold text-[#2563EB]">
                        <span>
                            Showing filtered results ({filtered.length} entry{filtered.length === 1 ? '' : 'ies'})
                        </span>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 font-extrabold text-[#22C55E] underline hover:text-[#2563EB]"
                            onClick={resetFilters}
                        >
                            <Icon name="close" size={14} /> Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message Banner */}
            {error && <Error>{error}</Error>}

            {/* Main History Table / List Area */}
            <div className="mt-8">
                {loading ? (
                    <div className="panel p-6 animate-pulse space-y-4">
                        <div className="h-6 w-1/3 rounded bg-[#2563EB]/20" />
                        <div className="h-10 w-full rounded bg-[#2563EB]/10" />
                        <div className="h-10 w-full rounded bg-[#2563EB]/10" />
                        <div className="h-10 w-full rounded bg-[#2563EB]/10" />
                    </div>
                ) : !items.length ? (
                    /* Empty State when user has zero records */
                    <div className="panel p-10 text-center">
                        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#2563EB] text-white">
                            <Icon name="donation" size={28} />
                        </div>
                        <h3 className="text-base font-extrabold text-[#2563EB]">No historical entries found</h3>
                        <p className="mt-1 text-xs text-[#2563EB] opacity-80 max-w-sm mx-auto">
                            {isDonor
                                ? "You haven't listed any donations yet. Share a resource today to help campus members in need!"
                                : "You haven't submitted any support requests yet."}
                        </p>
                        {isDonor && (
                            <div className="mt-5">
                                <Link to="/donate" className="no-underline">
                                    <Button variant="primary">
                                        <Icon name="plus" className="mr-1.5" /> Make a Donation
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                ) : !paginatedItems.length ? (
                    /* Empty State for filtered result */
                    <div className="panel p-8 text-center">
                        <p className="font-extrabold text-sm text-[#2563EB]">No records match your active filters</p>
                        <p className="mt-1 text-xs text-[#2563EB] opacity-80">
                            Try adjusting your search query, status, or date range filters.
                        </p>
                        <Button variant="secondary" className="mt-4 text-xs" onClick={resetFilters}>
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Table for Desktop & Tablet */}
                        <div className="hidden sm:block table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Ref ID</th>
                                        <th>Item / Category</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                        <th>Date Created</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((x) => {
                                        const refId = `#${isDonor ? 'DN' : 'REQ'}-${String(x.id).padStart(3, '0')}`;
                                        const isCompleted = ['fulfilled', 'matched', 'confirmed'].includes(x.status);

                                        return (
                                            <tr key={x.id}>
                                                <td className="font-mono text-xs font-bold text-[#2563EB]">{refId}</td>
                                                <td>
                                                    <div className="font-extrabold text-[#2563EB]">
                                                        {x.item_name || title(x.category)}
                                                    </div>
                                                    <div className="text-[11px] font-bold text-[#2563EB] opacity-75 uppercase">
                                                        {x.category}
                                                    </div>
                                                </td>
                                                <td className="font-bold text-[#2563EB]">{x.quantity || x.quantity_needed} unit(s)</td>
                                                <td>
                                                    <Badge status={x.status} />
                                                </td>
                                                <td className="text-xs font-bold text-[#2563EB]">{formatDate(x.created_at)}</td>
                                                <td className="text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <Button
                                                            variant="secondary"
                                                            className="py-1 px-2.5 text-xs"
                                                            onClick={() => setSelectedDonation(x)}
                                                        >
                                                            <Icon name="info" className="mr-1" size={13} /> Details
                                                        </Button>
                                                        {isCompleted && (
                                                            <Button
                                                                variant="success"
                                                                className="py-1 px-2.5 text-xs"
                                                                onClick={() => handlePrintReceipt(x)}
                                                            >
                                                                <Icon name="save" className="mr-1" size={13} /> Receipt
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards view for Mobile */}
                        <div className="sm:hidden space-y-4">
                            {paginatedItems.map((x) => {
                                const refId = `#${isDonor ? 'DN' : 'REQ'}-${String(x.id).padStart(3, '0')}`;
                                const isCompleted = ['fulfilled', 'matched', 'confirmed'].includes(x.status);

                                return (
                                    <div key={x.id} className="panel p-5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-2">
                                            <span className="font-mono text-xs font-bold text-[#2563EB]">{refId}</span>
                                            <Badge status={x.status} />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-base text-[#2563EB]">
                                                {x.item_name || title(x.category)}
                                            </h4>
                                            <p className="text-xs font-bold text-[#2563EB] uppercase opacity-75">
                                                {x.category} • {x.quantity || x.quantity_needed} unit(s)
                                            </p>
                                            <p className="text-[11px] text-[#2563EB] mt-1">
                                                Date: {formatDate(x.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2563EB]/20">
                                            <Button
                                                variant="secondary"
                                                className="py-1 px-3 text-xs"
                                                onClick={() => setSelectedDonation(x)}
                                            >
                                                <Icon name="info" className="mr-1" size={13} /> Details
                                            </Button>
                                            {isCompleted && (
                                                <Button
                                                    variant="success"
                                                    className="py-1 px-3 text-xs"
                                                    onClick={() => handlePrintReceipt(x)}
                                                >
                                                    <Icon name="save" className="mr-1" size={13} /> Receipt
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#2563EB] pt-4 text-xs font-bold text-[#2563EB]">
                                <div>
                                    Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} records
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        className="py-1 px-3 text-xs"
                                        disabled={currentPage <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Button>

                                    <span className="px-2">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <Button
                                        variant="secondary"
                                        className="py-1 px-3 text-xs"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Donation Record Details Modal */}
            {selectedDonation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4">
                    <div className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 text-[#2563EB] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#2563EB] pb-3">
                            <div className="flex items-center gap-2">
                                <Icon name="history" size={20} className="text-[#2563EB]" />
                                <h2 className="text-lg font-extrabold text-[#2563EB]">
                                    Record #{isDonor ? 'DN' : 'REQ'}-{String(selectedDonation.id).padStart(3, '0')}
                                </h2>
                            </div>
                            <button
                                type="button"
                                title="Close"
                                className="nav-link p-1"
                                onClick={() => setSelectedDonation(null)}
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-xs font-bold">
                            <div className="flex items-center justify-between border-b border-[#2563EB]/30 pb-2">
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Item Name & Category</span>
                                    <span className="text-base font-extrabold">
                                        {selectedDonation.item_name || title(selectedDonation.category)}
                                    </span>
                                    <span className="ml-2 uppercase text-[10px] rounded border border-[#22C55E] bg-[#22C55E] text-white px-1.5 py-0.5">
                                        {selectedDonation.category}
                                    </span>
                                </div>
                                <Badge status={selectedDonation.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-b border-[#2563EB]/30 pb-2">
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Quantity</span>
                                    <span>{selectedDonation.quantity || selectedDonation.quantity_needed} unit(s)</span>
                                </div>
                                <div>
                                    <span className="text-[#2563EB] opacity-70 block">Date Created</span>
                                    <span>{formatDate(selectedDonation.created_at)}</span>
                                </div>
                            </div>

                            {selectedDonation.condition_notes && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Condition Notes & Description</span>
                                    <p className="font-normal whitespace-pre-wrap">{selectedDonation.condition_notes}</p>
                                </div>
                            )}

                            {selectedDonation.pickup_location && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Pickup Location</span>
                                    <span>{selectedDonation.pickup_location}</span>
                                </div>
                            )}

                            {selectedDonation.availability_window && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Availability Window</span>
                                    <span>{selectedDonation.availability_window}</span>
                                </div>
                            )}

                            {selectedDonation.preferred_handoff_slots && (
                                <div className="border-b border-[#2563EB]/30 pb-2">
                                    <span className="text-[#2563EB] opacity-70 block">Preferred Handoff Schedule</span>
                                    <span>{selectedDonation.preferred_handoff_slots}</span>
                                </div>
                            )}

                            {(selectedDonation.image_path || selectedDonation.image_url) && (
                                <div className="pt-2 border-t border-[#2563EB]/30">
                                    <span className="text-[#2563EB] opacity-70 block mb-1">Uploaded Item Photo</span>
                                    <img
                                        src={selectedDonation.image_url || `/storage/${selectedDonation.image_path}`}
                                        alt="Donation Photo"
                                        className="h-28 w-28 rounded-lg border border-[#2563EB] object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#2563EB]/30 pt-3">
                            <Button variant="secondary" onClick={() => setSelectedDonation(null)}>
                                Close
                            </Button>
                            {['fulfilled', 'matched', 'confirmed'].includes(selectedDonation.status) && (
                                <Button variant="success" onClick={() => handlePrintReceipt(selectedDonation)}>
                                    <Icon name="save" className="mr-1" /> Official Receipt
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Official Printable Donation Receipt Modal */}
            {receiptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2563EB]/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static print:inset-auto">
                    <div className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-8 text-[#2563EB] shadow-2xl bg-white print:border-none print:shadow-none print:max-w-none print:h-auto">
                        {/* Header Branding */}
                        <div className="flex items-center justify-between border-b-2 border-[#2563EB] pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/relieflink-logo.png"
                                    className="h-12 w-12 rounded-lg border border-[#2563EB] object-cover"
                                    alt="ReliefLink Logo"
                                />
                                <div>
                                    <h2 className="text-xl font-extrabold text-[#2563EB] leading-tight">ReliefLink</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] opacity-80">
                                        Campus Resource Exchange Network
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="rounded-md border border-[#22C55E] bg-[#22C55E] text-white px-2 py-1 text-xs font-extrabold uppercase">
                                    VERIFIED RECEIPT
                                </span>
                                <p className="mt-1 text-xs font-mono font-bold text-[#2563EB]">
                                    RL-REC-{new Date().getFullYear()}-{String(receiptModal.id).padStart(4, '0')}
                                </p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-extrabold text-[#2563EB] uppercase tracking-wide">
                                Official Donation & Impact Receipt
                            </h3>
                            <p className="text-xs font-semibold text-[#2563EB] opacity-80">
                                Thank you for making a difference in the campus community.
                            </p>
                        </div>

                        {/* Summary Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#2563EB] p-4 bg-white text-xs font-bold mb-6">
                            <div>
                                <span className="text-[#2563EB] opacity-70 block">Donor Name</span>
                                <span className="text-sm font-extrabold">{user?.name || 'Campus Donor'}</span>
                            </div>
                            <div>
                                <span className="text-[#2563EB] opacity-70 block">Donor Email</span>
                                <span>{user?.email || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-[#2563EB] opacity-70 block">Issue Date</span>
                                <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div>
                                <span className="text-[#2563EB] opacity-70 block">Completion Status</span>
                                <span className="text-[#22C55E] font-extrabold uppercase">✓ FULFILLED</span>
                            </div>
                        </div>

                        {/* Item Details Table */}
                        <div className="border border-[#2563EB] rounded-xl overflow-hidden mb-6">
                            <table className="w-full text-xs font-bold text-left border-collapse">
                                <thead className="bg-[#2563EB] text-white">
                                    <tr>
                                        <th className="p-3">Item Description</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3 text-right">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-[#2563EB]">
                                        <td className="p-3 text-sm font-extrabold text-[#2563EB]">
                                            {receiptModal.item_name || title(receiptModal.category)}
                                        </td>
                                        <td className="p-3 uppercase text-[#2563EB]">{receiptModal.category}</td>
                                        <td className="p-3 text-right text-sm font-extrabold text-[#2563EB]">
                                            {receiptModal.quantity || receiptModal.quantity_needed} unit(s)
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Location & Log notes if any */}
                        {receiptModal.pickup_location && (
                            <div className="mb-6 rounded-xl border border-[#2563EB]/40 p-3 text-xs font-bold text-[#2563EB]">
                                <span className="opacity-70 block">Pickup Location / Log</span>
                                <span>{receiptModal.pickup_location}</span>
                            </div>
                        )}

                        {/* Impact Statement */}
                        <div className="rounded-xl border border-[#22C55E] bg-white p-4 text-xs font-bold text-[#2563EB] text-center mb-6">
                            <p className="text-[#22C55E] font-extrabold mb-1">🌱 Verified Campus Impact</p>
                            <p className="font-normal opacity-90 leading-relaxed">
                                This document confirms that the above resource was contributed to the ReliefLink Campus Exchange network and has been matched with student community needs.
                            </p>
                        </div>

                        {/* Action Buttons (Hidden on Print) */}
                        <div className="flex items-center justify-end gap-3 border-t border-[#2563EB] pt-4 print:hidden">
                            <Button variant="secondary" onClick={() => setReceiptModal(null)}>
                                Close
                            </Button>
                            <Button variant="success" onClick={() => window.print()}>
                                <Icon name="save" className="mr-1" /> Print / Save PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function AdminCategories(){
    const {user} = useAuth();
    const [categories, setCategories] = useState([
        { id: 1, name: 'Food & Nutrition', slug: 'food', status: 'active' },
        { id: 2, name: 'Clothing & Apparel', slug: 'clothing', status: 'active' },
        { id: 3, name: 'Hygiene & Personal Care', slug: 'hygiene', status: 'active' },
        { id: 4, name: 'School Supplies', slug: 'school supplies', status: 'active' },
        { id: 5, name: 'Textbooks & Academic Books', slug: 'books', status: 'active' },
        { id: 6, name: 'Technology & Devices', slug: 'technology', status: 'active' },
        { id: 7, name: 'Medical & Health Essentials', slug: 'medical', status: 'active' },
        { id: 8, name: 'Housing & Household Items', slug: 'housing', status: 'active' }
    ]);
    const [donations, setDonations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');
    
    const [addingCategory, setAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [inspectingCategory, setInspectingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get('/admin/donations').then(r => setDonations(r.data.data || r.data || [])).catch(() => {}),
            api.get('/admin/requests').then(r => setRequests(r.data.data || r.data || [])).catch(() => {})
        ]).finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    if (user?.role !== 'admin') return <Navigate to={getRoleDashboard(user?.role)} replace/>;

    const getItemCount = slug => {
        const dCount = donations.filter(d => (d.category || '').toLowerCase() === slug.toLowerCase()).length;
        const rCount = requests.filter(r => (r.category || '').toLowerCase() === slug.toLowerCase()).length;
        return dCount + rCount;
    };

    let filtered = categories.filter(cat => {
        const matchesStatus = statusFilter === 'all' || cat.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search || cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    filtered.sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'count_desc') return getItemCount(b.slug) - getItemCount(a.slug);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.status === 'active').length;
    const inactiveCategories = categories.filter(c => c.status === 'inactive').length;
    const totalListings = donations.length + requests.length;

    const handleAddCategory = e => {
        e.preventDefault();
        setFormError('');
        const name = e.target.cat_name.value.trim();
        const slug = e.target.cat_slug.value.trim().toLowerCase().replace(/\s+/g, '-');
        if (!name || !slug) {
            setFormError('Category name and slug are required.');
            return;
        }
        if (categories.some(c => c.slug === slug)) {
            setFormError('A category with this slug already exists.');
            return;
        }

        const newCat = { id: Date.now(), name, slug, status: 'active' };
        setCategories([...categories, newCat]);
        setAddingCategory(false);
        setSuccessMessage(`Category "${name}" was created successfully.`);
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const handleUpdateCategory = e => {
        e.preventDefault();
        setFormError('');
        const name = e.target.cat_name.value.trim();
        const slug = e.target.cat_slug.value.trim().toLowerCase().replace(/\s+/g, '-');
        if (!name || !slug) {
            setFormError('Category name and slug are required.');
            return;
        }

        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name, slug } : c));
        setEditingCategory(null);
        setSuccessMessage(`Category "${name}" was updated successfully.`);
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const toggleStatus = id => {
        setCategories(categories.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
    };

    const confirmDelete = () => {
        if (!deletingCategory) return;
        const count = getItemCount(deletingCategory.slug);
        if (count > 0) {
            alert(`Cannot delete category "${deletingCategory.name}" because it currently has ${count} active listing(s). Please reassign or remove the items first.`);
            setDeletingCategory(null);
            return;
        }

        const catName = deletingCategory.name;
        setCategories(categories.filter(c => c.id !== deletingCategory.id));
        setDeletingCategory(null);
        setSuccessMessage(`Category "${catName}" was successfully deleted.`);
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">SYSTEM MANAGEMENT</p>
                    <h1 className="page-title">Resource Categories</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Configure, create, and organize campus donation and aid request categories.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" onClick={loadData} loading={loading}>
                        <Icon name="activity"/>
                        <span className="ml-1 text-xs">Refresh Backend</span>
                    </Button>
                    <Button onClick={() => { setFormError(''); setAddingCategory(true); }}>
                        <Icon name="plus"/>
                        <span className="ml-1 text-xs">Add New Category</span>
                    </Button>
                </div>
            </div>

            {successMessage && (
                <div className="rounded-xl border border-[#22C55E] bg-white p-4 text-sm font-bold text-[#22C55E] shadow-sm flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="text-[#22C55E] hover:underline font-extrabold text-xs">Dismiss</button>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Total Categories</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{totalCategories}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="categories"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Active Categories</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{activeCategories}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-white text-[#22C55E]">
                        <Icon name="check"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Inactive Categories</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{inactiveCategories}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="decline"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Total Active Listings</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{totalListings}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="donation"/>
                    </span>
                </article>
            </div>

            <div className="panel p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Search Categories</label>
                    <input
                        type="text"
                        placeholder="Search by category name or slug..."
                        className="field w-full text-sm"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Status Filter</label>
                    <select
                        className="field w-full text-sm"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Sort By</label>
                    <select
                        className="field w-full text-sm"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                        <option value="count_desc">Listings (High to Low)</option>
                        <option value="status">Status</option>
                    </select>
                </div>
            </div>

            {!filtered.length ? (
                <div className="panel p-8 text-center">
                    <p className="font-bold text-[#2563EB] text-lg">No resource categories found.</p>
                    <p className="text-xs text-[#2563EB]/80 font-semibold mt-1">Click "Add New Category" to create a new category.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="hidden sm:block table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Category Name</th>
                                    <th>Slug</th>
                                    <th>Active Listings</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(cat => {
                                    const count = getItemCount(cat.slug);
                                    return (
                                        <tr key={cat.id}>
                                            <td>
                                                <strong className="text-base text-[#2563EB]">{cat.name}</strong>
                                            </td>
                                            <td>
                                                <code className="text-xs font-bold bg-[#2563EB]/5 text-[#2563EB] px-2 py-0.5 rounded border border-[#2563EB]/20">{cat.slug}</code>
                                            </td>
                                            <td>
                                                <strong className="text-sm text-[#2563EB]">{count} listings</strong>
                                            </td>
                                            <td>
                                                <Badge status={cat.status}/>
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button title="View Associated Listings" variant="secondary" onClick={() => setInspectingCategory(cat)}>
                                                        <Icon name="eye"/>
                                                        <span className="ml-1 text-xs">View ({count})</span>
                                                    </Button>
                                                    <Button title="Edit Category" variant="secondary" onClick={() => { setFormError(''); setEditingCategory(cat); }}>
                                                        <Icon name="edit"/>
                                                        <span className="ml-1 text-xs">Edit</span>
                                                    </Button>
                                                    <Button
                                                        title={cat.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        variant="secondary"
                                                        onClick={() => toggleStatus(cat.id)}
                                                    >
                                                        <span className="text-xs">{cat.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                                                    </Button>
                                                    <Button title="Delete Category" variant="secondary" onClick={() => setDeletingCategory(cat)}>
                                                        <Icon name="delete"/>
                                                        <span className="ml-1 text-xs">Delete</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 sm:hidden">
                        {paginated.map(cat => {
                            const count = getItemCount(cat.slug);
                            return (
                                <article key={cat.id} className="panel p-4 space-y-3 bg-white">
                                    <div className="flex items-start justify-between gap-2 border-b border-[#2563EB]/15 pb-2">
                                        <div>
                                            <strong className="text-base text-[#2563EB] block">{cat.name}</strong>
                                            <code className="text-[11px] font-bold bg-[#2563EB]/5 text-[#2563EB] px-1.5 py-0.5 rounded border border-[#2563EB]/20">{cat.slug}</code>
                                        </div>
                                        <Badge status={cat.status}/>
                                    </div>
                                    <p className="text-xs font-bold text-[#2563EB]">
                                        Active Listings: <strong>{count} items</strong>
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Button title="View Associated Listings" variant="secondary" onClick={() => setInspectingCategory(cat)}>
                                            <Icon name="eye"/>
                                            <span className="ml-1 text-xs">View ({count})</span>
                                        </Button>
                                        <Button title="Edit Category" variant="secondary" onClick={() => { setFormError(''); setEditingCategory(cat); }}>
                                            <Icon name="edit"/>
                                            <span className="ml-1 text-xs">Edit</span>
                                        </Button>
                                        <Button
                                            title={cat.status === 'active' ? 'Deactivate' : 'Activate'}
                                            variant="secondary"
                                            onClick={() => toggleStatus(cat.id)}
                                        >
                                            <span className="text-xs">{cat.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                                        </Button>
                                        <Button title="Delete Category" variant="secondary" onClick={() => setDeletingCategory(cat)}>
                                            <Icon name="delete"/>
                                            <span className="ml-1 text-xs">Delete</span>
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="panel p-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xs font-bold text-[#2563EB]">
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} categories
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &larr; Previous
                                </Button>
                                <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next &rarr;
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {addingCategory && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <form className="panel w-full max-w-md p-6 bg-white space-y-4" onSubmit={handleAddCategory}>
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Add New Resource Category</h2>
                            <button type="button" className="nav-link p-1" onClick={() => setAddingCategory(false)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        {formError && (
                            <p className="rounded-xl border border-[#2563EB] p-3 text-xs font-bold text-[#2563EB] bg-[#2563EB]/5">{formError}</p>
                        )}
                        <label className="block text-xs font-bold text-[#2563EB]">
                            Category Name
                            <input name="cat_name" required className="field mt-1 text-sm w-full" placeholder="e.g. Winter Clothing"/>
                        </label>
                        <label className="block text-xs font-bold text-[#2563EB]">
                            Category Slug
                            <input name="cat_slug" required className="field mt-1 text-sm w-full" placeholder="e.g. winter-clothing"/>
                        </label>
                        <div className="flex gap-3 pt-2">
                            <Button>Create Category</Button>
                            <Button type="button" variant="secondary" onClick={() => setAddingCategory(false)}>Cancel</Button>
                        </div>
                    </form>
                </div>
            )}

            {editingCategory && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <form className="panel w-full max-w-md p-6 bg-white space-y-4" onSubmit={handleUpdateCategory}>
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Edit Category</h2>
                            <button type="button" className="nav-link p-1" onClick={() => setEditingCategory(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        {formError && (
                            <p className="rounded-xl border border-[#2563EB] p-3 text-xs font-bold text-[#2563EB] bg-[#2563EB]/5">{formError}</p>
                        )}
                        <label className="block text-xs font-bold text-[#2563EB]">
                            Category Name
                            <input name="cat_name" required defaultValue={editingCategory.name} className="field mt-1 text-sm w-full"/>
                        </label>
                        <label className="block text-xs font-bold text-[#2563EB]">
                            Category Slug
                            <input name="cat_slug" required defaultValue={editingCategory.slug} className="field mt-1 text-sm w-full"/>
                        </label>
                        <div className="flex gap-3 pt-2">
                            <Button>Save Changes</Button>
                            <Button type="button" variant="secondary" onClick={() => setEditingCategory(null)}>Cancel</Button>
                        </div>
                    </form>
                </div>
            )}

            {inspectingCategory && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-lg p-6 bg-white space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Category Listings Inspection</h2>
                            <button className="nav-link p-1" onClick={() => setInspectingCategory(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-[#2563EB]/70 uppercase">Category: {inspectingCategory.slug}</span>
                            <h3 className="text-xl font-extrabold text-[#2563EB] mt-0.5">{inspectingCategory.name}</h3>
                        </div>

                        <div className="space-y-3 border-t border-b border-[#2563EB]/20 py-3 text-xs">
                            <p className="font-extrabold text-sm text-[#2563EB]">Associated Donations ({donations.filter(d => (d.category || '').toLowerCase() === inspectingCategory.slug.toLowerCase()).length})</p>
                            {donations.filter(d => (d.category || '').toLowerCase() === inspectingCategory.slug.toLowerCase()).map(d => (
                                <div key={d.id} className="p-2.5 rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 flex justify-between items-center">
                                    <div>
                                        <strong className="text-[#2563EB] block">{d.item_name}</strong>
                                        <span className="text-[#2563EB]/70 font-semibold">Donor: {d.donor?.name || 'Campus Donor'} • {d.quantity || 1} units</span>
                                    </div>
                                    <Badge status={d.status}/>
                                </div>
                            ))}

                            <p className="font-extrabold text-sm text-[#2563EB] pt-2">Associated Support Requests ({requests.filter(r => (r.category || '').toLowerCase() === inspectingCategory.slug.toLowerCase()).length})</p>
                            {requests.filter(r => (r.category || '').toLowerCase() === inspectingCategory.slug.toLowerCase()).map(r => (
                                <div key={r.id} className="p-2.5 rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 flex justify-between items-center">
                                    <div>
                                        <strong className="text-[#2563EB] block">{r.category}</strong>
                                        <span className="text-[#2563EB]/70 font-semibold">Requester: {r.beneficiary?.name || 'Student'} • {r.quantity_needed} needed</span>
                                    </div>
                                    <Badge status={r.status}/>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-1">
                            <Button variant="secondary" onClick={() => setInspectingCategory(null)}>
                                Close Inspection
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deletingCategory && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Confirm Delete Category</h2>
                            <button className="nav-link p-1" onClick={() => setDeletingCategory(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to delete category <strong>"{deletingCategory.name}"</strong>?
                        </p>
                        {getItemCount(deletingCategory.slug) > 0 ? (
                            <p className="text-xs font-extrabold text-[#2563EB] bg-[#2563EB]/5 p-3 rounded-lg border border-[#2563EB]/20">
                                ⚠️ Warning: This category currently has {getItemCount(deletingCategory.slug)} active listing(s). You must reassign or clear these items before deletion.
                            </p>
                        ) : (
                            <p className="text-xs font-bold text-[#2563EB]/70">
                                This action cannot be undone.
                            </p>
                        )}
                        <div className="flex flex-wrap gap-3 pt-3">
                            <Button disabled={getItemCount(deletingCategory.slug) > 0} onClick={confirmDelete}>
                                <Icon name="delete"/>
                                <span className="ml-1">Confirm Delete</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setDeletingCategory(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function AdminApprovals(){
    const {user} = useAuth();
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending_review');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('urgency_desc');
    const [actionLoading, setActionLoading] = useState(false);
    
    const [inspectingRequest, setInspectingRequest] = useState(null);
    const [approvingRequest, setApprovingRequest] = useState(null);
    const [decliningRequest, setDecliningRequest] = useState(null);
    const [declineReason, setDeclineReason] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const loadData = () => {
        setLoading(true);
        setError('');
        api.get('/admin/requests')
            .then(r => {
                setAllRequests(r.data.data || r.data || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load moderation requests.');
                setLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, []);

    if (!['admin', 'staff'].includes(user?.role)) return <Navigate to={getRoleDashboard(user?.role)} replace/>;

    let filtered = allRequests.filter(req => {
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || req.category === categoryFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            (req.category && req.category.toLowerCase().includes(q)) ||
            (req.beneficiary?.name && req.beneficiary.name.toLowerCase().includes(q)) ||
            (req.justification && req.justification.toLowerCase().includes(q));

        return matchesStatus && matchesCategory && matchesSearch;
    });

    const urgencyWeight = { high: 3, medium: 2, low: 1 };

    filtered.sort((a, b) => {
        if (sortBy === 'urgency_desc') return (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0);
        if (sortBy === 'date_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalCount = allRequests.length;
    const pendingCount = allRequests.filter(r => r.status === 'pending_review' || r.status === 'proposed').length;
    const approvedCount = allRequests.filter(r => r.status === 'approved' || r.status === 'matched').length;
    const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;

    const commitStatusUpdate = async (id, status) => {
        setActionLoading(true);
        setError('');
        try {
            await api.patch(`/admin/requests/${id}`, { status });
            if (inspectingRequest?.id === id) setInspectingRequest(null);
            setApprovingRequest(null);
            setDecliningRequest(null);
            loadData();
        } catch(e) {
            setError(e.response?.data?.message || 'Could not update request status.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">MODERATION QUEUE</p>
                    <h1 className="page-title">Approvals & Verification</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Review, verify, authorize, or decline submitted beneficiary aid requests.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" onClick={loadData} loading={loading}>
                        <Icon name="activity"/>
                        <span className="ml-1 text-xs">Refresh Queue</span>
                    </Button>
                </div>
            </div>

            <Error>{error}</Error>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Pending Review</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{pendingCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="approvals"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Approved Requests</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{approvedCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-white text-[#22C55E]">
                        <Icon name="check"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Declined Requests</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{rejectedCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="decline"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Total Requests</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{totalCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="request"/>
                    </span>
                </article>
            </div>

            <div className="panel p-4 sm:p-5 space-y-4 bg-white">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#2563EB]/15 pb-3">
                    <button
                        className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${statusFilter === 'pending_review' ? 'bg-[#2563EB] text-white border border-[#2563EB]' : 'bg-white text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#2563EB]/10'}`}
                        onClick={() => { setStatusFilter('pending_review'); setPage(1); }}
                    >
                        Pending Moderation Queue ({pendingCount})
                    </button>
                    <button
                        className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${statusFilter === 'all' ? 'bg-[#2563EB] text-white border border-[#2563EB]' : 'bg-white text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#2563EB]/10'}`}
                        onClick={() => { setStatusFilter('all'); setPage(1); }}
                    >
                        All Submitted Requests ({totalCount})
                    </button>
                    <button
                        className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${statusFilter === 'approved' ? 'bg-[#22C55E] text-white border border-[#22C55E]' : 'bg-white text-[#22C55E] border border-[#22C55E]/30 hover:bg-[#22C55E]/10'}`}
                        onClick={() => { setStatusFilter('approved'); setPage(1); }}
                    >
                        Approved ({approvedCount})
                    </button>
                    <button
                        className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${statusFilter === 'rejected' ? 'bg-[#2563EB] text-white border border-[#2563EB]' : 'bg-white text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#2563EB]/10'}`}
                        onClick={() => { setStatusFilter('rejected'); setPage(1); }}
                    >
                        Declined ({rejectedCount})
                    </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Search Queue</label>
                        <input
                            type="text"
                            placeholder="Search by category, requester name, justification..."
                            className="field w-full text-sm"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Category</label>
                        <select
                            className="field w-full text-sm"
                            value={categoryFilter}
                            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Categories</option>
                            <option value="food">Food</option>
                            <option value="clothing">Clothing</option>
                            <option value="hygiene">Hygiene</option>
                            <option value="school supplies">School Supplies</option>
                            <option value="books">Books</option>
                            <option value="technology">Technology</option>
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Sort By</label>
                        <select
                            className="field w-full text-sm"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="urgency_desc">Urgency (High First)</option>
                            <option value="date_desc">Newest First</option>
                            <option value="category">Category</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="panel p-8 text-center font-bold text-[#2563EB]">
                    Loading moderation queue...
                </div>
            ) : !filtered.length ? (
                <div className="panel p-12 text-center bg-white space-y-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#22C55E] bg-[#22C55E] text-white mx-auto">
                        <Icon name="check"/>
                    </span>
                    <h3 className="font-extrabold text-[#2563EB] text-xl">All submitted requests have been reviewed!</h3>
                    <p className="text-xs text-[#2563EB]/80 font-semibold max-w-sm mx-auto">
                        There are currently no requests matching your search or filter criteria in the queue. New activity will appear here when ready.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginated.map(req => (
                        <article key={req.id} className="panel p-5 space-y-3 bg-white hover:border-[#22C55E] transition">
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2563EB]/15 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge status={req.urgency}/>
                                        <h3 className="text-lg font-extrabold text-[#2563EB]">{title(req.category)} ({req.quantity_needed} needed)</h3>
                                    </div>
                                    <p className="text-xs font-semibold text-[#2563EB]/80 mt-1">
                                        Requester: <strong className="text-[#2563EB]">{req.beneficiary?.name || 'Student Requester'}</strong>
                                        {req.beneficiary?.email && ` (${req.beneficiary.email})`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge status={req.status}/>
                                </div>
                            </div>

                            {req.justification && (
                                <p className="text-xs text-[#2563EB] bg-[#2563EB]/5 p-3 rounded-lg border border-[#2563EB]/20 italic leading-relaxed">
                                    "{req.justification}"
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <span className="text-[11px] font-bold text-[#2563EB]/60">
                                    Submitted: {req.created_at ? new Date(req.created_at).toLocaleString() : 'N/A'}
                                </span>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="secondary" onClick={() => setInspectingRequest(req)}>
                                        <Icon name="eye"/>
                                        <span className="ml-1 text-xs">View Details</span>
                                    </Button>

                                    {req.status === 'pending_review' && (
                                        <>
                                            <Button loading={actionLoading} onClick={() => setApprovingRequest(req)}>
                                                <Icon name="check"/>
                                                <span className="ml-1 text-xs">Approve Request</span>
                                            </Button>
                                            <Button variant="secondary" loading={actionLoading} onClick={() => { setDeclineReason(''); setDecliningRequest(req); }}>
                                                <Icon name="decline"/>
                                                <span className="ml-1 text-xs">Decline</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}

                    {totalPages > 1 && (
                        <div className="panel p-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xs font-bold text-[#2563EB]">
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} requests
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &larr; Previous
                                </Button>
                                <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next &rarr;
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {inspectingRequest && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-lg p-6 bg-white space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Support Request Inspection</h2>
                            <button className="nav-link p-1" onClick={() => setInspectingRequest(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <Badge status={inspectingRequest.urgency}/>
                                <Badge status={inspectingRequest.status}/>
                            </div>
                            <h3 className="text-xl font-extrabold text-[#2563EB] mt-2">{title(inspectingRequest.category)} ({inspectingRequest.quantity_needed} units)</h3>
                        </div>

                        <div className="space-y-2 border-t border-b border-[#2563EB]/20 py-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Requester Name:</span>
                                <span className="font-semibold text-[#2563EB]">{inspectingRequest.beneficiary?.name || 'Student Requester'}</span>
                            </div>
                            {inspectingRequest.beneficiary?.email && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-[#2563EB]/70">Requester Email:</span>
                                    <span className="font-semibold text-[#2563EB]">{inspectingRequest.beneficiary.email}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Quantity Needed:</span>
                                <span className="font-extrabold text-[#2563EB]">{inspectingRequest.quantity_needed} units</span>
                            </div>
                            {inspectingRequest.justification && (
                                <div className="pt-1">
                                    <span className="font-bold text-[#2563EB]/70 block">Justification / Needs Statement:</span>
                                    <p className="mt-1 text-xs text-[#2563EB] bg-[#2563EB]/5 p-3 rounded-lg border border-[#2563EB]/20 leading-relaxed">{inspectingRequest.justification}</p>
                                </div>
                            )}
                            {inspectingRequest.alternative_categories && (
                                <div className="pt-1">
                                    <span className="font-bold text-[#2563EB]/70 block">Alternative Acceptable Categories:</span>
                                    <p className="mt-1 text-xs text-[#2563EB] font-semibold">{inspectingRequest.alternative_categories}</p>
                                </div>
                            )}
                            <div className="flex justify-between pt-1">
                                <span className="font-bold text-[#2563EB]/70">Date Submitted:</span>
                                <span className="font-semibold text-[#2563EB]">
                                    {inspectingRequest.created_at ? new Date(inspectingRequest.created_at).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            {inspectingRequest.status === 'pending_review' && (
                                <div className="flex items-center gap-2">
                                    <Button loading={actionLoading} onClick={() => setApprovingRequest(inspectingRequest)}>
                                        <Icon name="check"/>
                                        <span className="ml-1">Approve Request</span>
                                    </Button>
                                    <Button variant="secondary" loading={actionLoading} onClick={() => { setDeclineReason(''); setDecliningRequest(inspectingRequest); }}>
                                        <Icon name="decline"/>
                                        <span className="ml-1">Decline</span>
                                    </Button>
                                </div>
                            )}
                            <Button variant="secondary" onClick={() => setInspectingRequest(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {approvingRequest && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Confirm Request Authorization</h2>
                            <button className="nav-link p-1" onClick={() => setApprovingRequest(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to approve support request for <strong>"{title(approvingRequest.category)}"</strong> requested by <strong>"{approvingRequest.beneficiary?.name || 'Student'}"</strong>?
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            This will authorize the request and add it to the active matching pool for pairing with available campus donations.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-3">
                            <Button loading={actionLoading} onClick={() => commitStatusUpdate(approvingRequest.id, 'approved')}>
                                <Icon name="check"/>
                                <span className="ml-1">Authorize & Approve</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setApprovingRequest(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {decliningRequest && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Decline Support Request</h2>
                            <button className="nav-link p-1" onClick={() => setDecliningRequest(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to decline support request for <strong>"{title(decliningRequest.category)}"</strong>?
                        </p>
                        <label className="block text-xs font-bold text-[#2563EB]">
                            Decline Reason / Administrative Feedback (Optional)
                            <textarea
                                className="field mt-1 w-full text-xs"
                                rows="3"
                                placeholder="State reason for declining..."
                                value={declineReason}
                                onChange={e => setDeclineReason(e.target.value)}
                            />
                        </label>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button loading={actionLoading} onClick={() => commitStatusUpdate(decliningRequest.id, 'rejected')}>
                                <Icon name="decline"/>
                                <span className="ml-1">Decline Request</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setDecliningRequest(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function AdminAnnouncements(){
    const {user} = useAuth();
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            headline: 'Winter Clothes & Apparel Donation Drive Active',
            audience: 'All Members',
            priority: 'urgent',
            message: 'We are accepting warm winter coats, jackets, and thermal clothing at the Student Center drop-off point starting today.',
            status: 'published',
            author: 'Admin Office',
            created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
        },
        {
            id: 2,
            headline: 'Textbook Exchange Policy Updated for Spring Semester',
            audience: 'Beneficiaries Only',
            priority: 'normal',
            message: 'Students requesting academic textbooks can now list up to 3 alternative book titles to accelerate match generation.',
            status: 'published',
            author: 'Campus Registrar',
            created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
        },
        {
            id: 3,
            headline: 'Emergency Food Pantry Restock Scheduled',
            audience: 'Donors Only',
            priority: 'urgent',
            message: 'Urgent need for non-perishable canned food and hydration items. Donors can drop off supplies directly at Hub B.',
            status: 'draft',
            author: 'ReliefLink Operations',
            created_at: new Date(Date.now() - 3600000 * 12).toISOString()
        }
    ]);

    const [headline, setHeadline] = useState('');
    const [audience, setAudience] = useState('All Members');
    const [priority, setPriority] = useState('normal');
    const [message, setMessage] = useState('');
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [previewingData, setPreviewingData] = useState(null);
    const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
    const [search, setSearch] = useState('');
    const [audienceFilter, setAudienceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    if (user?.role !== 'admin') return <Navigate to={getRoleDashboard(user?.role)} replace/>;

    const handleCreateAnnouncement = (isDraft = false) => {
        setFormError('');
        setSuccessMessage('');

        const trimmedHeadline = headline.trim();
        const trimmedMessage = message.trim();

        if (!trimmedHeadline) {
            setFormError('Please enter an announcement headline.');
            return;
        }
        if (!trimmedMessage) {
            setFormError('Please enter message content.');
            return;
        }

        setSubmitting(true);
        setTimeout(() => {
            const newNotice = {
                id: Date.now(),
                headline: trimmedHeadline,
                audience,
                priority,
                message: trimmedMessage,
                status: isDraft ? 'draft' : 'published',
                author: user?.name || 'Administrator',
                created_at: new Date().toISOString()
            };

            setAnnouncements([newNotice, ...announcements]);
            setHeadline('');
            setMessage('');
            setAudience('All Members');
            setPriority('normal');
            setSubmitting(false);
            setSuccessMessage(isDraft ? 'Announcement saved as draft.' : 'Announcement broadcasted successfully to campus members!');
            setTimeout(() => setSuccessMessage(''), 4000);
        }, 400);
    };

    const togglePublishDraft = id => {
        setAnnouncements(announcements.map(a => a.id === id ? { ...a, status: a.status === 'draft' ? 'published' : 'draft' } : a));
    };

    const confirmDelete = () => {
        if (!deletingAnnouncement) return;
        setAnnouncements(announcements.filter(a => a.id !== deletingAnnouncement.id));
        setDeletingAnnouncement(null);
    };

    let filteredHistory = announcements.filter(item => {
        const matchesAudience = audienceFilter === 'all' || item.audience === audienceFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            item.headline.toLowerCase().includes(q) ||
            item.message.toLowerCase().includes(q) ||
            item.author.toLowerCase().includes(q);

        return matchesAudience && matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const paginatedHistory = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalCount = announcements.length;
    const publishedCount = announcements.filter(a => a.status === 'published').length;
    const draftCount = announcements.filter(a => a.status === 'draft').length;

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">COMMUNICATION CENTER</p>
                    <h1 className="page-title">Campus Announcements</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Broadcast urgent notifications, emergency drives, and updates to campus members.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Published Broadcasts</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{publishedCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-white text-[#22C55E]">
                        <Icon name="check"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Pending Drafts</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{draftCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="edit"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Total Notices</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{totalCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="announcements"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Campus Reach</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">100%</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="people"/>
                    </span>
                </article>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-4">
                    <div className="panel p-6 bg-white space-y-4">
                        <h2 className="text-lg font-extrabold text-[#2563EB] border-b border-[#2563EB]/20 pb-3">
                            Post Broadcast Message
                        </h2>

                        {formError && (
                            <p className="rounded-xl border border-[#2563EB] p-3 text-xs font-bold text-[#2563EB] bg-[#2563EB]/5">{formError}</p>
                        )}
                        {successMessage && (
                            <p className="rounded-xl border border-[#22C55E] p-3 text-xs font-bold text-[#22C55E] bg-[#22C55E]/10">{successMessage}</p>
                        )}

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]">Headline</label>
                                    <span className="text-[10px] font-bold text-[#2563EB]/60">{headline.length}/120</span>
                                </div>
                                <input
                                    maxLength="120"
                                    className="field w-full text-sm"
                                    placeholder="e.g. Winter Clothes Donation Drive Active"
                                    value={headline}
                                    onChange={e => setHeadline(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-1">Target Audience</label>
                                    <select
                                        className="field w-full text-xs"
                                        value={audience}
                                        onChange={e => setAudience(e.target.value)}
                                    >
                                        <option value="All Members">All Members</option>
                                        <option value="Donors Only">Donors Only</option>
                                        <option value="Beneficiaries Only">Beneficiaries Only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-1">Priority</label>
                                    <select
                                        className="field w-full text-xs"
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]">Message Content</label>
                                    <span className="text-[10px] font-bold text-[#2563EB]/60">{message.length}/500</span>
                                </div>
                                <textarea
                                    maxLength="500"
                                    className="field w-full text-xs"
                                    rows="5"
                                    placeholder="Detail the announcement or emergency drive..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                <Button loading={submitting} onClick={() => handleCreateAnnouncement(false)}>
                                    <Icon name="announcements"/>
                                    <span className="ml-1 text-xs">Broadcast Now</span>
                                </Button>
                                <Button variant="secondary" loading={submitting} onClick={() => handleCreateAnnouncement(true)}>
                                    <Icon name="edit"/>
                                    <span className="ml-1 text-xs">Save Draft</span>
                                </Button>
                                <Button
                                    variant="secondary"
                                    disabled={!headline && !message}
                                    onClick={() => setPreviewingData({ headline, audience, priority, message, author: user?.name || 'Administrator', created_at: new Date().toISOString() })}
                                >
                                    <Icon name="profile"/>
                                    <span className="ml-1 text-xs">Preview</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                    <div className="panel p-4 sm:p-5 space-y-4 bg-white">
                        <h2 className="text-lg font-extrabold text-[#2563EB] border-b border-[#2563EB]/20 pb-3">
                            Broadcast History & Audit Log
                        </h2>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex-1 min-w-[180px]">
                                <input
                                    type="text"
                                    placeholder="Search announcements..."
                                    className="field w-full text-xs"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div className="min-w-[130px]">
                                <select
                                    className="field w-full text-xs"
                                    value={audienceFilter}
                                    onChange={e => { setAudienceFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="all">All Audiences</option>
                                    <option value="All Members">All Members</option>
                                    <option value="Donors Only">Donors Only</option>
                                    <option value="Beneficiaries Only">Beneficiaries Only</option>
                                </select>
                            </div>

                            <div className="min-w-[110px]">
                                <select
                                    className="field w-full text-xs"
                                    value={statusFilter}
                                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Drafts</option>
                                </select>
                            </div>
                        </div>

                        {!filteredHistory.length ? (
                            <div className="panel p-8 text-center bg-white">
                                <p className="font-bold text-[#2563EB]">No announcements found matching criteria.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {paginatedHistory.map(item => (
                                    <article key={item.id} className="panel p-4 space-y-2 bg-white hover:border-[#22C55E] transition">
                                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#2563EB]/15 pb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge status={item.priority}/>
                                                    <Badge status={item.status}/>
                                                </div>
                                                <h3 className="text-base font-extrabold text-[#2563EB] mt-1">{item.headline}</h3>
                                            </div>
                                            <span className="text-[11px] font-extrabold text-[#2563EB] bg-[#2563EB]/5 px-2 py-0.5 rounded border border-[#2563EB]/20">
                                                Audience: {item.audience}
                                            </span>
                                        </div>

                                        <p className="text-xs text-[#2563EB]/90 leading-relaxed font-medium">
                                            {item.message}
                                        </p>

                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#2563EB]/10 text-[11px]">
                                            <span className="font-semibold text-[#2563EB]/70">
                                                Posted by <strong>{item.author}</strong> on {new Date(item.created_at).toLocaleString()}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button variant="secondary" onClick={() => setPreviewingData(item)}>
                                                    <Icon name="profile"/>
                                                    <span className="ml-1 text-xs">Preview</span>
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => togglePublishDraft(item.id)}
                                                >
                                                    <span className="text-xs">{item.status === 'draft' ? 'Publish' : 'Unpublish'}</span>
                                                </Button>
                                                <Button variant="secondary" onClick={() => setDeletingAnnouncement(item)}>
                                                    <Icon name="delete"/>
                                                    <span className="ml-1 text-xs">Delete</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                ))}

                                {totalPages > 1 && (
                                    <div className="panel p-3 flex flex-wrap items-center justify-between gap-4">
                                        <p className="text-xs font-bold text-[#2563EB]">
                                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredHistory.length)} of {filteredHistory.length}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="secondary"
                                                disabled={currentPage === 1}
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                            >
                                                &larr; Previous
                                            </Button>
                                            <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                variant="secondary"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            >
                                                Next &rarr;
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {previewingData && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-lg p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Announcement Recipient Preview</h2>
                            <button className="nav-link p-1" onClick={() => setPreviewingData(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>

                        <div className="rounded-xl border-2 border-[#2563EB] p-5 bg-[#2563EB]/5 space-y-3">
                            <div className="flex items-center justify-between gap-2 border-b border-[#2563EB]/20 pb-2">
                                <span className="text-xs font-extrabold text-[#2563EB] uppercase">ReliefLink Campus Notice</span>
                                <Badge status={previewingData.priority || 'normal'}/>
                            </div>
                            <h3 className="text-lg font-extrabold text-[#2563EB]">{previewingData.headline || 'Untitled Headline'}</h3>
                            <p className="text-xs text-[#2563EB] leading-relaxed font-semibold">{previewingData.message || 'No content provided.'}</p>
                            <div className="flex justify-between items-center pt-2 text-[11px] font-bold text-[#2563EB]/70">
                                <span>Target Audience: {previewingData.audience}</span>
                                <span>Author: {previewingData.author}</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-1">
                            <Button variant="secondary" onClick={() => setPreviewingData(null)}>
                                Close Preview
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deletingAnnouncement && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Delete Announcement</h2>
                            <button className="nav-link p-1" onClick={() => setDeletingAnnouncement(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to permanently delete announcement <strong>"{deletingAnnouncement.headline}"</strong>?
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            This action cannot be undone.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-3">
                            <Button onClick={confirmDelete}>
                                <Icon name="delete"/>
                                <span className="ml-1">Confirm Delete</span>
                            </Button>
                            <Button variant="secondary" onClick={() => setDeletingAnnouncement(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function AdminSettings(){
    const defaultSettings={
        auto_matching:true,
        match_on_category:true,
        match_on_quantity:false,
        max_matches_per_donation:5,
        match_cooldown_hours:24,
        email_handoff_alerts:true,
        email_match_alerts:true,
        email_approval_alerts:true,
        handoff_reminder_hours:24,
        admin_verification:true,
        require_justification:true,
        auto_approve_returning:false,
        max_pending_per_user:3,
        allow_self_registration:true,
        maintenance_mode:false,
        session_timeout_minutes:60,
        max_photo_size_mb:2,
        items_per_page:10
    };

    const[settings,setSettings]=useState({...defaultSettings});
    const[savedSettings,setSavedSettings]=useState({...defaultSettings});
    const[message,setMessage]=useState('');
    const[messageType,setMessageType]=useState('success');
    const[saving,setSaving]=useState(false);
    const[activeTab,setActiveTab]=useState('matching');
    const[confirmSave,setConfirmSave]=useState(false);
    const[confirmReset,setConfirmReset]=useState(false);
    const[fieldErrors,setFieldErrors]=useState({});

    useEffect(()=>{
        api.get('/admin/settings').then(r=>{
            const loaded={...defaultSettings,...(r.data.data||{})};
            setSettings(loaded);setSavedSettings(loaded);
        }).catch(()=>{setMessage('Could not load saved settings.');setMessageType('error');});
    },[]);

    useEffect(()=>{
        if(message){
            const timer=setTimeout(()=>setMessage(''),6000);
            return ()=>clearTimeout(timer);
        }
    },[message]);

    const hasChanges=JSON.stringify(settings)!==JSON.stringify(savedSettings);

    const update=(key,val)=>{
        setSettings(prev=>({...prev,[key]:val}));
        setFieldErrors(prev=>{const n={...prev};delete n[key];return n;});
    };

    const validateAll=()=>{
        const errs={};
        if(settings.max_matches_per_donation<1||settings.max_matches_per_donation>50)
            errs.max_matches_per_donation='Must be between 1 and 50';
        if(settings.match_cooldown_hours<0||settings.match_cooldown_hours>168)
            errs.match_cooldown_hours='Must be between 0 and 168 hours';
        if(settings.handoff_reminder_hours<1||settings.handoff_reminder_hours>72)
            errs.handoff_reminder_hours='Must be between 1 and 72 hours';
        if(settings.max_pending_per_user<1||settings.max_pending_per_user>20)
            errs.max_pending_per_user='Must be between 1 and 20';
        if(settings.session_timeout_minutes<5||settings.session_timeout_minutes>1440)
            errs.session_timeout_minutes='Must be between 5 and 1440 minutes';
        if(settings.max_photo_size_mb<1||settings.max_photo_size_mb>10)
            errs.max_photo_size_mb='Must be between 1 and 10 MB';
        if(settings.items_per_page<5||settings.items_per_page>100)
            errs.items_per_page='Must be between 5 and 100';
        setFieldErrors(errs);
        return Object.keys(errs).length===0;
    };

    const handleSave=()=>{
        if(!validateAll()) return;
        setConfirmSave(true);
    };

    const executeSave=()=>{
        setSaving(true);
        setConfirmSave(false);
        api.put('/admin/settings',settings).then(response=>{
                const saved={...defaultSettings,...(response.data.data||{})};
                setSettings(saved);setSavedSettings(saved);
                setMessage('All configurations saved successfully.');
                setMessageType('success');
            }).catch(e=>{
                setMessage('Could not save settings. Please try again.');
                setMessageType('error');
            }).finally(()=>{
                setSaving(false);
            });
    };

    const handleReset=()=>{
        setConfirmReset(true);
    };

    const executeReset=()=>{
        setSettings({...defaultSettings});
        setFieldErrors({});
        setConfirmReset(false);
        setMessage('Settings have been reset to defaults. Click "Save All Settings" to apply.');
        setMessageType('success');
    };

    const Toggle=({checked,onChange,label,description})=>(
        <div className="flex items-start justify-between gap-4 py-3">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#2563EB]">{label}</p>
                {description&&<p className="mt-0.5 text-xs font-semibold text-[#2563EB]/60 leading-relaxed">{description}</p>}
            </div>
            <button
                type="button"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-2 ${
                    checked?'bg-[#22C55E] border-[#22C55E]':'bg-[#2563EB]/20 border-[#2563EB]/20'
                }`}
                onClick={()=>onChange(!checked)}
                role="switch"
                aria-checked={checked}
            >
                <span
                    className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
                    style={{transform:checked?'translateX(20px)':'translateX(0px)'}}
                />
            </button>
        </div>
    );

    const NumberField=({label,description,value,onChange,fieldKey,unit,min,max})=>(
        <div className="py-3">
            <label className="block text-sm font-bold text-[#2563EB] mb-0.5">{label}</label>
            {description&&<p className="text-xs font-semibold text-[#2563EB]/60 mb-2">{description}</p>}
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    className={`field w-28 text-sm text-center ${fieldErrors[fieldKey]?'border-[#2563EB] bg-[#2563EB]/5':''}`}
                    value={value}
                    min={min}
                    max={max}
                    onChange={e=>onChange(parseInt(e.target.value)||0)}
                />
                {unit&&<span className="text-xs font-semibold text-[#2563EB]/60">{unit}</span>}
            </div>
            {fieldErrors[fieldKey]&&(
                <p className="mt-1 text-[10px] font-bold text-[#2563EB] flex items-center gap-1">
                    <Icon name="close" size={10}/>{fieldErrors[fieldKey]}
                </p>
            )}
        </div>
    );

    const SectionHeader=({icon,title,description})=>(
        <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-3 mb-1">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <Icon name={icon} size={16}/>
            </span>
            <div>
                <h3 className="text-sm font-extrabold text-[#2563EB] uppercase tracking-wider">{title}</h3>
                {description&&<p className="text-[10px] font-semibold text-[#2563EB]/60">{description}</p>}
            </div>
        </div>
    );

    const tabs=[
        {key:'matching',label:'Matching Engine',icon:'match'},
        {key:'notifications',label:'Notifications',icon:'bell'},
        {key:'verification',label:'Verification',icon:'approvals'},
        {key:'system',label:'System',icon:'activity'}
    ];

    const changedCount=Object.keys(settings).filter(k=>settings[k]!==savedSettings[k]).length;

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">SYSTEM CONFIGURATION</p>
                    <h1 className="page-title">Platform Settings</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Configure ReliefLink system parameters, matching weights, notification rules, and platform behavior.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {hasChanges&&(
                        <span className="text-xs font-extrabold text-[#22C55E] flex items-center gap-1 bg-[#22C55E]/10 px-3 py-1.5 rounded-xl border border-[#22C55E]/30">
                            <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                            {changedCount} unsaved change{changedCount!==1?'s':''}
                        </span>
                    )}
                    <Button variant="secondary" onClick={handleReset}>
                        <Icon name="close"/>
                        <span className="ml-1 text-xs">Reset to Defaults</span>
                    </Button>
                    <Button onClick={handleSave} loading={saving} disabled={saving||(!hasChanges&&Object.keys(fieldErrors).length===0)}>
                        <Icon name="check"/>
                        <span className="ml-1 text-xs">Save All Settings</span>
                    </Button>
                </div>
            </div>

            {message&&(
                <div className={`panel p-4 flex items-center justify-between gap-4 ${
                    messageType==='success'
                        ?'border-l-4 border-l-[#22C55E] bg-[#22C55E]/5'
                        :'border-l-4 border-l-[#2563EB] bg-[#2563EB]/5'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            messageType==='success'?'bg-[#22C55E] text-white':'bg-[#2563EB] text-white'
                        }`}>
                            <Icon name={messageType==='success'?'check':'close'} size={16}/>
                        </span>
                        <p className={`text-sm font-bold ${messageType==='success'?'text-[#22C55E]':'text-[#2563EB]'}`}>
                            {message}
                        </p>
                    </div>
                    <button className="text-[#2563EB]/60 hover:text-[#2563EB] transition" onClick={()=>setMessage('')}>
                        <Icon name="close" size={16}/>
                    </button>
                </div>
            )}

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {[
                    {label:'Matching',value:settings.auto_matching?'Active':'Disabled',active:settings.auto_matching,icon:'match'},
                    {label:'Email Alerts',value:settings.email_handoff_alerts?'Enabled':'Disabled',active:settings.email_handoff_alerts,icon:'bell'},
                    {label:'Admin Review',value:settings.admin_verification?'Required':'Optional',active:settings.admin_verification,icon:'approvals'},
                    {label:'System Mode',value:settings.maintenance_mode?'Maintenance':'Operational',active:!settings.maintenance_mode,icon:'activity'}
                ].map((card,i)=>(
                    <article key={i} className="panel p-4 flex items-center justify-between bg-white">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]/60">{card.label}</p>
                            <p className={`mt-0.5 text-sm font-extrabold ${card.active?'text-[#22C55E]':'text-[#2563EB]'}`}>{card.value}</p>
                        </div>
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            card.active?'bg-[#22C55E] text-white':'bg-[#2563EB]/10 text-[#2563EB]'
                        }`}>
                            <Icon name={card.icon} size={14}/>
                        </span>
                    </article>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-[#2563EB]/15 pb-1">
                {tabs.map(t=>(
                    <button
                        key={t.key}
                        className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition flex items-center gap-1.5 ${
                            activeTab===t.key
                                ?'bg-[#2563EB] text-white border border-[#2563EB]'
                                :'bg-white text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#2563EB]/10'
                        }`}
                        onClick={()=>setActiveTab(t.key)}
                    >
                        <Icon name={t.icon} size={14}/>
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab==='matching'&&(
                <div className="space-y-6">
                    <div className="panel p-5 sm:p-6 bg-white space-y-1">
                        <SectionHeader icon="match" title="Resource Matching Engine" description="Control how donations are automatically paired with aid requests"/>

                        <Toggle
                            checked={settings.auto_matching}
                            onChange={v=>update('auto_matching',v)}
                            label="Automated Resource Matching"
                            description="Automatically pair approved requests with available donations when categories align. When disabled, all matches must be created manually by administrators."
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <Toggle
                            checked={settings.match_on_category}
                            onChange={v=>update('match_on_category',v)}
                            label="Category-Based Matching"
                            description="Require that donation and request categories match exactly before proposing a pairing."
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <Toggle
                            checked={settings.match_on_quantity}
                            onChange={v=>update('match_on_quantity',v)}
                            label="Quantity-Aware Matching"
                            description="Factor available quantity into match scoring. When enabled, the engine will prefer donations that can fully fulfill the requested amount."
                        />
                    </div>

                    <div className="panel p-5 sm:p-6 bg-white space-y-1">
                        <SectionHeader icon="activity" title="Matching Limits & Timing" description="Set boundaries for the matching engine"/>

                        <NumberField
                            label="Maximum Matches per Donation"
                            description="Limit the number of requests a single donation can be matched to simultaneously."
                            value={settings.max_matches_per_donation}
                            onChange={v=>update('max_matches_per_donation',v)}
                            fieldKey="max_matches_per_donation"
                            unit="matches"
                            min={1} max={50}
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <NumberField
                            label="Match Cooldown Period"
                            description="Minimum time between re-matching a declined or expired match for the same donation-request pair."
                            value={settings.match_cooldown_hours}
                            onChange={v=>update('match_cooldown_hours',v)}
                            fieldKey="match_cooldown_hours"
                            unit="hours"
                            min={0} max={168}
                        />
                    </div>
                </div>
            )}

            {activeTab==='notifications'&&(
                <div className="space-y-6">
                    <div className="panel p-5 sm:p-6 bg-white space-y-1">
                        <SectionHeader icon="bell" title="Email Notification Preferences" description="Configure which email alerts are sent to users and administrators"/>

                        <Toggle
                            checked={settings.email_handoff_alerts}
                            onChange={v=>update('email_handoff_alerts',v)}
                            label="Handoff Reminder Emails"
                            description="Send email reminders to users prior to their scheduled handoff times."
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <Toggle
                            checked={settings.email_match_alerts}
                            onChange={v=>update('email_match_alerts',v)}
                            label="Match Notification Emails"
                            description="Notify donors and beneficiaries via email when a new match is proposed or confirmed."
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <Toggle
                            checked={settings.email_approval_alerts}
                            onChange={v=>update('email_approval_alerts',v)}
                            label="Approval Status Emails"
                            description="Send email updates to beneficiaries when their request is approved or rejected by an administrator."
                        />
                    </div>

                    <div className="panel p-5 sm:p-6 bg-white space-y-1">
                        <SectionHeader icon="activity" title="Notification Timing" description="Fine-tune when reminders are dispatched"/>

                        <NumberField
                            label="Handoff Reminder Lead Time"
                            description="How many hours before a scheduled handoff should the reminder email be sent."
                            value={settings.handoff_reminder_hours}
                            onChange={v=>update('handoff_reminder_hours',v)}
                            fieldKey="handoff_reminder_hours"
                            unit="hours before handoff"
                            min={1} max={72}
                        />
                    </div>
                </div>
            )}

            {activeTab==='verification'&&(
                <div className="space-y-6">
                    <div className="panel p-5 sm:p-6 bg-white space-y-1">
                        <SectionHeader icon="approvals" title="Admin Verification Rules" description="Control the approval workflow for incoming aid requests"/>

                        <Toggle
                            checked={settings.admin_verification}
                            onChange={v=>update('admin_verification',v)}
                            label="Require Admin Verification"
                            description="Mandate admin approval before beneficiary requests are visible to donors and eligible for matching. Disabling this will allow all requests to enter matching automatically."
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <Toggle
                            checked={settings.require_justification}
                            onChange={v=>update('require_justification',v)}
                            label="Require Request Justification"
                            description="Require beneficiaries to provide a written justification when submitting aid requests. This helps administrators evaluate the legitimacy and urgency of each request."
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <Toggle
                            checked={settings.auto_approve_returning}
                            onChange={v=>update('auto_approve_returning',v)}
                            label="Auto-Approve Returning Beneficiaries"
                            description="Automatically approve requests from beneficiaries who have previously had at least one approved request. Only applies when admin verification is enabled."
                        />
                    </div>

                    <div className="panel p-5 sm:p-6 bg-white space-y-1">
                        <SectionHeader icon="request" title="Request Limits" description="Prevent abuse and manage request volume"/>

                        <NumberField
                            label="Maximum Pending Requests per User"
                            description="Limit the number of active pending requests a single beneficiary can have at any given time."
                            value={settings.max_pending_per_user}
                            onChange={v=>update('max_pending_per_user',v)}
                            fieldKey="max_pending_per_user"
                            unit="requests"
                            min={1} max={20}
                        />
                    </div>
                </div>
            )}

            {activeTab==='system'&&(
                <div className="space-y-6">
                    <div className="panel p-5 sm:p-6 bg-white space-y-1">
                        <SectionHeader icon="activity" title="Platform Behavior" description="General system-wide settings"/>

                        <Toggle
                            checked={settings.allow_self_registration}
                            onChange={v=>update('allow_self_registration',v)}
                            label="Allow Self-Registration"
                            description="Allow new users to create accounts without an admin invitation. When disabled, only administrators can create new user accounts."
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <Toggle
                            checked={settings.maintenance_mode}
                            onChange={v=>update('maintenance_mode',v)}
                            label="Maintenance Mode"
                            description="When enabled, the platform displays a maintenance notice to non-admin users. Only administrators can access the system during maintenance."
                        />
                    </div>

                    <div className="panel p-5 sm:p-6 bg-white space-y-1">
                        <SectionHeader icon="security" title="Security & Limits" description="Session and upload restrictions"/>

                        <NumberField
                            label="Session Timeout"
                            description="Automatically log out inactive users after this period of inactivity."
                            value={settings.session_timeout_minutes}
                            onChange={v=>update('session_timeout_minutes',v)}
                            fieldKey="session_timeout_minutes"
                            unit="minutes"
                            min={5} max={1440}
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <NumberField
                            label="Maximum Photo Upload Size"
                            description="Set the maximum allowed file size for profile photos and donation images."
                            value={settings.max_photo_size_mb}
                            onChange={v=>update('max_photo_size_mb',v)}
                            fieldKey="max_photo_size_mb"
                            unit="MB"
                            min={1} max={10}
                        />
                        <div className="border-t border-[#2563EB]/10"/>
                        <NumberField
                            label="Items per Page"
                            description="Default number of rows displayed in paginated tables and lists across the admin panel."
                            value={settings.items_per_page}
                            onChange={v=>update('items_per_page',v)}
                            fieldKey="items_per_page"
                            unit="items"
                            min={5} max={100}
                        />
                    </div>
                </div>
            )}

            <div className="panel p-4 flex flex-wrap items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-2">
                    {hasChanges?(
                        <span className="text-xs font-extrabold text-[#22C55E] flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                            {changedCount} unsaved change{changedCount!==1?'s':''}
                        </span>
                    ):(
                        <span className="text-xs font-semibold text-[#2563EB]/60 flex items-center gap-1">
                            <Icon name="check" size={12}/>
                            All settings are saved
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleReset}>
                        <Icon name="close"/>
                        <span className="ml-1 text-xs">Reset Defaults</span>
                    </Button>
                    <Button onClick={handleSave} loading={saving} disabled={saving||(!hasChanges&&Object.keys(fieldErrors).length===0)}>
                        <Icon name="check"/>
                        <span className="ml-1 text-xs">Save All Settings</span>
                    </Button>
                </div>
            </div>

            {confirmSave&&(
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Confirm Save Settings</h2>
                            <button className="nav-link p-1" onClick={()=>setConfirmSave(false)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            You are about to save {changedCount} configuration change{changedCount!==1?'s':''}. These changes will take effect immediately.
                        </p>
                        <div className="bg-[#2563EB]/5 rounded-xl p-3 border border-[#2563EB]/15 space-y-1 max-h-40 overflow-y-auto">
                            {Object.keys(settings).filter(k=>settings[k]!==savedSettings[k]).map(k=>(
                                <div key={k} className="flex justify-between text-xs">
                                    <span className="font-bold text-[#2563EB]/70">{k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>
                                    <span className="font-extrabold text-[#22C55E]">{String(settings[k])}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button onClick={executeSave} loading={saving}>
                                <Icon name="check"/>
                                <span className="ml-1">Confirm & Save</span>
                            </Button>
                            <Button variant="secondary" onClick={()=>setConfirmSave(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {confirmReset&&(
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Reset to Defaults</h2>
                            <button className="nav-link p-1" onClick={()=>setConfirmReset(false)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to reset all settings to their default values? This will revert all configurations.
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            You will still need to click "Save All Settings" to persist the defaults.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button onClick={executeReset}>
                                <Icon name="close"/>
                                <span className="ml-1">Reset to Defaults</span>
                            </Button>
                            <Button variant="secondary" onClick={()=>setConfirmReset(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function Profile(){
    const{user,refresh}=useAuth();
    const[f,setF]=useState({
        name:user?.name||'',
        email:user?.email||'',
        contact_number:user?.contact_number||'',
        campus_id:user?.campus_id||'',
        address:user?.address||'',
        student_id_number:user?.student_id_number||'',
        school_email:user?.school_email||'',
        department:user?.department||'',
        course:user?.course||'',
        year_level:user?.year_level||'',
        country:user?.country||'',
        country_code:user?.country_code||'',
        password:'',
        password_confirmation:''
    });
    const[message,setMessage]=useState('');
    const[messageType,setMessageType]=useState('success');
    const[saving,setSaving]=useState(false);
    const[photoPreview,setPhotoPreview]=useState(null);
    const[photoFile,setPhotoFile]=useState(null);
    const[photoRemoved,setPhotoRemoved]=useState(false);
    const[isPhotoViewerOpen,setIsPhotoViewerOpen]=useState(false);
    const[showPassword,setShowPassword]=useState(false);
    const[showConfirm,setShowConfirm]=useState(false);
    const[activeSection,setActiveSection]=useState('personal');
    const fileRef=useRef(null);

    useEffect(()=>{
        if(user){
            setF({
                name:user.name||'',
                email:user.email||'',
                contact_number:user.contact_number||'',
                campus_id:user.campus_id||'',
                address:user.address||'',
                student_id_number:user.student_id_number||'',
                school_email:user.school_email||'',
                department:user.department||'',
                course:user.course||'',
                year_level:user.year_level||'',
                country:user.country||'',
                country_code:user.country_code||'',
                password:'',
                password_confirmation:''
            });
            setPhotoRemoved(false);
        }
    },[user]);

    useEffect(()=>{
        if(message){
            const timer=setTimeout(()=>setMessage(''),6000);
            return ()=>clearTimeout(timer);
        }
    },[message]);

    const profileImage=photoRemoved?null:(photoPreview||user?.profile_photo_url||null);

    useEffect(()=>{
        if(!isPhotoViewerOpen) return undefined;
        const closeOnEscape=(event)=>{
            if(event.key==='Escape') setIsPhotoViewerOpen(false);
        };
        document.addEventListener('keydown',closeOnEscape);
        return()=>document.removeEventListener('keydown',closeOnEscape);
    },[isPhotoViewerOpen]);

    if(!user)return <Navigate to="/login"/>;

    const handlePhotoSelect=(e)=>{
        const file=e.target.files?.[0];
        if(!file) return;
        if(file.size>2*1024*1024){
            setMessage('Photo must be under 2MB.');
            setMessageType('error');
            return;
        }
        setPhotoFile(file);
        setPhotoRemoved(false);
        const reader=new FileReader();
        reader.onload=(ev)=>setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const removePhoto=()=>{
        setPhotoPreview(null);
        setPhotoFile(null);
        setPhotoRemoved(true);
        if(fileRef.current)fileRef.current.value='';
    };

    const getPasswordStrength=(pw)=>{
        if(!pw) return {score:0,label:'',color:''};
        let score=0;
        if(pw.length>=8) score++;
        if(pw.length>=12) score++;
        if(/[A-Z]/.test(pw)) score++;
        if(/[0-9]/.test(pw)) score++;
        if(/[^A-Za-z0-9]/.test(pw)) score++;
        if(score<=1) return {score:1,label:'Weak',color:'#2563EB'};
        if(score<=2) return {score:2,label:'Fair',color:'#2563EB'};
        if(score<=3) return {score:3,label:'Good',color:'#2563EB'};
        if(score<=4) return {score:4,label:'Strong',color:'#22C55E'};
        return {score:5,label:'Excellent',color:'#22C55E'};
    };

    const strength=getPasswordStrength(f.password);
    const passwordsMatch=!f.password_confirmation||f.password===f.password_confirmation;
    const canSubmitPassword=!f.password||(f.password.length>=8&&passwordsMatch);

    const submit=async e=>{
        e.preventDefault();
        if(f.password&&f.password.length<8){
            setMessage('Password must be at least 8 characters.');
            setMessageType('error');
            return;
        }
        if(f.password&&!passwordsMatch){
            setMessage('Passwords do not match.');
            setMessageType('error');
            return;
        }
        setSaving(true);
        const data=new FormData();
        data.append('name',f.name.trim());
        data.append('email',f.email.trim());
        if(f.contact_number) data.append('contact_number',f.contact_number.trim());
        if(f.campus_id) data.append('campus_id',f.campus_id.trim());
        if(f.address) data.append('address',f.address.trim());
        if(f.student_id_number) data.append('student_id_number',f.student_id_number.trim());
        if(f.school_email) data.append('school_email',f.school_email.trim());
        if(f.department) data.append('department',f.department.trim());
        if(f.course) data.append('course',f.course.trim());
        if(f.year_level) data.append('year_level',f.year_level.trim());
        if(f.country) data.append('country',f.country.trim());
        if(f.country_code) data.append('country_code',f.country_code.trim());
        if(f.password){
            data.append('password',f.password);
            data.append('password_confirmation',f.password_confirmation);
        }
        if(photoFile) data.append('profile_photo',photoFile);
        if(photoRemoved) data.append('remove_photo','1');

        try{
            await api.post('/profile',data);
            await refresh();
            setMessage('Profile updated successfully.');
            setMessageType('success');
            setF(prev=>({...prev,password:'',password_confirmation:''}));
            setPhotoFile(null);
            setPhotoPreview(null);
            setPhotoRemoved(false);
            if(fileRef.current)fileRef.current.value='';
        }catch(e){
            setMessage(e.response?.data?.message||'Could not update profile. Please check your input and try again.');
            setMessageType('error');
        }finally{
            setSaving(false);
        }
    };

    const initials=(user.name||'U').split(' ').filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2);
    const memberSince=user.created_at?new Date(user.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):'N/A';
    const roleBadgeLabel=user.role==='beneficiary'?'BENEFICIARY':user.role==='donor'?'DONOR':(user.role||'user').toUpperCase();
    const idLabel = 'Valid ID Number';

    const sections=[
        {key:'personal',label:'Personal Info',icon:'person'},
        {key:'security',label:'Security',icon:'security'},
        {key:'account',label:'Account Info',icon:'activity'}
    ];

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">ACCOUNT SETTINGS</p>
                    <h1 className="page-title">Your Profile</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Manage your personal information, security settings, and account details.
                    </p>
                </div>
            </div>

            {message&&(
                <div className={`panel p-4 flex items-center justify-between gap-4 ${
                    messageType==='success'
                        ?'border-l-4 border-l-[#22C55E] bg-[#22C55E]/5'
                        :'border-l-4 border-l-[#2563EB] bg-[#2563EB]/5'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            messageType==='success'?'bg-[#22C55E] text-white':'bg-[#2563EB] text-white'
                        }`}>
                            <Icon name={messageType==='success'?'check':'close'} size={16}/>
                        </span>
                        <p className={`text-sm font-bold ${messageType==='success'?'text-[#22C55E]':'text-[#2563EB]'}`}>
                            {message}
                        </p>
                    </div>
                    <button className="text-[#2563EB]/60 hover:text-[#2563EB] transition" onClick={()=>setMessage('')}>
                        <Icon name="close" size={16}/>
                    </button>
                </div>
            )}

            <div className="panel p-5 flex flex-wrap items-center gap-5 sm:gap-6 bg-white">
                <div className="relative">
                    {profileImage?(
                        <button
                            type="button"
                            className="block rounded-2xl bg-transparent p-0"
                            onClick={()=>setIsPhotoViewerOpen(true)}
                            aria-label="View full-size profile photo"
                            title="View full-size photo"
                        >
                            <img
                                src={profileImage}
                                alt={user.name}
                                className="h-20 w-20 rounded-2xl border-2 border-[#2563EB] object-cover"
                            />
                        </button>
                    ):(
                        <div className="h-20 w-20 rounded-2xl bg-[#2563EB] text-white grid place-items-center text-2xl font-extrabold border-2 border-[#2563EB]">
                            {initials}
                        </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-[#22C55E] text-white border-2 border-white">
                        <Icon name="check" size={12}/>
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-extrabold text-[#2563EB] truncate">{user.name}</h2>
                    <p className="text-sm font-semibold text-[#2563EB]/70 truncate">{user.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-block rounded-lg bg-[#2563EB] text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                            {roleBadgeLabel}
                        </span>
                        <span className="text-[11px] font-semibold text-[#2563EB]/60">
                            Member since {memberSince}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-[#2563EB]/15 pb-1">
                {sections.map(s=>(
                    <button
                        key={s.key}
                        className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition flex items-center gap-1.5 ${
                            activeSection===s.key
                                ?'bg-[#2563EB] text-white border border-[#2563EB]'
                                :'bg-white text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#2563EB]/10'
                        }`}
                        onClick={()=>setActiveSection(s.key)}
                    >
                        <Icon name={s.icon} size={14}/>
                        {s.label}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="space-y-6">
                {activeSection==='personal'&&(
                    <div className="space-y-6">
                        <div className="panel p-5 sm:p-6 bg-white space-y-5">
                            <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-3">
                                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                                    <Icon name="person" size={16}/>
                                </span>
                                <h3 className="text-sm font-extrabold text-[#2563EB] uppercase tracking-wider">Personal Information</h3>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">Full Name *</label>
                                    <input
                                        required
                                        className="field w-full"
                                        placeholder="Enter your full name"
                                        value={f.name}
                                        onChange={e=>setF({...f,name:e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">Email Address *</label>
                                    <input
                                        required
                                        type="email"
                                        className="field w-full"
                                        placeholder="Enter your email address"
                                        value={f.email}
                                        onChange={e=>setF({...f,email:e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">Contact Number</label>
                                    <InternationalPhoneInput
                                        id="profile_contact_number"
                                        value={f.contact_number}
                                        defaultCountry={f.country_code || 'PH'}
                                        onChange={(val, valid, meta={})=>setF(prev=>({
                                            ...prev,
                                            contact_number:val,
                                            country:meta.country ? (COUNTRY_LIST.find(country=>country.code===meta.country)?.name || prev.country) : prev.country,
                                            country_code:meta.country || prev.country_code,
                                        }))}
                                        placeholder="Enter contact number"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {user.role==='donor'&&<>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">Address</label>
                                    <input className="field w-full" placeholder="Enter your address" value={f.address} onChange={e=>setF({...f,address:e.target.value})}/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">{idLabel}</label>
                                    <input className="field w-full" placeholder="Enter your valid ID number" value={f.campus_id} onChange={e=>setF({...f,campus_id:e.target.value})}/>
                                </div>
                                </>}
                                {user.role==='beneficiary'&&<>
                                {[
                                    ['Student ID Number','student_id_number','Enter your student ID number'],
                                    ['School Email Address','school_email','Enter your school email address'],
                                    ['Department','department','Enter your department'],
                                    ['Course','course','Enter your course'],
                                    ['Year Level','year_level','e.g. 1st Year'],
                                ].map(([label,key,placeholder])=><div key={key}>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">{label}</label>
                                    <input className="field w-full" type={key==='school_email'?'email':'text'} placeholder={placeholder} value={f[key]} onChange={e=>setF({...f,[key]:e.target.value})}/>
                                </div>)}
                                </>}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">Country / Region</label>
                                    <input
                                        className="field w-full"
                                        placeholder="Enter your country or region"
                                        value={f.country}
                                        onChange={e=>setF({...f,country:e.target.value})}
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="panel p-5 sm:p-6 bg-white space-y-5">
                            <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-3">
                                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                                    <Icon name="donation" size={16}/>
                                </span>
                                <h3 className="text-sm font-extrabold text-[#2563EB] uppercase tracking-wider">Profile Photo</h3>
                            </div>

                            <div className="flex flex-wrap items-start gap-5">
                                <div className="shrink-0">
                                    {profileImage?(
                                        <button
                                            type="button"
                                            className="block rounded-2xl bg-transparent p-0"
                                            onClick={()=>setIsPhotoViewerOpen(true)}
                                            aria-label="View full-size profile photo"
                                            title="View full-size photo"
                                        >
                                            <img
                                                src={profileImage}
                                                alt="Profile preview"
                                                className="h-24 w-24 rounded-2xl border-2 border-[#2563EB] object-cover"
                                            />
                                        </button>
                                    ):(
                                        <div className="h-24 w-24 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] grid place-items-center text-3xl font-extrabold border-2 border-[#2563EB]/30">
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-[200px] space-y-3">
                                    <div
                                        className="border-2 border-dashed border-[#2563EB]/30 rounded-xl p-4 text-center cursor-pointer hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition"
                                        onClick={()=>fileRef.current?.click()}
                                    >
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] mx-auto mb-2">
                                            <Icon name="donation" size={20}/>
                                        </span>
                                        <p className="text-xs font-bold text-[#2563EB]">Click to upload a new photo</p>
                                        <p className="text-[10px] font-semibold text-[#2563EB]/60 mt-1">JPG, PNG, or GIF — Max 2MB</p>
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoSelect}
                                    />
                                    {(photoPreview||user?.profile_photo_url)&&(
                                        <div className="flex items-center gap-3">
                                            {photoPreview&&(
                                                <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                                                    <Icon name="check" size={12}/>
                                                    New photo selected
                                                </span>
                                            )}
                                            <button type="button" className="text-xs font-bold text-[#2563EB] underline hover:text-[#2563EB]/80" onClick={removePhoto}>
                                                Remove photo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button loading={saving} disabled={saving}>
                                <Icon name="check"/>
                                <span className="ml-1.5">Save Personal Info</span>
                            </Button>
                        </div>
                    </div>
                )}

                {activeSection==='security'&&(
                    <div className="space-y-6">
                        <div className="panel p-5 sm:p-6 bg-white space-y-5">
                            <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-3">
                                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                                    <Icon name="security" size={16}/>
                                </span>
                                <h3 className="text-sm font-extrabold text-[#2563EB] uppercase tracking-wider">Change Password</h3>
                            </div>

                            <p className="text-xs font-semibold text-[#2563EB]/70">
                                Leave password fields empty if you do not want to change your password. Passwords must be at least 8 characters.
                            </p>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">New Password</label>
                                    <input
                                        className="field w-full"
                                        type="password"
                                        placeholder="Enter new password"
                                        value={f.password}
                                        onChange={e=>setF({...f,password:e.target.value})}
                                    />

                                    {f.password&&(
                                        <div className="mt-2 space-y-1.5">
                                            <div className="flex gap-1">
                                                {[1,2,3,4,5].map(i=>(
                                                    <div
                                                        key={i}
                                                        className="h-1.5 flex-1 rounded-full transition-all"
                                                        style={{
                                                            backgroundColor:i<=strength.score?strength.color:'#2563EB20'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-[10px] font-extrabold" style={{color:strength.color}}>
                                                Password Strength: {strength.label}
                                            </p>
                                            <div className="space-y-0.5">
                                                {[
                                                    {test:f.password.length>=8,label:'At least 8 characters'},
                                                    {test:/[A-Z]/.test(f.password),label:'One uppercase letter'},
                                                    {test:/[0-9]/.test(f.password),label:'One number'},
                                                    {test:/[^A-Za-z0-9]/.test(f.password),label:'One special character'}
                                                ].map((rule,i)=>(
                                                    <p key={i} className={`text-[10px] font-bold flex items-center gap-1 ${rule.test?'text-[#22C55E]':'text-[#2563EB]/50'}`}>
                                                        <Icon name={rule.test?'check':'close'} size={10}/>
                                                        {rule.label}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1.5">Confirm New Password</label>
                                    <input
                                        className={`field w-full ${f.password_confirmation&&!passwordsMatch?'border-[#2563EB] bg-[#2563EB]/5':''}`}
                                        type="password"
                                        placeholder="Re-enter new password"
                                        value={f.password_confirmation}
                                        onChange={e=>setF({...f,password_confirmation:e.target.value})}
                                    />
                                    {f.password_confirmation&&(
                                        <p className={`mt-1.5 text-[10px] font-extrabold flex items-center gap-1 ${passwordsMatch?'text-[#22C55E]':'text-[#2563EB]'}`}>
                                            <Icon name={passwordsMatch?'check':'close'} size={10}/>
                                            {passwordsMatch?'Passwords match':'Passwords do not match'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button loading={saving} disabled={saving||!canSubmitPassword}>
                                <Icon name="security"/>
                                <span className="ml-1.5">Update Security Settings</span>
                            </Button>
                        </div>
                    </div>
                )}

                {activeSection==='account'&&(
                    <div className="space-y-6">
                        <div className="panel p-5 sm:p-6 bg-white space-y-5">
                            <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-3">
                                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                                    <Icon name="activity" size={16}/>
                                </span>
                                <h3 className="text-sm font-extrabold text-[#2563EB] uppercase tracking-wider">Account Information</h3>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    {label:'Account ID',value:`#${user.id||'—'}`},
                                    {label:'Full Name',value:user.name||'—'},
                                    {label:'Email Address',value:user.email||'—'},
                                    {label:'Contact Number',value:user.contact_number||'Not provided'},
                                    {label:'Account Type',value:user.role==='beneficiary'?'Request Support (Beneficiary)':user.role==='donor'?'Make a Donation (Donor)':title(user.role)},
                                    {label:'Country / Region',value:user.country||'Campus Resident'},
                                    ...(user.role==='donor'?[
                                        {label:'Address',value:user.address||'Not provided'},
                                        {label:'Valid ID Number',value:user.campus_id||'N/A',isMono:true},
                                    ]:[]),
                                    ...(user.role==='beneficiary'?[
                                        {label:'Student ID Number',value:user.student_id_number||'N/A',isMono:true},
                                        {label:'School Email',value:user.school_email||'Not provided'},
                                        {label:'Department',value:user.department||'Not provided'},
                                        {label:'Course',value:user.course||'Not provided'},
                                        {label:'Year Level',value:user.year_level||'Not provided'},
                                    ]:[]),
                                    {label:'Member Since',value:memberSince},
                                    {label:'Account Status',value:'Active',accent:true}
                                ].map((item,i)=>(
                                    <div key={i} className="bg-[#2563EB]/5 rounded-xl p-4 border border-[#2563EB]/10">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]/60 mb-1">{item.label}</p>
                                        <p className={`text-sm font-extrabold ${item.accent?'text-[#22C55E]':'text-[#2563EB]'} ${item.isMono?'font-mono':''}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel p-5 sm:p-6 bg-white space-y-5">
                            <div className="flex items-center gap-2 border-b border-[#2563EB]/15 pb-3">
                                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                                    <Icon name="security" size={16}/>
                                </span>
                                <h3 className="text-sm font-extrabold text-[#2563EB] uppercase tracking-wider">Session & Security</h3>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="bg-[#2563EB]/5 rounded-xl p-4 border border-[#2563EB]/10">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]/60 mb-1">Authentication Method</p>
                                    <p className="text-sm font-extrabold text-[#2563EB]">Email & Password</p>
                                </div>
                                <div className="bg-[#2563EB]/5 rounded-xl p-4 border border-[#2563EB]/10">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]/60 mb-1">Active Session</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                                        <p className="text-sm font-extrabold text-[#22C55E]">Currently Active</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] font-semibold text-[#2563EB]/60 leading-relaxed">
                                Your session is secured via API token authentication. To end your current session, use the logout option from the navigation menu. For password changes, visit the Security tab above.
                            </p>
                        </div>
                    </div>
                )}
            </form>

            {isPhotoViewerOpen&&profileImage&&(
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-[#2563EB]/45 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Full-size profile photo"
                    onMouseDown={()=>setIsPhotoViewerOpen(false)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]" onMouseDown={event=>event.stopPropagation()}>
                        <button
                            type="button"
                            className="absolute -right-3 -top-3 z-10 grid h-9 w-9 place-items-center rounded-full border-2 border-[#2563EB] bg-white text-[#2563EB] shadow-sm"
                            onClick={()=>setIsPhotoViewerOpen(false)}
                            aria-label="Close photo preview"
                        >
                            <Icon name="close" size={18}/>
                        </button>
                        <img
                            src={profileImage}
                            alt={`${user.name}'s full-size profile photo`}
                            className="max-h-[85vh] max-w-[85vw] rounded-2xl border-2 border-white object-contain bg-white"
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

function Reports(){
    const {user} = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeframe, setTimeframe] = useState('all_time');

    const loadReport = () => {
        if (!['admin', 'staff'].includes(user?.role)) return;
        setLoading(true);
        setError('');
        api.get('/admin/reports')
            .then(r => {
                setReport(r.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load performance report data.');
                setLoading(false);
            });
    };

    useEffect(() => {
        loadReport();
    }, [user]);

    if (!['admin', 'staff'].includes(user?.role)) return <Navigate to={getRoleDashboard(user?.role)} replace/>;

    const handleExportCSV = () => {
        if (!report) return;
        let csv = 'Category,Donated Quantity,Requested Quantity,Balance,Fulfillment Coverage %\n';
        (report.category_balance || []).forEach(row => {
            const donated = Number(row.donated_quantity || 0);
            const requested = Number(row.requested_quantity || 0);
            const balance = donated - requested;
            const coverage = requested > 0 ? Math.min(100, Math.round((donated / requested) * 100)) : 100;
            csv += `"${row.category}",${donated},${requested},${balance},${coverage}%\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ReliefLink_Performance_Report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const categories = report?.category_balance || [];
    const totalDonated = categories.reduce((sum, c) => sum + Number(c.donated_quantity || 0), 0);
    const totalRequested = categories.reduce((sum, c) => sum + Number(c.requested_quantity || 0), 0);
    const overallCoverage = totalRequested > 0 ? Math.min(100, Math.round((totalDonated / totalRequested) * 100)) : 100;

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">REPORTS AND ANALYTICS</p>
                    <h1 className="page-title">Performance Report</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        System metrics, authorization rates, category balances, and fulfillment throughput.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        className="field text-sm font-bold min-w-[140px]"
                        value={timeframe}
                        onChange={e => setTimeframe(e.target.value)}
                    >
                        <option value="all_time">All Time</option>
                        <option value="this_month">This Month</option>
                        <option value="this_week">This Week</option>
                        <option value="today">Today</option>
                    </select>
                    <Button variant="secondary" onClick={loadReport} loading={loading}>
                        <Icon name="activity"/>
                        <span className="ml-1 text-xs">Refresh Data</span>
                    </Button>
                    <Button onClick={handleExportCSV} disabled={!report}>
                        <Icon name="reports"/>
                        <span className="ml-1 text-xs">Export CSV</span>
                    </Button>
                </div>
            </div>

            <Error>{error}</Error>

            {loading ? (
                <div className="panel p-12 text-center font-bold text-[#2563EB]">
                    Loading performance analytics & category balance data...
                </div>
            ) : !report ? (
                <div className="panel p-8 text-center font-bold text-[#2563EB]">
                    No report data available.
                </div>
            ) : (
                <>
                    <section className="panel p-6 bg-white space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/20 pb-3">
                            <div>
                                <h2 className="text-lg font-extrabold text-[#2563EB]">Executive Performance Summary</h2>
                                <p className="text-xs text-[#2563EB]/70 font-semibold">Key insights computed from live campus exchange data</p>
                            </div>
                            <span className="rounded-xl border border-[#22C55E] bg-[#22C55E] px-3 py-1 text-xs font-extrabold text-white">
                                {overallCoverage}% Overall Demand Met
                            </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 text-xs font-semibold">
                            <div className="rounded-xl border border-[#2563EB]/20 p-4 bg-white">
                                <span className="text-[#2563EB]/70 block font-bold uppercase text-[10px]">Supply vs Demand Ratio</span>
                                <p className="text-lg font-extrabold text-[#2563EB] mt-1">{totalDonated} Donated / {totalRequested} Requested</p>
                                <p className="text-[11px] text-[#2563EB]/80 mt-1">
                                    {totalDonated >= totalRequested ? 'Surplus available across categories.' : 'Demand exceeds current available donation items.'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#2563EB]/20 p-4 bg-white">
                                <span className="text-[#2563EB]/70 block font-bold uppercase text-[10px]">Request Authorization</span>
                                <p className="text-lg font-extrabold text-[#22C55E] mt-1">{report.approval_rate}% Approved</p>
                                <p className="text-[11px] text-[#2563EB]/80 mt-1">High review efficiency maintains quick assistance turnaround.</p>
                            </div>

                            <div className="rounded-xl border border-[#2563EB]/20 p-4 bg-white">
                                <span className="text-[#2563EB]/70 block font-bold uppercase text-[10px]">Match Confirmation</span>
                                <p className="text-lg font-extrabold text-[#22C55E] mt-1">{report.confirmation_rate}% Confirmed</p>
                                <p className="text-[11px] text-[#2563EB]/80 mt-1">Paired donations successfully authorized for scheduled handoff.</p>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-xs font-extrabold text-[#2563EB]">
                                <span>Campus Demand Fulfillment Progress</span>
                                <span>{overallCoverage}%</span>
                            </div>
                            <div className="h-3.5 w-full rounded-full border border-[#2563EB]/20 bg-[#2563EB]/10 overflow-hidden">
                                <div
                                    className="h-full bg-[#22C55E] transition-all duration-500"
                                    style={{ width: `${overallCoverage}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <article className="panel p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Request Approval Rate</p>
                                <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{report.approval_rate}%</strong>
                                <span className="text-[11px] font-semibold text-[#2563EB]/80 mt-1 block">Reviewed & authorized aid requests</span>
                            </div>
                            <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#22C55E] bg-white text-[#22C55E]">
                                <Icon name="check"/>
                            </span>
                        </article>

                        <article className="panel p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Match Confirmation Rate</p>
                                <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{report.confirmation_rate}%</strong>
                                <span className="text-[11px] font-semibold text-[#2563EB]/80 mt-1 block">Proposed matches confirmed for delivery</span>
                            </div>
                            <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#22C55E] bg-white text-[#22C55E]">
                                <Icon name="match"/>
                            </span>
                        </article>

                        <article className="panel p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Active Donors</p>
                                <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{report.coverage.active_donors}</strong>
                                <span className="text-[11px] font-semibold text-[#2563EB]/80 mt-1 block">Registered donors supporting campus</span>
                            </div>
                            <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                                <Icon name="donation"/>
                            </span>
                        </article>

                        <article className="panel p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Active Beneficiaries</p>
                                <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{report.coverage.active_beneficiaries}</strong>
                                <span className="text-[11px] font-semibold text-[#2563EB]/80 mt-1 block">Registered students seeking assistance</span>
                            </div>
                            <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                                <Icon name="request"/>
                            </span>
                        </article>

                        <article className="panel p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Fulfilled Donations</p>
                                <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{report.coverage.fulfilled_donations}</strong>
                                <span className="text-[11px] font-semibold text-[#2563EB]/80 mt-1 block">Donated items handed off to students</span>
                            </div>
                            <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                                <Icon name="check"/>
                            </span>
                        </article>

                        <article className="panel p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Fulfilled Requests</p>
                                <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{report.coverage.fulfilled_requests}</strong>
                                <span className="text-[11px] font-semibold text-[#2563EB]/80 mt-1 block">Student requests fully satisfied</span>
                            </div>
                            <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                                <Icon name="check"/>
                            </span>
                        </article>
                    </div>

                    <section className="panel p-6 bg-white space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2563EB]/20 pb-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-[#2563EB]">Category Balance & Distribution</h2>
                                <p className="text-xs text-[#2563EB]/70 font-semibold">Detailed resource supply vs demand breakdown per category</p>
                            </div>
                            <span className="text-xs font-bold text-[#2563EB]">{categories.length} Categories Analyzed</span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Visual Supply vs Demand Charts</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {categories.map(cat => {
                                    const d = Number(cat.donated_quantity || 0);
                                    const r = Number(cat.requested_quantity || 0);
                                    const maxVal = Math.max(d, r, 1);
                                    const dPct = Math.round((d / maxVal) * 100);
                                    const rPct = Math.round((r / maxVal) * 100);
                                    const balance = d - r;

                                    return (
                                        <div key={cat.category} className="rounded-xl border border-[#2563EB] p-4 space-y-3 bg-white">
                                            <div className="flex justify-between items-center">
                                                <strong className="text-sm font-extrabold text-[#2563EB]">{title(cat.category)}</strong>
                                                <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${balance >= 0 ? 'bg-[#22C55E] text-white' : 'border border-[#2563EB] text-[#2563EB]'}`}>
                                                    {balance >= 0 ? `+${balance} Surplus` : `${balance} Deficit`}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[11px] font-bold text-[#2563EB]">
                                                    <span>Donated: {d} units</span>
                                                    <span>{dPct}%</span>
                                                </div>
                                                <div className="h-2.5 w-full rounded-full bg-[#2563EB]/10 overflow-hidden">
                                                    <div className="h-full bg-[#2563EB] transition-all" style={{ width: `${dPct}%` }}/>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[11px] font-bold text-[#2563EB]">
                                                    <span>Requested: {r} units</span>
                                                    <span>{rPct}%</span>
                                                </div>
                                                <div className="h-2.5 w-full rounded-full bg-[#22C55E]/10 overflow-hidden">
                                                    <div className="h-full bg-[#22C55E] transition-all" style={{ width: `${rPct}%` }}/>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Category Data Breakdown</h3>
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Donated Quantity</th>
                                            <th>Requested Quantity</th>
                                            <th>Net Balance</th>
                                            <th>Fulfillment Coverage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(x => {
                                            const d = Number(x.donated_quantity || 0);
                                            const r = Number(x.requested_quantity || 0);
                                            const net = d - r;
                                            const pct = r > 0 ? Math.min(100, Math.round((d / r) * 100)) : 100;

                                            return (
                                                <tr key={x.category}>
                                                    <td><strong>{title(x.category)}</strong></td>
                                                    <td><strong className="text-[#2563EB]">{d} units</strong></td>
                                                    <td><strong className="text-[#2563EB]">{r} units</strong></td>
                                                    <td>
                                                        <span className={`font-extrabold ${net >= 0 ? 'text-[#22C55E]' : 'text-[#2563EB]'}`}>
                                                            {net >= 0 ? `+${net} surplus` : `${net} deficit`}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 rounded-full bg-[#2563EB]/10 overflow-hidden shrink-0">
                                                                <div className="h-full bg-[#22C55E]" style={{ width: `${pct}%` }}/>
                                                            </div>
                                                            <span className="text-xs font-extrabold text-[#2563EB]">{pct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

function Activities(){
    const {user} = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewingLog, setViewingLog] = useState(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const load = () => {
        if (!['admin', 'staff'].includes(user?.role)) return;
        setLoading(true);
        setError('');
        api.get('/admin/activities')
            .then(r => {
                setData(r.data.data || r.data || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load activity logs.');
                setLoading(false);
            });
    };

    useEffect(() => {
        load();
    }, [user]);

    if (!['admin', 'staff'].includes(user?.role)) return <Navigate to={getRoleDashboard(user?.role)} replace/>;

    const handleExportCSV = () => {
        if (!data.length) return;
        let csv = 'Log ID,Action,Performed By,Subject Type,Subject ID,Timestamp\n';
        data.forEach(x => {
            const id = x.id || '';
            const action = `"${(x.action || '').replace(/"/g, '""')}"`;
            const actor = `"${(x.user?.name || 'System').replace(/"/g, '""')}"`;
            const subjectType = `"${(x.subject_type || 'N/A').replace(/"/g, '""')}"`;
            const subjectId = x.subject_id || 'N/A';
            const timestamp = `"${new Date(x.created_at).toLocaleString()}"`;
            csv += `${id},${action},${actor},${subjectType},${subjectId},${timestamp}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ReliefLink_Activity_Logs_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    let filtered = data.filter(x => {
        const actionStr = (x.action || '').toLowerCase();
        let matchesType = true;
        if (actionFilter === 'users') matchesType = actionStr.includes('user');
        else if (actionFilter === 'requests') matchesType = actionStr.includes('request');
        else if (actionFilter === 'donations') matchesType = actionStr.includes('donation');
        else if (actionFilter === 'matches') matchesType = actionStr.includes('match');

        const q = search.toLowerCase();
        const matchesSearch = !search ||
            actionStr.includes(q) ||
            (x.user?.name && x.user.name.toLowerCase().includes(q)) ||
            (x.subject_type && x.subject_type.toLowerCase().includes(q)) ||
            (x.subject_id && String(x.subject_id).includes(q));

        return matchesType && matchesSearch;
    });

    filtered.sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const userCount = data.filter(x => (x.action || '').toLowerCase().includes('user')).length;
    const requestCount = data.filter(x => (x.action || '').toLowerCase().includes('request')).length;
    const matchCount = data.filter(x => (x.action || '').toLowerCase().includes('match')).length;

    const getActionCategory = actionStr => {
        const act = (actionStr || '').toLowerCase();
        if (act.includes('user')) return 'User Management';
        if (act.includes('request')) return 'Support Request';
        if (act.includes('donation')) return 'Donation Listing';
        if (act.includes('match')) return 'Match Engine';
        return 'System Audit';
    };

    const getActionIcon = actionStr => {
        const act = (actionStr || '').toLowerCase();
        if (act.includes('user')) return 'profile';
        if (act.includes('request')) return 'request';
        if (act.includes('donation')) return 'donation';
        if (act.includes('match')) return 'match';
        return 'activity';
    };

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">ACCOUNTABILITY & AUDIT TRAIL</p>
                    <h1 className="page-title">Activity Log</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Monitor system operations, administrative actions, account changes, and authorization records.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" onClick={load} loading={loading}>
                        <Icon name="activity"/>
                        <span className="ml-1 text-xs">Refresh Logs</span>
                    </Button>
                    <Button onClick={handleExportCSV} disabled={!data.length}>
                        <Icon name="reports"/>
                        <span className="ml-1 text-xs">Export CSV</span>
                    </Button>
                </div>
            </div>

            <Error>{error}</Error>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Total Audit Logs</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{data.length}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="activity"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">User Account Events</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{userCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="profile"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Support Request Events</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{requestCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-white text-[#22C55E]">
                        <Icon name="request"/>
                    </span>
                </article>

                <article className="panel no-hover p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Match Operations</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{matchCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="match"/>
                    </span>
                </article>
            </div>

            <div className="panel no-hover p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Search Audit Trail</label>
                    <input
                        type="text"
                        placeholder="Search by action, administrator, target ID..."
                        className="field w-full text-sm"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="min-w-[160px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Filter by Module</label>
                    <select
                        className="field w-full text-sm"
                        value={actionFilter}
                        onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Modules</option>
                        <option value="users">User Accounts</option>
                        <option value="requests">Support Requests</option>
                        <option value="donations">Donations</option>
                        <option value="matches">Match Operations</option>
                    </select>
                </div>

                <div className="min-w-[150px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Sort Order</label>
                    <select
                        className="field w-full text-sm"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="panel p-8 text-center font-bold text-[#2563EB]">
                    Loading activity log history...
                </div>
            ) : !filtered.length ? (
                <div className="panel p-8 text-center">
                    <p className="font-bold text-[#2563EB] text-lg">No activity log entries found.</p>
                    <p className="text-xs text-[#2563EB]/80 font-semibold mt-1">Try adjusting your search query or module filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {paginated.map(x => (
                        <article key={x.id} className="panel p-4 flex flex-wrap items-center justify-between gap-4 bg-white hover:border-[#22C55E] transition">
                            <div className="flex items-start gap-3.5 min-w-0">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] mt-0.5">
                                    <Icon name={getActionIcon(x.action)}/>
                                </span>
                                <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <strong className="text-base text-[#2563EB]">{title(x.action)}</strong>
                                        <span className="rounded bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#2563EB] border border-[#2563EB]/20">
                                            {getActionCategory(x.action)}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-[#2563EB]/80">
                                        Executed by: <strong className="text-[#2563EB]">{x.user?.name || 'System Administrator'}</strong>
                                        {x.subject_type && ` • Target: ${x.subject_type.split('\\').pop()} #${x.subject_id || ''}`}
                                    </p>
                                    <p className="text-[11px] font-bold text-[#2563EB]/60">
                                        {new Date(x.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="secondary" onClick={() => setViewingLog(x)}>
                                    <Icon name="eye"/>
                                    <span className="ml-1 text-xs">View Details</span>
                                </Button>
                            </div>
                        </article>
                    ))}

                    {totalPages > 1 && (
                        <div className="panel p-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xs font-bold text-[#2563EB]">
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} audit entries
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &larr; Previous
                                </Button>
                                <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next &rarr;
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewingLog && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel no-hover w-full max-w-lg p-6 bg-white space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Activity Audit Log Inspection</h2>
                            <button className="nav-link p-1" onClick={() => setViewingLog(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>

                        <div>
                            <span className="rounded bg-[#2563EB]/10 px-2.5 py-1 text-xs font-extrabold text-[#2563EB] border border-[#2563EB]/20">
                                Log Entry #{viewingLog.id}
                            </span>
                            <h3 className="text-xl font-extrabold text-[#2563EB] mt-2">{title(viewingLog.action)}</h3>
                        </div>

                        <div className="space-y-2 border-t border-b border-[#2563EB]/20 py-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Action Category:</span>
                                <span className="font-semibold text-[#2563EB]">{getActionCategory(viewingLog.action)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Performed By:</span>
                                <span className="font-semibold text-[#2563EB]">{viewingLog.user?.name || 'System Administrator'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-[#2563EB]/70">Exact Timestamp:</span>
                                <span className="font-semibold text-[#2563EB]">{new Date(viewingLog.created_at).toLocaleString()}</span>
                            </div>
                            {viewingLog.subject_type && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-[#2563EB]/70">Target Model:</span>
                                    <code className="text-xs font-extrabold text-[#2563EB]">{viewingLog.subject_type}</code>
                                </div>
                            )}
                            {viewingLog.subject_id && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-[#2563EB]/70">Target Model ID:</span>
                                    <span className="font-extrabold text-[#2563EB]">#{viewingLog.subject_id}</span>
                                </div>
                            )}
                            {viewingLog.metadata && Object.keys(viewingLog.metadata).length > 0 && (
                                <div className="pt-2">
                                    <span className="font-bold text-[#2563EB]/70 block mb-1">Logged Metadata:</span>
                                    <pre className="p-3 bg-[#2563EB]/5 rounded-lg border border-[#2563EB]/20 text-xs font-mono text-[#2563EB] overflow-x-auto">
                                        {JSON.stringify(viewingLog.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-1">
                            <Button variant="secondary" onClick={() => setViewingLog(null)}>
                                Close Inspection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function NotificationsPage(){
    const{user}=useAuth();
    const {
        items,
        unreadCount: sharedUnreadCount,
        loading,
        error,
        refresh,
        markAsRead: markNotificationAsRead,
        markAllAsRead: markAllNotificationsAsRead,
        removeNotification,
        clearNotifications,
    }=useNotifications();
    const navigate=useNavigate();
    const[actionLoading,setActionLoading]=useState(false);
    const[actionError,setActionError]=useState('');
    const[search,setSearch]=useState('');
    const[readFilter,setReadFilter]=useState('all');
    const[sortBy,setSortBy]=useState('newest');
    const[inspecting,setInspecting]=useState(null);
    const[deletingNotif,setDeletingNotif]=useState(null);
    const[page,setPage]=useState(1);
    const pageSize=10;

    if(!user)return <Navigate to="/login"/>;

    const markAsRead=async(id)=>{
        try{
            await markNotificationAsRead(id);
            setActionError('');
            if(inspecting?.id===id) setInspecting(prev=>prev?{...prev,is_read:true}:null);
        }catch(e){
            setActionError('Could not mark this notification as read. Please try again.');
        }
    };

    const markAllRead=async()=>{
        setActionLoading(true);
        try{
            await markAllNotificationsAsRead();
            setActionError('');
            if(inspecting) setInspecting(prev=>prev?{...prev,is_read:true}:null);
        }catch(e){
            setActionError('Could not mark all notifications as read. Please try again.');
        }finally{
            setActionLoading(false);
        }
    };

    const deleteOne=async(id)=>{
        try{
            await removeNotification(id);
            setActionError('');
            if(inspecting?.id===id) setInspecting(null);
            setDeletingNotif(null);
        }catch(e){
            setActionError('Could not delete this notification. Please try again.');
        }
    };

    const clearAll=async()=>{
        if(window.confirm('Clear all notifications? This action cannot be undone.')){
            setActionLoading(true);
            try{
                await clearNotifications();
                setActionError('');
                setInspecting(null);
            }catch(e){
                setActionError('Could not clear notifications. Please try again.');
            }finally{
                setActionLoading(false);
            }
        }
    };

    const getCategoryFromMessage=(msg)=>{
        if(!msg) return 'system';
        const lower=msg.toLowerCase();
        if(lower.includes('match')||lower.includes('paired')) return 'match';
        if(lower.includes('request')||lower.includes('aid')||lower.includes('approv')||lower.includes('reject')) return 'request';
        if(lower.includes('donat')||lower.includes('item')||lower.includes('resource')) return 'donation';
        if(lower.includes('handoff')||lower.includes('deliver')||lower.includes('schedul')) return 'handoff';
        return 'system';
    };

    const categoryIcon={match:'match',request:'request',donation:'donation',handoff:'approvals',system:'activity'};
    const categoryLabel={match:'Match Update',request:'Request Update',donation:'Donation Alert',handoff:'Handoff Notice',system:'System Alert'};

    let filtered=items.filter(n=>{
        const matchesRead=readFilter==='all'||(readFilter==='unread'&&!n.is_read)||(readFilter==='read'&&n.is_read);
        const q=search.toLowerCase();
        const matchesSearch=!search||(n.message&&n.message.toLowerCase().includes(q));
        return matchesRead&&matchesSearch;
    });

    filtered.sort((a,b)=>{
        if(sortBy==='newest') return new Date(b.created_at||0)-new Date(a.created_at||0);
        if(sortBy==='oldest') return new Date(a.created_at||0)-new Date(b.created_at||0);
        return 0;
    });

    const totalPages=Math.ceil(filtered.length/pageSize)||1;
    const currentPage=Math.min(page,totalPages);
    const paginated=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);

    const totalCount=items.length;
    const unreadCount=sharedUnreadCount;
    const readCount=items.filter(n=>n.is_read).length;

    const getRelativeTime=(dateStr)=>{
        if(!dateStr) return 'Just now';
        const diff=Date.now()-new Date(dateStr).getTime();
        const mins=Math.floor(diff/60000);
        if(mins<1) return 'Just now';
        if(mins<60) return `${mins}m ago`;
        const hrs=Math.floor(mins/60);
        if(hrs<24) return `${hrs}h ago`;
        const days=Math.floor(hrs/24);
        if(days<7) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <main className="page space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">ALERTS & UPDATES</p>
                    <h1 className="page-title">Notifications</h1>
                    <p className="mt-1 text-sm font-semibold text-[#2563EB]/80">
                        Stay up to date with support requests, donations, matches, and handoff progress.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" onClick={()=>refresh({showLoading:true})} loading={loading}>
                        <Icon name="activity"/>
                        <span className="ml-1 text-xs">Refresh</span>
                    </Button>
                    {unreadCount>0&&(
                        <Button variant="secondary" loading={actionLoading} onClick={markAllRead}>
                            <Icon name="check"/>
                            <span className="ml-1 text-xs">Mark All Read</span>
                        </Button>
                    )}
                    {totalCount>0&&(
                        <Button variant="secondary" loading={actionLoading} onClick={clearAll}>
                            <Icon name="delete"/>
                            <span className="ml-1 text-xs">Clear All</span>
                        </Button>
                    )}
                </div>
            </div>

            <Error>{actionError||error}</Error>

            <div className="grid gap-4 sm:grid-cols-3">
                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Total Notifications</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{totalCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="bell"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Unread Alerts</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#22C55E]">{unreadCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#22C55E] bg-[#22C55E] text-white">
                        <Icon name="bell"/>
                    </span>
                </article>

                <article className="panel p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]/70">Read / Dismissed</p>
                        <strong className="mt-1 block text-3xl font-extrabold text-[#2563EB]">{readCount}</strong>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#2563EB] bg-white text-[#2563EB]">
                        <Icon name="check"/>
                    </span>
                </article>
            </div>

            <div className="panel p-4 sm:p-5 space-y-4 bg-white">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#2563EB]/15 pb-3">
                    {[
                        {key:'all',label:`All (${totalCount})`},
                        {key:'unread',label:`Unread (${unreadCount})`,accent:true},
                        {key:'read',label:`Read (${readCount})`}
                    ].map(tab=>(
                        <button
                            key={tab.key}
                            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                                readFilter===tab.key
                                    ?(tab.accent?'bg-[#22C55E] text-white border border-[#22C55E]':'bg-[#2563EB] text-white border border-[#2563EB]')
                                    :(tab.accent?'bg-white text-[#22C55E] border border-[#22C55E]/30 hover:bg-[#22C55E]/10':'bg-white text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#2563EB]/10')
                            }`}
                            onClick={()=>{setReadFilter(tab.key);setPage(1);}}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Search Notifications</label>
                        <input
                            type="text"
                            placeholder="Search by notification content..."
                            className="field w-full text-sm"
                            value={search}
                            onChange={e=>{setSearch(e.target.value);setPage(1);}}
                        />
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB]/70 mb-1">Sort By</label>
                        <select
                            className="field w-full text-sm"
                            value={sortBy}
                            onChange={e=>setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading?(
                <div className="panel p-8 text-center font-bold text-[#2563EB]">
                    Loading notifications…
                </div>
            ):!filtered.length?(
                <div className="panel p-12 text-center bg-white space-y-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#22C55E] bg-[#22C55E] text-white mx-auto">
                        <Icon name="check"/>
                    </span>
                    <h3 className="font-extrabold text-[#2563EB] text-xl">You're all caught up!</h3>
                    <p className="text-xs text-[#2563EB]/80 font-semibold max-w-sm mx-auto">
                        {readFilter==='unread'
                            ?'No unread notifications. Switch to "All" to see previous alerts.'
                            :'You have no notifications at this time. New activity will appear here when it is ready.'}
                    </p>
                </div>
            ):(
                <div className="space-y-3">
                    {paginated.map(n=>{
                        const cat=n.type||getCategoryFromMessage(n.message);
                        return (
                            <article
                                key={n.id}
                                className={`panel p-4 sm:p-5 flex flex-wrap items-start justify-between gap-4 transition cursor-pointer hover:border-[#22C55E] ${!n.is_read?'border-l-4 border-l-[#22C55E] bg-[#2563EB]/5':''}`}
                                onClick={()=>{setInspecting(n);if(!n.is_read) markAsRead(n.id);}}
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${!n.is_read?'bg-[#22C55E] text-white':'bg-[#2563EB]/10 text-[#2563EB]'}`}>
                                        <Icon name={categoryIcon[cat]||'bell'} size={18}/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/60 bg-[#2563EB]/5 px-2 py-0.5 rounded border border-[#2563EB]/15">
                                                {categoryLabel[cat]||'Alert'}
                                            </span>
                                            {n.priority==='high'&&<span className="inline-block rounded border border-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 text-[10px] font-extrabold text-[#22C55E]">PRIORITY</span>}
                                            {!n.is_read&&<span className="inline-block rounded bg-[#22C55E] px-1.5 py-0.5 text-[10px] font-extrabold text-white">NEW</span>}
                                        </div>
                                        <p className="mt-1.5 font-bold text-[#2563EB] text-sm leading-relaxed line-clamp-2">{n.message}</p>
                                        <p className="mt-1 text-[11px] font-semibold text-[#2563EB]/60">
                                            {getRelativeTime(n.created_at)} • {n.created_at?new Date(n.created_at).toLocaleString():'Recent'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0" onClick={e=>e.stopPropagation()}>
                                    {!n.is_read&&(
                                        <Button variant="secondary" onClick={()=>markAsRead(n.id)}>
                                            <Icon name="check"/>
                                            <span className="ml-1 text-xs hidden sm:inline">Read</span>
                                        </Button>
                                    )}
                                    <Button variant="secondary" title="Delete notification" onClick={()=>setDeletingNotif(n)}>
                                        <Icon name="delete"/>
                                    </Button>
                                </div>
                            </article>
                        );
                    })}

                    {totalPages>1&&(
                        <div className="panel p-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-xs font-bold text-[#2563EB]">
                                Showing {(currentPage-1)*pageSize+1} to {Math.min(currentPage*pageSize,filtered.length)} of {filtered.length} notifications
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={currentPage===1}
                                    onClick={()=>setPage(p=>Math.max(1,p-1))}
                                >
                                    &larr; Previous
                                </Button>
                                <span className="text-xs font-extrabold text-[#2563EB] px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    disabled={currentPage===totalPages}
                                    onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
                                >
                                    Next &rarr;
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {inspecting&&(
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-lg p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Notification Details</h2>
                            <button className="nav-link p-1" onClick={()=>setInspecting(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${!inspecting.is_read?'bg-[#22C55E] text-white':'bg-[#2563EB]/10 text-[#2563EB]'}`}>
                                <Icon name={categoryIcon[inspecting.type||getCategoryFromMessage(inspecting.message)]||'bell'} size={22}/>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]/60 bg-[#2563EB]/5 px-2 py-0.5 rounded border border-[#2563EB]/15">
                                        {categoryLabel[inspecting.type||getCategoryFromMessage(inspecting.message)]||'Alert'}
                                    </span>
                                    <Badge status={inspecting.is_read?'read':'unread'}/>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-b border-[#2563EB]/20 py-4">
                            <p className="text-sm font-bold text-[#2563EB] leading-relaxed">{inspecting.message}</p>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-[#2563EB]/70">Received:</span>
                                <span className="font-semibold text-[#2563EB]">
                                    {inspecting.created_at?new Date(inspecting.created_at).toLocaleString():'Recent alert'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-[#2563EB]/70">Relative Time:</span>
                                <span className="font-semibold text-[#2563EB]">{getRelativeTime(inspecting.created_at)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-[#2563EB]/70">Status:</span>
                                <span className={`font-extrabold ${inspecting.is_read?'text-[#2563EB]':'text-[#22C55E]'}`}>
                                    {inspecting.is_read?'Read':'Unread'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-[#2563EB]/70">Seen:</span>
                                <span className="font-semibold text-[#2563EB]">{inspecting.seen_at ? new Date(inspecting.seen_at).toLocaleString() : 'Not yet viewed'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-[#2563EB]/70">Category:</span>
                                <span className="font-semibold text-[#2563EB]">{categoryLabel[inspecting.type||getCategoryFromMessage(inspecting.message)]||'System Alert'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-[#2563EB]/70">Priority:</span>
                                <span className="font-semibold text-[#2563EB]">{title(inspecting.priority||'normal')}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2">
                                {!inspecting.is_read&&(
                                    <Button onClick={()=>markAsRead(inspecting.id)}>
                                        <Icon name="check"/>
                                        <span className="ml-1">Mark as Read</span>
                                    </Button>
                                )}
                                <Button variant="secondary" onClick={()=>{setInspecting(null);setDeletingNotif(inspecting);}}>
                                    <Icon name="delete"/>
                                    <span className="ml-1">Delete</span>
                                </Button>
                            </div>
                            {inspecting.action_url&&(
                                <Button onClick={()=>{markAsRead(inspecting.id);setInspecting(null);navigate(inspecting.action_url);}}>
                                    <Icon name="arrow"/><span className="ml-1">Open related item</span>
                                </Button>
                            )}
                            <Button variant="secondary" onClick={()=>setInspecting(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deletingNotif&&(
                <div className="fixed inset-0 z-40 grid place-items-center bg-[#2563EB]/40 backdrop-blur-sm p-4">
                    <div className="panel w-full max-w-md p-6 bg-white space-y-4">
                        <div className="flex items-center justify-between border-b border-[#2563EB]/20 pb-3">
                            <h2 className="text-lg font-extrabold text-[#2563EB]">Delete Notification</h2>
                            <button className="nav-link p-1" onClick={()=>setDeletingNotif(null)} title="Close">
                                <Icon name="close"/>
                            </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2563EB]">
                            Are you sure you want to delete this notification?
                        </p>
                        <p className="text-xs text-[#2563EB] bg-[#2563EB]/5 p-3 rounded-lg border border-[#2563EB]/20 leading-relaxed italic">
                            "{deletingNotif.message}"
                        </p>
                        <p className="text-xs font-bold text-[#2563EB]/70">
                            This action cannot be undone.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button onClick={()=>deleteOne(deletingNotif.id)}>
                                <Icon name="delete"/>
                                <span className="ml-1">Confirm Delete</span>
                            </Button>
                            <Button variant="secondary" onClick={()=>setDeletingNotif(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function App() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white lg:flex">
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            <div className="flex flex-1 flex-col min-w-0 min-h-screen">
                <Header setMobileOpen={setMobileOpen} />
                <main className="flex-1 min-w-0">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/login" element={<Auth/>}/>
                        <Route path="/register" element={<Auth register/>}/>

                        {/* Admin Only Routes */}
                        <Route path="/dashboard" element={<RouteGuard roles={['admin']}><Dashboard/></RouteGuard>}/>
                        <Route path="/users" element={<RouteGuard roles={['admin']}><List kind="users"/></RouteGuard>}/>
                        <Route path="/reports" element={<RouteGuard roles={['admin']}><Reports/></RouteGuard>}/>
                        <Route path="/activities" element={<RouteGuard roles={['admin']}><Activities/></RouteGuard>}/>
                        <Route path="/admin/categories" element={<RouteGuard roles={['admin']}><AdminCategories/></RouteGuard>}/>
                        <Route path="/admin/approvals" element={<RouteGuard roles={['admin']}><AdminApprovals/></RouteGuard>}/>
                        <Route path="/admin/announcements" element={<RouteGuard roles={['admin']}><AdminAnnouncements/></RouteGuard>}/>
                        <Route path="/admin/settings" element={<RouteGuard roles={['admin']}><AdminSettings/></RouteGuard>}/>

                        {/* Donor Only Routes */}
                        <Route path="/donor/dashboard" element={<RouteGuard roles={['donor']}><DonorDashboard/></RouteGuard>}/>
                        <Route path="/donate" element={<RouteGuard roles={['donor']}><ResourceForm donation/></RouteGuard>}/>
                        <Route path="/donor/needs" element={<RouteGuard roles={['donor']}><DonorNeeds/></RouteGuard>}/>
                        <Route path="/donor/fulfillment" element={<RouteGuard roles={['donor']}><FulfillmentPage role="donor"/></RouteGuard>}/>
                        <Route path="/donor/history" element={<RouteGuard roles={['donor']}><HistoryPage role="donor"/></RouteGuard>}/>

                        {/* Beneficiary Only Routes */}
                        <Route path="/beneficiary/dashboard" element={<RouteGuard roles={['beneficiary']}><BeneficiaryDashboard/></RouteGuard>}/>
                        <Route path="/request-help" element={<RouteGuard roles={['beneficiary']}><ResourceForm/></RouteGuard>}/>
                        <Route path="/beneficiary/fulfillment" element={<RouteGuard roles={['beneficiary']}><FulfillmentPage role="beneficiary"/></RouteGuard>}/>
                        <Route path="/beneficiary/history" element={<RouteGuard roles={['beneficiary']}><HistoryPage role="beneficiary"/></RouteGuard>}/>

                        {/* Staff Only Routes */}
                        <Route path="/staff/dashboard" element={<RouteGuard roles={['staff', 'admin']}><StaffDashboard/></RouteGuard>}/>
                        <Route path="/staff/verifications" element={<RouteGuard roles={['staff', 'admin']}><StaffVerificationDesk/></RouteGuard>}/>
                        <Route path="/staff/inventory" element={<RouteGuard roles={['staff', 'admin']}><StaffWarehouseInventory/></RouteGuard>}/>
                        <Route path="/staff/desk" element={<RouteGuard roles={['staff', 'admin']}><StaffWalkInDesk/></RouteGuard>}/>
                        <Route path="/staff/handoffs" element={<RouteGuard roles={['staff', 'admin']}><StaffHandoffDispatch/></RouteGuard>}/>
                        <Route path="/staff/activity" element={<RouteGuard roles={['staff', 'admin']}><Activities/></RouteGuard>}/>
                        <Route path="/staff/approvals" element={<RouteGuard roles={['staff', 'admin']}><StaffVerificationDesk/></RouteGuard>}/>
                        <Route path="/staff/fulfillments" element={<RouteGuard roles={['staff', 'admin']}><StaffHandoffDispatch/></RouteGuard>}/>

                        {/* Shared Protected Routes */}
                        <Route path="/donations" element={<RouteGuard roles={['donor','staff','admin']}><List kind="donations"/></RouteGuard>}/>
                        <Route path="/requests" element={<RouteGuard roles={['beneficiary','staff','admin']}><List kind="requests"/></RouteGuard>}/>
                        <Route path="/matches" element={<RouteGuard roles={['donor','beneficiary','staff','admin']}><Matches/></RouteGuard>}/>
                        <Route path="/notifications" element={<RouteGuard roles={['donor','beneficiary','staff','admin']}><NotificationsPage/></RouteGuard>}/>
                        <Route path="/profile" element={<RouteGuard roles={['donor','beneficiary','staff','admin']}><Profile/></RouteGuard>}/>

                        <Route path="*" element={<Navigate to="/"/>}/>
                    </Routes>
                </main>
            </div>
        </div>
    );
}
