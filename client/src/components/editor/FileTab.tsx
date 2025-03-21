import { useFileSystem } from "@/context/FileContext"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { IoClose } from "react-icons/io5"
import cn from "classnames"
import { useEffect, useRef } from "react"
import customMapping from "@/utils/customMapping"
import { useSettings } from "@/context/SettingContext"
import langMap from "lang-map"
import { motion, AnimatePresence } from "framer-motion"

function FileTab() {
    const {
        openFiles,
        closeFile,
        activeFile,
        updateFileContent,
        setActiveFile,
    } = useFileSystem()
    const fileTabRef = useRef<HTMLDivElement>(null)
    const { setLanguage } = useSettings()

    const changeActiveFile = (fileId: string) => {
        // If the file is already active, do nothing
        if (activeFile?.id === fileId) return

        updateFileContent(activeFile?.id || "", activeFile?.content || "")

        const file = openFiles.find((file) => file.id === fileId)
        if (file) {
            setActiveFile(file)
        }
    }

    const handleCloseFile = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation()
        
        // If we're closing the active file, we need to activate another file
        if (activeFile?.id === fileId) {
            const currentIndex = openFiles.findIndex(f => f.id === fileId)
            
            // Find the next file to activate
            if (openFiles.length > 1) {
                // Try to activate the file to the right
                if (currentIndex < openFiles.length - 1) {
                    const nextFile = openFiles[currentIndex + 1]
                    setActiveFile(nextFile)
                } 
                // Otherwise activate the file to the left
                else {
                    const prevFile = openFiles[currentIndex - 1]
                    setActiveFile(prevFile)
                }
            }
        }
        
        // Close the file
        closeFile(fileId)
    }

    useEffect(() => {
        const fileTabNode = fileTabRef.current
        if (!fileTabNode) return

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                fileTabNode.scrollLeft += 100
            } else {
                fileTabNode.scrollLeft -= 100
            }
        }

        fileTabNode.addEventListener("wheel", handleWheel)

        return () => {
            fileTabNode.removeEventListener("wheel", handleWheel)
        }
    }, [])

    // Update the editor language when a file is opened
    useEffect(() => {
        if (activeFile?.name === undefined) return
        // Get file extension on file open and set language when file is opened
        const extension = activeFile.name.split(".").pop()
        if (!extension) return

        // Check if custom mapping exists
        if (customMapping[extension]) {
            setLanguage(customMapping[extension])
            return
        }

        const language = langMap.languages(extension)
        setLanguage(language[0])
    }, [activeFile?.name, setLanguage])

    return (
        <div
            className="flex h-[42px] w-full select-none overflow-x-auto border-b border-darkTertiary/90 bg-darkSecondary/90 shadow-md"
            ref={fileTabRef}
        >
            <AnimatePresence mode="popLayout">
                {openFiles.map((file) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, width: 0, padding: 0, margin: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ minWidth: "160px", maxWidth: "200px" }}
                        className={cn(
                            "flex h-full items-center px-4 transition-all duration-150 relative border-r border-r-darkTertiary/80",
                            {
                                "bg-dark text-white border-t-2 border-t-primary-500": file.id === activeFile?.id,
                                "bg-darkSecondary hover:bg-darkHover/80 text-gray-300 hover:text-white": file.id !== activeFile?.id,
                            }
                        )}
                    >
                        {file.id === activeFile?.id && (
                            <motion.div 
                                layoutId="active-tab-highlight"
                                className="absolute inset-0 bg-dark z-0" 
                                initial={false}
                            />
                        )}
                        <button
                            onClick={() => changeActiveFile(file.id)}
                            className="flex items-center z-10 h-full w-full"
                        >
                            <Icon
                                icon={getIconClassName(file.name)}
                                fontSize={18}
                                className={cn("mr-2 min-w-fit", {
                                    "text-primary-400": file.id === activeFile?.id,
                                    "text-gray-400": file.id !== activeFile?.id,
                                })}
                            />
                            <p
                                className={cn("flex-grow overflow-hidden truncate max-w-[120px]", {
                                    "font-medium": file.id === activeFile?.id
                                })}
                                title={file.name}
                            >
                                {file.name}
                            </p>
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleCloseFile(e, file.id)}
                            className="ml-2 p-1 rounded-full text-gray-400 hover:text-white z-10"
                        >
                            <IoClose size={16} />
                        </motion.button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default FileTab
