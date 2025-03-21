import { useAppContext } from "@/context/AppContext"
import { ACTIVITY_STATE } from "@/types/app"
import DrawingEditor from "../drawing/DrawingEditor"
import EditorComponent from "../editor/EditorComponent"
import { motion, AnimatePresence } from "framer-motion"

export default function WorkSpace() {
  const { activityState } = useAppContext()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex-grow bg-darkSecondary md:static rounded-lg shadow-lg border-l border-darkTertiary/20 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {activityState === ACTIVITY_STATE.DRAWING ? (
          <motion.div
            key="drawing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <DrawingEditor />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full flex flex-col"
          >
            <EditorComponent />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}