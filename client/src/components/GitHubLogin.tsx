import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';

const GitHubLogin: React.FC = () => {
    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/github`;
    };

    return (
        <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-darkTertiary/80 text-white rounded-md 
                       hover:bg-darkTertiary/60 border border-darkTertiary/30 transition-all duration-300"
        >
            <FaGithub className="text-xl" />
            <span className="font-medium">Login with GitHub</span>
        </motion.button>
    );
};

export default GitHubLogin; 