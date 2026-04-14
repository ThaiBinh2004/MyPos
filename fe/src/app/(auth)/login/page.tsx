'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/services/auth.service';
import { useAuth } from '@/contexts/auth-context';
import { Button, Input } from '@/components/ui';

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tài khoản'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await login(data);
      localStorage.setItem('token', res.token);
      setUser(res.user);
      router.push('/hr');
    } catch {
      setError('root', { message: 'Tài khoản hoặc mật khẩu không đúng' });
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-150 w-150 rounded-full bg-indigo-50 opacity-60" />
        <div className="absolute -bottom-40 -left-40 h-125 w-125 rounded-full bg-violet-50 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-200 w-200 rounded-full bg-indigo-50/30" />
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">FORHER ERP</h1>
            <p className="text-sm text-slate-400">Hệ thống quản lý doanh nghiệp</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Đăng nhập</h2>
            <p className="mt-1 text-sm text-slate-400">Nhập thông tin tài khoản để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Tài khoản"
              placeholder="admin"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <Button type="submit" className="mt-2 w-full" size="lg" loading={isSubmitting}>
              Đăng nhập
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-300">
          © {new Date().getFullYear()} FORHER Fashion
        </p>
      </div>
    </div>
  );
}
