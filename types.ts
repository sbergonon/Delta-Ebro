
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
  TAXI = 'taxi',
  MIX = 'mix'
}

export enum AccommodationMode {
  BASE = 'base', // Same place every night
  ROUTE = 'route' // Moving hotels
}

export interface UserPreferences {
  language: Language;
  theme: Theme;
  customThemes?: Theme[];
  selectedPOIs?: string[]; 
  duration: number;
  transport: Transport;
  customTransports?: Transport[];
  startDate?: string;
  additionalInfo?: string;
  includeUpriver?: boolean;
  
  // New Accommodation Fields
  accommodationMode: AccommodationMode;
  baseLocation: string; // e.g., "Amposta"
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

export interface Restaurant {
  name: string;
  cuisine: string;
  rating: string;
  address: string;
}

export interface RestaurantRecommendation {
  name: string;
  location: string;
  phone: string;
  price: string;
  specialty: Record<Language, string>;
}

export interface SavedItinerary {
  id: string;
  name: string;
  createdAt: number;
  preferences: UserPreferences;
  result: ItineraryResult;
}
