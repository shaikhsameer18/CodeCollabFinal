import { useEffect, useState } from 'react'
import FormComponent from "@/components/forms/FormComponent"
import { motion } from "framer-motion"
import { Highlight, themes } from "prism-react-renderer"
import { FiUsers, FiGitMerge, FiZap } from 'react-icons/fi'

export default function HomePage() {
    const [mounted, setMounted] = useState(false)
    const [text, setText] = useState("")
    
    // Single JavaScript code example with the user's function
    const codeExample = `// CodeCollab IDE

function codeCollab() {
  const collaboration = "Seamless";
  const coding = "Efficient";
  return \`\${collaboration} & \${coding} Coding\`;
}

// Join a room to start collaborating!
codeCollab();  // → "Seamless & Efficient Coding"`;

    // Typing animation
    useEffect(() => {
        setMounted(true)
        if (mounted) {
            let i = 0;
            const typingInterval = setInterval(() => {
                setText(codeExample.slice(0, i));
                i++;
                if (i > codeExample.length) {
                    clearInterval(typingInterval);
                }
            }, 30);
            
            return () => clearInterval(typingInterval);
        }
    }, [mounted]);

    // Features section data with better descriptions
    const features = [
        {
            icon: <FiZap className="h-7 w-7 text-yellow-400" />,
            title: "Real-time Sync",
            description: "See your team's changes instantly as they type"
        },
        {
            icon: <FiUsers className="h-7 w-7 text-blue-400" />,
            title: "Collaboration",
            description: "Multiple cursors with live user presence"
        },
        {
            icon: <FiGitMerge className="h-7 w-7 text-teal-400" />,
            title: "GitHub Integration",
            description: "Seamless connection with repositories"
        }
    ]

    return (
        <div className="h-screen w-screen overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-darkPrimary to-darkSecondary"></div>
            
            {/* Animated mesh background */}
            <div className="absolute inset-0 opacity-5">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 0 10 L 40 10 M 10 0 L 10 40 M 0 20 L 40 20 M 20 0 L 20 40 M 0 30 L 40 30 M 30 0 L 30 40" 
                                fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
            
            {/* Glowing orbs - Enhanced */}
            <div className="absolute top-10 right-20 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl"></div>
            <div className="absolute top-40 left-20 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl"></div>
            
            {/* Main Content */}
            <div className="relative z-10 h-full w-full flex items-center justify-center">
                <div className="w-full max-w-7xl h-full flex flex-col md:flex-row items-center">
                    {/* Left hero section */}
                    <motion.div 
                        className="w-full lg:w-1/2 flex flex-col h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col justify-between h-full p-4 py-5">
                            {/* Logo and heading */}
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
                                            <polyline points="16 18 22 12 16 6"></polyline>
                                            <polyline points="8 6 2 12 8 18"></polyline>
                                        </svg>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-display font-bold">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">
                                            CodeCollab
                                        </span>
                                    </h1>
                                </div>
                                
                                <p className="text-lg text-gray-300 mb-4 max-w-xl">
                                    Where teams code together in real-time. Collaborate seamlessly, anywhere in the world.
                                </p>
                            </div>
                            
                            {/* Code Editor - Centered and improved styling with no scrolling */}
                            <div className="w-full max-w-xl mx-auto rounded-xl overflow-hidden border border-darkTertiary/30 shadow-2xl mb-3">
                                <div className="bg-darkTertiary/50 backdrop-blur-md px-4 py-2 flex items-center justify-between border-b border-darkTertiary/30">
                                    <div className="flex items-center gap-2">
                                        <div className="flex space-x-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="text-sm text-gray-400 ml-2">
                                            codeCollab.js
                                        </div>
                                    </div>
                                    <div className="text-sm px-2 py-0.5 rounded bg-darkTertiary/70 text-primary-300 font-mono">
                                        javascript
                                    </div>
                                </div>
                                
                                <div className="bg-darkSecondary/80 backdrop-blur-md">
                                    <Highlight theme={themes.nightOwl} code={text} language="javascript">
                                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                            <pre className={`${className} p-4 text-md font-mono`} style={style}>
                                                {tokens.map((line, i) => (
                                                    <div key={i} {...getLineProps({ line, key: i })} className="leading-relaxed">
                                                        <span className="text-gray-500 mr-4 select-none opacity-70">{i + 1}</span>
                                                        {line.map((token, key) => (
                                                            <span key={key} {...getTokenProps({ token, key })} />
                                                        ))}
                                                    </div>
                                                ))}
                                            </pre>
                                        )}
                                    </Highlight>
                                </div>
                            </div>
                            
                            {/* Features Grid - Larger with more content */}
                            <div className="hidden lg:flex gap-5 mt-auto">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex-1 group rounded-xl p-4 border-2 border-darkTertiary/30 
                                                 bg-gradient-to-br from-darkSecondary/80 to-darkTertiary/50 backdrop-blur-md 
                                                 hover:border-primary-500/50 transition-all duration-300 shadow-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        whileHover={{ y: -3, x: 0, scale: 1.01 }}
                                    >
                                        <div className="flex flex-col items-start">
                                            <div className="p-2.5 rounded-lg bg-darkTertiary/50 group-hover:bg-gradient-to-r 
                                                         group-hover:from-primary-500/20 group-hover:to-teal-500/20 
                                                         transition-colors mb-3 flex-shrink-0">
                                                {feature.icon}
                                            </div>
                                            <h3 className="font-medium text-base text-white mb-1">{feature.title}</h3>
                                            <p className="text-sm text-gray-400">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Right login section */}
                    <motion.div 
                        className="w-full lg:w-1/2 p-4 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <FormComponent />
                    </motion.div>
                </div>
            </div>
            
            {/* Bottom feature icons - Mobile friendly, visible outside main content */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around py-4 px-3 bg-gradient-to-r from-darkSecondary/90 to-darkPrimary/90 backdrop-blur-md lg:hidden border-t border-darkTertiary/30 z-10">
                {features.map((feature, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center mx-2">
                        <div className="p-2 rounded-md bg-darkTertiary/50 mb-2 w-12 h-12 flex items-center justify-center">
                            {feature.icon}
                        </div>
                        <span className="text-sm text-white font-medium">{feature.title}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}