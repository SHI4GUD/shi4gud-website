import { createPublicClient, http, fallback, PublicClient } from 'viem';
import { mainnet } from 'viem/chains';

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY;

const ALCHEMY_RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const INFURA_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;

const PUBLIC_RPC_URLS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com',
];

export const createViemClient = (): PublicClient => {
  const transports = [];

  if (ALCHEMY_API_KEY && ALCHEMY_API_KEY !== 'YOUR_ALCHEMY_API_KEY') {
    transports.push(
      http(ALCHEMY_RPC_URL, {
        name: 'Alchemy',
        retryCount: 2,
        retryDelay: 1000,
      })
    );
  }

  if (INFURA_API_KEY && INFURA_API_KEY !== 'YOUR_INFURA_API_KEY') {
    transports.push(
      http(INFURA_RPC_URL, {
        name: 'Infura',
        retryCount: 2,
        retryDelay: 1000,
      })
    );
  }

  PUBLIC_RPC_URLS.forEach((url) => {
    transports.push(
      http(url, {
        retryCount: 1,
        retryDelay: 500,
      })
    );
  });

  if (transports.length === 0) {
    PUBLIC_RPC_URLS.forEach((url) => {
      transports.push(http(url, { retryCount: 1 }));
    });
  }

  return createPublicClient({
    chain: mainnet,
    transport: fallback(transports, {
      rank: false,
      retryCount: 2,
    }),
  });
};

let clientInstance: PublicClient | null = null;

export const getViemClient = (): PublicClient => {
  if (!clientInstance) {
    clientInstance = createViemClient();
  }
  return clientInstance;
};
