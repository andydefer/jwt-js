// src/config/authConfig.ts

import { AuthConfig } from "../types";


export const defaultAuthConfig: AuthConfig = {
  baseURL: '/', // par défaut localhost ou racine
  routes: {
    login: '/jwt/login',
    register: '/jwt/register',
    logout: '/jwt/logout',
    fetchUser: '/jwt/user',
    refreshToken: '/jwt/refresh',
  },
};
