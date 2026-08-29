import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface LoginFormValues {
  username: string;
  password: string;
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';

  // If already logged in, skip login page
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null);
      await login(data.username, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Survey Platform</h1>
          <p className="text-text-secondary mt-2 text-sm">Sign in to your admin account</p>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="admin"
                className={errors.username ? 'border-danger' : ''}
                {...register('username', {
                  required: 'Username is required.',
                })}
              />
              {errors.username && (
                <p className="text-danger text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={errors.password ? 'border-danger' : ''}
                {...register('password', {
                  required: 'Password is required.',
                  minLength: { value: 6, message: 'Password must be at least 6 characters.' },
                })}
              />
              {errors.password && (
                <p className="text-danger text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-md px-4 py-3">
                {serverError}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
