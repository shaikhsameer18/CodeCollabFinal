import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { useGitHub } from '../../context/GitHubContext';

interface GitHubSidebarButtonProps {
    onClick: () => void;
}

const GitHubSidebarButton: React.FC<GitHubSidebarButtonProps> = ({ onClick }) => {
    const { isAuthenticated, user } = useGitHub();

    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors relative group"
            title={isAuthenticated ? `Signed in as ${user?.login}` : 'Connect to GitHub'}
        >
            <FaGithub className="text-white text-2xl" />
            {isAuthenticated && user?.avatar_url && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border-2 border-gray-800">
                    <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isAuthenticated ? 'GitHub Settings' : 'Connect to GitHub'}
            </span>
        </button>
    );
};

export default GitHubSidebarButton; 