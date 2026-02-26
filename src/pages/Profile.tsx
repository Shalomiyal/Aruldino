import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Shield, Building2, Layers, Save } from 'lucide-react';

const Profile = () => {
    const { user, profile, role, fetchProfile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [deptName, setDeptName] = useState('N/A');
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setEmail(profile.email || '');
            setBio((profile as any).bio || '');
            setPhone((profile as any).phone || '');
            setAddress((profile as any).address || '');
            fetchDepartment();
            fetchRelevantData();
        }
    }, [profile]);

    const fetchDepartment = async () => {
        if (profile?.department_id) {
            const { data } = await supabase
                .from('departments' as any)
                .select('name')
                .eq('id', profile.department_id)
                .single();
            if (data) setDeptName((data as any).name);
        }
    };

    const fetchRelevantData = async () => {
        if (!user) return;
        try {
            if (role === 'student') {
                const { data } = await supabase
                    .from('enrollments' as any)
                    .select('subject_id, subjects(name, code)')
                    .eq('student_id', user.id) as any;
                setSubjects(data?.map((d: any) => d.subjects) || []);
            } else if (role === 'lecturer') {
                const { data } = await supabase
                    .from('subjects' as any)
                    .select('name, code')
                    .eq('lecturer_id', user.id);
                setSubjects(data || []);
            }
        } catch (error) {
            console.error('Fetch subjects error:', error);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates: any = {
                full_name: fullName,
                bio,
                phone,
                address,
                updated_at: new Date().toISOString(),
            };

            if (role === 'admin') updates.email = email;

            const { error } = await supabase.from('profiles').update(updates).eq('user_id', user?.id);
            if (error) throw error;

            toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
            setTimeout(async () => { await fetchProfile(); }, 500);
        } catch (error: any) {
            toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const isEmailDisabled = role !== 'admin';

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black font-heading tracking-tighter mb-2 text-primary">
                            Member Profile
                        </h1>
                        <p className="text-muted-foreground">Detailed overview of your academic and personal identity</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Identity Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-premium border-none bg-card/50 backdrop-blur-sm overflow-hidden">
                            <div className="h-24 gradient-primary relative">
                                <Badge className="absolute bottom-2 right-2 bg-white/20 backdrop-blur text-[10px] font-black uppercase text-white border-none">{role}</Badge>
                            </div>
                            <CardContent className="-mt-12 flex flex-col items-center text-center space-y-4 pb-8">
                                <div className="h-24 w-24 rounded-3xl bg-card border-4 border-card shadow-premium flex items-center justify-center text-primary text-3xl font-black">
                                    {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                </div>
                                <div className="px-4">
                                    <h3 className="text-xl font-bold font-heading truncate max-w-full">{profile?.full_name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 truncate">{profile?.email}</p>
                                </div>
                                <div className="w-full pt-4 space-y-3 text-left border-t border-dashed">
                                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Building2 className="h-4 w-4" /></div>
                                        <div className="flex flex-col"><span className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">Department</span><span>{deptName}</span></div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600"><Layers className="h-4 w-4" /></div>
                                        <div className="flex flex-col"><span className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">Batch</span><span>{(profile as any)?.batch || 'General'}</span></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {subjects.length > 0 && (
                            <Card className="shadow-premium border-none">
                                <CardHeader className="p-4 flex flex-row items-center gap-2 border-b">
                                    <div className="h-6 w-6 rounded bg-primary text-white flex items-center justify-center"><Shield className="h-3 w-3" /></div>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest leading-none m-0">
                                        {role === 'student' ? 'My Subjects' : 'My Courses'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-48">
                                        <div className="p-4 space-y-3">
                                            {subjects.map((s, i) => (
                                                <div key={i} className="flex flex-col border-l-2 border-primary/20 pl-3 py-1">
                                                    <span className="text-xs font-bold leading-tight">{s.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{s.code}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Edit Form */}
                    <div className="lg:col-span-3 space-y-8">
                        <Card className="shadow-premium border-none bg-card/80">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="text-xl font-heading">Personal Dossier</CardTitle>
                                <CardDescription>Your public and private account information</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Legal Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-12 bg-muted/20 border-none rounded-xl" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Email Identity</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 bg-muted/20 border-none rounded-xl" disabled={isEmailDisabled} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Phone Number</Label>
                                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 bg-muted/20 border-none rounded-xl" placeholder="+1 (555) 000-0000" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Physical Address</Label>
                                            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-12 bg-muted/20 border-none rounded-xl" placeholder="Full campus/home address" />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Bio / Professional Summary</Label>
                                            <textarea
                                                className="w-full min-h-[100px] p-4 bg-muted/20 border-none rounded-2xl text-sm focus:ring-2 ring-primary outline-none transition-all placeholder:text-muted-foreground/30"
                                                placeholder="Tell us about yourself..."
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <Button type="submit" className="gradient-primary px-10 h-12 font-bold rounded-xl shadow-premium" disabled={loading}>
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Commit Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="shadow-premium border-none bg-card/80">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="text-xl font-heading">Security Protocol</CardTitle>
                                <CardDescription>Update your authentication credentials</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ChangePasswordForm />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const ChangePasswordForm = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast({ title: 'Passwords do not match', variant: 'destructive' });
        }
        if (password.length < 6) {
            return toast({ title: 'Password too short', description: 'Minimum 6 characters required.', variant: 'destructive' });
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            toast({ title: 'Success', description: 'Your password has been updated.' });
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">New Password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" variant="secondary" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                </Button>
            </div>
        </form>
    );
};

export default Profile;
