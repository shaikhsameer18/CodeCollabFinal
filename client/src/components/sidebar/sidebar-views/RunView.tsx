import { ChangeEvent, useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Play, ChevronDown, Code, Terminal } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useRunCode } from '@/context/RunCodeContext'

export default function RunView() {
    const {
        setInput,
        output,
        isRunning,
        supportedLanguages,
        selectedLanguage,
        setSelectedLanguage,
        runCode,
    } = useRunCode()

    const [inputValue, setInputValue] = useState('')

    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const lang = JSON.parse(e.target.value)
        setSelectedLanguage(lang)
    }

    const copyOutput = () => {
        navigator.clipboard.writeText(output)
        toast.success('Output copied to clipboard')
    }

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value)
        setInput(e.target.value)
    }

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
            className="flex flex-col gap-4 h-full"
        >
            <motion.div 
                initial="hidden"
                animate="visible"
                custom={1}
                variants={sectionVariants}
                className="bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 p-3"
            >
                <h3 className="text-sm font-medium text-primary-300 mb-3 flex items-center gap-2">
                    <Code size={14} className="text-primary-400" />
                    <span className="font-sans">Language Selection</span>
                </h3>
                
                <div className="relative">
                    <select
                        className="w-full appearance-none bg-darkTertiary/30 border border-darkTertiary/30 rounded-md 
                                  text-white p-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-sans"
                        value={JSON.stringify(selectedLanguage)}
                        onChange={handleLanguageChange}
                    >
                        {supportedLanguages
                            .sort((a, b) => (a.language > b.language ? 1 : -1))
                            .map((lang, i) => (
                                <option key={i} value={JSON.stringify(lang)} className="bg-darkSecondary">
                                    {lang.language + (lang.version ? ` (${lang.version})` : '')}
                                </option>
                            ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 pointer-events-none" size={16} />
                </div>
            </motion.div>
            
            <motion.div 
                initial="hidden"
                animate="visible"
                custom={2}
                variants={sectionVariants}
                className="bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 p-3"
            >
                <h3 className="text-sm font-medium text-primary-300 mb-3 flex items-center gap-2">
                    <Terminal size={14} className="text-primary-400" />
                    <span className="font-sans">Input</span>
                </h3>
                
                <motion.textarea
                    className="flex-grow w-full p-3 bg-darkTertiary/30 border border-darkTertiary/30 rounded-md 
                               text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-sans
                               min-h-[80px] text-sm"
                    placeholder="Write your input here..."
                    value={inputValue}
                    onChange={handleInputChange}
                />
                
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center p-2.5 bg-gradient-to-r from-primary-600 to-teal-600 
                               rounded-md text-white font-medium shadow-md hover:shadow-glow w-full mt-3
                               disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                    onClick={runCode}
                    disabled={isRunning}
                >
                    <Play className="mr-2" size={16} />
                    {isRunning ? 'Running...' : 'Run Code'}
                </motion.button>
            </motion.div>
            
            <motion.div 
                initial="hidden"
                animate="visible"
                custom={3}
                variants={sectionVariants}
                className="bg-darkTertiary/10 rounded-lg border border-darkTertiary/30 p-3 flex-grow"
            >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-primary-300 flex items-center gap-2">
                        <Terminal size={14} className="text-teal-400" />
                        <span className="font-sans">Output</span>
                    </h3>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={copyOutput}
                        title="Copy Output"
                        className="p-1.5 bg-darkTertiary/30 rounded-md hover:bg-darkTertiary/50 transition-all duration-300 text-teal-400"
                        disabled={!output}
                    >
                        <Copy size={14} />
                    </motion.button>
                </div>
                
                <div className="flex-grow p-3 bg-darkTertiary/20 border border-darkTertiary/30 rounded-md text-white overflow-y-auto h-full max-h-[180px]">
                    {output ? (
                        <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
                    ) : (
                        <div className="flex items-center justify-center h-full opacity-50">
                            <p className="text-sm text-gray-400 font-sans">Run code to see output here</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}