import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import { ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import { FormEvent, useRef, useState } from "react"
import { FiSend } from "react-icons/fi"
import { v4 as uuidV4 } from "uuid"
import { motion } from "framer-motion"

export default function ChatInput() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { setMessages } = useChatRoom()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [inputValue, setInputValue] = useState("")

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (inputValue.trim().length > 0) {
            const message: ChatMessage = {
                id: uuidV4(),
                message: inputValue.trim(),
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
            }
            socket.emit(SocketEvent.SEND_MESSAGE, { message })
            setMessages((messages) => [...messages, message])
            setInputValue("")
        }
    }

    return (
        <form
            onSubmit={handleSendMessage}
            className="flex justify-between rounded-lg bg-darkTertiary/30 shadow-lg overflow-hidden border border-darkTertiary/40"
        >
            <input
                type="text"
                className="w-full flex-grow bg-transparent p-3 text-white placeholder-gray-400 outline-none font-sans"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                ref={inputRef}
            />
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center bg-gradient-to-r from-primary-600 to-teal-600 p-3 text-white transition-colors duration-300 hover:shadow-glow w-12"
                type="submit"
            >
                <FiSend size={20} />
            </motion.button>
        </form>
    )
}