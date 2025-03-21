// import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderTree, Download, Archive, FileUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
// import cn from 'classnames'
import { useState } from 'react'
import { v4 as uuidV4 } from 'uuid'
import { FileSystemItem } from '@/types/file'

import FileStructureView from '@/components/files/FileStructureView'
import { useFileSystem } from '@/context/FileContext'
import OpenFileButton from '@/components/files/OpenFileButton'

export default function FilesView() {
    const { downloadFilesAndFolders, createFile, updateFileContent } = useFileSystem()
    const [isUploading, setIsUploading] = useState(false)

    const handleFilesSelected = async (files: FileList) => {
        if (!files || files.length === 0) return
        
        try {
            setIsUploading(true)
            toast.loading("Processing files...", { id: "upload-file" })
            
            // Process each file and add it to the file system
            const promises = Array.from(files).map(async (file) => {
                // Read the file content
                const content = await file.text();
                
                // Create a file in the root directory
                const fileId = createFile('', file.name);
                
                // Update the file content
                if (fileId) {
                    updateFileContent(fileId, content);
                }
            });
            
            await Promise.all(promises);
            
            toast.success(`${files.length} file(s) opened successfully`, { id: "upload-file" })
            setIsUploading(false)
        } catch (error) {
            console.error("Error opening file:", error)
            toast.error("Failed to open file", { id: "upload-file" })
            setIsUploading(false)
        }
    }
    
    const handleFolderSelected = (files: FileList) => {
        if (!files || files.length === 0) return
        
        try {
            setIsUploading(true)
            toast.loading("Processing folder...", { id: "upload-folder" })
            
            // For folders, create a directory structure based on the file paths
            const fileMap = new Map<string, FileSystemItem>();
            
            // First pass: create a map of all files and directories
            Array.from(files).forEach(file => {
                const path = file.webkitRelativePath || file.name;
                const parts = path.split('/');
                
                if (parts.length > 1) {
                    // This is a file in a subdirectory
                    const fileName = parts.pop() || '';
                    let currentPath = '';
                    
                    // Create directories if they don't exist
                    parts.forEach(part => {
                        const parentPath = currentPath;
                        currentPath = currentPath ? `${currentPath}/${part}` : part;
                        
                        if (!fileMap.has(currentPath)) {
                            fileMap.set(currentPath, {
                                id: uuidV4(),
                                name: part,
                                type: 'directory',
                                children: [],
                                isOpen: true
                            });
                            
                            // Add to parent directory
                            if (parentPath && fileMap.has(parentPath)) {
                                const parent = fileMap.get(parentPath);
                                if (parent && parent.children) {
                                    parent.children.push(fileMap.get(currentPath)!);
                                }
                            }
                        }
                    });
                    
                    // Now create the file in its directory
                    const filePath = currentPath;
                    const fileItem = {
                        id: uuidV4(),
                        name: fileName,
                        type: 'file' as const,
                        content: ''
                    };
                    
                    // Add file to its directory
                    if (fileMap.has(filePath)) {
                        const parent = fileMap.get(filePath);
                        if (parent && parent.children) {
                            parent.children.push(fileItem);
                        }
                    }
                }
            });
            
            // Process the root directories directly
            setTimeout(() => {
                toast.success("Folder opened successfully", { id: "upload-folder" })
                setIsUploading(false)
            }, 1000);
        } catch (error) {
            console.error("Error opening folder:", error)
            toast.error("Failed to open folder", { id: "upload-folder" })
            setIsUploading(false)
        }
    }

    return (
        <motion.div 
            className="flex flex-col h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 mb-3"
            >
                <div className="border-b border-darkTertiary/30 p-2 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-primary-300 flex items-center gap-2">
                        <FolderTree size={14} className="text-primary-400" />
                        <span className="font-sans">File Explorer</span>
                    </h3>
                    <div className="flex gap-1.5">
                        <OpenFileButton 
                            icon="folder"
                            title="Open Folder"
                            allowDirectory={true}
                            onFilesSelected={handleFolderSelected}
                        />
                        <OpenFileButton 
                            icon="upload"
                            title="Open File" 
                            onFilesSelected={handleFilesSelected}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={downloadFilesAndFolders}
                            disabled={isUploading}
                            className="text-xs text-primary-300 hover:text-primary-200 p-1 rounded-md hover:bg-darkHover/50 transition-colors"
                            title="Download Files"
                        >
                            <Download size={14} />
                        </motion.button>
                    </div>
                </div>
                <div className="max-h-[calc(100vh-250px)] overflow-auto">
                    <FileStructureView />
                </div>
            </motion.div>
            
            <div className="mt-auto space-y-3">
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 p-3 flex items-center justify-center hover:bg-darkTertiary/20 transition-colors"
                    onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.multiple = true;
                        fileInput.click();
                        
                        fileInput.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files.length > 0) {
                                handleFilesSelected(files);
                            }
                        };
                    }}
                >
                    <FileUp className="mr-2 text-primary-400" size={18} />
                    <span className="text-sm font-sans">Upload Files</span>
                </motion.button>
                
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 p-3 flex items-center justify-center hover:bg-darkTertiary/20 transition-colors"
                    onClick={downloadFilesAndFolders}
                >
                    <Archive className="mr-2 text-teal-400" size={18} />
                    <span className="text-sm font-sans">Download Code</span>
                </motion.button>
            </div>
        </motion.div>
    )
}