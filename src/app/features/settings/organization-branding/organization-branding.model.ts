export interface OrganizationBranding {
  organizationName: string;
  logoUrl: string | null;
  useCompanyLogo: boolean;
  showNexoraAttribution: boolean;
  invoiceFooterText: string | null;
  receiptFooterText: string | null;
}

export interface OrganizationBrandingUpdate {
  useCompanyLogo: boolean;
  showNexoraAttribution: boolean;
  invoiceFooterText: string;
  receiptFooterText: string;
}
