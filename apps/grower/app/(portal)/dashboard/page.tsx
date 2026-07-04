'use client';
import { useQuery } from '@tanstack/react-query';
import { growerApi } from '@/lib/api';
import { GrowerProfile, ComplianceStatus, LabTest, PesticideLog } from '@/types';
import { formatDate } from '@/lib/utils';

function ComplianceBanner({ status }: { status: ComplianceStatus }) {
  const colors = {
    compliant: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    non_compliant: 'bg-red-50 border-red-200 text-red-800',
  };
  const icons = { compliant: '✅', warning: '⚠️', non_compliant: '❌' };
  return (
    <div className={`border rounded-2xl p-4 flex items-center gap-3 ${colors[status.overallStatus]}`}>
      <span className="text-2xl">{icons[status.overallStatus]}</span>
      <div>
        <p className="font-semibold capitalize">{status.overallStatus.replace('_', ' ')}</p>
        {status.licenseExpiresIn !== undefined && status.licenseExpiresIn <= 30 && (
          <p className="text-sm">License expires in {status.licenseExpiresIn} days</p>
        )}
        {status.pendingCoaCount > 0 && (
          <p className="text-sm">{status.pendingCoaCount} product{status.pendingCoaCount !== 1 ? 's' : ''} awaiting COA</p>
        )}
      </div>
    </div>
  );
}

export default function GrowerDashboardPage() {
  const { data: profile } = useQuery<GrowerProfile>({
    queryKey: ['grower-profile'],
    queryFn: async () => { const { data } = await growerApi.get('/grower/me'); return data; },
  });

  const { data: compliance } = useQuery<ComplianceStatus>({
    queryKey: ['compliance'],
    queryFn: async () => { const { data } = await growerApi.get('/grower/me/compliance'); return data; },
  });

  const { data: labTests = [] } = useQuery<LabTest[]>({
    queryKey: ['lab-tests'],
    queryFn: async () => { const { data } = await growerApi.get('/grower/me/lab-tests'); return data; },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {profile?.farmName ?? 'Your Farm'} 🌿
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {profile?.city && `${profile.city}, `}{profile?.stateCode}
          {profile?.licenseNumber && ` · License: ${profile.licenseNumber}`}
        </p>
      </div>

      {compliance && <ComplianceBanner status={compliance} />}

      {/* Certifications */}
      {profile && (
        <div className="card">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Certifications & Growing Method</h2>
          <div className="flex flex-wrap gap-2">
            {profile.noPesticidesUsed && (
              <span className="badge bg-green-100 text-green-700">No Pesticides</span>
            )}
            {profile.cleanGreenCertified && (
              <span className="badge bg-green-100 text-green-700">Clean Green Certified</span>
            )}
            {profile.sunEarthCertified && (
              <span className="badge bg-green-100 text-green-700">Sun + Earth Certified</span>
            )}
            {profile.usdaOrganic && (
              <span className="badge bg-green-100 text-green-700">USDA Organic</span>
            )}
            {profile.outdoorGrown && <span className="badge bg-brand-100 text-brand-800">Outdoor</span>}
            {profile.indoorGrown && <span className="badge bg-brand-100 text-brand-800">Indoor</span>}
            {profile.greenhouseGrown && <span className="badge bg-brand-100 text-brand-800">Greenhouse</span>}
          </div>
        </div>
      )}

      {/* Recent lab tests */}
      <div className="card">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Recent Lab Tests</h2>
        {labTests.length === 0 ? (
          <p className="text-sm text-neutral-400">No lab tests on file</p>
        ) : (
          <div className="space-y-3">
            {labTests.slice(0, 5).map((test) => (
              <div key={test.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{test.productName}</p>
                  <p className="text-xs text-neutral-400">{test.labName} · {formatDate(test.testedAt)}</p>
                </div>
                <span className={`badge ${test.overallPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
