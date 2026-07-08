'use client';

import { useQuery } from '@tanstack/react-query';
import { growerApi } from '@/lib/api';
import { GrowerProfile, ComplianceStatus, LabTest } from '@/types';
import { formatDate } from '@/lib/utils';

// ── Compliance Banner ────────────────────────────────────────────────────────

type OverallStatus = 'compliant' | 'warning' | 'non_compliant';

const bannerConfig: Record<OverallStatus, {
  bg: string; border: string; iconBg: string; iconColor: string; textColor: string; subColor: string; label: string;
}> = {
  compliant: {
    bg: 'rgba(34,197,94,0.07)',
    border: 'rgba(34,197,94,0.20)',
    iconBg: 'rgba(34,197,94,0.14)',
    iconColor: '#16a34a',
    textColor: '#166534',
    subColor: '#15803d',
    label: 'All Compliant',
  },
  warning: {
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.22)',
    iconBg: 'rgba(245,158,11,0.14)',
    iconColor: '#d97706',
    textColor: '#92400e',
    subColor: '#b45309',
    label: 'Action Required',
  },
  non_compliant: {
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.20)',
    iconBg: 'rgba(239,68,68,0.14)',
    iconColor: '#dc2626',
    textColor: '#991b1b',
    subColor: '#b91c1c',
    label: 'Non-Compliant',
  },
};

function ComplianceBanner({ status }: { status: ComplianceStatus }) {
  const c = bannerConfig[status.overallStatus as OverallStatus] ?? bannerConfig.warning;
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: c.iconBg }}
      >
        {status.overallStatus === 'compliant' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm" style={{ color: c.textColor }}>{c.label}</p>
        {status.licenseExpiresIn !== undefined && status.licenseExpiresIn <= 30 && (
          <p className="text-xs mt-0.5" style={{ color: c.subColor }}>
            License expires in {status.licenseExpiresIn} day{status.licenseExpiresIn !== 1 ? 's' : ''}
          </p>
        )}
        {status.pendingCoaCount > 0 && (
          <p className="text-xs mt-0.5" style={{ color: c.subColor }}>
            {status.pendingCoaCount} product{status.pendingCoaCount !== 1 ? 's' : ''} awaiting COA
          </p>
        )}
      </div>
    </div>
  );
}

// ── Cert Chips ───────────────────────────────────────────────────────────────

function CertChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: 'rgba(34,197,94,0.10)',
        color: '#166534',
        border: '1px solid rgba(34,197,94,0.22)',
      }}
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <polyline points="2 6 5 9 10 3" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}

function GrowthChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: 'rgba(15,76,53,0.10)',
        color: '#0f4c35',
        border: '1px solid rgba(15,76,53,0.18)',
      }}
    >
      {label}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GrowerDashboardPage() {
  const { data: profile } = useQuery<GrowerProfile>({
    queryKey: ['grower-profile'],
    queryFn: async () => {
      const { data } = await growerApi.get('/grower/me');
      return data;
    },
  });

  const { data: compliance } = useQuery<ComplianceStatus>({
    queryKey: ['compliance'],
    queryFn: async () => {
      const { data } = await growerApi.get('/grower/me/compliance');
      return data;
    },
  });

  const { data: labTests = [] } = useQuery<LabTest[]>({
    queryKey: ['lab-tests'],
    queryFn: async () => {
      const { data } = await growerApi.get('/grower/me/lab-tests');
      return data;
    },
  });

  return (
    <div className="space-y-5">
      {/* ── Farm header ── */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {profile?.farmName ?? 'Your Farm'}
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {profile?.city && `${profile.city}, `}{profile?.stateCode}
          {profile?.licenseNumber && (
            <span className="ml-2 font-mono text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-lg">
              License: {profile.licenseNumber}
            </span>
          )}
        </p>
      </div>

      {/* ── Compliance banner ── */}
      {compliance && <ComplianceBanner status={compliance} />}

      {/* ── Certifications ── */}
      {profile && (
        <div className="card">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">
            Certifications &amp; Growing Method
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.noPesticidesUsed      && <CertChip label="No Pesticides" />}
            {profile.cleanGreenCertified   && <CertChip label="Clean Green Certified" />}
            {profile.sunEarthCertified     && <CertChip label="Sun + Earth Certified" />}
            {profile.usdaOrganic           && <CertChip label="USDA Organic" />}
            {profile.outdoorGrown          && <GrowthChip label="Outdoor" />}
            {profile.indoorGrown           && <GrowthChip label="Indoor" />}
            {profile.greenhouseGrown       && <GrowthChip label="Greenhouse" />}
            {!profile.noPesticidesUsed &&
             !profile.cleanGreenCertified &&
             !profile.sunEarthCertified &&
             !profile.usdaOrganic &&
             !profile.outdoorGrown &&
             !profile.indoorGrown &&
             !profile.greenhouseGrown && (
               <p className="text-sm text-neutral-400">No certifications on file</p>
             )}
          </div>
        </div>
      )}

      {/* ── Recent lab tests ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Recent Lab Tests</h2>
          <span className="text-xs text-neutral-400">{labTests.length} on file</span>
        </div>

        {labTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2v6l-2 4a6 6 0 0 0 16 0l-2-4V2" />
              <line x1="6" y1="2" x2="18" y2="2" />
            </svg>
            <p className="text-sm text-neutral-400">No lab tests on file</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {labTests.slice(0, 5).map((test) => (
              <div key={test.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{test.productName}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {test.labName} · {formatDate(test.testedAt)}
                  </p>
                </div>
                <span
                  className="badge shrink-0"
                  style={
                    test.overallPass
                      ? { backgroundColor: 'rgba(34,197,94,0.10)', color: '#166534' }
                      : { backgroundColor: 'rgba(239,68,68,0.10)', color: '#991b1b' }
                  }
                >
                  {test.overallPass ? 'Pass' : 'Fail'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
