import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";

// BotChain Mainnet Configuration
export const BOTCHAIN_CHAIN_ID = 677;
export const BOTCHAIN_RPC_URL = "https://rpc.botchain.ai";
export const BOTCHAIN_EXPLORER_URL = "https://scan.botchain.ai";
export const BOTCHAIN_WEBSITE_URL = "https://botchain.ai";

export const botchain = defineChain({
  id: BOTCHAIN_CHAIN_ID,
  name: "BotChain",
  nativeCurrency: {
    decimals: 18,
    name: "BotChain",
    symbol: "BOT",
  },
  rpcUrls: {
    default: {
      http: [BOTCHAIN_RPC_URL],
    },
    public: {
      http: [BOTCHAIN_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "BotChain Explorer",
      url: BOTCHAIN_EXPLORER_URL,
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [botchain],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [botchain.id]: http(BOTCHAIN_RPC_URL),
  },
  ssr: true,
});
