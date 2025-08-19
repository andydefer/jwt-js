export declare const useAuth: () => {
    isAuthenticated: boolean;
    user: import("../types").User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string, deviceId?: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, password: string, deviceId?: string) => Promise<void>;
};
