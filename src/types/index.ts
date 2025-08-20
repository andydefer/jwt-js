export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Initialisation automatique du store
  initialize: () => Promise<void>;

  // Authentification
  login: (email: string, password: string, deviceId?: string) => Promise<void>;
  register: (name: string, email: string, password: string, deviceId?: string) => Promise<User>;
  logout: () => void;

  // Récupération des infos utilisateur
  fetchUser: () => Promise<void>;

  // Rotation du token
  refreshToken: () => Promise<void>;
}

export interface AuthConfig {
  baseURL: string;                 // Base URL de l'API
  routes: {
    login: string;
    register: string;
    logout: string;
    fetchUser: string;
    refreshToken: string;
  };
}