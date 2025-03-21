import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import Avatar from "react-avatar"
import { motion } from "framer-motion"
import { FiUsers } from "react-icons/fi"

function Users() {
    const { users } = useAppContext()

    return (
        <div className="flex min-h-[200px] flex-grow flex-col p-4 bg-darkSecondary/70 rounded-lg backdrop-blur-sm border border-darkTertiary/30 shadow-md">
            <div className="flex items-center mb-3 gap-2">
                <div className="p-1.5 rounded-full bg-teal-500/20">
                    <FiUsers size={18} className="text-teal-400" />
                </div>
                <h2 className="text-base font-medium text-white">Active Users</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <div className="flex w-full flex-wrap items-start justify-center gap-3">
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center w-full py-6 text-center">
                            <p className="text-sm text-gray-400">No users currently connected</p>
                        </div>
                    ) : (
                        users.map((user) => (
                            <User key={user.socketId} user={user} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

const User = ({ user }: { user: RemoteUser }) => {
    const { username, status } = user
    const title = `${username} - ${status === USER_CONNECTION_STATUS.ONLINE ? "online" : "offline"}`
    
    // Generate consistent colors based on username
    const getColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];
        return colors[Math.abs(hash) % colors.length];
    }

    return (
        <motion.div
            className="relative flex w-[120px] flex-col items-center gap-2 p-3 bg-darkTertiary/40 rounded-lg border border-darkTertiary/30 shadow-md transition-all"
            title={title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ 
                y: -3, 
                scale: 1.03,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}
        >
            <Avatar
                name={username}
                size="60"
                round={true}
                title={title}
                className="border-2 border-darkTertiary shadow-md"
                fgColor="#fff"
                color={getColor(username)}
            />
            <p className="line-clamp-2 max-w-full text-ellipsis break-words text-center text-gray-200 font-medium text-sm">
                {username}
            </p>
            <div
                className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 ${
                    status === USER_CONNECTION_STATUS.ONLINE
                        ? "bg-green-400 border-green-500/30"
                        : "bg-gray-400 border-gray-500/30"
                }`}
            ></div>
        </motion.div>
    )
}

export default Users