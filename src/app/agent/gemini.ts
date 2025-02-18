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
import { GEMINI_API_KEY } from "../../../env";

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
        "Hello! I am PDF/Youtube Video Talk AI. How can I assist you with your PDF/Youtube Video document today?",
    });
    this.addMessage(defaultMessage);
  }

  async callModel(): Promise<AIMessageChunk> {
    const promptMessages: any[] = [
      [
        "system",
        `You are a highly capable document summarization assistant. Your task is to read and analyze the entire document and produce a clear, concise summary. The summary should capture the key points, main themes, and any critical insights, formatted in an easy-to-read manner. Please ensure accuracy and clarity so that the user can quickly grasp the document's core content.
        AFTER THAT TALK TO THE USER IN THE CONTEXT OF THE DOCUMENT.
        This is the PDF/Youtube Video context: {pdf_file}`,
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

  async getNextPromptSuggestions(): Promise<string[]> {
    const suggestionPromptMessages: any[] = [
      [
        "system",
        `You are a document Q/A expert. Generate 3 VERY SHORT follow-up questions (8-12 words max) based on the conversation and PDF/Youtube Video.
        FORMAT STRICTLY AS: ["question?", "question?", "question?"]
        NO MARKDOWN, ONLY PLAIN JSON ARRAY. AVOID COMPOUND QUESTIONS.`,
      ],
      [
        "human",
        `Conversation context: {messages}
        PDF/Youtube Video content summary:
        {pdf_file}`,
      ],
    ];

    const conversationContext = this.state.messages.slice(-2);
    const variables = {
      messages: conversationContext
        .map((m: any) => `${m.role}: ${m.content}`)
        .join("\n"),
      pdf_file: this.state.pdf_file,
    };

    const suggestionPrompt = ChatPromptTemplate.fromMessages(
      suggestionPromptMessages,
    );
    const formattedPrompt = await suggestionPrompt.formatMessages(variables);

    try {
      const suggestionResponse = await this.model.invoke(formattedPrompt);
      const responseContent = String(suggestionResponse.content).trim();

      // Improved JSON extraction with error-tolerant parsing
      let suggestions;
      try {
        suggestions = JSON.parse(responseContent);
      } catch {
        const cleaned =
          responseContent
            .replace(/[\s\n]+/g, " ")
            .replace(/(\w)(")(\w)/g, "$1$3") // Fix common quote issues
            .match(/\[.*\]/)?.[0] || "[]";
        suggestions = JSON.parse(cleaned);
      }

      // Handle both object and string formats
      return suggestions
        .map((s: any) => {
          if (typeof s === "string") return s.trim();
          if (s.content) return s.content.trim();
          if (s.text) return s.text.trim();
          return JSON.stringify(s).trim();
        })
        .filter((s: any) => s.length > 0)
        .slice(0, 3); // Ensure max 3 suggestions
    } catch (error) {
      console.error("Suggestion generation error:", error);
      return [];
    }
  }
  // Add a message to the conversation context
  addMessage(message: GeminiChatMessage) {
    this.state.messages.push(message);
  }

  getMessages() {
    return this.state.messages.slice(1);
  }

  async getYouTubeVideoTranscript(videoLink: string): Promise<string> {
    const videoId = extractVideoId(videoLink);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }
    const apiUrl = `http://localhost:8000/transcript?video_id=${videoId}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.transcript;
    } catch (error) {
      console.error(`Error fetching transcript: ${error}`);
      throw error;
    }
  }

  async setContext(file: File | string): Promise<void> {
    try {
      if (typeof file === "string") {
        this.state.pdf_file = file;
      } else {
        const text = await pdfToText(file);
        this.state.pdf_file = text;
      }
    } catch (error) {
      console.error("Failed to extract text from pdf", error);
    }
  }
  // Optionally, add a helper to clear conversation
  resetConversation() {
    this.state.messages = [];
  }
}

function extractVideoId(url: string): string | null {
  // Matches common forms: https://www.youtube.com/watch?v=VIDEOID and https://youtu.be/VIDEOID
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
