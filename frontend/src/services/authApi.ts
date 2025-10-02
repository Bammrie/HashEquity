import { appEnv } from '../config/env';

type WalletLoginPayload = {
  walletAddress: string;
  signature: string;
};

export type WalletLoginResponse = {
  message: string;
  token: string;
  walletAddress: string;
  isAdmin: boolean;
};

const trimmedBaseUrl = appEnv.backendUrl ? appEnv.backendUrl.replace(/\/$/, '') : '';
const authBase = `${trimmedBaseUrl}/api/auth`;

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = 'Unexpected error communicating with backend';
    try {
      const data = await response.json();
      if (typeof data?.error === 'string') {
        message = data.error;
      }
    } catch (error) {
      // ignore json parse errors
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
};

export const walletLogin = async (
  payload: WalletLoginPayload,
): Promise<WalletLoginResponse> => {
  const response = await fetch(`${authBase}/wallet-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<WalletLoginResponse>(response);
};

