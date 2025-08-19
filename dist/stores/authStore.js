"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const react_1 = require("@inertiajs/react");
const axios_1 = __importDefault(require("axios"));
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
    token: null,
    publicKey: null,
    user: null,
    isLoading: false,
    error: null,
    isInitialized: false,
    initialize: () => __awaiter(void 0, void 0, void 0, function* () {
        if (get().isInitialized || get().isLoading)
            return;
        set({ isLoading: true });
        try {
            const storedToken = get().token;
            if (storedToken) {
                yield get().fetchUser();
                set({ isInitialized: true });
                return;
            }
            yield get().getTokenFromSession();
        }
        catch (error) {
            console.log('Auto-login failed, user not authenticated');
        }
        finally {
            set({ isLoading: false, isInitialized: true });
        }
    }),
    login: (email, password, deviceId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        set({ isLoading: true, error: null });
        try {
            const response = yield axios_1.default.post('/jwt/login', {
                email,
                password,
                device_id: deviceId || crypto.randomUUID(),
            });
            set({
                token: response.data.data.token,
                publicKey: response.data.data.public_key,
                isLoading: false,
                isInitialized: true,
            });
            yield get().fetchUser();
        }
        catch (error) {
            set({
                error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Login failed',
                isLoading: false,
            });
            throw error;
        }
    }),
    register: (name, email, password, deviceId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        set({ isLoading: true, error: null });
        try {
            const response = yield axios_1.default.post('/jwt/register', {
                name,
                email,
                password,
                password_confirmation: password,
                device_id: deviceId || crypto.randomUUID(),
            });
            set({
                token: response.data.data.token,
                publicKey: response.data.data.public_key,
                user: response.data.data.user,
                isLoading: false,
                isInitialized: true,
            });
        }
        catch (error) {
            set({
                error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                    'Registration failed',
                isLoading: false,
            });
            throw error;
        }
    }),
    logout: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = get().token;
            if (token) {
                yield axios_1.default.post('/jwt/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        }
        finally {
            set({
                token: null,
                publicKey: null,
                user: null,
                isInitialized: true,
            });
            react_1.router.visit('/login');
        }
    }),
    fetchUser: () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const fullToken = get().token;
        if (!fullToken)
            return;
        const jwtToken = fullToken.split(':')[1];
        try {
            const response = yield axios_1.default.get('/jwt/user', {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            set({ user: response.data.data });
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) &&
                ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                set({ token: null, publicKey: null, user: null });
            }
            throw error;
        }
    }),
    verifySignature: (data, signature) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!get().token)
                return false;
            const response = yield axios_1.default.post('/jwt/verify-signature', {
                token: get().token,
                data,
                signature,
            }, {
                headers: {
                    Authorization: `Bearer ${get().token}`,
                },
            });
            return response.data.status === 'success';
        }
        catch (_a) {
            return false;
        }
    }),
    getTokenFromSession: () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        set({ isLoading: true });
        try {
            const response = yield axios_1.default.get('/jwt/token');
            if ((_a = response.data.data) === null || _a === void 0 ? void 0 : _a.token) {
                set({
                    token: response.data.data.token,
                    publicKey: response.data.data.public_key,
                });
                yield get().fetchUser();
            }
        }
        catch (error) {
            // pas d’erreur levée si pas connecté en session
        }
        finally {
            set({ isLoading: false });
        }
    }),
}), {
    name: 'jwt-auth-storage',
    partialize: (state) => ({
        token: state.token,
        publicKey: state.publicKey,
        user: state.user,
    }),
}));
