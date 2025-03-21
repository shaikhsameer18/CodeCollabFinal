import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGitHub } from '../context/GitHubContext';

const GitHubSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshUser } = useGitHub();

    useEffect(() => {
        const handleSuccessRedirect = async () => {
            try {
                // Refresh user data
                await refreshUser();
                
                // Get saved room ID from sessionStorage
                const roomId = sessionStorage.getItem('returnRoomId');
                
                // Navigate back to the room or to homepage
                if (roomId) {
                    console.log('Redirecting to room:', roomId);
                    navigate(`/editor/${roomId}`);
                    sessionStorage.removeItem('returnRoomId');
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error handling GitHub success:', error);
                navigate('/');
            }
        };

        handleSuccessRedirect();
    }, [navigate, refreshUser]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-pulse mb-4">
                <svg className="w-12 h-12 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Authentication Successful</h1>
            <p className="text-gray-600">Redirecting you back...</p>
        </div>
    );
};

export default GitHubSuccessPage; 