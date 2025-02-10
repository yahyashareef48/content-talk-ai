import {
  AIMessageChunk,
  ToolMessageFieldsWithToolCallId,
} from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  BaseMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { GEMINI_API_KEY } from "../../../../agent.config";

export type GeminiChatMessage =
  | HumanMessage
  | AIMessage
  | BaseMessage
  | SystemMessage
  | ToolMessage;

export class ChatAgent {
  private model: ChatGoogleGenerativeAI;
  private state: {
    messages: GeminiChatMessage[];
  };

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      maxOutputTokens: 2048,
      apiKey: GEMINI_API_KEY,
    });
    this.state = { messages: [] };
  }

  // Add a message to the conversation context
  addMessage(message: GeminiChatMessage) {
    this.state.messages.push(message);
  }

  // Optionally, add a helper to clear conversation
  resetConversation() {
    this.state.messages = [];
  }

  async callModel(): Promise<AIMessageChunk> {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are PDF Talk AI, an expert assistant designed to help users navigate and understand PDF documents. When provided with a PDF context, offer clear, concise, and relevant insights. Focus on ensuring your responses are tailored to the content and intent of the document, and always maintain a helpful and user-friendly tone.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);

    const formattedPrompt = await prompt.formatMessages({
      messages: this.state.messages,
    });

    console.log("Formatted Prompt", formattedPrompt);

    const GeminiResponse = await this.model.invoke(formattedPrompt);

    // Optionally add the agent’s answer to the conversation state
    this.addMessage(GeminiResponse);

    return GeminiResponse;
  }
}
