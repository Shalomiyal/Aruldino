import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, BookOpen, Users, Award, ArrowRight, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* Header */}
      <header className="relative z-10 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold font-heading text-white">SAMS</h1>
              <p className="text-xs text-white/60">Student Academic Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button className="gradient-primary">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff8c00]/10 blur-[150px] rounded-full -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00b7eb]/10 blur-[100px] rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00b7eb]/10 border border-[#00b7eb]/20">
              <span className="w-2 h-2 rounded-full bg-[#00b7eb] animate-pulse"></span>
              <span className="text-sm text-white/80">Welcome to Campus Academic Portal</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black font-heading text-white leading-tight">
              Shape Your Future
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c00] to-[#00b7eb]">
                At Our University
              </span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              A comprehensive platform for students, lecturers, and administrators to manage academic activities, track progress, and achieve excellence together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/login">
                <Button size="lg" className="gradient-primary text-lg px-8 py-6">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Student Login
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 text-lg px-8 py-6">
                  Staff Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-heading text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Our comprehensive system provides all the tools for academic success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-[#ff8c00]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-[#ff8c00]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Course Management</h3>
                <p className="text-white/60 text-sm">Browse subjects, view timetables, and manage enrollments</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-[#00b7eb]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-[#00b7eb]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Attendance Tracking</h3>
                <p className="text-white/60 text-sm">Track and manage student attendance in real-time</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-[#ff8c00]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Award className="h-7 w-7 text-[#ff8c00]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Grade Management</h3>
                <p className="text-white/60 text-sm">Submit, track, and view academic grades easily</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-[#00b7eb]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="h-7 w-7 text-[#00b7eb]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Events & Activities</h3>
                <p className="text-white/60 text-sm">Stay updated with campus events and announcements</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold font-heading text-white mb-6">
                About Our University
              </h2>
              <p className="text-white/70 text-lg mb-6">
                We are committed to providing quality education and fostering academic excellence. 
                Our Student Academic Management System streamlines administrative processes and 
                enhances the learning experience for all stakeholders.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/80">
                  <MapPin className="h-5 w-5 text-[#ff8c00]" />
                  <span>123 University Avenue, Academic City</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="h-5 w-5 text-[#ff8c00]" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="h-5 w-5 text-[#ff8c00]" />
                  <span>info@university.edu</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#ff8c00]/20 to-[#00b7eb]/20 rounded-3xl blur-2xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-4xl font-black text-[#ff8c00] mb-2">5000+</div>
                  <div className="text-white/60">Students</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-4xl font-black text-[#00b7eb] mb-2">200+</div>
                  <div className="text-white/60">Lecturers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-4xl font-black text-[#ff8c00] mb-2">50+</div>
                  <div className="text-white/60">Courses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-4xl font-black text-[#00b7eb] mb-2">95%</div>
                  <div className="text-white/60">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
              <span className="text-white/60">© 2024 SAMS. All rights reserved.</span>
            </div>
            <div className="text-white/40 text-sm">
              Student Academic Management System
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
