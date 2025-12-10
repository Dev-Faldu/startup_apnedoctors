import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LiveMessage } from '@/types/live';
import { User, Bot } from 'lucide-react';

interface LiveTranscriptProps {
  messages: LiveMessage[];
  currentTranscript?: string;
  className?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  messages,
  currentTranscript,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex flex-col gap-3 overflow-y-auto max-h-48 p-4 rounded-xl',
        'bg-background/50 backdrop-blur-sm border border-border/30',
        className
      )}
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'flex gap-2 items-start',
            msg.role === 'user' ? 'flex-row-reverse' : ''
          )}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              msg.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'
            )}
          >
            {msg.role === 'user' ? (
              <User className="w-4 h-4 text-primary" />
            ) : (
              <Bot className="w-4 h-4 text-accent" />
            )}
          </div>
          <div
            className={cn(
              'px-3 py-2 rounded-lg max-w-[80%] text-sm',
              msg.role === 'user'
                ? 'bg-primary/10 text-foreground'
                : 'bg-accent/10 text-foreground'
            )}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {currentTranscript && (
        <div className="flex gap-2 items-start flex-row-reverse">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="px-3 py-2 rounded-lg max-w-[80%] text-sm bg-primary/10 text-foreground/70 italic">
            {currentTranscript}...
          </div>
        </div>
      )}

      {messages.length === 0 && !currentTranscript && (
        <div className="text-center text-muted-foreground text-sm py-4">
          Start speaking to begin your consultation...
        </div>
      )}
    </div>
  );
};
