import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Info,
  Layers,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useStateContext } from "@/context";
import { ethers } from "ethers";

const API = import.meta.env.VITE_BASE_API;


const getChainLabel = (chain) => {
  switch (chain) {
    case "eth":
      return "Ethereum";
    case "bsc":
      return "BSC";
    case "polygon":
      return "Polygon";
    case "arb":
      return "Arbitrum";
    case "optimism":
      return "Optimism";
    case "avalanche":
      return "Avalanche";
    case "base":
      return "Base";
    default:
      return chain;
  }
};

const getExplorerUrl = (chain, txHash) => {
  const baseUrls = {
    eth: "https://etherscan.io/tx/",
    bsc: "https://bscscan.com/tx/",
    polygon: "https://polygonscan.com/tx/",
    arb: "https://arbiscan.io/tx/",
    optimism: "https://optimistic.etherscan.io/tx/",
    avalanche: "https://snowtrace.io/tx/",
    base: "https://basescan.org/tx/",
  };
  return `${baseUrls[chain] || "#"}${txHash}`;
};

const ColoredProgress = ({ value, color = "bg-green-500" }) => (
  <div className="w-full h-3 bg-zinc-800 rounded-md overflow-hidden">
    <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
  </div>
);

export default function WalletAnalyzer() {
  const { getWalletDetail, hasUserVoted, vote, address, isConnected } = useStateContext();
  const [walletVoting, setWalletVoting] = useState();
  const [hasVoted, setHasVoted] = useState();
  const [walletData, setWalletData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  function isValidEvmAddress(address) {
    try {
      return ethers.getAddress(address);
    } catch (e) {
      return false;
    }
  }

  const loadData = async (inputAddress) => {
    const [voting, voted] = await Promise.all([
      getWalletDetail(inputAddress),
      hasUserVoted(inputAddress, address),
    ]);
    setWalletVoting(voting);
    setHasVoted(voted);

    const walletDetailRes = await fetch(`${API}/wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: inputAddress }),
    });
    const data = await walletDetailRes.json();
    setWalletData(data);
  };

  const handleSearch = async () => {
    if (!isValidEvmAddress(search)) {
      alert("Invalid EVM address!");
      return;
    }
    setLoading(true);
    await loadData(search);
    setLoading(false);
  };

  const handleVote = async (label) => {
    await vote(search, label);
    await loadData(search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 h-full space-y-8 overflow-auto custom-scrollbar">
      {/* Introduction Section */}
      {!walletData && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
          <CardHeader className="text-xl font-semibold text-white flex gap-2 items-center">
            <Layers className="text-violet-500 w-5 h-5" />
            Trust Labeling System
          </CardHeader>
          <CardContent className="space-y-5 text-zinc-400 text-sm leading-relaxed">
            <p>
              Discover how trustworthy a wallet is by looking at what the onchain community says.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>🛡️ Detect phishing or scam wallets via voting + ScamSniffer DB</li>
              <li>🌐 Chains: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base</li>
              <li>📊 Vote Low / Medium / High Trust</li>
              <li>🔗 Phishing DB: <a className="text-blue-500 underline" href="https://github.com/scamsniffer/scam-database" target="_blank">ScamSniffer</a></li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      {isConnected ? (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
          <CardHeader className="text-xl font-semibold text-white flex gap-2 items-center">
            <Search className="text-blue-500 w-5 h-5" />
            Lookup Wallet / Contract Address
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter address (0x...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-800 text-white border-zinc-700"
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Search"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-white">🔌 Please connect your wallet.</div>
      )}

      {/* Wallet Info */}
      {walletData && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-md">
          <CardHeader className="text-lg font-semibold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-violet-500" />
            Wallet Overview
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white">
            <div className="flex justify-between flex-wrap gap-4">
              <div>
                <p className="text-zinc-400">Address</p>
                <p className="font-mono text-blue-400">{walletData.address}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-zinc-400 mb-1">Phishing Flag</p>
                {walletData.isPhising ? (
                  <Badge className="bg-red-700 text-red-100">Reported Scam</Badge>
                ) : (
                  <Badge className="bg-green-700 text-green-100">Safe</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions + Voting */}
      {walletData && walletVoting && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Transaction Activity */}
          <Card className="bg-zinc-900 border border-zinc-800 shadow-md h-[400px] overflow-hidden">
            <CardHeader className="text-lg font-semibold text-white">📊 Transaction History</CardHeader>
            <CardContent className="space-y-4 text-sm text-white h-full overflow-y-auto pr-2 custom-scrollbar">
              {walletData.active_chains?.map((c, idx) => (
                <div key={idx} className="bg-zinc-800 p-4 rounded-md border border-zinc-700 space-y-2">
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>{getChainLabel(c.chain)} ({c.chain_id})</span>
                    <span>{c.first_transaction ? "Active" : "Inactive"}</span>
                  </div>
                  {c.first_transaction && (
                    <div className="text-xs text-zinc-300 space-y-1">
                      <div>
                        🔹 First Tx: {new Date(c.first_transaction.block_timestamp).toLocaleString()}
                        <a href={getExplorerUrl(c.chain, c.first_transaction.transaction_hash)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="inline ml-1 w-3 h-3 text-blue-400" />
                        </a>
                      </div>
                      <div>
                        🔹 Last Tx: {new Date(c.last_transaction.block_timestamp).toLocaleString()}
                        <a href={getExplorerUrl(c.chain, c.last_transaction.transaction_hash)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="inline ml-1 w-3 h-3 text-blue-400" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right: Voting Section */}
          <Card className="bg-zinc-900 border border-zinc-800 shadow-md h-full">
            <CardHeader className="text-lg font-semibold text-white">🏷️ Reputation Voting</CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[3, 2, 1].map((label) => {
                  const total = Number(walletVoting[0]);
                  const count = Number(walletVoting[label]);
                  const percent = count == 0 ? 0 : Math.round((count / total) * 100);

                  const labelText = label === 3 ? "High" : label === 2 ? "Medium" : "Low";
                  const color =
                    label === 3
                      ? "bg-gradient-to-r from-green-400 to-green-600"
                      : label === 2
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                        : "bg-gradient-to-r from-red-400 to-red-600";

                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white font-medium">{labelText} Trust</span>
                        <span className="text-white/60">{count} votes</span>
                      </div>
                      <ColoredProgress value={percent} color={color} />
                    </div>
                  );
                })}
              </div>

              {!hasVoted ? (
                <div className="flex flex-col gap-3 mt-4">
                  <Button className="bg-green-600 cursor-pointer" onClick={() => handleVote(2)}>
                    <ShieldCheck className="w-4 h-4 mr-1" /> Vote High
                  </Button>
                  <Button className="bg-yellow-600 cursor-pointer" onClick={() => handleVote(1)}>
                    Vote Medium
                  </Button>
                  <Button className="bg-red-600 cursor-pointer" onClick={() => handleVote(0)}>
                    <ShieldAlert className="w-4 h-4 mr-1" /> Vote Low
                  </Button>
                </div>
              ) : (
                <div className="text-green-400 font-medium pt-2">✅ You already voted for this wallet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
