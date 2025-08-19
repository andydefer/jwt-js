"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = void 0;
const react_1 = require("react");
const authStore_1 = require("../stores/authStore");
const useAuth = () => {
    const { token, user, isLoading, error, login, logout, register, initialize, isInitialized, } = (0, authStore_1.useAuthStore)();
    (0, react_1.useEffect)(() => {
        if (!isInitialized)
            initialize();
    }, [initialize, isInitialized]);
    return {
        isAuthenticated: !!token,
        user,
        isLoading,
        error,
        login,
        logout,
        register,
    };
};
exports.useAuth = useAuth;
