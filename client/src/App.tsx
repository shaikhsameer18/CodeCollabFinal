import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { GitHubProvider } from './context/GitHubContext';
import GitHubSidebarButton from './components/github/GitHubSidebarButton';
import GitHubModal from './components/github/GitHubModal';
import GitHubCommitModal from './components/github/GitHubCommitModal';
import GitHubSuccessPage from './pages/GitHubSuccessPage';
import GitHubErrorPage from './pages/GitHubErrorPage';
import Toast from './components/toast/Toast';
import EditorPage from './pages/EditorPage';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
    const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);

    return (
        <GitHubProvider>
            <Router>
                <Routes>
                    <Route path="/github/success" element={<GitHubSuccessPage />} />
                    <Route path="/github/error" element={<GitHubErrorPage />} />
                    <Route path="/" element={
                        <MainLayout 
                            isGitHubModalOpen={isGitHubModalOpen}
                            setIsGitHubModalOpen={setIsGitHubModalOpen}
                            isCommitModalOpen={isCommitModalOpen}
                            setIsCommitModalOpen={setIsCommitModalOpen}
                        >
                            <HomePage />
                        </MainLayout>
                    } />
                    <Route path="/editor/:roomId" element={
                        <MainLayout 
                            isGitHubModalOpen={isGitHubModalOpen}
                            setIsGitHubModalOpen={setIsGitHubModalOpen}
                            isCommitModalOpen={isCommitModalOpen}
                            setIsCommitModalOpen={setIsCommitModalOpen}
                        >
                            <EditorPage />
                        </MainLayout>
                    } />
                </Routes>
                <Toast />
            </Router>
        </GitHubProvider>
    );
};

interface MainLayoutProps {
    children: React.ReactNode;
    isGitHubModalOpen: boolean;
    setIsGitHubModalOpen: (open: boolean) => void;
    isCommitModalOpen: boolean;
    setIsCommitModalOpen: (open: boolean) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
    children, 
    isGitHubModalOpen, 
    setIsGitHubModalOpen,
    isCommitModalOpen,
    setIsCommitModalOpen
}) => {
    const { roomId } = useParams<{ roomId: string }>();

    useEffect(() => {
        // For future implementations that need to run when the room changes
        
        return () => {
            // Cleanup if needed
        };
    }, [roomId]);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-16 bg-gray-900 p-4 flex flex-col items-center">
                <GitHubSidebarButton onClick={() => setIsGitHubModalOpen(true)} />
                {/* Add other sidebar buttons here */}
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>

            {/* GitHub Modal */}
            <GitHubModal
                isOpen={isGitHubModalOpen}
                onClose={() => setIsGitHubModalOpen(false)}
                onCommit={() => {
                    setIsGitHubModalOpen(false);
                    setIsCommitModalOpen(true);
                }}
            />

            {/* Commit Modal */}
            <GitHubCommitModal
                isOpen={isCommitModalOpen}
                onClose={() => setIsCommitModalOpen(false)}
            />
        </div>
    );
};

export default App;
