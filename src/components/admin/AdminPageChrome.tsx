import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminPageChromeProps {
    children: ReactNode;
    className?: string;
}

export const AdminPageChrome = ({ children, className = '' }: AdminPageChromeProps) => {
    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2baec1]/5 ${className}`}>
            {children}
        </div>
    );
};

interface AdminPageHeroProps {
    title: string;
    description?: string;
    icon?: ReactNode;
}

export const AdminPageHero = ({ title, description, icon }: AdminPageHeroProps) => {
    return (
        <div className="bg-gradient-to-r from-[#2baec1] to-[#2e406a] px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
                {icon && (
                    <div className="p-2 rounded-lg bg-white/20">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-bold text-white">{title}</h1>
                    {description && (
                        <p className="text-sm text-white/80">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

interface AdminPageStackProps {
    children: ReactNode;
    className?: string;
}

export const AdminPageStack = ({ children, className = '' }: AdminPageStackProps) => {
    return (
        <div className={`max-w-6xl mx-auto p-6 space-y-6 min-w-0 ${className}`}>
            {children}
        </div>
    );
};

interface AdminBackToDashboardProps {
    to?: string;
}

export const AdminBackToDashboard = ({ to = '/dashboard' }: AdminBackToDashboardProps) => {
    return (
        <div className="flex justify-start">
            <Link to={to}>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 group">
                    <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to dashboard
                </Button>
            </Link>
        </div>
    );
};

export default {
    AdminPageChrome,
    AdminPageHero,
    AdminPageStack,
    AdminBackToDashboard,
};