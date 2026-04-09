import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { GraduationCap, Loader2, Mail, Lock, ArrowRight, Sparkles, CheckCircle, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#ff8c00]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00b7eb]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#ff8c00] rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-[#00b7eb] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Dot Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>

      <div className="relative z-10 w-full max-w-lg animate-slide-up p-4">
        {/* Back Button */}
        <div className="absolute top-0 left-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Button>
          </Link>
        </div>
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c00] to-[#00b7eb] rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <img src="/logo.png" alt="Logo" className="relative h-20 w-20 object-contain" />
          </div>
          <h1 className="text-3xl font-black font-heading text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-600 flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 text-[#ff8c00]" />
            Sign in to your SAMS account
            <Sparkles className="h-3 w-3 text-[#00b7eb]" />
          </p>
        </div>

        {/* Main Login Card */}
        <Card className="relative border border-slate-200 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff8c00] via-[#00b7eb] to-[#ff8c00]"></div>

          <form onSubmit={handleLogin}>
            <CardHeader className="pb-6">
              <div className="text-center">
                <p className="text-sm text-slate-600">Enter your credentials to access your account</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#ff8c00]" />
                  Email Address
                </Label>
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c00] to-[#00b7eb] rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-300 blur"></div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg bg-gradient-to-br from-[#ff8c00]/10 to-[#ff8c00]/5 flex items-center justify-center transition-all duration-300 group-focus-within:scale-105">
                      <Mail className="h-5 w-5 text-[#ff8c00]" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-11 rounded-xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#ff8c00] focus:ring-2 focus:ring-[#ff8c00]/20 transition-all duration-300"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#00b7eb]" />
                    Password
                  </Label>
                  <Link to="/forgot-password" className="text-xs text-[#00b7eb] hover:text-[#ff8c00] transition-colors duration-300 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00b7eb] to-[#ff8c00] rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-300 blur"></div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg bg-gradient-to-br from-[#00b7eb]/10 to-[#00b7eb]/5 flex items-center justify-center transition-all duration-300 group-focus-within:scale-105">
                      <Lock className="h-5 w-5 text-[#00b7eb]" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-11 rounded-xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#00b7eb] focus:ring-2 focus:ring-[#00b7eb]/20 transition-all duration-300"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl gradient-primary font-semibold shadow-lg shadow-[#ff8c00]/30 hover:shadow-xl hover:shadow-[#ff8c00]/40 transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Sign In
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                )}
              </Button>

              <p className="text-sm text-slate-600 text-center">
                Don't have an account?{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c00] to-[#00b7eb] font-semibold">
                  Contact your administrator
                </span>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-[#ff8c00]/30 transition-all duration-300">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-[#ff8c00]" />
              <p className="text-lg font-bold text-slate-900">UGC</p>
            </div>
            <p className="text-xs text-slate-500">Approved</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-[#00b7eb]/30 transition-all duration-300">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-[#00b7eb]" />
              <p className="text-lg font-bold text-slate-900">SLIIT</p>
            </div>
            <p className="text-xs text-slate-500">Validated</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-[#ff8c00]/30 transition-all duration-300">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-[#ff8c00]" />
              <p className="text-lg font-bold text-slate-900">99.9%</p>
            </div>
            <p className="text-xs text-slate-500">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
