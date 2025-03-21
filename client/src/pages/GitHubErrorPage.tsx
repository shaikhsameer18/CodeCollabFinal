import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaGithub } from 'react-icons/fa';
import { useGitHub } from '../context/GitHubContext';

const GitHubErrorPage: React.FC = () => {
    const { login } = useGitHub();
    const roomId = sessionStorage.getItem('returnRoomId');

    const handleRetry = () => {
        login(roomId || undefined);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
                <div className="flex items-center justify-center text-red-500 mb-6">
                    <FaExclamationTriangle size={48} />
                </div>
                
                <h1 className="text-2xl font-bold text-center mb-4">Authentication Failed</h1>
                
                <p className="text-gray-600 text-center mb-6">
                    There was a problem authenticating with GitHub. This could be due to expired credentials or network issues.
                </p>
                
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={handleRetry}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <FaGithub size={20} />
                        Try Again
                    </button>
                    
                    <Link
                        to={roomId ? `/editor/${roomId}` : '/'}
                        className="text-center text-indigo-600 hover:text-indigo-800"
                    >
                        Return to {roomId ? 'Editor' : 'Home'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GitHubErrorPage; 