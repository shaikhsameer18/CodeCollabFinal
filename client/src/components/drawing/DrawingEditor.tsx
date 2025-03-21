import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { SocketEvent } from "@/types/socket"
import { useCallback, useEffect } from "react"
import { HistoryEntry, RecordsDiff, TLRecord, Tldraw, useEditor } from "tldraw"
import { motion } from "framer-motion"

function DrawingEditor() {
    const { isMobile } = useWindowDimensions()

    return (
        <motion.div 
            className="w-full h-full bg-gradient-to-br from-darkPrimary to-darkSecondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Tldraw
                inferDarkMode
                forceMobile={isMobile}
                defaultName="Editor"
                className="z-0 w-full h-full"
            >
                <ReachEditor />
            </Tldraw>
        </motion.div>
    )
}

function ReachEditor() {
    const editor = useEditor()
    const { drawingData, setDrawingData } = useAppContext()
    const { socket } = useSocket()

    const handleChangeEvent = useCallback(
        (change: HistoryEntry<TLRecord>) => {
            const snapshot = change.changes
            setDrawingData(editor.store.getSnapshot())
            socket.emit(SocketEvent.DRAWING_UPDATE, { snapshot })
        },
        [editor.store, setDrawingData, socket],
    )

    const handleRemoteDrawing = useCallback(
        ({ snapshot }: { snapshot: RecordsDiff<TLRecord> }) => {
            editor.store.mergeRemoteChanges(() => {
                const { added, updated, removed } = snapshot

                for (const record of Object.values(added)) {
                    editor.store.put([record])
                }
                for (const [, to] of Object.values(updated)) {
                    editor.store.put([to])
                }
                for (const record of Object.values(removed)) {
                    editor.store.remove([record.id])
                }
            })

            setDrawingData(editor.store.getSnapshot())
        },
        [editor.store, setDrawingData],
    )

    useEffect(() => {
        if (drawingData && Object.keys(drawingData).length > 0) {
            editor.store.loadSnapshot(drawingData)
        }
    }, [])

    useEffect(() => {
        const cleanupFunction = editor.store.listen(handleChangeEvent, {
            source: "user",
            scope: "document",
        })
        socket.on(SocketEvent.DRAWING_UPDATE, handleRemoteDrawing)

        return () => {
            cleanupFunction()
            socket.off(SocketEvent.DRAWING_UPDATE)
        }
    }, [
        drawingData,
        editor.store,
        handleChangeEvent,
        handleRemoteDrawing,
        socket,
    ])

    return null
}

export default DrawingEditor