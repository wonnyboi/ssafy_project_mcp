import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
// Create a new MCP server
const server = new McpServer({
    name: "github-analyzer",
    version: "1.0.0"
});
// Tool to read GitHub repository
server.tool("readGithubRepo", {
    owner: z.string().describe("GitHub repository owner"),
    repo: z.string().describe("GitHub repository name")
}, async ({ owner, repo }) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        const repoData = response.data;
        return {
            content: [{
                    type: "text",
                    text: `Repository Analysis:\n
Name: ${repoData.name}
Description: ${repoData.description || 'No description'}
Stars: ${repoData.stargazers_count}
Forks: ${repoData.forks_count}
Language: ${repoData.language || 'Not specified'}
Created: ${new Date(repoData.created_at).toLocaleDateString()}
Last Updated: ${new Date(repoData.updated_at).toLocaleDateString()}`
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return {
            content: [{ type: "text", text: `Error reading repository: ${errorMessage}` }]
        };
    }
});
// Tool to ask user questions
server.tool("askUser", {
    question: z.string().describe("Question to ask the user")
}, async ({ question }) => {
    return {
        content: [{ type: "text", text: `Question: ${question}\nPlease provide your answer.` }]
    };
});
// Tool to summarize project information
server.tool("summarizeProject", {
    repoInfo: z.string().describe("Repository information"),
    userAnswers: z.string().describe("User's answers to questions")
}, async ({ repoInfo, userAnswers }) => {
    return {
        content: [{
                type: "text",
                text: `Project Summary:\n\n${repoInfo}\n\nAdditional Information:\n${userAnswers}`
            }]
    };
});
// Connect the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.log("GitHub Repository Analyzer Server is running...");
