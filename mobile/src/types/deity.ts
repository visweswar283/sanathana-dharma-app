export interface Deity {
  id: string;
  displayName: string;
  sanskritName: string;
  shortDescription: string;
  themeColor: string;
  accentColor: string;
  isAvailable: boolean;
  phase: 1 | 2 | 3;
  specialties: string[];
}
