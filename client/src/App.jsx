import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Chat from "@/components/chat";
import Tracking from "@/components/Tracking";
import WalletAnalyzer from "@/components/Wallet";
import { StateContextProvider } from '@/context';

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { sepolia } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '805b6af44af0f0838b92cd03a9ee6369'

// 2. Create a metadata object - optional
const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://example.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [sepolia]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  enableWallets: true,
  enableReconnect: true,
  debug: true,
  themeMode: "dark",
  features: { onramp: false, swaps: false, analytics: false }
})

export default function App() {
  const [selected, setSelected] = useState("Agent Assistant");

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <StateContextProvider>
          <div className="flex h-screen w-full bg-black text-white overflow-hidden">
            <Sidebar selected={selected} onSelect={setSelected} />

            {/* Main content */}
            <main className="flex-1 overflow-hidden">
              {selected === "Agent Assistant" && <Chat />}
              {selected === "Transaction Monitor" && <Tracking />}
              {selected === "Wallet Analyzer" && <WalletAnalyzer />}
            </main>
          </div>
        </StateContextProvider>
      </QueryClientProvider>
    </WagmiProvider>

  );
}
