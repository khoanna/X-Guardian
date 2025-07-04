import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TypingIndicator = () => {
  return (
    <div className="flex w-full justify-start">
      <div className="flex items-end gap-2 max-w-[80%]">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="flex items-center space-x-1 bg-zinc-800 text-white px-4 py-2 rounded-2xl shadow-md">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
