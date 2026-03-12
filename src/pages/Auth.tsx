import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lovable } from '@/integrations/lovable';
import { motion } from 'framer-motion';
import { Mail, Lock, Chrome } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) setError(error.message);
      else setError('Kiểm tra email để xác nhận tài khoản!');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message || 'Google login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border bg-card p-8 card-shadow">
          <h1 className="font-display text-2xl font-bold text-center text-card-foreground mb-6">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h1>

          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome className="h-4 w-4 mr-2" />
            Tiếp tục với Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">hoặc</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
