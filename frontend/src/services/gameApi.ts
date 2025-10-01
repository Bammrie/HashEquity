import { appEnv } from '../config/env';

type StatsEntry = {
  objectId: string;
  name: string;
  image: string;
  destroyed: number;
};

type BalancesResponse = {
  hashBalance: number | string;
  unmintedHash: number | string;
};

type DestroyPayload = {
  wallet: string;
  objectId: string;
  reward?: number;
  objectName?: string;
  objectImage?: string;
};

const trimmedBaseUrl = appEnv.backendUrl ? appEnv.backendUrl.replace(/\/$/, '') : '';
const apiBase = `${trimmedBaseUrl}/api/game`;

const createUrl = (path: string) => `${apiBase}${path}`;

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

export const fetchGameStats = async (): Promise<StatsEntry[]> => {
  const response = await fetch(createUrl('/stats'), {
    headers: {
      Accept: 'application/json',
    },
  });
  return handleResponse<StatsEntry[]>(response);
};

export const fetchBalances = async (wallet: string): Promise<BalancesResponse> => {
  const url = new URL(createUrl('/balances'), window.location.origin);
  url.searchParams.set('wallet', wallet);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });
  return handleResponse<BalancesResponse>(response);
};

export const destroyGameObject = async (payload: DestroyPayload): Promise<BalancesResponse> => {
  const response = await fetch(createUrl('/destroy'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<BalancesResponse>(response);
};

export type { StatsEntry, BalancesResponse, DestroyPayload };
