import type { User } from '../types';
interface UseAuthReturn {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string, deviceId?: string) => Promise<void>;
    register: (name: string, email: string, password: string, deviceId?: string) => Promise<User>;
    logout: () => void;
}
export declare const useAuth: () => UseAuthReturn;
export {};
