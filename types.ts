

export type Language = 'ca' | 'es' | 'en';

export enum Theme {
  HISTORICAL = 'historical',
  CIVIL_WAR = 'civil_war',
  GEOLOGICAL = 'geological',
  NATURE = 'nature',
  GASTRONOMIC = 'gastronomic',
  CUSTOM = 'custom'
}

export enum Transport {
  WALKING = 'walking',
  BUS = 'bus',
  CAR = 'car',
  RIVER = 'river',
  TRAIN = 'train',
  BIKE = 'bike',
  MIX = 'mix'
}

export interface UserPreferences {
  language: Language;
  theme: Theme;
  customThemes?: Theme[];
  selectedPOIs?: string[]; // New field for specific places
  duration: number;
  transport: Transport;
  customTransports?: Transport[];
  startDate?: string;
  additionalInfo?: string;
  includeUpriver?: boolean;
}

export interface GroundingSource {
  title: string;
  url: string;
  type: 'web' | 'map';
}

export interface ItineraryStep {
  id: string;
  day: string;
  timeOfDay: string;
  title: string;
  description: string;
  imageUrl?: string;
  userNotes?: string;
  detailedInstructions?: string[];
  nearbyAttractions?: NearbyAttraction[];
}

export interface ItineraryResult {
  markdown: string;
  steps: ItineraryStep[];
  sources: GroundingSource[];
}

export interface NearbyAttraction {
  name: string;
  type: string;
  distance: string;
}