namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    SOLANA_RPC_URL: string;
    MINT_PUBLIC_KEY: string;
    TREASURY_PUBLIC_KEY: string;
    TREASURY_PRIVATE_KEY: string;
    ENCRYPTION_KEY: string;
    NEXT_PUBLIC_API_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
