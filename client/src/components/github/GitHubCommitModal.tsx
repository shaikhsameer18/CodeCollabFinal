import React, { useState, useEffect } from 'react';
import { FaGithub, FaTimes, FaCheck, FaFileCode, FaFileAlt, FaFolder, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useGitHub } from '../../context/GitHubContext';
import { useFileSystem } from '../../context/FileContext';
import { FileSystemItem } from '../../types/file';
import { motion } from 'framer-motion';

interface GitHubCommitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FileItem {
    path: string;
    selected: boolean;
    type: 'file' | 'directory';
    extension?: string;
    status?: 'modified' | 'untracked';
    content?: string;
}

// Define an interface for API error responses
interface ApiErrorResponse {
    response?: {
        data?: {
            error?: string;
        };
    };
}

const GitHubCommitModal: React.FC<GitHubCommitModalProps> = ({ isOpen, onClose }) => {
    const { commitAndPush, createAndPushRepo } = useGitHub();
    const fileSystem = useFileSystem();
    const [commitMessage, setCommitMessage] = useState('');
    const [repoName, setRepoName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileItems, setFileItems] = useState<FileItem[]>([]);
    const [selectAll, setSelectAll] = useState(true);
    const [success, setSuccess] = useState(false);
    const [repoUrl, setRepoUrl] = useState('');
    const [existingRepoUrl, setExistingRepoUrl] = useState('');
    const [isUsingExistingRepo, setIsUsingExistingRepo] = useState(false);

    // Reset form when modal is opened/closed
    useEffect(() => {
        if (isOpen) {
            setSuccess(false);
            setError('');
            setRepoUrl('');
            setExistingRepoUrl('');
            setCommitMessage('Initial commit');
            setIsUsingExistingRepo(false);
        }
    }, [isOpen]);

    // Get files from the CodeCollab session
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            console.log("Loading files from editor session...");

            // Create a map to track unique files and prevent duplicates
            const fileMap = new Map<string, FileItem>();

            const processFile = (file: FileSystemItem, isOpenFile = false, isActiveFile = false) => {
                if (file.type === 'file') {
                    const path = file.name;
                    if (!fileMap.has(path)) {
                        fileMap.set(path, {
                            path,
                            selected: true,
                            type: 'file',
                            extension: path.split('.').pop(),
                            status: isActiveFile ? 'modified' : (isOpenFile ? 'modified' : 'untracked'),
                            content: file.content || ''
                        });
                        console.log(`Added file from editor: ${path} (${isActiveFile ? 'active' : (isOpenFile ? 'open' : 'in filesystem')})`);
                    }
                }
            };

            // First check active file
            if (fileSystem.activeFile) {
                processFile(fileSystem.activeFile, false, true);
            }

            // Then check open files
            fileSystem.openFiles.forEach(file => {
                processFile(file, true);
            });

            // Finally check the file structure
            if (fileSystem.fileStructure) {
                const extractFiles = (item: FileSystemItem, parentPath = '') => {
                    if (item.type === 'file') {
                        const path = parentPath ? `${parentPath}/${item.name}` : item.name;
                        if (!fileMap.has(path)) {
                            fileMap.set(path, {
                                path,
                                selected: true,
                                type: 'file',
                                extension: item.name.split('.').pop(),
                                status: 'untracked',
                                content: item.content || ''
                            });
                            console.log(`Added file from filesystem: ${path}`);
                        }
                    } else if (item.type === 'directory' && item.children) {
                        const dirPath = parentPath ? `${parentPath}/${item.name}` : item.name;
                        const newParentPath = item.name === 'root' ? '' : dirPath;

                        item.children.forEach(child => {
                            extractFiles(child, newParentPath);
                        });
                    }
                };

                extractFiles(fileSystem.fileStructure);
            }

            // Ensure index.js, main.py, and main.java are included if they exist in the editor session
            const criticalFiles = ['index.js', 'main.py', 'main.java'];

            // Check if any critical files are missing and also in active/open files
            criticalFiles.forEach(filename => {
                if (!fileMap.has(filename)) {
                    // Check active file
                    if (fileSystem.activeFile && fileSystem.activeFile.name === filename) {
                        const activeFile = fileSystem.activeFile;
                        fileMap.set(filename, {
                            path: filename,
                            selected: true,
                            type: 'file',
                            extension: filename.split('.').pop(),
                            status: 'modified',
                            content: activeFile.content || ''
                        });
                        console.log(`Added critical active file: ${filename}`);
                    }
                    // Check open files
                    else {
                        const openFile = fileSystem.openFiles.find(file => file.name === filename);
                        if (openFile) {
                            fileMap.set(filename, {
                                path: filename,
                                selected: true,
                                type: 'file',
                                extension: filename.split('.').pop(),
                                status: 'modified',
                                content: openFile.content || ''
                            });
                            console.log(`Added critical open file: ${filename}`);
                        }
                    }
                }
            });

            // Convert map to array
            const allFiles = Array.from(fileMap.values());

            console.log(`Total files found: ${allFiles.length}`);

            // Update the state with the files
            if (allFiles.length > 0) {
                setFileItems(allFiles);
            } else {
                // Fallback only if no files are found
                console.warn('No files found in editor, using fallback file');
                setFileItems([{
                    path: 'index.js',
                    selected: true,
                    type: 'file',
                    extension: 'js',
                    status: 'untracked',
                    content: '// Initial file\nconsole.log("Hello from CodeCollab!");'
                }]);
            }

            setLoading(false);
        }
    }, [isOpen, fileSystem]);

    if (!isOpen) return null;

    const toggleFileSelection = (index: number) => {
        const newItems = [...fileItems];
        newItems[index].selected = !newItems[index].selected;
        setFileItems(newItems);

        // Update selectAll state based on if all files are selected
        setSelectAll(newItems.every(item => item.selected));
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        const newItems = fileItems.map(item => ({
            ...item,
            selected: newSelectAll
        }));

        setFileItems(newItems);
    };

    const getSelectedFiles = () => {
        return fileItems.filter(item => item.selected).map(item => item.path);
    };

    const getFileIcon = (item: FileItem) => {
        if (item.type === 'directory') return <FaFolder className="text-yellow-500" />;

        const extension = item.extension?.toLowerCase();
        if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '')) {
            return <FaFileCode className="text-blue-500" />;
        } else if (['html', 'css', 'md'].includes(extension || '')) {
            return <FaFileAlt className="text-green-500" />;
        }

        return <FaFileAlt className="text-gray-500" />;
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return null;

        if (status === 'modified') {
            return <span className="px-2 py-0.5 text-xs bg-yellow-900 text-yellow-300 rounded-full">Modified</span>;
        }

        if (status === 'untracked') {
            return <span className="px-2 py-0.5 text-xs bg-green-900 text-green-300 rounded-full">New</span>;
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const selectedFiles = getSelectedFiles();
        console.log(`Selected files for commit: ${selectedFiles.join(', ')}`);

        if (selectedFiles.length === 0) {
            setError('Please select at least one file to include');
            setLoading(false);
            return;
        }

        // Get contents of selected files
        const fileContents: Record<string, string> = {};

        // First collect all file contents from the fileItems array
        fileItems
            .filter(item => item.selected)
            .forEach(item => {
                if (item.content !== undefined) {
                    fileContents[item.path] = item.content;
                } else {
                    console.warn(`Missing content for ${item.path}, using empty string`);
                    fileContents[item.path] = '';
                }
            });

        // Double check fileSystem for any missing contents
        if (fileSystem && fileSystem.fileStructure) {
            // Recursive function to extract file contents
            const findFileContent = (item: FileSystemItem, path: string): string | null => {
                if (item.type === 'file' && item.name === path) {
                    return item.content || '';
                } else if (item.type === 'directory' && item.children) {
                    for (const child of item.children) {
                        const result = findFileContent(child, path);
                        if (result !== null) return result;
                    }
                }
                return null;
            };

            // For each selected file, try to find its content in the file system if missing
            selectedFiles.forEach(filePath => {
                if (!fileContents[filePath] || fileContents[filePath] === '') {
                    // Try to find in active file
                    if (fileSystem.activeFile && fileSystem.activeFile.name === filePath) {
                        fileContents[filePath] = fileSystem.activeFile.content || '';
                    }
                    // Try to find in open files
                    else if (fileSystem.openFiles.some(f => f.name === filePath)) {
                        const openFile = fileSystem.openFiles.find(f => f.name === filePath);
                        if (openFile && openFile.content) {
                            fileContents[filePath] = openFile.content;
                        }
                    }
                    // Try to find in file structure
                    else {
                        const content = findFileContent(fileSystem.fileStructure, filePath);
                        if (content !== null) {
                            fileContents[filePath] = content;
                        }
                    }
                }
            });
        }

        // Ensure all selected files have some content
        selectedFiles.forEach(filePath => {
            if (!fileContents[filePath]) {
                console.warn(`Creating default content for ${filePath}`);
                // Create default content based on file extension
                const ext = filePath.split('.').pop()?.toLowerCase();
                switch (ext) {
                    case 'js':
                        fileContents[filePath] = `// ${filePath}\nconsole.log("Hello from CodeCollab!");\n`;
                        break;
                    case 'py':
                        fileContents[filePath] = `# ${filePath}\nprint("Hello from CodeCollab!")\n`;
                        break;
                    case 'java':
                        fileContents[filePath] = `// ${filePath}\npublic class ${filePath.split('.')[0]} {\n    public static void main(String[] args) {\n        System.out.println("Hello from CodeCollab!");\n    }\n}\n`;
                        break;
                    case 'html':
                        fileContents[filePath] = `<!DOCTYPE html>\n<html>\n<head>\n    <title>CodeCollab</title>\n</head>\n<body>\n    <h1>Hello from CodeCollab!</h1>\n</body>\n</html>\n`;
                        break;
                    default:
                        fileContents[filePath] = `# ${filePath}\nCreated with CodeCollab\n`;
                }
            }
        });

        console.log(`File contents prepared for ${Object.keys(fileContents).length} files`);

        try {
            if (!isUsingExistingRepo) {
                // Create new repository
                if (!repoName.trim()) {
                    setError('Repository name is required');
                    setLoading(false);
                    return;
                }

                if (!commitMessage.trim()) {
                    setError('Commit message is required');
                    setLoading(false);
                    return;
                }

                if (selectedFiles.length === 0) {
                    setError('Please select at least one file to include');
                    setLoading(false);
                    return;
                }

                const result = await createAndPushRepo({
                    name: repoName,
                    description,
                    private: isPrivate
                }, commitMessage, selectedFiles, fileContents);

                setSuccess(true);
                setRepoUrl(result.html_url);
            } else {
                // Use existing repository
                if (!existingRepoUrl.trim()) {
                    setError('Repository URL is required');
                    setLoading(false);
                    return;
                }

                // Validate URL format
                if (!existingRepoUrl.includes('github.com')) {
                    setError('Please enter a valid GitHub repository URL');
                    setLoading(false);
                    return;
                }

                // Ensure URL ends with .git
                let formattedRepoUrl = existingRepoUrl;
                if (!formattedRepoUrl.endsWith('.git')) {
                    formattedRepoUrl = `${formattedRepoUrl}.git`;
                }

                if (!commitMessage.trim()) {
                    setError('Commit message is required');
                    setLoading(false);
                    return;
                }

                if (selectedFiles.length === 0) {
                    setError('Please select at least one file to include');
                    setLoading(false);
                    return;
                }

                try {
                    await commitAndPush(commitMessage, formattedRepoUrl, selectedFiles, fileContents);
                    setSuccess(true);
                    setRepoUrl(formattedRepoUrl.replace('.git', ''));
                } catch (err: unknown) {
                    console.error("Push error:", err);
                    let errorMessage = 'Failed to push code to GitHub';

                    if (err instanceof Error) {
                        errorMessage = err.message;
                    } else if (typeof err === 'object' && err !== null) {
                        const apiError = err as ApiErrorResponse;
                        if (apiError.response?.data?.error) {
                            errorMessage = apiError.response.data.error;
                        }
                    }

                    if (errorMessage.includes('authentication') || errorMessage.includes('permissions')) {
                        // Authentication error
                        setError(`${errorMessage} Please log out and log in again with appropriate permissions.`);
                    } else {
                        setError(`${errorMessage}. Please check your repository URL and try again.`);
                    }
                    setLoading(false);
                    return;
                }
            }
        } catch (err: unknown) {
            console.error("Push error:", err);
            let errorMessage = 'Failed to push code to GitHub';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                const apiError = err as ApiErrorResponse;
                if (apiError.response?.data?.error) {
                    errorMessage = apiError.response.data.error;
                }
            }

            if (errorMessage.includes('name already exists')) {
                setError('A repository with this name already exists in your GitHub account. Please choose a different name.');
            } else if (errorMessage.includes('rate limit')) {
                setError('GitHub API rate limit exceeded. Please try again later.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-darkPrimary border border-darkTertiary/40 rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
            >
                {success ? (
                    <div className="flex flex-col items-center py-10">
                        <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-5">
                            <FaCheck className="text-teal-400 text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Successfully Pushed!</h2>
                        <p className="text-gray-300 text-center mb-6">
                            Your code has been pushed to GitHub successfully.
                        </p>
                        <div className="flex space-x-2 mb-6">
                            <a
                                href={repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-md hover:shadow-lg flex items-center transition-all"
                            >
                                <FaGithub className="mr-2" /> View on GitHub
                            </a>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-darkTertiary/80 text-white rounded-md border border-darkTertiary/50 hover:bg-darkTertiary/60"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <FaGithub className="mr-2 text-teal-500" />
                                Push to GitHub
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center mb-4">
                                <label className="inline-flex items-center cursor-pointer mr-6">
                                    <input
                                        type="radio"
                                        name="repoType"
                                        checked={!isUsingExistingRepo}
                                        onChange={() => setIsUsingExistingRepo(false)}
                                        className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-600 rounded-full"
                                    />
                                    <span className="ml-2 text-sm text-gray-300">Create new repository</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="repoType"
                                        checked={isUsingExistingRepo}
                                        onChange={() => setIsUsingExistingRepo(true)}
                                        className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-600 rounded-full"
                                    />
                                    <span className="ml-2 text-sm text-gray-300">Use existing repository</span>
                                </label>
                            </div>

                            {!isUsingExistingRepo ? (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="repoName" className="block text-sm font-medium text-gray-300 mb-1">
                                            Repository Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="repoName"
                                            value={repoName}
                                            onChange={(e) => setRepoName(e.target.value)}
                                            required
                                            placeholder="e.g. my-project"
                                            className="bg-darkTertiary/40 border border-darkTertiary/60 rounded-md w-full p-2.5 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="A short description of your project"
                                            rows={2}
                                            className="bg-darkTertiary/40 border border-darkTertiary/60 rounded-md w-full p-2.5 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isPrivate"
                                            checked={isPrivate}
                                            onChange={(e) => setIsPrivate(e.target.checked)}
                                            className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-600 rounded"
                                        />
                                        <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-300">
                                            Private repository
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="existingRepoUrl" className="block text-sm font-medium text-gray-300 mb-1">
                                        Repository URL <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="existingRepoUrl"
                                        value={existingRepoUrl}
                                        onChange={(e) => setExistingRepoUrl(e.target.value)}
                                        required
                                        placeholder="https://github.com/username/repo.git"
                                        className="bg-darkTertiary/40 border border-darkTertiary/60 rounded-md w-full p-2.5 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                                    />
                                </div>
                            )}
                            
                            <div>
                                <label htmlFor="commitMessage" className="block text-sm font-medium text-gray-300 mb-1">
                                    Commit Message <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="commitMessage"
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    required
                                    placeholder="Describe your changes"
                                    className="bg-darkTertiary/40 border border-darkTertiary/60 rounded-md w-full p-2.5 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* File Selection */}
                        <div className="bg-darkSecondary/90 p-5 rounded-md border border-darkTertiary/60">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-200 text-lg">Select Files to Push</h3>
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    className="text-sm text-teal-400 hover:text-teal-300 font-medium"
                                >
                                    {selectAll ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="border border-darkTertiary/60 rounded-md overflow-hidden max-h-60 overflow-y-auto bg-darkPrimary/90">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <FaSyncAlt className="animate-spin h-6 w-6 text-teal-500" />
                                        <span className="ml-2 text-sm text-gray-300">Loading files...</span>
                                    </div>
                                ) : fileItems.length === 0 ? (
                                    <div className="py-8 px-4 text-center text-gray-400 flex flex-col items-center">
                                        <FaExclamationTriangle className="text-yellow-500 mb-2" size={24} />
                                        <p>No files available to commit</p>
                                        <p className="text-sm mt-1">Create or edit files in your workspace first</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-darkTertiary/60">
                                        {fileItems.map((item, index) => (
                                            <li key={index} className="hover:bg-darkSecondary/70">
                                                <div className="flex items-center px-4 py-3">
                                                    <div className="flex items-center h-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.selected}
                                                            onChange={() => toggleFileSelection(index)}
                                                            className="h-4 w-4 bg-darkTertiary text-teal-500 focus:ring-teal-500 border-darkTertiary/70 rounded"
                                                        />
                                                    </div>
                                                    <div className="ml-3 flex items-center flex-1">
                                                        <span className="mr-2">{getFileIcon(item)}</span>
                                                        <span className="text-sm text-gray-200 truncate flex-1">
                                                            {item.path}
                                                        </span>
                                                        <div className="ml-2">
                                                            {getStatusBadge(item.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/40 border border-red-700/40 text-red-200 px-4 py-3 rounded flex items-center">
                                <FaExclamationTriangle className="mr-2" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-darkTertiary/60 text-gray-300 rounded-md hover:bg-darkTertiary/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || fileItems.filter(f => f.selected).length === 0}
                                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-md hover:shadow-lg focus:outline-none disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2 transition-all"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <FaSyncAlt className="animate-spin h-4 w-4 text-white" />
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        <FaCheck />
                                        {!isUsingExistingRepo ? 'Create & Push' : 'Commit & Push'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
};

export default GitHubCommitModal; 