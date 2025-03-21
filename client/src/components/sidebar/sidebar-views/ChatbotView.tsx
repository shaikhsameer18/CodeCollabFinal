import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/chatbot/ChatMessage";
import { sendMessageToChatbot } from "@/api";
import { motion } from "framer-motion";
import { FiSend, FiCpu, FiCode } from "react-icons/fi";

interface Message {
    sender: "user" | "ai";
    content: string;
    timestamp?: string;
}

export default function ChatbotView() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getTimeString = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { 
            sender: "user", 
            content: input,
            timestamp: getTimeString()
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        // Add initial "typing" message that will be updated
        setMessages((prev) => [
            ...prev,
            { 
                sender: "ai", 
                content: "",
                timestamp: getTimeString()
            }
        ]);

        let receivedAnyContent = false;

        try {
            await sendMessageToChatbot(input, (chunk) => {
                receivedAnyContent = true;
                setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.sender === "ai") {
                        return [
                            ...prev.slice(0, -1),
                            { 
                                sender: "ai", 
                                content: lastMessage.content + chunk,
                                timestamp: lastMessage.timestamp || getTimeString()
                            },
                        ];
                    } else {
                        return [
                            ...prev, 
                            { 
                                sender: "ai", 
                                content: chunk,
                                timestamp: getTimeString()
                            }
                        ];
                    }
                });
            });

            // If we completed but never got any content, show a connection error
            if (!receivedAnyContent) {
                setMessages((prev) => {
                    // Replace the empty typing message
                    return [
                        ...prev.slice(0, -1),
                        { 
                            sender: "ai", 
                            content: "❌ **Connection Error:** Failed to receive response from the API. Please check your connection and API configuration.",
                            timestamp: getTimeString()
                        }
                    ];
                });
            }
        } catch (error) {
            // Handle the error by showing it in the chat
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            
            setMessages((prev) => {
                // Replace the empty typing message
                return [
                    ...prev.slice(0, -1),
                    { 
                        sender: "ai", 
                        content: `❌ **Error:** ${errorMessage}`,
                        timestamp: getTimeString()
                    }
                ];
            });
            
            console.error("Chatbot API error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter Key Press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <motion.div 
            className="flex flex-col h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Chat Header */}
            <motion.div 
                className="flex items-center p-2 mb-3 bg-darkTertiary/30 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center mr-3">
                    <FiCpu className="text-white" size={15} />
                </div>
                <div>
                    <h3 className="text-sm font-medium">CodeCollab AI Assistant</h3>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                        {loading ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                </span>
                                <span>typing...</span>
                            </>
                        ) : (
                            <span>ready to help</span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Chat Messages Container */}
            <motion.div 
                className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-darkTertiary/40 scrollbar-track-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ 
                    msOverflowStyle: 'none',  /* Hide scrollbar for IE and Edge */
                    scrollbarWidth: 'thin'     /* Firefox */
                }}
            >
                {messages.length === 0 ? (
                    <motion.div 
                        className="flex flex-col items-center justify-center h-full text-center opacity-70 p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.7, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="mb-4 rounded-full bg-gradient-to-br from-primary-500/20 to-teal-500/20 p-4">
                            <FiCode className="text-primary-400" size={32} />
                        </div>
                        <h4 className="text-base text-primary-300 font-medium mb-2">Chat with AI Assistant</h4>
                        <p className="text-sm text-gray-400 font-sans">
                            Ask questions about your code, get help with debugging, 
                            or request coding suggestions
                        </p>
                    </motion.div>
                ) : (
                    <div className="pt-1 pb-1">
                        {messages.map((msg, idx) => (
                            <ChatMessage 
                                key={idx} 
                                sender={msg.sender} 
                                content={msg.content}
                                timestamp={msg.timestamp} 
                            />
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </motion.div>

            {/* Input Field & Send Button */}
            <motion.div 
                className="mt-3 bg-darkTertiary/20 rounded-lg p-2 border border-darkTertiary/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask the AI assistant..."
                        className="flex-grow p-2.5 bg-darkTertiary/30 text-white rounded-l-md 
                                border border-darkTertiary/40 focus:outline-none focus:border-primary-500/50 
                                focus:ring-1 focus:ring-primary-500/30 font-sans text-sm"
                        disabled={loading}
                    />
                    <motion.button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="w-12 h-10 flex items-center justify-center bg-gradient-to-r from-primary-600 to-teal-600 
                                text-white rounded-md hover:shadow-glow disabled:opacity-50 
                                transition-all duration-300 font-sans"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? (
                            <motion.div 
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                        ) : (
                            <FiSend size={16} />
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
