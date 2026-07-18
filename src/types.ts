export interface SavedToken {
  id: string;
  userId: string;
  title: string;
  token: string;
  category: string;
  createdAt: string; // ISO date string or Firestore formatted date
  notes?: string;
}

export interface GeneratorConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}
