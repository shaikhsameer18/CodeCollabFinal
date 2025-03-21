import React, { useState, useContext, useRef, useEffect } from "react";
import { ChatbotContext } from "@/context/ChatbotContext";
import { sendMessageToChatbot } from "@/api/index";
import ChatMessage from "@/components/chatbot/ChatMessage";
import { FiSend, FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";

const ChatSidebar: React.FC = () => {
    const chatbotContext = useContext(ChatbotContext);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    if (!chatbotContext) {
        throw new Error("ChatSidebar must be used within a ChatbotProvider.");
    }

    const { messages, addMessage } = chatbotContext;
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        addMessage({ sender: "user", content: input });
        setInput("");
        setLoading(true);

        try {
            await sendMessageToChatbot(input, (chunk: string) => {
                addMessage({ sender: "ai", content: chunk });
            });
        } catch {
            addMessage({ sender: "ai", content: "❌ Error fetching response." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-darkPrimary/90 h-full rounded-lg shadow-lg border border-darkTertiary/20 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-darkTertiary/30 backdrop-blur-md">
                <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">
                    CodeCollab AI
                </h1>
                <p className="text-xs text-gray-400 mt-1">Ask coding questions or get help with your code</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 px-4 space-y-2">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                            <FiLoader size={24} className="text-primary-400 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">AI Assistant Ready</h3>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Ask questions about your code, request explanations, or get help with coding tasks.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <ChatMessage key={idx} sender={msg.sender} content={msg.content} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Box & Send Button */}
            <motion.div 
                className="p-3 bg-darkSecondary/70 border-t border-darkTertiary/30 backdrop-blur-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 p-2.5 bg-darkTertiary/50 text-white rounded-md border border-darkTertiary/50 focus:outline-none focus:border-primary-500/50 transition-colors"
                        disabled={loading}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="p-2.5 bg-gradient-to-r from-primary-500 to-teal-500 text-white rounded-md transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <FiLoader className="animate-spin" size={18} />
                        ) : (
                            <FiSend size={18} />
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ChatSidebar;
