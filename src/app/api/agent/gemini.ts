import { AIMessageChunk } from "@langchain/core/messages";
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
import pdfToText from "react-pdftotext";
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
    pdf_file: String | null;
    messages: GeminiChatMessage[];
  };

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      maxOutputTokens: 2048,
      apiKey: GEMINI_API_KEY,
    });
    this.state = { messages: [], pdf_file: null };
  }

  async callModel(): Promise<AIMessageChunk> {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are PDF Talk AI, an expert assistant designed to help users navigate and understand PDF documents. Your responses should be strictly based on the provided PDF context. Offer clear, concise, and relevant insights tailored to the content and intent of the document. Always maintain a helpful and user-friendly tone.
        This is the PDF context: {pdf_file}`,
      ],
      new MessagesPlaceholder("messages"),
    ]);

    const formattedPrompt = await prompt.formatMessages({
      messages: this.state.messages,
      pdf_file: this.state.pdf_file,
    });

    const GeminiResponse = await this.model.invoke(formattedPrompt);

    this.addMessage(GeminiResponse);

    return GeminiResponse;
  }

  // Add a message to the conversation context
  addMessage(message: GeminiChatMessage) {
    this.state.messages.push(message);
  }

  getMessages() {
    return this.state.messages;
  }

  async setPDFFile(file: File): Promise<void> {
    pdfToText(file)
      .then((text) => (this.state.pdf_file = text))
      .catch((error) => console.error("Failed to extract text from pdf"));
  }
  // Optionally, add a helper to clear conversation
  resetConversation() {
    this.state.messages = [];
  }
}
