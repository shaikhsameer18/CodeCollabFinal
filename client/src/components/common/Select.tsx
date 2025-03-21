import { ChangeEvent } from "react"
import { PiCaretDownBold } from "react-icons/pi"

interface SelectProps {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    value: string
    options: string[]
    title: string
    className?: string
}

function Select({ onChange, value, options, title, className = "" }: SelectProps) {
    return (
        <div className={`relative w-full ${className}`}>
            <label className="mb-2 block text-primary-300 font-medium font-sans">{title}</label>
            <div className="relative">
                <select
                    className="w-full rounded-md border border-darkTertiary/40 bg-darkTertiary/30 px-4 py-2 text-white outline-none appearance-none cursor-pointer transition-colors hover:bg-darkTertiary/40 focus:ring-2 focus:ring-primary-500/50 font-sans"
                    value={value}
                    onChange={onChange}
                >
                    {options.sort().map((option) => {
                        const value = option
                        const name = option.charAt(0).toUpperCase() + option.slice(1)

                        return (
                            <option key={name} value={value} className="bg-darkSecondary">
                                {name}
                            </option>
                        )
                    })}
                </select>
                <PiCaretDownBold
                    size={16}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-primary-400 pointer-events-none"
                />
            </div>
        </div>
    )
}

export default Select