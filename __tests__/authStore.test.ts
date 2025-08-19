// __tests__/authStore.test.ts
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
    act(() => setState({
      token: null,
      publicKey: null,
      user: null,
      isLoading: false,
      error: null,
      isInitialized: false,
    }));
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const fakeUser = { id: 1, name: 'Andy', email: 'andy@test.com' };
    const fakeResponse = {
      data: {
        data: { token: 'token:abc', public_key: 'pubKey' },
      },
    };
    const fakeUserResponse = { data: { data: fakeUser } };

    mockedAxios.post.mockResolvedValueOnce(fakeResponse);
    mockedAxios.get.mockResolvedValueOnce(fakeUserResponse);

    await act(async () => {
      await useAuthStore.getState().login('andy@test.com', 'password');
    });

    const state = useAuthStore.getState();
    expect(state.token).toBe('token:abc');
    expect(state.publicKey).toBe('pubKey');
    expect(state.user).toEqual(fakeUser);
    expect(state.isInitialized).toBe(true);
  });

  it('should handle login error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    await expect(
      act(async () =>
        useAuthStore.getState().login('andy@test.com', 'wrong')
      )
    ).rejects.toBeDefined();

    const state = useAuthStore.getState();
    expect(state.error).toBe('Invalid credentials');
    expect(state.token).toBeNull();
  });

  it('should logout properly', async () => {
    act(() => useAuthStore.setState({ token: 'token:abc', publicKey: 'pubKey', user: { id: 1, name: 'Andy', email: 'andy@test.com' } }));

    mockedAxios.post.mockResolvedValueOnce({});

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(router.visit).toHaveBeenCalledWith('/login');
  });

  it('should fetch user when token exists', async () => {
    const fakeUser = { id: 1, name: 'Andy', email: 'andy@test.com' };
    act(() => useAuthStore.setState({ token: 'jwt:tokenabc' }));

    mockedAxios.get.mockResolvedValueOnce({ data: { data: fakeUser } });

    await act(async () => {
      await useAuthStore.getState().fetchUser();
    });

    expect(useAuthStore.getState().user).toEqual(fakeUser);
  });

  it('should verify signature successfully', async () => {
    act(() => useAuthStore.setState({ token: 'token:abc' }));

    mockedAxios.post.mockResolvedValueOnce({ data: { status: 'success' } });

    const result = await useAuthStore.getState().verifySignature('data', 'sig');
    expect(result).toBe(true);
  });

  it('should return false for signature verification failure', async () => {
    act(() => useAuthStore.setState({ token: 'token:abc' }));

    mockedAxios.post.mockRejectedValueOnce(new Error('fail'));

    const result = await useAuthStore.getState().verifySignature('data', 'sig');
    expect(result).toBe(false);
  });
});
