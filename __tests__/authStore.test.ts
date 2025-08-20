// __tests__/authStore.test.ts
import { router } from '@inertiajs/react';
import { act } from '@testing-library/react';
import axios from 'axios';
import { useAuthStore } from '../src/stores/authStore';

// Mock axios en premier avec une approche différente
jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    defaults: {
      headers: {
        common: {} as Record<string, string | undefined>,
      },
    },
  };

  return {
    ...jest.requireActual('axios'),
    create: jest.fn(() => mockInstance),
    __mockInstance: mockInstance, // Exposer l'instance pour les tests
  };
});

// Mock pour @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  router: {
    visit: jest.fn(),
    get: jest.fn(),
    post: jest.fn()
  },
}));

// Récupérer l'instance mockée
const mockedApi = (axios.create as jest.Mock)();

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset du store avant chaque test
    const { setState } = useAuthStore;
    act(() =>
      setState({
        token: null,
        user: null,
        isLoading: false,
        error: null,
        isInitialized: false,
      })
    );

    // Nettoyer les mocks
    jest.clearAllMocks();
    mockedApi.get.mockClear();
    mockedApi.post.mockClear();
    mockedApi.defaults.headers.common = {} as Record<string, string | undefined>;
  });

  // --- Initialisation ---
  it('should initialize and fetch user if token exists in storage', async () => {
    const fakeUser = { id: 1, name: 'Andy', email: 'andy@test.com' };
    const fakeUserResponse = { data: { data: fakeUser } };

    act(() => useAuthStore.setState({ token: 'jwt:test-token' }));
    mockedApi.get.mockResolvedValueOnce(fakeUserResponse);

    await act(async () => useAuthStore.getState().initialize());

    const state = useAuthStore.getState();
    expect(mockedApi.get).toHaveBeenCalledWith('/jwt/user');
    expect(state.user).toEqual(fakeUser);
    expect(state.isLoading).toBe(false);
    expect(state.isInitialized).toBe(true);
  });

  // --- Login ---
  it('should login successfully and set headers', async () => {
    const fakeUser = { id: 1, name: 'Andy', email: 'andy@test.com' };
    const fakeLoginResponse = { data: { data: { token: 'token:abc' } } };
    const fakeUserResponse = { data: { data: fakeUser } };

    mockedApi.post.mockResolvedValueOnce(fakeLoginResponse);
    mockedApi.get.mockResolvedValueOnce(fakeUserResponse);

    await act(async () =>
      useAuthStore.getState().login('andy@test.com', 'password')
    );

    const state = useAuthStore.getState();
    expect(mockedApi.post).toHaveBeenCalledWith('/jwt/login', expect.any(Object));
    expect(mockedApi.defaults.headers.common['Authorization']).toBe('Bearer token:abc');
    expect(state.token).toBe('token:abc');
    expect(state.user).toEqual(fakeUser);
    expect(state.error).toBeNull();
  });

  it('should handle login error', async () => {
    mockedApi.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    await expect(
      act(async () => useAuthStore.getState().login('andy@test.com', 'wrong'))
    ).rejects.toBeDefined();

    const state = useAuthStore.getState();
    expect(state.error).toBe('Invalid credentials');
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  // --- Register ---
  it('should register successfully and set user', async () => {
    const fakeUser = { id: 2, name: 'John', email: 'john@test.com' };
    const fakeRegisterResponse = { data: { data: { token: 'token:def', user: fakeUser } } };

    mockedApi.post.mockResolvedValueOnce(fakeRegisterResponse);

    await act(async () =>
      useAuthStore.getState().register('John', 'john@test.com', 'password')
    );

    const state = useAuthStore.getState();
    expect(mockedApi.post).toHaveBeenCalledWith('/jwt/register', expect.any(Object));
    expect(mockedApi.defaults.headers.common['Authorization']).toBe('Bearer token:def');
    expect(state.token).toBe('token:def');
    expect(state.user).toEqual(fakeUser);
    expect(state.error).toBeNull();
  });

  // --- Logout ---
  it('should logout properly and redirect', async () => {
    act(() =>
      useAuthStore.setState({
        token: 'token:abc',
        user: { id: 1, name: 'Andy', email: 'andy@test.com' },
      })
    );
    mockedApi.post.mockResolvedValueOnce({});

    await act(async () => useAuthStore.getState().logout());

    const state = useAuthStore.getState();
    expect(mockedApi.post).toHaveBeenCalledWith('/jwt/logout');
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(router.visit).toHaveBeenCalledWith('/login');
    expect(mockedApi.defaults.headers.common['Authorization']).toBeUndefined();
  });

  // --- Fetch User ---
  it('should fetch user when token exists', async () => {
    const fakeUser = { id: 1, name: 'Andy', email: 'andy@test.com' };
    act(() => useAuthStore.setState({ token: 'jwt:tokenabc' }));

    mockedApi.get.mockResolvedValueOnce({ data: { data: fakeUser } });

    await act(async () => useAuthStore.getState().fetchUser());

    const state = useAuthStore.getState();
    expect(mockedApi.get).toHaveBeenCalledWith('/jwt/user');
    expect(state.user).toEqual(fakeUser);
  });

  it('should handle fetch user 401 error and redirect', async () => {
    act(() => useAuthStore.setState({ token: 'jwt:tokenabc' }));
    mockedApi.get.mockRejectedValueOnce({ response: { status: 401 } });

    await expect(
      act(async () => useAuthStore.getState().fetchUser())
    ).rejects.toBeDefined();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(router.visit).toHaveBeenCalledWith('/login');
  });

  // --- Refresh Token ---
  it('should refresh token successfully', async () => {
    act(() => useAuthStore.setState({ token: 'token:old' }));
    mockedApi.post.mockResolvedValueOnce({ data: { data: { token: 'token:new' } } });

    await act(async () => useAuthStore.getState().refreshToken());

    const state = useAuthStore.getState();
    expect(mockedApi.post).toHaveBeenCalledWith('/jwt/refresh');
    expect(state.token).toBe('token:new');
    expect(mockedApi.defaults.headers.common['Authorization']).toBe('Bearer token:new');
    expect(state.isLoading).toBe(false);
  });

  it('should handle refresh token failure gracefully and clear state', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    act(() => useAuthStore.setState({ token: 'token:old' }));
    mockedApi.post.mockRejectedValueOnce(new Error('fail'));

    await act(async () => useAuthStore.getState().refreshToken());

    consoleSpy.mockRestore();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(router.visit).toHaveBeenCalledWith('/login');
    expect(mockedApi.defaults.headers.common['Authorization']).toBeUndefined();
  });
});