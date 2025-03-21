import { ChangeEvent, useEffect } from "react"
import { motion } from "framer-motion"
import { RefreshCw, ChevronDown } from "lucide-react"

import Select from "@/components/common/Select"
import { useSettings } from "@/context/SettingContext"
import { editorFonts } from "@/resources/Fonts"
import { editorThemes } from "@/resources/Themes"
import { langNames } from "@uiw/codemirror-extensions-langs"

export default function SettingsView() {
    const {
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        resetSettings,
    } = useSettings()

    const handleFontFamilyChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontFamily(e.target.value)
    const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setTheme(e.target.value)
    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setLanguage(e.target.value)
    const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontSize(parseInt(e.target.value))

    useEffect(() => {
        const editor = document.querySelector(
            ".cm-editor > .cm-scroller"
        ) as HTMLElement
        if (editor) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (custom: number) => ({ 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.1 * custom, duration: 0.3 } 
        })
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5 overflow-auto h-full"
        >
            <motion.div 
                initial="hidden"
                animate="visible"
                custom={1}
                variants={sectionVariants}
                className="bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 p-4"
            >
                <h3 className="text-sm font-medium text-primary-300 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-primary-400 to-teal-400 rounded-full"></span>
                    Editor Appearance
                </h3>
                
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <Select
                            onChange={handleFontFamilyChange}
                            value={fontFamily}
                            options={editorFonts}
                            title="Font Family"
                            className="flex-grow w-full sm:w-auto"
                        />
                        <div className="relative w-full sm:w-24">
                            <label className="mb-2 block text-primary-300 font-medium font-sans">Font Size</label>
                            <div className="relative">
                                <select
                                    value={fontSize}
                                    onChange={handleFontSizeChange}
                                    className="w-full appearance-none bg-darkTertiary/30 text-white rounded-md px-4 py-2 pr-8 
                                               focus:outline-none focus:ring-2 focus:ring-primary-500/50 border border-darkTertiary/30 font-sans"
                                    title="Font Size"
                                >
                                    {[...Array(13).keys()].map((size) => (
                                        <option key={size} value={size + 12} className="bg-darkSecondary">
                                            {size + 12}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                    
                    <Select
                        onChange={handleThemeChange}
                        value={theme}
                        options={Object.keys(editorThemes)}
                        title="Theme"
                    />
                </div>
            </motion.div>
            
            <motion.div 
                initial="hidden"
                animate="visible"
                custom={2}
                variants={sectionVariants}
                className="bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 p-4"
            >
                <h3 className="text-sm font-medium text-primary-300 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-primary-400 to-teal-400 rounded-full"></span>
                    Code Settings
                </h3>
                
                <Select
                    onChange={handleLanguageChange}
                    value={language}
                    options={langNames}
                    title="Language"
                />
            </motion.div>
            
            <motion.div 
                initial="hidden"
                animate="visible"
                custom={3}
                variants={sectionVariants}
                className="bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 p-4"
            >
                <h3 className="text-sm font-medium text-primary-300 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-primary-400 to-teal-400 rounded-full"></span>
                    Interface
                </h3>
                
                {/* Additional interface settings can be added here */}
            </motion.div>
            
            <motion.button
                initial="hidden"
                animate="visible"
                custom={4}
                variants={sectionVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-auto flex items-center justify-center p-3 
                          bg-gradient-to-r from-primary-700/20 to-teal-700/20
                          hover:from-primary-700/30 hover:to-teal-700/30
                          border border-darkTertiary/30 rounded-md text-white 
                          transition-all duration-300 shadow-sm"
                onClick={resetSettings}
            >
                <RefreshCw className="mr-2 text-primary-400" size={18} />
                <span className="font-sans">Reset to default</span>
            </motion.button>
        </motion.div>
    )
}