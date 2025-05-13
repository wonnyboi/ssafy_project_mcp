# Project Portfolio Guide MCP Server

A Model Context Protocol server that helps collect and structure project portfolio information through a guided conversation flow.

## Features

- Step-by-step project information collection
- GitHub repository integration
- Structured data collection for project portfolios
- RESTful API endpoints
- Docker containerization support

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Docker (for containerized deployment)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd project-portfolio-guide
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

### Local Development

Start the development server:

```bash
npm run dev
```

### Production

Start the production server:

```bash
npm start
```

### Docker

Build and run with Docker:

```bash
docker build -t project-portfolio-guide .
docker run -p 3000:3000 project-portfolio-guide
```

## API Endpoints

### POST /message

Send a message to the server and receive the next step in the conversation.

Request body:

```json
{
  "content": "user message"
}
```

Response:

```json
{
  "content": "server response",
  "metadata": {
    "step": 1,
    "totalSteps": 15
  }
}
```

### GET /health

Check server health status.

Response:

```json
{
  "status": "healthy"
}
```

## Deployment to Smithery

1. Create a Smithery account at https://smithery.ai
2. Install the Smithery CLI:

```bash
npm install -g @smithery/cli
```

3. Login to Smithery:

```bash
smithery login
```

4. Deploy the server:

```bash
smithery deploy
```

## Configuration

The server can be configured using environment variables:

- `PORT`: Server port number (default: 3000)
- `NODE_ENV`: Node environment (default: production)

## License

MIT
