import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`nav-link w-full justify-start ${active ? 'nav-link-active' : ''} ${className}`}
        >
            {children}
        </Link>
    );
}