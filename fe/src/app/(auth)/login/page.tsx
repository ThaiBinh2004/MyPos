'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">FORHER</h1>
        <p className="mb-6 text-sm text-gray-500">Đăng nhập vào hệ thống</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Tài khoản"
            placeholder="Nhập tài khoản"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            error={errors.password?.message}
            {...register('password')}
          />

          {errors.root && (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}
