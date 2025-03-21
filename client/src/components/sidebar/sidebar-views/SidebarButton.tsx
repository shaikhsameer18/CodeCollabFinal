import { VIEWS } from "@/types/view";
import cn from "classnames";
import { motion } from "framer-motion";

interface ViewButtonProps {
    viewName: VIEWS; // ✅ Ensuring `viewName` is always from `VIEWS`
    icon: JSX.Element;
    isActive: boolean;
    onClick: () => void;
}

const SidebarButton = ({ viewName, icon, isActive, onClick }: ViewButtonProps) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
                {
                    "bg-gradient-to-br from-primary-600/20 to-teal-600/20 text-primary-300 shadow-md": isActive,
                    "text-gray-400 hover:text-white hover:bg-darkTertiary/40": !isActive,
                }
            )}
            aria-label={`Toggle ${viewName} view`}
        >
            {isActive && (
                <motion.span
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-500/10 to-teal-500/10 ring-1 ring-primary-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <span className="relative z-10">{icon}</span>
        </motion.button>
    );
};

export default SidebarButton;
