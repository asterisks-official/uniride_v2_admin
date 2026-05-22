'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BadgeCheck,
  Flag,
  Users,
  Car,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/verifications', label: 'Verifications', icon: BadgeCheck },
  { href: '/reports', label: 'Reports', icon: Flag },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/rides', label: 'Rides', icon: Car },
  { href: '/config', label: 'App Config', icon: Settings },
  { href: '/audit-log', label: 'Audit Log', icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen border-r bg-white flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-bold text-lg text-blue-600">UniRide Admin</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
