import { getIconForFile } from "vscode-icons-js"

// Programming file extension map to ensure we recognize all common programming files
const EXTENSION_ICONS: Record<string, string> = {
  // JavaScript
  'js': 'file-type-js',
  'jsx': 'file-type-reactjs',
  'ts': 'file-type-typescript',
  'tsx': 'file-type-react-ts',
  
  // Python
  'py': 'file-type-python',
  'ipynb': 'file-type-python',
  
  // Web
  'html': 'file-type-html',
  'css': 'file-type-css',
  'scss': 'file-type-scss',
  'sass': 'file-type-sass',
  'less': 'file-type-less',
  
  // Java
  'java': 'file-type-java',
  'jar': 'file-type-jar',
  
  // C-like
  'c': 'file-type-c',
  'cpp': 'file-type-cpp',
  'h': 'file-type-header',
  'cs': 'file-type-csharp',
  
  // PHP
  'php': 'file-type-php',
  
  // Ruby
  'rb': 'file-type-ruby',
  
  // Go
  'go': 'file-type-go',
  
  // Rust
  'rs': 'file-type-rust',
  
  // Swift
  'swift': 'file-type-swift',
  
  // Shell
  'sh': 'file-type-shell',
  'bash': 'file-type-shell',
  'zsh': 'file-type-shell',
  
  // Markdown/Text
  'md': 'file-type-markdown',
  'txt': 'file-type-text',
  
  // Config files
  'json': 'file-type-json',
  'yaml': 'file-type-yaml',
  'yml': 'file-type-yaml',
  'toml': 'file-type-toml',
  'xml': 'file-type-xml',
  
  // Git
  'gitignore': 'file-type-git',
  
  // Docker
  'dockerfile': 'file-type-docker',
  
  // Env files
  'env': 'file-type-env',
  
  // Package management
  'package.json': 'file-type-npm',
  'package-lock.json': 'file-type-npm-lock',
  'yarn.lock': 'file-type-yarn',
  'requirements.txt': 'file-type-pip',
  'pipfile': 'file-type-pip',
  'gemfile': 'file-type-ruby-bundler',
  
  // Default
  'default': 'file-type-default'
}

export const getIconClassName = (name: string): string => {
  // If the file has no extension
  if (!name || name.trim() === '') {
    return 'vscode-icons:default-file';
  }
  
  // Handle specific file names
  const lowerName = name.toLowerCase();
  if (EXTENSION_ICONS[lowerName]) {
    return `vscode-icons:${EXTENSION_ICONS[lowerName]}`;
  }
  
  // Get the extension from the filename
  const extension = name.split('.').pop()?.toLowerCase() || '';
  
  // Check if we have a custom mapping for this extension
  if (extension && EXTENSION_ICONS[extension]) {
    return `vscode-icons:${EXTENSION_ICONS[extension]}`;
  }
  
  // Use vscode-icons as fallback
  try {
    const icon = getIconForFile(name)?.replace(/_/g, "-").split(".")[0];
    if (icon) {
      return `vscode-icons:${icon}`;
    }
  } catch (error) {
    console.warn(`Failed to get icon for ${name}`, error);
  }
  
  // Default icon if nothing else worked
  return 'vscode-icons:default-file';
}
