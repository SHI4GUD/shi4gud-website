import { BurnBank } from '../types/types';

export const ENABLE_TRANSACTION_FETCHING = true;
export const ENABLE_PRICE_FETCHING = true;

export const PRICE_ORACLE_ADDRESS = '0xf86bff1a3ec62175de2c6395214323c566354315' as const;
export const WETH_USD_CHAINLINK_ADDRESS = '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419' as const;

export const POOL_ADDRESSES: Record<string, `0x${string}`> = {
  shi: '0x959c7d5706ac0b5a29f506a1019ba7f2a1c70c70',
  shib: '0x2f62f2b4c5fcd7570a709dec05d68ea19c82a9ec',
};

export const BURN_BANKS: BurnBank[] = [
  {
    id: 'shi',
    name: 'Shina Inu',
    symbol: 'SHI',
    contractAddress: '0x243cacb4d5ff6814ad668c3e225246efa886ad5a',
    burnAddresses: ['0x000000000000000000000000000000000000dead'],
    logo: '/assets/tokens/shi/logo.png',
    decimals: 18,
    totalSupply: 20000000000000,
    chainId: 1,
  },
  {
    id: 'shib',
    name: 'Shiba Inu',
    symbol: 'SHIB',
    contractAddress: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    burnAddresses: [
      '0xdead000000000000000042069420694206942069',
      '0x000000000000000000000000000000000000dead',
      '0x0000000000000000000000000000000000000000',
    ],
    logo: '/assets/tokens/shib/logo.png',
    decimals: 18,
    totalSupply: 999982318160301,
    chainId: 1,
  },
];

export const getBurnBankById = (id: string): BurnBank | undefined => {
  return BURN_BANKS.find((bank) => bank.id === id);
};

export const getDefaultBurnBank = (): BurnBank => {
  return BURN_BANKS[0];
};

export const getPoolAddress = (tokenId: string): `0x${string}` | undefined => {
  return POOL_ADDRESSES[tokenId];
};
