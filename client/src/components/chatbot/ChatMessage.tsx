import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiClipboard, FiCheck, FiUser, FiCode, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";

interface ChatMessageProps {
    sender: "user" | "ai";
    content: string;
    timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, content, timestamp }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <motion.div 
            className={`flex w-full my-3 ${sender === "user" ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div
                className={`relative p-3.5 rounded-lg shadow-md ${
                    sender === "user"
                        ? "rounded-tr-none ml-auto bg-gradient-to-br from-primary-500/90 to-teal-500/90 text-white backdrop-blur-sm border border-primary-400/30"
                        : "rounded-tl-none bg-darkSecondary/80 text-gray-200 border border-darkTertiary/30 backdrop-blur-sm"
                }`}
                style={{
                    maxWidth: "85%",
                    minWidth: "40%",
                    wordBreak: "break-word",
                }}
            >
                {/* Sender Label with Icon */}
                <div className="flex items-center mb-2 text-xs text-gray-300">
                    {sender === "user" ? (
                        <span className="flex items-center gap-1.5 text-white/80">
                            <FiUser size={12} />
                            <span>You</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-primary-300">
                            <FiCode size={12} />
                            <span>CodeCollab AI</span>
                        </span>
                    )}
                    
                    {timestamp && (
                        <span className="flex items-center gap-1 ml-auto opacity-70">
                            <FiClock size={10} />
                            <span className="text-[10px]">{timestamp}</span>
                        </span>
                    )}
                </div>

                {/* Message Content with Markdown Support */}
                <div className="text-sm leading-relaxed">
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                const codeContent = String(children).trim();
                                return match ? (
                                    <div className="relative group my-3">
                                        {/* Language Badge */}
                                        <div className="absolute top-0 left-3 bg-darkTertiary/70 text-xs px-2 py-0.5 rounded-b-md text-primary-300 font-mono">
                                            {match[1]}
                                        </div>
                                    
                                        {/* Copy Button */}
                                        <button
                                            onClick={() => handleCopy(codeContent)}
                                            className="absolute top-3 right-3 bg-darkTertiary/70 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            {copied === codeContent ? (
                                                <FiCheck className="text-green-400" size={16} />
                                            ) : (
                                                <FiClipboard className="text-gray-300" size={16} />
                                            )}
                                        </button>
                                        
                                        {/* Code Block */}
                                        <SyntaxHighlighter
                                            {...props}
                                            style={nightOwl}
                                            language={match[1]}
                                            PreTag="div"
                                            className="rounded-md mt-2 text-sm"
                                            customStyle={{
                                                borderRadius: '0.5rem',
                                                padding: '2rem 1rem 1rem 1rem',
                                                marginTop: '0.5rem',
                                                backgroundColor: 'rgba(29, 32, 43, 0.8)',
                                            }}
                                            // Explicitly set ref to null to avoid type mismatch
                                            ref={null}
                                        >
                                            {codeContent}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className="bg-darkTertiary/50 px-2 py-0.5 rounded text-sm font-mono text-primary-300">
                                        {children}
                                    </code>
                                );
                            },
                            p({ children }) {
                                return <p className="mb-3 last:mb-0">{children}</p>;
                            },
                            ul({ children }) {
                                return <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>;
                            },
                            ol({ children }) {
                                return <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>;
                            },
                            li({ children }) {
                                return <li className="mb-1">{children}</li>;
                            },
                            h1({ children }) {
                                return <h1 className="text-xl font-semibold mb-3 mt-4">{children}</h1>;
                            },
                            h2({ children }) {
                                return <h2 className="text-lg font-semibold mb-2 mt-3">{children}</h2>;
                            },
                            h3({ children }) {
                                return <h3 className="text-base font-medium mb-2 mt-3">{children}</h3>;
                            },
                            a({ children, href }) {
                                return <a href={href} className="text-primary-300 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>;
                            }
                        }}
                    >
                        {content}
                    </Markdown>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatMessage;