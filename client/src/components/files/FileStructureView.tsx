import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useContextMenu } from "@/hooks/useContextMenu"
import { ACTIVITY_STATE } from "@/types/app"
import { FileSystemItem, Id } from "@/types/file"
import { sortFileSystemItem, getFileById } from "@/utils/file"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import cn from "classnames"
import { FormEvent, MouseEvent, useEffect, useRef, useState, useCallback, DragEvent } from "react"
import { FiFolder, FiFolderPlus, FiFilePlus, FiChevronDown, FiChevronRight, FiChevronsUp, FiCheck, FiX } from "react-icons/fi"
import { motion } from "framer-motion"
import { MdDelete } from "react-icons/md"
import { PiPencilSimpleFill } from "react-icons/pi"
import RenameView from "./RenameView"
import { toast } from "react-hot-toast"

// Component for creating new files/folders inline
const CreateItemView = ({
    type,
    parentId,
    onCancel,
    isTopLevel = false
}: {
    type: 'file' | 'directory',
    parentId: Id,
    onCancel: () => void,
    isTopLevel?: boolean
}) => {
    const [name, setName] = useState<string>("")
    const { createFile, createDirectory } = useFileSystem()
    const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!name.trim()) {
            toast.error(`${type === 'file' ? 'File' : 'Directory'} name cannot be empty`)
            return
        }

        if (type === 'file') {
            createFile(parentId, name.trim())
        } else {
            createDirectory(parentId, name.trim())
        }

        onCancel()
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent<Document>) => {
            if (formRef.current && !formRef.current.contains(e.target as Node)) {
                onCancel()
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel()
            }
        }

        document.addEventListener('mousedown', handleClickOutside as unknown as EventListener)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [onCancel])

    return (
        <div className={cn(
            "flex items-center",
            isTopLevel ? "mb-2 px-2" : "rounded-md pl-7 pr-3 py-1.5"
        )}>
            {!isTopLevel && (
                type === 'directory' ? (
                    <FiFolder size={18} className="mr-2 min-w-fit text-blue-300" />
                ) : (
                    <Icon
                        icon={getIconClassName(name || 'file.txt')}
                        fontSize={18}
                        className="mr-2 min-w-fit text-gray-400"
                    />
                )
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="flex-1 flex items-center gap-1">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 w-full bg-darkTertiary/30 border border-darkTertiary/30 rounded-md p-1 text-sm text-white outline-none focus:border-primary-500/50"
                    placeholder={`New ${type === 'file' ? 'file' : 'folder'} name...`}
                    autoFocus
                />

                <button
                    type="submit"
                    className="p-1 rounded-md bg-primary-600/70 hover:bg-primary-600 text-white"
                    title="Create"
                >
                    <FiCheck size={16} />
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1 rounded-md bg-darkTertiary/50 hover:bg-darkTertiary/70 text-gray-300"
                    title="Cancel"
                >
                    <FiX size={16} />
                </button>
            </form>
        </div>
    )
}

function FileStructureView() {
    const fileSystem = useFileSystem()
    const { fileStructure, collapseDirectories } = fileSystem
    const explorerRef = useRef<HTMLDivElement | null>(null)
    const [selectedDirId, setSelectedDirId] = useState<Id | null>(null)
    const [creatingFile, setCreatingFile] = useState<boolean>(false)
    const [creatingDirectory, setCreatingDirectory] = useState<boolean>(false)

    // Maintain a map of file IDs to their parent directory IDs
    const fileParentMap = useRef<Map<Id, Id>>(new Map());

    // Function to build the file-to-parent relationship map
    const buildFileParentMap = useCallback((directory: FileSystemItem, parentId: Id | null = null) => {
        if (directory.children) {
            directory.children.forEach(child => {
                if (parentId) {
                    fileParentMap.current.set(child.id, parentId);
                }
                if (child.type === 'directory') {
                    buildFileParentMap(child, child.id);
                }
            });
        }
    }, []);

    // Update the file-parent map whenever fileStructure changes
    useEffect(() => {
        fileParentMap.current.clear();
        buildFileParentMap(fileStructure, fileStructure.id);
    }, [fileStructure, buildFileParentMap]);

    // Function to get the parent directory ID for a file or directory
    const getParentDirectoryId = useCallback((id: Id): Id => {
        return fileParentMap.current.get(id) || fileStructure.id;
    }, [fileStructure.id]);

    // Update setSelectedDirId to use parent directory for files
    const handleSelectItem = useCallback((itemId: Id) => {
        const file = getFileById(fileStructure, itemId);
        if (file && file.type === 'file') {
            // If it's a file, select its parent directory
            const parentId = getParentDirectoryId(itemId);
            setSelectedDirId(parentId);

            // Also ensure the parent directory is open
            const parentDir = getFileById(fileStructure, parentId);
            if (parentDir && parentDir.type === 'directory' && !parentDir.isOpen) {
                fileSystem.toggleDirectory(parentId);
            }
        } else {
            // If it's a directory, select it directly
            setSelectedDirId(itemId);
        }
    }, [fileStructure, getParentDirectoryId, fileSystem]);

    const handleClickOutside = (e: MouseEvent) => {
        if (
            explorerRef.current &&
            !explorerRef.current.contains(e.target as Node)
        ) {
            setSelectedDirId(fileStructure.id)
        }
    }

    // Get the currently active directory from selectedDirId
    // If a directory is selected, use it, otherwise use the root directory
    const getActiveDirectoryId = useCallback(() => {
        if (!selectedDirId) return fileStructure.id;

        // Find the selected directory in the file structure
        const findDirectory = (item: FileSystemItem): FileSystemItem | null => {
            if (item.id === selectedDirId && item.type === 'directory') {
                return item;
            }

            if (item.children) {
                for (const child of item.children) {
                    const found = findDirectory(child);
                    if (found) return found;
                }
            }

            return null;
        };

        const directory = findDirectory(fileStructure);

        // Always use the selected directory ID if found, regardless of whether it's open
        return directory ? selectedDirId : fileStructure.id;
    }, [selectedDirId, fileStructure]);

    const handleCreateFile = () => {
        setCreatingFile(true)
        setCreatingDirectory(false)
    }

    const handleCreateDirectory = () => {
        setCreatingDirectory(true)
        setCreatingFile(false)
    }

    const cancelCreation = () => {
        setCreatingFile(false)
        setCreatingDirectory(false)
    }

    const sortedFileStructure = sortFileSystemItem(fileStructure)

    return (
        <div onClick={handleClickOutside} className="flex flex-grow flex-col">
            <div className="flex justify-between mb-2 px-2 py-1.5">
                <h2 className="text-xs font-medium opacity-80 flex items-center">
                    <span className="text-primary-300 font-sans">Files</span>
                </h2>
                <div className="flex gap-1.5">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-md p-1 hover:bg-darkHover transition-colors"
                        onClick={handleCreateFile}
                        title="Create File"
                    >
                        <FiFilePlus size={16} className="text-primary-300 hover:text-primary-200" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-md p-1 hover:bg-darkHover transition-colors"
                        onClick={handleCreateDirectory}
                        title="Create Directory"
                    >
                        <FiFolderPlus size={16} className="text-blue-300 hover:text-blue-200" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-md p-1 hover:bg-darkHover/80 transition-colors bg-darkHover/40"
                        onClick={collapseDirectories}
                        title="Collapse All Directories"
                    >
                        <FiChevronsUp size={16} className="text-primary-300 hover:text-primary-200" />
                    </motion.button>
                </div>
            </div>

            {creatingFile && (
                <CreateItemView
                    type="file"
                    parentId={getActiveDirectoryId()}
                    onCancel={cancelCreation}
                    isTopLevel
                />
            )}

            {creatingDirectory && (
                <CreateItemView
                    type="directory"
                    parentId={getActiveDirectoryId()}
                    onCancel={cancelCreation}
                    isTopLevel
                />
            )}

            <div
                className="flex-grow overflow-auto pr-1 space-y-0.5"
                ref={explorerRef}
            >
                {sortedFileStructure.children &&
                    sortedFileStructure.children.map((item) => (
                        <Directory
                            key={item.id}
                            item={item}
                            setSelectedDirId={handleSelectItem}
                        />
                    ))}
            </div>
        </div>
    )
}

function Directory({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const [creatingFile, setCreatingFile] = useState<boolean>(false)
    const [creatingDirectory, setCreatingDirectory] = useState<boolean>(false)
    const [isDragOver, setIsDragOver] = useState<boolean>(false)
    const dirRef = useRef<HTMLDivElement | null>(null)
    const { coords, menuOpen, setMenuOpen } = useContextMenu({
        ref: dirRef,
    })
    const fileSystem = useFileSystem();
    const { deleteDirectory, toggleDirectory } = fileSystem;

    // Handle item drop logic
    const handleItemDrop = useCallback((droppedItemId: Id) => {
        const { fileStructure, updateDirectory } = fileSystem;

        // Find the dropped item
        const droppedItem = getFileById(fileStructure, droppedItemId);
        if (!droppedItem) return;

        // Find parent of the dropped item
        const findParent = (dir: FileSystemItem, itemId: Id): FileSystemItem | null => {
            if (dir.children) {
                for (const child of dir.children) {
                    if (child.id === itemId) {
                        return dir;
                    }
                    if (child.type === 'directory') {
                        const found = findParent(child, itemId);
                        if (found) return found;
                    }
                }
            }
            return null;
        };

        const sourceParent = findParent(fileStructure, droppedItemId);
        if (!sourceParent || sourceParent.id === item.id) return; // Already in this directory

        // Remove from original parent
        if (sourceParent.children) {
            const updatedSourceChildren = sourceParent.children.filter(child => child.id !== droppedItemId);
            updateDirectory(sourceParent.id, updatedSourceChildren);
        }

        // Add to new parent (this directory)
        if (!item.children) {
            updateDirectory(item.id, [droppedItem]);
        } else {
            const updatedTargetChildren = [...item.children, droppedItem];
            updateDirectory(item.id, updatedTargetChildren);
        }

        // Open the target directory to show the moved item
        if (!item.isOpen) {
            toggleDirectory(item.id);
        }

        toast.success(
            `${droppedItem.name} moved to ${item.name}`
        );
    }, [fileSystem, item, toggleDirectory]);

    // Handle drag events
    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        const droppedItemId = e.dataTransfer.getData('text/plain');
        if (droppedItemId && droppedItemId !== item.id) {
            handleItemDrop(droppedItemId);
        }
    }, [handleItemDrop, item.id]);

    const handleDirClick = (dirId: string) => {
        // First set this as the selected directory
        setSelectedDirId(dirId)
        // Then toggle the directory open/closed state
        toggleDirectory(dirId)
    }

    const handleRenameDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setEditing(true)
    }

    const handleDeleteDirectory = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm(
            `Are you sure you want to delete directory?`,
        )
        if (isConfirmed) {
            deleteDirectory(id)
        }
    }

    const handleCreateFile = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setCreatingFile(true)
        setCreatingDirectory(false)
        // Ensure the directory is open before creating a file inside it
        if (!item.isOpen) {
            toggleDirectory(item.id)
        }
        // Set this directory as the selected directory
        setSelectedDirId(item.id)
    }

    const handleCreateDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setCreatingDirectory(true)
        setCreatingFile(false)
        // Ensure the directory is open before creating a folder inside it
        if (!item.isOpen) {
            toggleDirectory(item.id)
        }
        // Set this directory as the selected directory
        setSelectedDirId(item.id)
    }

    const cancelCreation = () => {
        setCreatingFile(false)
        setCreatingDirectory(false)
    }

    // Add F2 key event listener to directory for renaming
    useEffect(() => {
        const dirNode = dirRef.current

        if (!dirNode) return

        dirNode.tabIndex = 0

        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }

        dirNode.addEventListener("keydown", handleF2)

        return () => {
            dirNode.removeEventListener("keydown", handleF2)
        }
    }, [])

    if (item.type === "file") {
        return <File item={item} setSelectedDirId={setSelectedDirId} />
    }

    // Animation variants for the folder content
    const variants = {
        open: {
            height: "auto",
            opacity: 1,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        closed: {
            height: 0,
            opacity: 0,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    return (
        <div className="overflow-x-auto">
            <div
                className={cn(
                    "flex w-full items-center rounded-md px-3 py-1.5 transition-all duration-200 cursor-pointer",
                    "hover:bg-darkHover/60",
                    item.isOpen && "bg-darkHover/40",
                    isDragOver && "bg-blue-500/20 border border-blue-400/50" // Highlight when dragging over
                )}
                onClick={() => handleDirClick(item.id)}
                ref={dirRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="mr-1.5 text-blue-300">
                    {item.isOpen ? (
                        <FiChevronDown size={16} className="transition-transform duration-200" />
                    ) : (
                        <FiChevronRight size={16} className="transition-transform duration-200" />
                    )}
                </div>
                <FiFolder
                    size={18}
                    className={cn(
                        "mr-2 min-w-fit transition-colors duration-200",
                        item.isOpen ? "text-blue-400" : "text-blue-300"
                    )}
                />
                {isEditing ? (
                    <RenameView
                        id={item.id}
                        preName={item.name}
                        type="directory"
                        setEditing={setEditing}
                    />
                ) : (
                    <p
                        className="flex-grow overflow-hidden truncate text-sm font-medium"
                        title={item.name}
                    >
                        {item.name}
                    </p>
                )}
            </div>
            {/* Wrap motion.div in a conditional so we only render it when necessary */}
            {(item.isOpen || (item.children && item.children.length > 0)) && (
                <motion.div
                    initial={item.isOpen ? "open" : "closed"}
                    animate={item.isOpen ? "open" : "closed"}
                    variants={variants}
                    className={cn(
                        "overflow-hidden",
                        { "pl-4": item.name !== "root" },
                    )}
                >
                    {/* Only render children content when the directory is open */}
                    {item.isOpen && (
                        <>
                            {/* Render file/directory creation UIs */}
                            {creatingFile && (
                                <CreateItemView
                                    type="file"
                                    parentId={item.id}
                                    onCancel={cancelCreation}
                                />
                            )}
                            {creatingDirectory && (
                                <CreateItemView
                                    type="directory"
                                    parentId={item.id}
                                    onCancel={cancelCreation}
                                />
                            )}

                            {item.children &&
                                item.children.map((childItem) => (
                                    <Directory
                                        key={childItem.id}
                                        item={childItem}
                                        setSelectedDirId={setSelectedDirId}
                                    />
                                ))}
                        </>
                    )}
                </motion.div>
            )}

            {menuOpen && (
                <DirectoryMenu
                    handleDeleteDirectory={handleDeleteDirectory}
                    handleRenameDirectory={handleRenameDirectory}
                    handleCreateFile={handleCreateFile}
                    handleCreateDirectory={handleCreateDirectory}
                    id={item.id}
                    left={coords.x}
                    top={coords.y}
                />
            )}
        </div>
    )
}

const File = ({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) => {
    const { deleteFile, openFile } = useFileSystem()
    const [isEditing, setEditing] = useState<boolean>(false)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const { activityState, setActivityState } = useAppContext()
    const fileRef = useRef<HTMLDivElement | null>(null)
    const { menuOpen, coords, setMenuOpen } = useContextMenu({
        ref: fileRef,
    })

    // Handle drag events
    const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    }, [item.id]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileClick = (fileId: string) => {
        if (isEditing) return
        // Set the selected directory to this file's ID
        // Our handleSelectItem function will map it to the parent directory
        setSelectedDirId(fileId)
        openFile(fileId)

        // Switch to coding mode if necessary
        if (activityState !== ACTIVITY_STATE.CODING) {
            setActivityState(ACTIVITY_STATE.CODING)
        }
    }

    const handleRenameFile = (e: MouseEvent) => {
        e.stopPropagation()
        setEditing(true)
        setMenuOpen(false)
    }

    const handleDeleteFile = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm(`Are you sure you want to delete file?`)
        if (isConfirmed) {
            deleteFile(id)
        }
    }

    // Add F2 key event listener to file for renaming
    useEffect(() => {
        const fileNode = fileRef.current

        if (!fileNode) return

        fileNode.tabIndex = 0

        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }

        fileNode.addEventListener("keydown", handleF2)

        return () => {
            fileNode.removeEventListener("keydown", handleF2)
        }
    }, [])

    return (
        <div
            className={cn(
                "flex w-full items-center rounded-md pl-7 pr-3 py-1.5 hover:bg-darkHover/60 transition-colors cursor-pointer",
                isDragging && "opacity-50" // Show as semi-transparent when dragging
            )}
            onClick={() => handleFileClick(item.id)}
            ref={fileRef}
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Icon
                icon={getIconClassName(item.name)}
                fontSize={18}
                className="mr-2 min-w-fit text-gray-400"
            />
            {isEditing ? (
                <RenameView
                    id={item.id}
                    preName={item.name}
                    type="file"
                    setEditing={setEditing}
                />
            ) : (
                <p
                    className="flex-grow cursor-pointer overflow-hidden truncate text-sm"
                    title={item.name}
                >
                    {item.name}
                </p>
            )}

            {/* Context Menu For File*/}
            {menuOpen && (
                <FileMenu
                    top={coords.y}
                    left={coords.x}
                    id={item.id}
                    handleRenameFile={handleRenameFile}
                    handleDeleteFile={handleDeleteFile}
                />
            )}
        </div>
    )
}

const FileMenu = ({
    top,
    left,
    id,
    handleRenameFile,
    handleDeleteFile,
}: {
    top: number
    left: number
    id: Id
    handleRenameFile: (e: MouseEvent) => void
    handleDeleteFile: (e: MouseEvent, id: Id) => void
}) => {
    return (
        <div
            className="absolute z-10 w-[160px] rounded-md border border-darkTertiary/30 bg-darkSecondary backdrop-blur-md p-1.5 shadow-lg"
            style={{
                top,
                left,
            }}
        >
            <button
                onClick={handleRenameFile}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 hover:bg-darkHover transition-colors text-sm"
            >
                <PiPencilSimpleFill size={16} className="text-primary-300" />
                Rename
            </button>
            <button
                onClick={(e) => handleDeleteFile(e, id)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-danger hover:bg-darkHover transition-colors text-sm"
            >
                <MdDelete size={18} />
                Delete
            </button>
        </div>
    )
}

const DirectoryMenu = ({
    top,
    left,
    id,
    handleRenameDirectory,
    handleDeleteDirectory,
    handleCreateFile,
    handleCreateDirectory,
}: {
    top: number
    left: number
    id: Id
    handleRenameDirectory: (e: MouseEvent) => void
    handleDeleteDirectory: (e: MouseEvent, id: Id) => void
    handleCreateFile: (e: MouseEvent) => void
    handleCreateDirectory: (e: MouseEvent) => void
}) => {
    return (
        <div
            className="absolute z-10 w-[160px] rounded-md border border-darkTertiary/30 bg-darkSecondary backdrop-blur-md p-1.5 shadow-lg"
            style={{
                top,
                left,
            }}
        >
            <button
                onClick={handleCreateFile}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 hover:bg-darkHover transition-colors text-sm"
            >
                <FiFilePlus size={16} className="text-primary-300" />
                New File
            </button>
            <button
                onClick={handleCreateDirectory}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 hover:bg-darkHover transition-colors text-sm"
            >
                <FiFolderPlus size={16} className="text-blue-300" />
                New Folder
            </button>
            <div className="my-1 border-t border-darkTertiary/30"></div>
            <button
                onClick={handleRenameDirectory}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 hover:bg-darkHover transition-colors text-sm"
            >
                <PiPencilSimpleFill size={16} className="text-primary-300" />
                Rename
            </button>
            <button
                onClick={(e) => handleDeleteDirectory(e, id)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-danger hover:bg-darkHover transition-colors text-sm"
            >
                <MdDelete size={18} />
                Delete
            </button>
        </div>
    )
}

export default FileStructureView
