import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ScrollAreaViewport } from "@radix-ui/react-scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import TypingIndicator from "./TypingIndicator";

const API = import.meta.env.VITE_BASE_API;

const initialMessages = [
  { id: 0, sender: "agent", text: "Hello! I’m your blockchain assistant. You can ask me anything about crypto, wallets, transactions, or tokens tracking. How can I help you today?" },
];

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className="flex items-end gap-2 max-w-[80%]">
        {!isUser && (
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        <div
          className={cn(
            "px-4 py-2 text-sm rounded-2xl shadow-md text-white prose prose-invert prose-p:my-0",
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-zinc-800 text-white rounded-bl-none"
          )}
        >
          <ReactMarkdown >
            {message.text}
          </ReactMarkdown>
        </div>
        {isUser && (
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://bit.ly/prosper-baba" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};


const Chat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    const response = await fetch(`${API}/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userMessage })
    });
    const botMessage = await response.json();

    const botReply = {
      id: Date.now() + 1,
      sender: "agent",
      text: botMessage?.answer,
    };

    setMessages((prev) => [...prev, botReply]);
    setIsTyping(false);
  };


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900">
        <h1 className="text-lg font-semibold">Onchain Agent</h1>
      </div>

      {/* Messages */}
      <ScrollArea className="h-full">
        <ScrollAreaViewport className="h-full custom-scrollbar">
          <div className="px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </ScrollAreaViewport>
        <ScrollBar orientation="vertical" />
      </ScrollArea>



      {/* Input */}
      <div className="border-t border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex gap-2">
          <Input
            placeholder="Nhập câu hỏi của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="bg-zinc-800 text-white placeholder:text-zinc-400 border-zinc-700 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button onClick={handleSend} size="icon" className="bg-blue-600 hover:bg-blue-700">
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
