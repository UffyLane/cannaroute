export interface GrowerProfile {
  id: string;
  farmName: string;
  farmDescription?: string;
  licenseNumber: string;
  licenseExpiryDate?: string;
  stateCode: string;
  city?: string;
  county?: string;
  cleanGreenCertified: boolean;
  cleanGreenCertNumber?: string;
  sunEarthCertified: boolean;
  sunEarthCertNumber?: string;
  usdaOrganic: boolean;
  noPesticidesUsed: boolean;
  outdoorGrown: boolean;
  indoorGrown: boolean;
  greenhouseGrown: boolean;
}

export interface LabTest {
  id: string;
  productId: string;
  productName: string;
  labName: string;
  labLicenseNumber?: string;
  thcPercentage?: number;
  thcaPercentage?: number;
  cbdPercentage?: number;
  cbdaPercentage?: number;
  overallPass: boolean;
  coaUrl?: string;
  testedAt: string;
  createdAt: string;
}

export interface PesticideLog {
  id: string;
  productId: string;
  noPesticidesUsed: boolean;
  pesticideName?: string;
  epaRegNumber?: string;
  applicationRate?: number;
  applicationRateUnit?: string;
  appliedDate?: string;
  prePharvestInterval?: number;
  createdAt: string;
}

export interface ComplianceStatus {
  licenseValid: boolean;
  licenseExpiresIn?: number; // days
  pendingCoaCount: number;
  failedLabTests: number;
  overallStatus: 'compliant' | 'warning' | 'non_compliant';
}
