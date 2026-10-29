export const LEGAL_TERMS_VERSION = '2026-10-29';
export const MINIMUM_AGE = 18;

export interface LegalAcceptance {
  version: string;
  acceptedAt: Date;
}

export function hasAcceptedCurrentTerms(acceptance: LegalAcceptance | undefined): boolean {
  return acceptance?.version === LEGAL_TERMS_VERSION;
}

export const PUBLISHER = {
  host: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  governingLaw: 'droit belge',
};
