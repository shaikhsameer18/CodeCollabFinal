import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiGithub, FiBox, FiLoader, FiFileText, FiAlertCircle } from 'react-icons/fi';

interface GitHubUser {
    login: string;
    avatar_url: string;
    name: string;
    public_repos: number;
}

const GitHubProfile: React.FC = () => {
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [repoName, setRepoName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/github/profile`, {
                    withCredentials: true
                });
                setUser(response.data);
            } catch (err) {
                setError('Failed to fetch profile');
                console.error('Error fetching profile:', err);
            }
        };

        fetchProfile();
    }, []);

    const handleCreateRepo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/auth/github/create-repo`,
                {
                    repoName,
                    description
                },
                {
                    withCredentials: true
                }
            );

            // Clear form and show success message
            setRepoName('');
            setDescription('');
            setSuccess('Repository created successfully!');
        } catch (err) {
            setError('Failed to create repository');
            console.error('Error creating repository:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-6 bg-darkSecondary/80 rounded-lg border border-darkTertiary/30 backdrop-blur-md shadow-lg">
                <FiLoader className="text-primary-400 w-10 h-10 animate-spin mb-4" />
                <p className="text-gray-300">Loading profile...</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="p-6 max-w-md mx-auto bg-darkSecondary/80 rounded-lg border border-darkTertiary/30 backdrop-blur-md shadow-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                    <img
                        src={user.avatar_url}
                        alt={`${user.login}'s avatar`}
                        className="w-16 h-16 rounded-full border-2 border-primary-500/30"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-darkSecondary p-1 rounded-full border border-darkTertiary/50">
                        <FiGithub className="w-4 h-4 text-primary-300" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{user.name}</h2>
                    <p className="text-primary-300">@{user.login}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                        <FiBox className="mr-1" />
                        <span>{user.public_repos} public repositories</span>
                    </div>
                </div>
            </div>

            {success && (
                <div className="mb-4 p-3 rounded-md bg-teal-500/20 border border-teal-500/30 text-teal-300 text-sm flex items-start">
                    <FiBox className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{success}</p>
                </div>
            )}

            <form onSubmit={handleCreateRepo} className="space-y-5">
                <div>
                    <label htmlFor="repoName" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                        <FiBox className="mr-2 text-teal-500" />
                        Repository Name
                    </label>
                    <input
                        type="text"
                        id="repoName"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        className="block w-full rounded-md bg-darkTertiary/50 border border-darkTertiary/50 p-2.5 text-white placeholder:text-gray-500 focus:border-teal-500/70 focus:outline-none transition-colors"
                        required
                        placeholder="e.g. my-awesome-project"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                        <FiFileText className="mr-2 text-teal-500" />
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full rounded-md bg-darkTertiary/50 border border-darkTertiary/50 p-2.5 text-white placeholder:text-gray-500 focus:border-teal-500/70 focus:outline-none transition-colors"
                        rows={3}
                        placeholder="Describe your repository (optional)"
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-md bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-start">
                        <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-gradient-to-r from-primary-600 to-teal-600 text-white font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? (
                        <>
                            <FiLoader className="animate-spin" />
                            <span>Creating...</span>
                        </>
                    ) : (
                        <>
                            <FiGithub />
                            <span>Create Repository</span>
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default GitHubProfile; 