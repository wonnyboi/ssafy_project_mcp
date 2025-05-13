export interface Message {
  content: string;
  metadata?: {
    step?: number | string;
    totalSteps?: number;
    projectData?: Record<string, any>;
  };
}

export interface ServerConfig {
  onMessage: (message: Message) => Promise<Message>;
  onStart?: () => Promise<void>;
  onStop?: () => Promise<void>;
} 