import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nip: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-6 text-[11px] font-bold text-[#047857] bg-green-50/50 p-4 rounded-xl border border-green-100 italic text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="font-sans">


                <div className="space-y-6">
                    <div>
                        <InputLabel htmlFor="nip" value="NIP" className="text-[13px] font-bold text-black dark:text-black mb-2" />
                        <TextInput
                            id="nip"
                            type="text"
                            name="nip"
                            value={data.nip}
                            className="mt-1 block w-full bg-slate-50/50"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('nip', e.target.value)}
                        />
                        <InputError message={errors.nip} className="mt-2" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <InputLabel htmlFor="password" value="Password" className="text-[13px] font-bold text-black dark:text-black" />
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-[11px] font-bold text-[#047857] hover:underline transition-all tracking-tighter"
                                >
                                    Lupa Password?
                                </Link>
                            )}
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full bg-slate-50/50"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center py-1">
                        <label className="flex items-center cursor-pointer group">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="rounded-md border-slate-200 text-[#047857] focus:ring-[#047857]"
                            />
                             <span className="ms-3 text-[13px] font-bold text-black dark:text-black tracking-tight group-hover:text-black transition-colors">
                                 Ingat Saya
                             </span>
                        </label>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <PrimaryButton 
                            className="w-full justify-center" 
                            disabled={processing}
                        >
                            Masuk
                        </PrimaryButton>
                        <Link
                            href="/"
                            className="inline-flex w-full justify-center items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 transition duration-150 ease-in-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:ring-offset-2"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>


            </form>
        </GuestLayout>
    );
}
