import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import { useSocket } from "@/context/SocketContext"
import usePageEvents from "@/hooks/usePageEvents"
import { editorThemes } from "@/resources/Themes"
import { FileSystemItem } from "@/types/file"
import { SocketEvent } from "@/types/socket"
import { color } from "@uiw/codemirror-extensions-color"
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link"
import { LanguageName, loadLanguage } from "@uiw/codemirror-extensions-langs"
import CodeMirror, {
    Extension,
    ViewUpdate,
    scrollPastEnd,
} from "@uiw/react-codemirror"
import { useEffect, useMemo, useState, useRef } from "react"
import toast from "react-hot-toast"
import { cursorTooltipBaseTheme, tooltipField } from "./tooltip"
import { motion } from "framer-motion"

function Editor() {
    const { users, currentUser } = useAppContext()
    const { activeFile, setActiveFile } = useFileSystem()
    const { theme, language, fontSize, fontFamily } = useSettings()
    const { socket } = useSocket()
    const [timeOut, setTimeOut] = useState(setTimeout(() => { }, 0))
    const editorRef = useRef<HTMLDivElement>(null);
    const filteredUsers = useMemo(
        () => users.filter((u) => u.username !== currentUser.username),
        [users, currentUser],
    )
    const [extensions, setExtensions] = useState<Extension[]>([])

    const onCodeChange = (code: string, view: ViewUpdate) => {
        if (!activeFile) return

        const file: FileSystemItem = { ...activeFile, content: code }
        setActiveFile(file)
        const cursorPosition = view.state?.selection?.main?.head
        socket.emit(SocketEvent.TYPING_START, { cursorPosition })
        socket.emit(SocketEvent.FILE_UPDATED, {
            fileId: activeFile.id,
            newContent: code,
        })
        clearTimeout(timeOut)

        const newTimeOut = setTimeout(
            () => socket.emit(SocketEvent.TYPING_PAUSE),
            1000,
        )
        setTimeOut(newTimeOut)
    }

    usePageEvents()

    // Apply font size to all editor elements
    useEffect(() => {
        const applyFontSize = () => {
            // Target all elements that should have the font size applied
            const editorElements = document.querySelectorAll('.cm-content, .cm-line, .cm-editor, .cm-activeLine, pre, code, .cm-gutterElement, .cm-lineNumbers, .cm-activeLineGutter');
            
            editorElements.forEach(el => {
                (el as HTMLElement).style.fontSize = `${fontSize}px`;
            });
            
            // Add a class to the document body with the current font size for CSS variables
            document.body.style.setProperty('--editor-font-size', `${fontSize}px`);
            
            // Also apply font family
            const fontElements = document.querySelectorAll('.cm-editor, .cm-content, .cm-scroller');
            fontElements.forEach(el => {
                (el as HTMLElement).style.fontFamily = `${fontFamily}, monospace`;
            });
            
            // Apply styles to fix inconsistent line heights
            const lineElements = document.querySelectorAll('.cm-line');
            lineElements.forEach(el => {
                (el as HTMLElement).style.lineHeight = '1.5';
                (el as HTMLElement).style.fontFamily = `${fontFamily}, monospace`;
            });

            // Apply to any internal CodeMirror elements that might be created later
            const styleEl = document.getElementById('cm-dynamic-styles');
            if (!styleEl) {
                const style = document.createElement('style');
                style.id = 'cm-dynamic-styles';
                style.textContent = `
                    .cm-content, .cm-line, .cm-editor, .cm-activeLine, pre, code, .cm-gutterElement, .cm-lineNumbers, .cm-activeLineGutter {
                        font-size: ${fontSize}px !important;
                        font-family: ${fontFamily}, monospace !important;
                    }
                    .cm-line {
                        line-height: 1.5 !important;
                    }
                `;
                document.head.appendChild(style);
            } else {
                styleEl.textContent = `
                    .cm-content, .cm-line, .cm-editor, .cm-activeLine, pre, code, .cm-gutterElement, .cm-lineNumbers, .cm-activeLineGutter {
                        font-size: ${fontSize}px !important;
                        font-family: ${fontFamily}, monospace !important;
                    }
                    .cm-line {
                        line-height: 1.5 !important;
                    }
                `;
            }
        };
        
        // Apply immediately
        applyFontSize();
        
        // Also set up a small delay to ensure it applies after CodeMirror renders
        const timeoutId = setTimeout(applyFontSize, 100);
        
        // Set up a mutation observer to detect when CodeMirror adds new elements
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                applyFontSize();
            }
        });
        
        // Start observing the editor container
        if (editorRef.current) {
            observer.observe(editorRef.current, { 
                childList: true, 
                subtree: true 
            });
        }
        
        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [fontSize, fontFamily]);

    useEffect(() => {
        const extensions = [
            color,
            hyperLink,
            tooltipField(filteredUsers),
            cursorTooltipBaseTheme,
            scrollPastEnd(),
        ]
        const langExt = loadLanguage(language.toLowerCase() as LanguageName)
        if (langExt) {
            extensions.push(langExt)
        } else {
            toast.error(
                "Syntax highlighting is unavailable for this language. Please adjust the editor settings; it may be listed under a different name.",
                {
                    duration: 5000,
                },
            )
        }

        setExtensions(extensions)
    }, [filteredUsers, language])

    return (
        <motion.div
            ref={editorRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full bg-dark"
        >
            <CodeMirror
                theme={editorThemes[theme]}
                onChange={onCodeChange}
                value={activeFile?.content}
                extensions={extensions}
                minHeight="100%"
                maxWidth="100%"
                style={{
                    height: "100%",
                    width: "100%",
                    position: "relative",
                    backgroundColor: "var(--cm-background)",
                    zIndex: 10,
                    padding: "8px 0"
                }}
                className="h-full overflow-hidden"
            />
        </motion.div>
    )
}

export default Editor