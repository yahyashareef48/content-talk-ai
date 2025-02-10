import React, { use, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import cx from "@/utils/cx";
import UpstashLogo from "@/components/upstash-logo";
import { IconUser } from "@tabler/icons-react";
import { HumanMessage } from "@langchain/core/messages";
import { GeminiChatMessage } from "@/app/api/agent/gemini";

const Message = ({ message }: { message: GeminiChatMessage }) => {
  const isUser = message instanceof HumanMessage;

  useEffect(() => {
    console.log("Message", message instanceof HumanMessage, message);
  });

  return (
    <article
      className={cx(
        "mb-4 flex items-start gap-4 p-4 md:p-5 rounded-2xl",
        isUser ? "" : "bg-primary",
      )}
    >
      <Avatar isUser={isUser} />
      <Markdown
        className={cx(
          "py-1.5 md:py-1 space-y-4 text-text-lite",
          isUser ? "font-semibold" : "",
        )}
        options={{
          overrides: {
            ol: ({ children }) => <ol className="list-decimal">{children}</ol>,
            ul: ({ children }) => <ol className="list-disc">{children}</ol>,
          },
        }}
      >
        {String(message.content)}
      </Markdown>
    </article>
  );
};

const Avatar: React.FC<{ isUser?: boolean; className?: string }> = ({
  isUser = false,
  className,
}) => {
  return (
    <div
      className={cx(
        "flex items-center justify-center size-8 shrink-0 rounded-full",
        isUser ? "bg-background-lite text-text-lite" : "bg-primary-dark",
        className,
      )}
    >
      {isUser ? <IconUser size={20} /> : <UpstashLogo />}
    </div>
  );
};

export default Message;
export { Avatar };
