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
import { GEMINI_API_KEY } from "../../../../env";

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

    const defaultMessage = new AIMessage({
      content:
        "Hello! I am PDF Talk AI. How can I assist you with your PDF document today?",
    });
    this.addMessage(defaultMessage);
  }

  async callModel(): Promise<AIMessageChunk> {
    const promptMessages: any[] = [
      [
        "system",
        `You are a highly capable document summarization assistant. Your task is to read and analyze the entire document and produce a clear, concise summary. The summary should capture the key points, main themes, and any critical insights, formatted in an easy-to-read manner. Please ensure accuracy and clarity so that the user can quickly grasp the document's core content.
        This is the PDF context: {pdf_file}`,
      ],
    ];

    if (this.state.messages.length > 0) {
      promptMessages.push(new MessagesPlaceholder("messages"));
    }

    const prompt = ChatPromptTemplate.fromMessages(promptMessages);

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
    return this.state.messages.slice(1);
  }

  async setPDFFile(file: File): Promise<void> {
    try {
      const text = await pdfToText(file);
      this.state.pdf_file = text;
    } catch (error) {
      console.error("Failed to extract text from pdf", error);
    }
  }
  // Optionally, add a helper to clear conversation
  resetConversation() {
    this.state.messages = [];
  }
}
