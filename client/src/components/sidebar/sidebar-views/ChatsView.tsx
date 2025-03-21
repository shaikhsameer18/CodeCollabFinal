import ChatInput from "@/components/chats/ChatInput"
import ChatList from "@/components/chats/ChatList"
import { motion } from "framer-motion"

export default function ChatsView() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full flex-col gap-3"
        >
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-hidden"
            >
                <ChatList />
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                <ChatInput />
            </motion.div>
        </motion.div>
    )
}