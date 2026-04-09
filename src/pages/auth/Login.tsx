import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { GraduationCap, Loader2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#1a1a2e] to-[#16213e]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dark Orange Glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#ff8c00]/20 rounded-full blur-3xl animate-pulse"></div>
        {/* Cyan Glow */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00b7eb]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#ff8c00]/10 to-[#00b7eb]/10 rounded-full blur-3xl"></div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#ff8c00] rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-[#00b7eb] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-[#ff8c00]/60 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* 3D Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#ff8c00 1px, transparent 1px), linear-gradient(90deg, #ff8c00 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top'
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg animate-slide-up p-4">
        {/* Logo Section with 3D Effect */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c00] to-[#00b7eb] rounded-full blur-xl opacity-50 animate-pulse"></div>
            <img src="/logo.png" alt="Logo" className="relative h-24 w-24 object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c00] via-[#ffffff] to-[#00b7eb] mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-white/60 flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 text-[#ff8c00]" />
            Sign in to your SAMS account
            <Sparkles className="h-3 w-3 text-[#00b7eb]" />
          </p>
        </div>

        {/* Main Login Card with 3D Glass Effect */}
        <Card className="relative border-0 shadow-2xl bg-white/5 backdrop-blur-xl overflow-hidden group">
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c00]/20 via-[#00b7eb]/20 to-[#ff8c00]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff8c00] via-[#00b7eb] to-[#ff8c00]"></div>

          <form onSubmit={handleLogin}>
            <CardHeader className="pb-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ff8c00]/10 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#00b7eb]/10 to-transparent rounded-tr-full"></div>
            </CardHeader>

            <CardContent className="space-y-6 relative">
              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-white/80 font-semibold text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#ff8c00]" />
                  Email Address
                </Label>
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c00] to-[#00b7eb] rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 blur"></div>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff8c00]/20 to-[#ff8c00]/10 flex items-center justify-center transition-all duration-300 group-focus-within:scale-110">
                      <Mail className="h-5 w-5 text-[#ff8c00]" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-14 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8c00]/50 focus:ring-2 focus:ring-[#ff8c00]/20 transition-all duration-300"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/80 font-semibold text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#00b7eb]" />
                    Password
                  </Label>
                  <Link to="/forgot-password" className="text-xs text-[#00b7eb] hover:text-[#ff8c00] transition-colors duration-300">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00b7eb] to-[#ff8c00] rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 blur"></div>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-gradient-to-br from-[#00b7eb]/20 to-[#00b7eb]/10 flex items-center justify-center transition-all duration-300 group-focus-within:scale-110">
                      <Lock className="h-5 w-5 text-[#00b7eb]" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-14 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#00b7eb]/50 focus:ring-2 focus:ring-[#00b7eb]/20 transition-all duration-300"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4 relative">
              {/* Submit Button with 3D Effect */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl relative overflow-hidden group/btn transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #ff8c00 0%, #ff8c00 50%, #00b7eb 50%, #00b7eb 100%)',
                  backgroundSize: '200% 100%',
                  boxShadow: '0 4px 20px rgba(255, 140, 0, 0.4)'
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-5 w-5" />
                      Sign In
                      <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </Button>

              <p className="text-sm text-white/60 text-center">
                Don't have an account?{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c00] to-[#00b7eb] font-semibold">
                  Contact your administrator
                </span>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Footer Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#ff8c00]/30 transition-all duration-300 hover:scale-105">
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c00] to-[#ff8c00]/60">5000+</p>
            <p className="text-xs text-white/60 mt-1">Students</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#00b7eb]/30 transition-all duration-300 hover:scale-105">
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00b7eb] to-[#00b7eb]/60">200+</p>
            <p className="text-xs text-white/60 mt-1">Lecturers</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#ff8c00]/30 transition-all duration-300 hover:scale-105">
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c00] to-[#00b7eb]">99.9%</p>
            <p className="text-xs text-white/60 mt-1">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
