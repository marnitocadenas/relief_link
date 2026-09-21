import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-600">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">ReliefLink</h1>
                    <p className="mt-2 text-gray-500">Campus Resource Exchange</p>
                </div>
                <div className="card card-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}