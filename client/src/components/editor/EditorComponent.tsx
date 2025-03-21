import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import cn from "classnames"
import Editor from "./Editor"
import FileTab from "./FileTab"
import { motion } from "framer-motion"
import { FiFile } from "react-icons/fi"

function EditorComponent() {
    const { openFiles } = useFileSystem()
    const { minHeightReached } = useResponsive()

    if (openFiles.length <= 0) {
        return (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex h-full w-full flex-col items-center justify-center bg-dark border-l border-darkTertiary/30"
            >
                <div className="glass-card text-center max-w-md">
                    <FiFile className="text-primary-400 h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">No Files Open</h2>
                    <p className="text-gray-400 mb-4">
                        Open a file from the sidebar to start editing or create a new file.
                    </p>
                    <div className="p-4 rounded-lg bg-darkTertiary border border-primary-900/20 text-left">
                        <p className="text-sm text-gray-300 font-mono">
                            <span className="text-accent-blue">Tip:</span> Use the file explorer in the sidebar to manage your files.
                        </p>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex w-full flex-col overflow-hidden bg-dark border-l border-darkTertiary/50", 
                {
                    "h-[calc(100vh-40px)]": !minHeightReached,
                    "h-full": minHeightReached,
                }
            )}
            style={{ height: "calc(100vh - 0px)" }}
        >
            <div className="editor-container flex flex-col h-full">
                <FileTab />
                <div className="flex-grow overflow-hidden border-t border-darkTertiary/20">
                    <Editor />
                </div>
            </div>
        </motion.main>
    )
}

export default EditorComponent
