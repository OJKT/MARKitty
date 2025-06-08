export interface CoverSheetData {
  learnerName: string;
  assignmentTitle: string;
  learnerDeclaration: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  type: 'pdf' | 'docx';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  institution?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
}

export interface StoredPreferences {
  lastUsedTemplate?: Template;
  defaultDeclaration?: string;
} 