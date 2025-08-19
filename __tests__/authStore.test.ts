import { router } from '@inertiajs/react';
import { act } from '@testing-library/react';
import axios from 'axios';
import { useAuthStore } from '../src/stores/authStore';

jest.mock('axios');
jest.mock('@inertiajs/react', () => ({
  router: { visit: jest.fn() },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const fakeUser = { id: 1, name: 'Andy', email: 'andy@test.com' };
    const fakeLoginResponse = { data: { data: { token: 'token:abc' } } };
    const fakeUserResponse = { data: { data: fakeUser } };

    mockedAxios.post.mockResolvedValueOnce(fakeLoginResponse);
    mockedAxios.get.mockResolvedValueOnce(fakeUserResponse);

    await act(async () => {
      await useAuthStore.getState().login('andy@test.com', 'password');
    });

    const state = useAuthStore.getState();
    expect(state.token).toBe('token:abc');
    expect(state.user).toEqual(fakeUser);
    expect(state.isInitialized).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle login error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
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

  it('should register successfully', async () => {
    const fakeUser = { id: 2, name: 'John', email: 'john@test.com' };
    const fakeRegisterResponse = { data: { data: { token: 'token:def', user: fakeUser } } };

    mockedAxios.post.mockResolvedValueOnce(fakeRegisterResponse);

    await act(async () => {
      await useAuthStore.getState().register('John', 'john@test.com', 'password');
    });

    const state = useAuthStore.getState();
    expect(state.token).toBe('token:def');
    expect(state.user).toEqual(fakeUser);
    expect(state.isInitialized).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should logout properly', async () => {
    act(() =>
      useAuthStore.setState({
        token: 'token:abc',
        user: { id: 1, name: 'Andy', email: 'andy@test.com' },
      })
    );

    mockedAxios.post.mockResolvedValueOnce({});

    await act(async () => useAuthStore.getState().logout());

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(router.visit).toHaveBeenCalledWith('/login');
  });

  it('should fetch user when token exists', async () => {
    const fakeUser = { id: 1, name: 'Andy', email: 'andy@test.com' };
    act(() => useAuthStore.setState({ token: 'jwt:tokenabc' }));

    mockedAxios.get.mockResolvedValueOnce({ data: { data: fakeUser } });

    await act(async () => useAuthStore.getState().fetchUser());

    const state = useAuthStore.getState();
    expect(state.user).toEqual(fakeUser);
  });

  it('should handle fetch user 401 error', async () => {
    act(() => useAuthStore.setState({ token: 'jwt:tokenabc' }));
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

    await expect(
      act(async () => useAuthStore.getState().fetchUser())
    ).rejects.toBeDefined();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should refresh token successfully', async () => {
    act(() => useAuthStore.setState({ token: 'token:old' }));
    mockedAxios.post.mockResolvedValueOnce({ data: { data: { token: 'token:new' } } });

    await act(async () => useAuthStore.getState().refreshToken());

    const state = useAuthStore.getState();
    expect(state.token).toBe('token:new');
    expect(state.isLoading).toBe(false);
  });

  it('should handle refresh token failure gracefully', async () => {
    act(() => useAuthStore.setState({ token: 'token:old' }));
    mockedAxios.post.mockRejectedValueOnce(new Error('fail'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => useAuthStore.getState().refreshToken());

    consoleSpy.mockRestore();

    const state = useAuthStore.getState();
    expect(state.token).toBe('token:old');
    expect(state.isLoading).toBe(false);
  });
});
