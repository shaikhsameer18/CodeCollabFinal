import React from 'react';
import { FaGithub, FaCodeBranch, FaSignOutAlt, FaExclamationCircle } from 'react-icons/fa';
import { useGitHub } from '../../context/GitHubContext';
import { motion } from 'framer-motion';

interface GitHubModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCommit?: () => void;
}

const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose, onCommit }) => {
    const { user, isAuthenticated, login, logout } = useGitHub();

    if (!isOpen) return null;

    const handleCommit = () => {
        if (onCommit) {
            onCommit();
        }
    };

    const handleLogoutAndRelogin = () => {
        logout();
        setTimeout(() => {
            login();
        }, 500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-darkPrimary border border-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold flex items-center text-white">
                        <FaGithub className="mr-2 text-teal-500" /> GitHub Integration
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white focus:outline-none transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {!isAuthenticated ? (
                    <div className="text-center">
                        <p className="mb-4 text-gray-300">Connect your GitHub account to get started</p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => login()}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-md hover:from-teal-500 hover:to-teal-400 transition-all shadow-md"
                        >
                            <FaGithub size={20} />
                            Login with GitHub
                        </motion.button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="border border-gray-700 rounded-lg p-4 bg-darkSecondary">
                            <div className="flex items-center">
                                <img
                                    src={user?.avatar_url}
                                    alt={user?.login}
                                    className="w-12 h-12 rounded-full mr-4 border-2 border-teal-500"
                                />
                                <div>
                                    <div className="font-medium text-white">
                                        {user?.name || user?.login}
                                    </div>
                                    <div className="text-sm text-teal-400">
                                        @{user?.login}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-yellow-800 rounded-lg p-4 bg-yellow-900 bg-opacity-30">
                            <div className="flex items-start">
                                <FaExclamationCircle className="text-yellow-500 mt-1 mr-2" />
                                <div>
                                    <h3 className="font-medium text-yellow-400">Having permission issues?</h3>
                                    <p className="text-sm text-yellow-300 mb-2">
                                        If you're experiencing permission errors, try logging out and logging back in with full permissions.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleLogoutAndRelogin}
                                        className="flex items-center text-sm bg-yellow-900 hover:bg-yellow-800 text-yellow-300 py-1 px-3 rounded-md transition-colors"
                                    >
                                        <FaSignOutAlt className="mr-1" /> Logout & Re-login
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        <div className="flex mt-4 space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={logout}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                            >
                                <FaSignOutAlt className="mr-2" /> Logout
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCommit}
                                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white py-2 px-4 rounded-md flex items-center justify-center shadow-md transition-all"
                            >
                                <FaCodeBranch className="mr-2" /> Commit
                            </motion.button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default GitHubModal; 