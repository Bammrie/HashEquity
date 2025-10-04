import { appEnv } from '../config/env';

type StatsEntry = {
  objectId: string;
  name: string;
  image: string;
  destroyed: number;
};

type LeaderboardEntry = {
  walletAddress: string;
  objectsDestroyed: number;
};

type BalancesResponse = {
  hashBalance: number | string;
  unmintedHash: number | string;
  vaultHashBalance?: number | string | null;
  objectsDestroyed: number | string;
};

type DestroyPayload = {
  wallet: string;
  objectId: string;
  reward?: number;
  objectName?: string;
  objectImage?: string;
};
type TradePayload = {
  wallet: string;
  amount: number;
};

type TradeResponse = BalancesResponse & {
  tradedAmount: number;
  mintedAmount: number;
};

const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const resolveBackendBase = (): string => {
  const explicit = appEnv.backendUrl?.trim();
  if (explicit) {
    return trimTrailingSlash(explicit);
  }

  if (typeof window === 'undefined') {
    return '';
  }

  const { hostname, origin } = window.location;
  const normalizedHost = hostname.toLowerCase();

  if (normalizedHost === 'localhost' || normalizedHost === '127.0.0.1') {
    console.warn(
      'VITE_BACKEND_URL is not set; defaulting to local backend at http://localhost:8080.'
    );
    return 'http://localhost:8080';
  }

  if (normalizedHost === 'hashequity.com' || normalizedHost.endsWith('.hashequity.com')) {
    console.warn(
      'VITE_BACKEND_URL is not set; defaulting to production API at https://api.hashequity.com.'
    );
    return 'https://api.hashequity.com';
  }

  console.warn(
    `VITE_BACKEND_URL is not set; defaulting to same-origin backend at ${origin}.`
  );
  return origin;
};

const backendBase = trimTrailingSlash(resolveBackendBase());
const apiBase = backendBase ? `${backendBase}/api/game` : '/api/game';

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

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await fetch(createUrl('/leaderboard'), {
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<LeaderboardEntry[]>(response);
};

export const fetchBalances = async (wallet: string): Promise<BalancesResponse> => {
  const url = `${createUrl('/balances')}?wallet=${encodeURIComponent(wallet)}`;

  const response = await fetch(url, {
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

export const tradeUnmintedHash = async (payload: TradePayload): Promise<TradeResponse> => {
  const response = await fetch(createUrl('/trade'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<TradeResponse>(response);
};

export type {
  StatsEntry,
  LeaderboardEntry,
  BalancesResponse,
  DestroyPayload,
  TradePayload,
  TradeResponse,
};
