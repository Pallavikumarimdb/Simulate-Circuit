import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import {
  Copy,
  Check,
  Download,
  Code as CodeIcon,
  Play,
  Pause,
  Folder,
  FileCode,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Editor, { Monaco } from '@monaco-editor/react';

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

interface CodeEditorProps {
  code: string;
  language?: string;
  title?: string;
  onRunCode?: () => void;
  isRunning?: boolean;
  files?: CodeFile[];
}

const CodeEditor = ({
  code,
  language = 'cpp',
  title = 'Arduino Code',
  onRunCode,
  isRunning = false,
  files = [],
}: CodeEditorProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '/': true,
  });
  const editorRef = useRef<any>(null);

  // If no files provided, create a default one from the code prop
  const effectiveFiles = files.length > 0
    ? files
    : [{ name: 'main.ino', language: 'cpp', content: code }];

  // Get the content of the currently selected file
  const activeFile = selectedFile
    ? effectiveFiles.find((f) => f.name === selectedFile) || effectiveFiles[0]
    : effectiveFiles[0];

  // Group files by folder structure
  const filesByFolder: Record<string, string[]> = {};
  effectiveFiles.forEach((file) => {
    const parts = file.name.split('/');
    let currentPath = '/';

    // Handle files at root
    if (parts.length === 1) {
      if (!filesByFolder[currentPath]) {
        filesByFolder[currentPath] = [];
      }
      filesByFolder[currentPath].push(file.name);
      return;
    }

    // Handle nested files
    for (let i = 0; i < parts.length - 1; i++) {
      const folder = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath === '/' ? `/${folder}` : `${currentPath}/${folder}`;

      if (!filesByFolder[parentPath]) {
        filesByFolder[parentPath] = [];
      }

      if (!filesByFolder[parentPath].includes(currentPath)) {
        filesByFolder[parentPath].push(currentPath);
      }

      if (!filesByFolder[currentPath]) {
        filesByFolder[currentPath] = [];
      }

      if (i === parts.length - 2) {
        filesByFolder[currentPath].push(file.name);
      }
    }
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([activeFile.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile || `${title.toLowerCase().replace(/\s/g, '_')}.ino`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
  };

  // Handle file content change
  const handleFileContentChange = (value: string | undefined) => {
    if (activeFile) {
      activeFile.content = value || '';
    }
  };

  // Recursive function to render file tree
  const renderFileTree = (folderPath: string, depth = 0) => {
    const items = filesByFolder[folderPath] || [];

    return items.map((item) => {
      const isFolder = item.includes('/');
      const displayName = isFolder
        ? item.split('/').filter(Boolean).pop() || item
        : item.split('/').pop() || item;

      const isExpanded = expandedFolders[item] || false;

      if (isFolder) {
        return (
          <div key={item} className="pl-3">
            <button
              className={`flex items-center gap-1 py-1 w-full text-left text-sm hover:bg-accent/50 rounded px-1`}
              onClick={() => toggleFolder(item)}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={14} className="text-amber-500" />
              <span>{displayName}</span>
            </button>
            {isExpanded && (
              <div className="pl-2 border-l border-border/50 ml-2">
                {renderFileTree(item, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={item}
          className={`pl-6 py-1 pr-2 w-full text-left text-sm flex items-center gap-1 ${
            selectedFile === item ? 'bg-accent text-primary' : 'hover:bg-accent/50'
          } rounded`}
          onClick={() => setSelectedFile(item)}
        >
          <FileCode size={14} className={selectedFile === item ? 'text-primary' : 'text-foreground/70'} />
          <span>{displayName}</span>
        </button>
      );
    });
  };

  return (
    <div className="bg-background rounded-xl shadow-soft border border-border/80 overflow-hidden h-full flex flex-col">
      <div className="bg-accent/50 px-4 py-2 flex items-center justify-between border-b border-border/80">
        <div className="flex items-center gap-2">
          <CodeIcon size={16} className="text-primary" />
          <span className="font-medium">{selectedFile || title}</span>
        </div>
        <div className="flex items-center gap-1">
          {onRunCode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground/70 hover:text-foreground"
              onClick={onRunCode}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground/70 hover:text-foreground"
            onClick={copyToClipboard}
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground/70 hover:text-foreground"
            onClick={downloadCode}
          >
            <Download size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-48 border-r border-border/80 bg-background/50 overflow-y-auto p-2">
          <div className="text-xs uppercase text-foreground/50 py-1 px-2">Explorer</div>
          {renderFileTree('/')}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto">
          <Editor
            height="100%"
            width="100%"
            language={activeFile.language}
            theme="vs-dark"
            value={activeFile.content}
            onChange={handleFileContentChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
