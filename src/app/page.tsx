"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Form from "@/components/form";
import Message from "@/components/message";
import cx from "@/utils/cx";
import PoweredBy from "@/components/powered-by";
import MessageLoading from "@/components/message-loading";
import { ChatAgent, GeminiChatMessage } from "./api/agent/gemini";
import { HumanMessage } from "@langchain/core/messages";

export default function Home() {
  // Note: Instantiating the agent on the client may expose your API key.
  const agentRef = useRef<ChatAgent | null>(null);
  useEffect(() => {
    agentRef.current = new ChatAgent();
  }, []);

  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [streaming, setStreaming] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [chatLog, setChatLog] = useState<GeminiChatMessage[]>([]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Append user input to agent state
      agentRef.current?.addMessage(new HumanMessage(input));
      messagesEndRef.current && messagesEndRef.current.scrollIntoView();
      setInput("");
      setStreaming(true);

      // Get response from agent
      agentRef.current
        ?.callModel()
        .then(() => {
          setStreaming(false);
          setChatLog(agentRef.current?.getMessages() || []);
          messagesEndRef.current && messagesEndRef.current.scrollIntoView();
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

        {/* Anchor for scrolling */}
        <div ref={messagesEndRef} id="messagesEndRef" />
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
