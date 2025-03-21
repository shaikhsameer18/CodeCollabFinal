import { useSettings } from "@/context/SettingContext"
import { useEffect } from "react"

function usePageEvents() {
    const { fontSize, setFontSize } = useSettings()

    useEffect(() => {
        // Prevent user from leaving the page
        const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
            const msg = "Changes you made may not be saved"
            return (e.returnValue = msg)
        }

        window.addEventListener("beforeunload", beforeUnloadHandler)

        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler)
        }
    }, [])

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                // Prevent default browser zoom behavior
                e.preventDefault()
                
                // Check if we're in the editor
                if (e.target instanceof Element && 
                    (e.target.closest('.cm-editor') || 
                     e.target.closest('.cm-content') || 
                     e.target.closest('.cm-line'))) {
                    
                    // Calculate new font size
                    const newSize = e.deltaY > 0 
                        ? Math.max(fontSize - 1, 12) 
                        : Math.min(fontSize + 1, 24);
                    
                    // Only update if the size changed
                    if (newSize !== fontSize) {
                        setFontSize(newSize);
                        
                        // Force immediate update on all editor elements
                        const updateElements = () => {
                            const elements = document.querySelectorAll('.cm-content, .cm-line, .cm-activeLine, pre, code, .cm-gutterElement');
                            elements.forEach(el => {
                                (el as HTMLElement).style.fontSize = `${newSize}px`;
                            });
                        };
                        
                        // Apply immediately and after a small delay
                        updateElements();
                        setTimeout(updateElements, 0);
                        setTimeout(updateElements, 10);
                    }
                }
            }
        }

        window.addEventListener("wheel", handleWheel, { passive: false })

        return () => {
            window.removeEventListener("wheel", handleWheel)
        }
    }, [fontSize, setFontSize])
    
    return null;
}

export default usePageEvents
