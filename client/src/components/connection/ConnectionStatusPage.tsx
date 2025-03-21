import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiWifiOff, FiHome, FiRefreshCw } from "react-icons/fi"

export default function ConnectionStatusPage() {
    return (
        <div className="flex h-screen min-h-screen flex-col items-center justify-center gap-6 px-4 text-center bg-gradient-to-br from-gray-900 via-darkPrimary to-darkSecondary">
            <ConnectionError />
        </div>
    )
}

function ConnectionError() {
    const navigate = useNavigate()

    const reloadPage = () => {
        window.location.reload()
    }

    const gotoHomePage = () => {
        navigate("/")
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-darkSecondary/80 p-8 rounded-xl border border-darkTertiary/30 shadow-2xl backdrop-blur-sm"
        >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-teal-500/20 flex items-center justify-center">
                <FiWifiOff className="text-primary-400" size={36} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400 mb-4">
                Connection Error
            </h1>
            
            <p className="text-lg font-medium text-gray-300 mb-8 max-w-md">
                We're having trouble connecting to the server. This might be due to network issues or server maintenance.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 rounded-md bg-gradient-to-r from-primary-500 to-teal-500 text-white font-medium transition duration-300 hover:shadow-lg flex items-center gap-2 focus:outline-none"
                    onClick={reloadPage}
                >
                    <FiRefreshCw size={18} />
                    Try Again
                </motion.button>
                
                <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 rounded-md bg-darkTertiary/60 text-white font-medium transition duration-300 hover:bg-darkTertiary/80 hover:shadow-md flex items-center gap-2 focus:outline-none border border-darkTertiary/50"
                    onClick={gotoHomePage}
                >
                    <FiHome size={18} />
                    Go to Home
                </motion.button>
            </div>
        </motion.div>
    )
}