import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 text-sm leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'text-[#047857] font-black'
                    : 'text-slate-500 font-bold hover:text-slate-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
