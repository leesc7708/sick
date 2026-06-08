export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  age: number;
  gender: Gender;
  isPregnant: boolean;
  isLactating: boolean;
  conditions: string[];
  allergies: string[];
  currentMedicines: string[];
  onboardingDone: boolean;
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

export interface SymptomQuery {
  text: string;
  bodyParts: string[];
  intensity?: number;
  duration?: string;
  additional?: string[];
}

export interface PossibleCondition {
  name: string;
  probability: 'high' | 'medium' | 'low';
  description: string;
}

export interface SymptomAnalysis {
  isRedFlag: boolean;
  redFlagReason?: string;
  possibleConditions: PossibleCondition[];
  recommendedDepartments: string[];
  selfCare: string[];
  urgency: 'emergency' | 'urgent' | 'soon' | 'routine';
  disclaimer: string;
}

export interface Hospital {
  id: string;
  name: string;
  department: string[];
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  isOpenNow: boolean;
  hasNightCare: boolean;
  hasWeekendCare: boolean;
  hasParking: boolean;
  phone: string;
  hours: string;
  estimatedCost: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  isPrescription: boolean;
  effects: string;
  dosage: string;
  warnings: string[];
  storage: string;
  ingredients: string[];
}

export interface InteractionResult {
  level: RiskLevel;
  medicineA: string;
  medicineB: string;
  description: string;
  recommendation: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  SymptomInput: undefined;
  RedFlag: { reason: string };
  SymptomResult: { analysis: SymptomAnalysis; query: SymptomQuery };
  HospitalFinder: { departments?: string[] };
  MedicineSearch: undefined;
  MedicineDetail: { medicineId: string };
  MyMedicines: undefined;
  InteractionCheck: undefined;
  Settings: undefined;
};
