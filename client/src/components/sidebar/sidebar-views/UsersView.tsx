import { motion } from 'framer-motion'
import { Share2, Copy, LogOut, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import Users from '@/components/common/Users'
import { useAppContext } from '@/context/AppContext'
import { useSocket } from '@/context/SocketContext'
import { USER_STATUS } from '@/types/user'

export default function UsersView() {
    const navigate = useNavigate()
    const { setStatus } = useAppContext()
    const { socket } = useSocket()

    const copyURL = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success('URL copied to clipboard')
        } catch (error) {
            toast.error('Unable to copy URL to clipboard')
            console.error(error)
        }
    }

    const shareURL = async () => {
        const url = window.location.href
        try {
            await navigator.share({ url })
        } catch (error) {
            toast.error('Unable to share URL')
            console.error(error)
        }
    }

    const leaveRoom = () => {
        socket.disconnect()
        setStatus(USER_STATUS.DISCONNECTED)
        navigate('/', { replace: true })
    }

    const buttonVariants = {
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 h-full"
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-darkTertiary/10 rounded-lg border border-darkTertiary/30"
            >
                <div className="border-b border-darkTertiary/30 p-3">
                    <h3 className="text-sm font-medium text-primary-300 flex items-center gap-2">
                        <UserRound size={14} className="text-primary-400" />
                        <span className="font-sans">Active Users</span>
                    </h3>
                </div>
                <div className="p-3">
                    <Users />
                </div>
            </motion.div>
            
            <motion.div 
                className="mt-auto grid grid-cols-3 gap-3 pt-3 border-t border-darkTertiary/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex flex-col items-center justify-center py-3 px-2 bg-darkTertiary/30 rounded-md 
                               text-primary-300 hover:bg-darkTertiary/40 transition-all duration-300
                               shadow-sm"
                    onClick={shareURL}
                    title="Share Link"
                >
                    <Share2 size={18} />
                    <span className="text-xs mt-1 font-sans">Share</span>
                </motion.button>
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex flex-col items-center justify-center py-3 px-2 bg-darkTertiary/30 rounded-md 
                               text-teal-300 hover:bg-darkTertiary/40 transition-all duration-300
                               shadow-sm"
                    onClick={copyURL}
                    title="Copy Link"
                >
                    <Copy size={18} />
                    <span className="text-xs mt-1 font-sans">Copy</span>
                </motion.button>
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex flex-col items-center justify-center py-3 px-2 bg-gradient-to-r from-primary-600 to-teal-600
                               rounded-md text-white shadow-md hover:shadow-glow transition-all duration-300"
                    onClick={leaveRoom}
                    title="Leave room"
                >
                    <LogOut size={18} />
                    <span className="text-xs mt-1 font-sans">Leave</span>
                </motion.button>
            </motion.div>
        </motion.div>
    )
}