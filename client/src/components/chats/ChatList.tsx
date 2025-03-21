import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { SyntheticEvent, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom()
    const { currentUser } = useAppContext()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement
        setLastScrollHeight(container.scrollTop)
    }

    useEffect(() => {
        if (!messagesContainerRef.current) return
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false)
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight
    }, [isNewMessage, setIsNewMessage, lastScrollHeight])

    return (
        <div
            className="flex-grow overflow-auto rounded-lg bg-darkTertiary/20 p-3 shadow-inner border border-darkTertiary/30"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center opacity-70">
                    <div className="mb-3 text-3xl">💬</div>
                    <p className="text-sm text-gray-400 font-sans">No messages yet. Start the conversation!</p>
                </div>
            ) : (
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`mb-3 w-[85%] self-end break-words rounded-lg px-4 py-2.5 shadow-sm ${
                                message.username === currentUser.username
                                    ? "ml-auto bg-gradient-to-r from-primary-600/90 to-teal-600/90 text-white"
                                    : "bg-darkTertiary/40 text-gray-200 border border-darkTertiary/30"
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-medium font-sans">
                                    {message.username}
                                </span>
                                <span className="text-xs opacity-75 font-sans">
                                    {message.timestamp}
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed font-sans">{message.message}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>
    )
}