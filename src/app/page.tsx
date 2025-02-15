"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Form from "@/components/form";
import Message from "@/components/message";
import cx from "@/utils/cx";
import PoweredBy from "@/components/powered-by";
import MessageLoading from "@/components/message-loading";
import { ChatAgent, GeminiChatMessage } from "./api/agent/gemini";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IconPlus } from "@tabler/icons-react";

export default function Home() {
  // Note: Instantiating the agent on the client may expose your API key.
  const agentRef = useRef<ChatAgent | null>(null);
  useEffect(() => {
    agentRef.current = new ChatAgent();
  }, []);

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [streaming, setStreaming] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [chatLog, setChatLog] = useState<GeminiChatMessage[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        await agentRef.current?.setPDFFile(e.target.files[0]);
        await agentRef.current?.callModel();
        setStreaming(false);
        setChatLog(agentRef.current?.getMessages() || []);
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView();
        }
      } catch (error) {
        console.error("Error from agent:", error);
        setStreaming(false);
      }
      setPdfFile(e.target.files[0]);
    }
  };
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Append user input to agent state
      agentRef.current?.addMessage(new HumanMessage(input));
      messagesEndRef.current && messagesEndRef.current.scrollIntoView();
      setInput("");
      setChatLog(agentRef.current?.getMessages() || []);
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
    [agentRef, input, pdfFile],
  );

  return (
    <div>
      {!pdfFile ? (
        <div className="w-full flex justify-center items-center min-h-screen">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={handleFileButtonClick}
            className="p-8 border-2 border-primary-lite rounded-xl flex items-center justify-center text-xl"
          >
            <IconPlus className="text-primary-lite" size={40} />
          </button>
        </div>
      ) : (
        <main className="relative max-w-screen-md p-4 md:p-6 mx-auto flex min-h-svh !pb-32 md:!pb-40 overflow-y-auto">
          <div className="w-full">
            {chatLog.map((message) => (
              <Message key={Math.random()} message={message} />
            ))}

            {/* Loading indicator */}
            {streaming && <MessageLoading />}

            {/* Anchor for scrolling */}
            <div ref={messagesEndRef} id="messagesEndRef" />

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
          </div>
        </main>
      )}
    </div>
  );
}
