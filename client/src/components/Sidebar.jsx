import { Wallet, MessageCircle, BlocksIcon, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const menu = [
  { label: "Agent Assistant", icon: MessageCircle },
  { label: "Transaction Monitor", icon: BlocksIcon },
  { label: "Wallet Analyzer", icon: Wallet },
];

export default function Sidebar({ selected, onSelect }) {
  return (
    <aside className="h-screen w-64 bg-zinc-950 text-white border-r border-zinc-800 flex flex-col justify-between">
      {/* Top: Wallet */}
      <div>
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-center items-center">
          <appkit-button balance="hide" />
        </div>

        {/* Menu Items */}
        <nav className="px-2 py-4 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = selected === item.label;

            return (
              <button
                key={item.label}
                onClick={() => onSelect?.(item.label)}
                className={cn(
                  "flex items-center w-full gap-3 px-4 py-2 rounded-md transition-colors text-sm",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: GitBook Button */}
      <div className="p-4 border-t border-zinc-800">
        <a
          href="https://jackie-2.gitbook.io/x-guardian/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>GitBook Docs</span>
        </a>
      </div>
    </aside>
  );
}
