import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Send, Hash, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  senderEmail: string;
}

const ChatView = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Alice",
      content: "Hey everyone, what do you think about the latest proposal?",
      timestamp: new Date(Date.now() - 3600000),
      senderEmail: "alice@example.com"
    },
    {
      id: "2",
      sender: "Bob",
      content: "I think it's a solid proposal. We should vote on it.",
      timestamp: new Date(Date.now() - 1800000),
      senderEmail: "bob@example.com"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: user.email?.split('@')[0] || "You",
      content: newMessage,
      timestamp: new Date(),
      senderEmail: user.email || ""
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Chat</h2>
          <p className="text-muted-foreground">Collaborate with your team</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>12 members online</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-4">
          <h3 className="font-semibold mb-4">Channels</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Hash className="h-4 w-4 mr-2" />
              general
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Hash className="h-4 w-4 mr-2" />
              proposals
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Hash className="h-4 w-4 mr-2" />
              arbitration
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Hash className="h-4 w-4 mr-2" />
              treasury
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-3 flex flex-col h-[600px]">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">general</h3>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-10 w-10 bg-primary/10">
                    <div className="flex items-center justify-center h-full text-primary font-semibold">
                      {message.sender[0].toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold">{message.sender}</span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChatView;
