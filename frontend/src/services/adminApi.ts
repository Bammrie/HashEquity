import { appEnv } from '../config/env';

export type AdminSummary = {
  totalPlayers: number;
  hashBalanceTotal: number;
  unmintedHashTotal: number;
  adminWallets: string[];
  generatedAt: string;
};

export type AdminUserEntry = {
  walletAddress: string;
  hashBalance: number;
  unmintedHash: number;
  isAdmin: boolean;
  updatedAt: string;
  createdAt: string;
};

export type AdminOverviewResponse = {
  summary: AdminSummary;
  topUsers: AdminUserEntry[];
};

const trimmedBaseUrl = appEnv.backendUrl ? appEnv.backendUrl.replace(/\/$/, '') : '';
const adminBase = `${trimmedBaseUrl}/api/admin`;

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

export const fetchAdminOverview = async (
  token: string,
): Promise<AdminOverviewResponse> => {
  const response = await fetch(`${adminBase}/overview`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<AdminOverviewResponse>(response);
};

