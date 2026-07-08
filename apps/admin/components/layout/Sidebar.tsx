'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// ── SVG Icons ────────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DispensariesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ComplianceIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Nav Config ───────────────────────────────────────────────────────────────

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',        Icon: DashboardIcon },
  { href: '/users',       label: 'Users',             Icon: UsersIcon },
  { href: '/dispensaries',label: 'Dispensaries',      Icon: DispensariesIcon },
  { href: '/compliance',  label: 'Compliance Rules',  Icon: ComplianceIcon },
  { href: '/health',      label: 'System Health',     Icon: HealthIcon },
];

// ── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="w-[228px] shrink-0 flex flex-col h-full"
      style={{ backgroundColor: '#0a1a0f', borderRight: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* ── Logo ── */}
      <div
        className="h-16 flex items-center px-5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Lock + leaf mark */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0f4c35, #0c3324)',
            border: '1px solid rgba(15,76,53,0.85)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">CannaRoute</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.36)' }}>Admin Panel</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                  color: isActive ? '#f59e0b' : 'rgba(255,255,255,0.52)',
                }}
              >
                <span style={{ color: isActive ? '#f59e0b' : 'rgba(255,255,255,0.38)' }}>
                  <Icon />
                </span>
                {label}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: '#f59e0b' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── User footer ── */}
      <div className="px-3 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 px-2 py-2 mb-0.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: '#7e22ce' }}
          >
            {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.36)' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.36)' }}
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </aside>
  );
}
