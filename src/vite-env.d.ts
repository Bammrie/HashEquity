interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_HASH_TOKEN_ADDRESS: string;
  readonly VITE_NFT_CONTRACT_ADDRESS: string;
  readonly VITE_ADMIN_PASSCODE: string;
  readonly [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const value: string;
  export default value;
}
