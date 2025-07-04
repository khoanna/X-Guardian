import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Wallet, ShieldAlert, ExternalLink } from "lucide-react";
import { ethers } from 'ethers'

const API = import.meta.env.VITE_BASE_API;

export default function Tracking() {
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const [isPhishing, setIsPhishing] = useState(false);

    function isValidEvmAddress(address) {
        try {
            const checksummed = ethers.getAddress(address);
            return checksummed === address || checksummed.toLowerCase() === address.toLowerCase();
        } catch (e) {
            return false;
        }
    }

    const handleTrack = async () => {
        setError("");
        setIsPhishing(false);
        setLoading(true);
        console.log(isValidEvmAddress(address));

        if (!isValidEvmAddress(address)) {
            alert("Invalid EVM address!");
            return;
        }
        try {
            const res = await fetch(`${API}/tracking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Unknown error");

            setResults(data?.txData || []);
            setIsPhishing(data?.isPhishing || false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 px-4">
            <Card className="bg-[#101012] border border-zinc-800 shadow-2xl shadow-blue-900/20">
                <CardHeader className="text-3xl font-bold text-white flex gap-2 items-center">
                    <Wallet className="text-blue-500 w-6 h-6" />
                    Wallet Tracker
                </CardHeader>

                <CardContent className="custom-scrollbar space-y-6 min-h-[420px]">
                    {/* Input */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Enter wallet address (e.g. 0x...)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="bg-zinc-900 text-white placeholder:text-zinc-500 border-zinc-700"
                        />
                        <Button
                            onClick={handleTrack}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Track"}
                        </Button>
                    </div>

                    {/* Phishing warning */}
                    {isPhishing && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-950 border border-red-700 p-3 rounded-md text-sm font-medium">
                            <ShieldAlert className="w-5 h-5" />
                            Warning: This address has been reported as a phishing address!
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-red-500 font-medium">⚠️ {error}</div>
                    )}

                    {/* Empty placeholder before results */}
                    {!results.length && !loading && !error && (
                        <div className="mt-10 space-y-6 text-zinc-400 text-center">
                            <h2 className="text-xl sm:text-2xl font-semibold text-white">
                                Track Wallets Across 7 Chains with Real-Time Scam Detection
                            </h2>

                            {/* Supported Chains */}
                            <div className="flex flex-wrap justify-center gap-3 text-sm">
                                {[
                                    { name: "Ethereum", color: "text-emerald-400", icon: "Ξ" },
                                    { name: "BSC", color: "text-yellow-400", icon: "🟡" },
                                    { name: "Polygon", color: "text-purple-400", icon: "⬣" },
                                    { name: "Arbitrum", color: "text-sky-400", icon: "🌀" },
                                    { name: "Optimism", color: "text-red-400", icon: "🟥" },
                                    { name: "Avalanche", color: "text-pink-400", icon: "🏔️" },
                                    { name: "Base", color: "text-blue-400", icon: "🧊" },
                                ].map((chain, idx) => (
                                    <span
                                        key={idx}
                                        className={`bg-zinc-800/60 px-4 py-1 rounded-md border border-zinc-700 font-medium ${chain.color}`}
                                    >
                                        {chain.icon} {chain.name}
                                    </span>
                                ))}
                            </div>

                            {/* Sample Addresses */}
                            <div className="text-sm text-zinc-400">
                                Try sample:{" "}
                                <code className="bg-zinc-800 px-2 py-1 rounded-md text-blue-400 font-mono">
                                    0x742d35Cc6634C0532925a3b844Bc454e4438f44e
                                </code>{" "}
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-inner shadow-zinc-900/20">
                                    <h3 className="text-white font-semibold text-sm mb-1">📊 Transfer History</h3>
                                    <p className="text-xs text-zinc-400">
                                        View all past incoming and outgoing transfers from any wallet, across multiple chains.
                                    </p>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-inner shadow-zinc-900/20">
                                    <h3 className="text-white font-semibold text-sm mb-1">🛡️ Scam Detection</h3>
                                    <p className="text-xs text-zinc-400">
                                        Identify phishing and scam wallets instantly using{" "}
                                        <a
                                            href="https://github.com/scamsniffer/scam-database"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 underline"
                                        >
                                            ScamSniffer Database
                                        </a>.
                                    </p>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-inner shadow-zinc-900/20">
                                    <h3 className="text-white font-semibold text-sm mb-1">🔍 Cross-chain Lookup</h3>
                                    <p className="text-xs text-zinc-400">
                                        Lookup addresses across Ethereum, BSC, Polygon, and more — all in one unified view.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-zinc-600">
                                ⚡ Powered by Moralis API + Community-Sourced Scam Database
                            </p>
                        </div>
                    )}


                    {/* Render Results */}
                    {results.length > 0 && (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 max-h-[520px] overflow-y-auto custom-scrollbar">
                            <CardContent className="space-y-6 custom-scrollbar">
                                {results.map((tx, idx) => (
                                    <div
                                        key={idx}
                                        className="relative border-l-2 border-blue-500 pl-6 pb-4"
                                    >
                                        <div className="absolute top-1 left-[-10px] w-4 h-4 bg-blue-500 rounded-full border-2 border-zinc-900" />

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-zinc-400">Chain:</div>
                                                <div className="text-sm text-white capitalize">{tx.chain}</div>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-sm text-zinc-400">From:</div>
                                                <div className="flex items-center gap-2 font-mono text-white text-xs">
                                                    {tx.from.address}
                                                    {tx.from.isPhising && (
                                                        <span className="bg-red-900 text-red-500 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                                                            <ShieldAlert className="w-3 h-3" />
                                                            Phishing
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-sm text-zinc-400">To:</div>
                                                <div className="flex items-center gap-2 font-mono text-white text-xs">
                                                    {tx.to.address ? tx.to.address : "Create Contract"}
                                                    {tx.to.isPhising && (
                                                        <span className="bg-red-900 text-red-500 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                                                            <ShieldAlert className="w-3 h-3" />
                                                            Phishing
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <div className="text-zinc-400">Value:</div>
                                                <div className="text-green-400 font-bold">{tx.value} ETH</div>
                                            </div>

                                            <div className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                                                <ExternalLink className="w-3 h-3" />
                                                <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer">
                                                    View on Explorer
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </div>
                    )}

                    {/* No Result */}
                    {!loading && results.length === 0 && address && !error && (
                        <div className="text-center text-zinc-400 mt-4">
                            No outgoing transfers found for this address.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
