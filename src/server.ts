import { readFileSync } from 'fs';
import { join } from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Message, ServerConfig } from './types';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 단계 정의 파일 읽기
const steps = readFileSync(join(__dirname, 'steps.md'), 'utf-8')
  .split('###')
  .filter(step => step.trim())
  .map(step => step.trim());

// 현재 단계 추적
let currentStep = 0;
let projectData: Record<string, any> = {};

class McpServer {
  private config: ServerConfig;
  private app: express.Application;
  private port: number;

  constructor(config: ServerConfig, port: number = 3000) {
    this.config = config;
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Smithery MCP 엔드포인트
    this.app.get('/mcp', async (req: Request, res: Response) => {
      try {
        const config = req.query.config ? JSON.parse(Buffer.from(req.query.config as string, 'base64').toString()) : {};
        res.json({
          name: 'project-portfolio-guide',
          version: '1.0.0',
          tools: [
            {
              name: 'startConversation',
              description: 'Start a new project portfolio conversation',
              parameters: {}
            }
          ]
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.post('/mcp', async (req: Request, res: Response) => {
      try {
        const message: Message = req.body;
        const response = await this.config.onMessage(message);
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.delete('/mcp', async (req: Request, res: Response) => {
      try {
        await this.config.onStop?.();
        res.json({ status: 'stopped' });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // 기존 엔드포인트들
    this.app.post('/message', async (req: Request, res: Response) => {
      try {
        const message: Message = req.body;
        const response = await this.config.onMessage(message);
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy' });
    });
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`서버가 포트 ${this.port}에서 시작되었습니다.`);
    });
    await this.config.onStart?.();
  }

  async stop() {
    console.log('서버가 종료되었습니다.');
    await this.config.onStop?.();
  }
}

const server = new McpServer({
  async onMessage(message: Message): Promise<Message> {
    // 첫 메시지인 경우 첫 단계 질문 반환
    if (currentStep === 0) {
      currentStep++;
      return {
        content: steps[0],
        metadata: {
          step: currentStep,
          totalSteps: steps.length
        }
      };
    }

    // 사용자 응답 저장
    const currentQuestion = steps[currentStep - 1].split('\n')[0];
    projectData[currentQuestion] = message.content;

    // 마지막 단계인 경우 종료
    if (currentStep >= steps.length) {
      return {
        content: '프로젝트 정보 수집이 완료되었습니다. 수집된 정보를 확인하시겠습니까? (y/n)',
        metadata: {
          step: 'complete',
          projectData
        }
      };
    }

    // 다음 단계로 진행
    currentStep++;
    return {
      content: steps[currentStep - 1],
      metadata: {
        step: currentStep,
        totalSteps: steps.length
      }
    };
  },

  async onStart() {
    console.log('MCP 서버가 시작되었습니다.');
  },

  async onStop() {
    console.log('MCP 서버가 종료되었습니다.');
  }
});

// 서버 시작
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.start(); 