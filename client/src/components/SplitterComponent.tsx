import { useViews } from "@/context/ViewContext"
import useLocalStorage from "@/hooks/useLocalStorage"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ReactNode } from "react"
import Split from "react-split"

export default function SplitterComponent({ children }: { children: ReactNode }) {
    const { isSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const { setItem, getItem } = useLocalStorage()

    const getGutter = () => {
        const gutter = document.createElement("div")
        gutter.className = `
            h-full cursor-col-resize hidden md:flex items-center justify-center 
            bg-darkTertiary/30 transition-all duration-300 hover:bg-primary-500/20
            relative border-x border-darkTertiary/20
        `
        return gutter
    }

    const getSizes = () => {
        if (isMobile) return [0, 100]
        const savedSizes = getItem("editorSizes")
        let sizes = [25, 75] // Default more space to editor
        if (savedSizes && isSidebarOpen) {
            sizes = JSON.parse(savedSizes)
        }
        return isSidebarOpen ? sizes : [0, 100]
    }

    const getMinSizes = () => {
        if (isMobile) return [0, 100]
        return isSidebarOpen ? [250, 350] : [0, 100]
    }

    const getMaxSizes = () => {
        if (isMobile) return [0, Infinity]
        return isSidebarOpen ? [400, Infinity] : [0, Infinity]
    }

    const handleGutterDrag = (sizes: number[]) => {
        setItem("editorSizes", JSON.stringify(sizes))
    }

    const getGutterStyle = () => ({
        width: "6px",
        display: isSidebarOpen && !isMobile ? "flex" : "none",
    })

    return (
        <Split
            sizes={getSizes()}
            minSize={getMinSizes()}
            gutter={getGutter}
            maxSize={getMaxSizes()}
            dragInterval={1}
            direction="horizontal"
            gutterAlign="center"
            cursor="col-resize"
            snapOffset={30}
            gutterStyle={getGutterStyle}
            onDrag={handleGutterDrag}
            className="flex h-screen w-screen overflow-hidden bg-darkPrimary"
        >
            {children}
        </Split>
    )
}