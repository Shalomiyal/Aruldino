import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen, Clock, User, Building2, LayoutGrid, Loader2, Edit2, Trash2, AlertCircle, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Subjects = () => {
    const { user, role, profile } = useAuth();
    const { toast } = useToast();

    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Admin Data
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    // Form State
    const [form, setForm] = useState({
        name: '',
        code: '',
        credits: '3',
        deptId: 'none',
        batch: '',
        lecturerId: 'none',
        desc: ''
    });

    const [editingSubject, setEditingSubject] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Subjects based on role
            let query = supabase.from('subjects' as any).select('*').eq('is_active', true);

            if (role === 'lecturer') {
                query = (query as any).eq('lecturer_id', user?.id);
            } else if (role === 'student') {
                // Fetch student enrollments first
                const { data: enrolls } = await supabase
                    .from('enrollments')
                    .select('subject_id')
                    .eq('student_id', user?.id);

                const enrolledIds = enrolls?.map(e => e.subject_id) || [];
                query = (query as any).in('id', enrolledIds);
            }

            const { data: subData, error: subError } = await (query as any);
            if (subError) throw subError;

            // 2. Fetch Helper Data (Profiles for names, etc.)
            const lecIds = [...new Set(subData.filter((s: any) => s.lecturer_id).map((s: any) => s.lecturer_id))];
            const deptIds = [...new Set(subData.filter((s: any) => s.department_id).map((s: any) => s.department_id))];

            const [profRes, deptRes] = await Promise.all([
                lecIds.length ? (supabase.from('profiles').select('user_id, full_name').in('user_id', lecIds as any[]) as any) : Promise.resolve({ data: [] }),
                deptIds.length ? (supabase.from('departments' as any).select('id, name').in('id', deptIds as any[]) as any) : Promise.resolve({ data: [] })
            ]);

            const profMap = Object.fromEntries(profRes.data?.map(p => [p.user_id, p.full_name]) || []);
            const deptMap = Object.fromEntries(deptRes.data?.map(d => [d.id, d.name]) || []);

            const enriched = subData.map((s: any) => ({
                ...s,
                lecturer_name: profMap[s.lecturer_id] || 'Unassigned',
                dept_name: deptMap[s.department_id] || 'General'
            }));

            setSubjects(enriched);

            // 3. Admin-only: Fetch all lecturers and departments for creation
            if (role === 'admin') {
                const [lRes, dRes] = await Promise.all([
                    supabase.from('profiles').select('user_id, full_name').eq('is_active', true) as any,
                    supabase.from('departments' as any).select('id, name') as any
                ]);
                setLecturers(lRes.data || []);
                setDepartments(dRes.data || []);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user, role, profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = {
                name: form.name,
                code: form.code,
                credits: parseInt(form.credits),
                department_id: form.deptId === 'none' ? null : form.deptId,
                batch: form.batch,
                lecturer_id: form.lecturerId === 'none' ? null : form.lecturerId,
                description: form.desc
            };

            if (editingSubject) {
                const { error } = await supabase.from('subjects').update(data).eq('id', editingSubject.id);
                if (error) throw error;
                toast({ title: 'Success', description: 'Subject updated.' });
            } else {
                const { error } = await supabase.from('subjects').insert([data]);
                if (error) throw error;
                toast({ title: 'Success', description: 'Subject created.' });
            }

            setDialogOpen(false);
            setEditingSubject(null);
            setForm({ name: '', code: '', credits: '3', deptId: 'none', batch: '', lecturerId: 'none', desc: '' });
            fetchData();
        } catch (error: any) {
            toast({ title: 'Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the subject and all related enrollments/timetable data.')) return;
        try {
            const { error } = await supabase.from('subjects').delete().eq('id', id);
            if (error) throw error;
            toast({ title: 'Subject deleted' });
            fetchData();
        } catch (error: any) {
            toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
        }
    };

    const openEditDialog = (subject: any) => {
        setEditingSubject(subject);
        setForm({
            name: subject.name,
            code: subject.code,
            credits: subject.credits.toString(),
            deptId: subject.department_id || 'none',
            batch: subject.batch || '',
            lecturerId: subject.lecturer_id || 'none',
            desc: subject.description || ''
        });
        setDialogOpen(true);
    };

    const filtered = subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold font-heading">Subjects</h1>
                        <p className="text-muted-foreground">
                            {role === 'admin' ? 'System-wide course management' : role === 'lecturer' ? 'My Assigned Courses' : 'My Academic Curriculum'}
                        </p>
                    </div>

                    {role === 'admin' && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gradient-primary"><Plus className="mr-2 h-4 w-4" /> New Subject</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader><DialogTitle>{editingSubject ? 'Modify Enterprise Course' : 'Create Enterprise Course'}</DialogTitle></DialogHeader>
                                <form onSubmit={handleSave} className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Subject Name</Label>
                                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Course Code</Label>
                                            <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Department</Label>
                                            <Select value={form.deptId} onValueChange={v => setForm({ ...form, deptId: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">N/A</SelectItem>
                                                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Target Batch</Label>
                                            <Input placeholder="e.g. 2024" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Assign Lecturer</Label>
                                        <Select value={form.lecturerId} onValueChange={v => setForm({ ...form, lecturerId: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Unassigned</SelectItem>
                                                {lecturers.map(l => <SelectItem key={l.user_id} value={l.user_id}>{l.full_name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full" disabled={isSaving}>
                                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {editingSubject ? 'Update Subject' : 'Create Subject'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="flex items-center gap-4 bg-card p-3 rounded-xl border">
                    <Search className="h-4 w-4 text-muted-foreground ml-2" />
                    <Input placeholder="Search code or subject name..." value={search} onChange={e => setSearch(e.target.value)} className="border-none shadow-none focus-visible:ring-0" />
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(s => (
                            <Card key={s.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="font-mono text-[10px]">{s.code}</Badge>
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">{s.batch || 'Generic'}</Badge>
                                    </div>
                                    <CardTitle className="text-xl font-heading group-hover:text-primary transition-colors">{s.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 mt-1">
                                        <Building2 className="h-3 w-3" /> {s.dept_name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{s.credits} Credits</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                                            <User className="h-3.5 w-3.5 text-primary" />
                                            <span>{s.lecturer_name}</span>
                                        </div>
                                    </div>
                                    {role === 'admin' && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="flex-1 text-xs h-8" onClick={() => window.location.href = `/admin/enrollments?subject=${s.id}`}>
                                                <Users className="mr-2 h-3 w-3" /> Enroll
                                            </Button>
                                            <Button variant="outline" className="flex-1 text-xs h-8" onClick={() => openEditDialog(s)}>
                                                <Edit2 className="mr-2 h-3 w-3" /> Edit
                                            </Button>
                                            <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 text-xs h-8" onClick={() => handleDelete(s.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Subjects;
