import { MouseEvent, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Folder } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WebkitDirectoryProps {
  webkitdirectory?: string;
  directory?: string;
}

interface OpenFileButtonProps {
  onFilesSelected?: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  allowDirectory?: boolean;
  className?: string;
  icon?: 'upload' | 'folder';
  title?: string;
}

export default function OpenFileButton({
  onFilesSelected,
  accept = '.js,.py,.html,.css,.ts,.jsx,.tsx,.json,.md,.txt,.csv',
  multiple = true,
  allowDirectory = false,
  className = '',
  icon = 'upload',
  title = 'Open File'
}: OpenFileButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = async () => {
    if (!inputRef.current?.files?.length) return;
    
    try {
      setIsLoading(true);
      const files = inputRef.current.files;
      
      if (onFilesSelected) {
        onFilesSelected(files);
      } else {
        // Default behavior if no handler provided
        const fileCount = files.length;
        toast.success(`${fileCount} file${fileCount !== 1 ? 's' : ''} selected`);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process files");
    } finally {
      setIsLoading(false);
      // Reset the input to allow selecting same files again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  // Prepare extra directory props if needed
  const directoryProps: WebkitDirectoryProps = {};
  if (allowDirectory) {
    directoryProps.webkitdirectory = 'true';
    directoryProps.directory = 'true';
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        {...directoryProps}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`text-xs text-primary-300 hover:text-primary-200 p-1 rounded-md hover:bg-darkHover/50 transition-colors ${className}`}
        title={title}
      >
        {icon === 'upload' ? (
          <Upload size={14} />
        ) : (
          <Folder size={14} />
        )}
      </motion.button>
    </>
  );
} 