import { Toaster, ToasterProps } from "react-hot-toast"

export default function Toast({ position = "top-right", ...props }: ToasterProps) {
    return (
        <Toaster 
            position={position} 
            {...props} 
            toastOptions={{
                style: {
                    background: 'rgba(23, 27, 35, 0.9)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(82, 205, 196, 0.2)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '8px',
                    fontSize: '14px',
                },
                success: {
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#ffffff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#ffffff',
                    },
                },
                ...props.toastOptions,
            }}
        />
    )
}