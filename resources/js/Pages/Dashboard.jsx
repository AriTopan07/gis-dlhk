import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-black">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white border border-slate-100 rounded-[2rem]">
                        <div className="p-10 text-slate-600 font-medium">
                            Selamat Datang kembali!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
