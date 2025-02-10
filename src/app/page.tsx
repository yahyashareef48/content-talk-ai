"use client";

import React, { use, useCallback, useEffect, useRef, useState } from "react";
import Form from "@/components/form";
import Message from "@/components/message";
import cx from "@/utils/cx";
import PoweredBy from "@/components/powered-by";
import MessageLoading from "@/components/message-loading";
import { INITIAL_QUESTIONS } from "@/utils/const";
import { ChatAgent, GeminiChatMessage } from "./api/agent/gemini";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export default function Home() {
  // Note: Instantiating the agent on the client may expose your API key.
  const agentRef = useRef<ChatAgent | null>(null);
  useEffect(() => {
    agentRef.current = new ChatAgent();
  }, []);

  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local state to hold a chat log
  const [chatLog, setChatLog] = useState<GeminiChatMessage[]>([]);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [chatResponse, setChatResponse] = useState<string>("");

  // If you're also using the useChat hook, make sure its state and agent context do not conflict.
  // For this example, we'll show the agent's response separately.
  const onClickQuestion = (value: string) => {
    setInput(value);
    setTimeout(() => {
      formRef.current?.dispatchEvent(
        new Event("submit", {
          cancelable: true,
          bubbles: true,
        }),
      );
    }, 1);
  };

  // Scroll to bottom when log updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [chatLog]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Append user input to agent state and chat log
      agentRef.current?.addMessage(new HumanMessage(input));
      setChatLog((prev) => [...prev, new HumanMessage(input)]);
      setInput("");
      setStreaming(true);

      // Get response from agent
      agentRef.current
        ?.callModel()
        .then((response) => {
          const responseText = response as unknown as string;
          setChatResponse(responseText);
          setChatLog((prev) => [...prev, new AIMessage(responseText)]);
          setStreaming(false);
        })
        .catch((error) => {
          console.error("Error from agent:", error);
          setStreaming(false);
        });
    },
    [agentRef, input],
  );

  return (
    <main className="relative max-w-screen-md p-4 md:p-6 mx-auto flex min-h-svh !pb-32 md:!pb-40 overflow-y-auto">
      <div className="w-full">
        {chatLog.map((message) => (
          <Message key={Math.random()} message={message} />
        ))}

        {/* Loading indicator */}
        {streaming && <MessageLoading />}

        {/* Button for initial questions */}
        {chatLog.length === 0 && (
          <div className="mt-4 md:mt-6 grid md:grid-cols-2 gap-2 md:gap-4">
            {INITIAL_QUESTIONS.map((msg) => (
              <button
                key={msg.content}
                type="button"
                className="cursor-pointer text-text-lite select-none text-left bg-background font-normal
                  border border-border rounded-xl p-3 md:px-4 md:py-3
                  hover:bg-background-hover hover:border-border-hover"
                onClick={() => onClickQuestion(msg.content)}
              >
                {msg.content}
              </button>
            ))}
          </div>
        )}

        {/* Anchor for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      <div
        className={cx(
          "fixed z-10 bottom-0 inset-x-0",
          "flex justify-center items-center",
          "bg-background",
        )}
      >
        <span
          className="absolute bottom-full h-10 inset-x-0 from-background/0
           bg-gradient-to-b to-background pointer-events-none"
        />
        <div className="w-full max-w-screen-md rounded-xl px-4 md:px-5 py-6">
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            inputProps={{
              disabled: streaming,
              value: input,
              onChange: (e) => setInput(e.target.value),
            }}
            buttonProps={{
              disabled: streaming,
            }}
          />
          <PoweredBy />
        </div>
      </div>
    </main>
  );
}
