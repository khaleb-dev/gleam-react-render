import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, Link } from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  className = "",
  minHeight = "120px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isUpdatingFromProps = useRef(false);

  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && !isUpdatingFromProps.current) {
      const currentContent = editorRef.current.innerHTML;
      if (currentContent !== value) {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        const cursorPosition = range?.startOffset;
        const parentNode = range?.startContainer;
        
        editorRef.current.innerHTML = value;
        
        // Restore cursor position if possible
        if (selection && range && parentNode && editorRef.current.contains(parentNode)) {
          try {
            range.setStart(parentNode, Math.min(cursorPosition || 0, parentNode.textContent?.length || 0));
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (e) {
            // If restoration fails, place cursor at end
            const newRange = document.createRange();
            newRange.selectNodeContents(editorRef.current);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  };

  const restoreSelection = (savedRange: Range | null) => {
    if (savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        try {
          selection.addRange(savedRange);
        } catch (e) {
          // If restoration fails, place cursor at end
          const range = document.createRange();
          range.selectNodeContents(editorRef.current!);
          range.collapse(false);
          selection.addRange(range);
        }
      }
    }
  };

  const cleanHtml = (html: string) => {
    // Remove all inline styles, especially background colors and text colors
    let cleaned = html.replace(/style="[^"]*"/gi, '');
    
    // Remove specific style attributes that might cause issues
    cleaned = cleaned.replace(/background[^;]*;?/gi, '');
    cleaned = cleaned.replace(/color[^;]*;?/gi, '');
    
    // Remove empty style attributes
    cleaned = cleaned.replace(/style=""/gi, '');
    
    // Clean up extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  };

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingFromProps.current = true;
      const cleanedHtml = cleanHtml(editorRef.current.innerHTML);
      onChange(cleanedHtml);
      setTimeout(() => {
        isUpdatingFromProps.current = false;
      }, 0);
    }
  };

  const formatText = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    // Ensure editor is focused and get current selection
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    
    // Apply the formatting command directly
    document.execCommand(command, false, value);
    
    // Clean the content after formatting
    const cleanedHtml = cleanHtml(editorRef.current.innerHTML);
    
    // Update onChange with cleaned content
    isUpdatingFromProps.current = true;
    onChange(cleanedHtml);
    
    setTimeout(() => {
      isUpdatingFromProps.current = false;
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
      }
    }

    // Handle Enter key for lists
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const listItem = range.startContainer.parentElement?.closest('li');
        if (listItem) {
          // If we're in a list item, let the default behavior handle it
          return;
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Insert plain text at current cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    handleInput();
  };

  const insertList = () => {
    if (!editorRef.current) return;
    
    const savedRange = saveSelection();
    editorRef.current.focus();
    
    if (savedRange) {
      restoreSelection(savedRange);
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      if (selectedText) {
        // Convert selected text to list
        const listItems = selectedText.split('\n').filter(line => line.trim())
          .map(line => `<li>${line.trim()}</li>`).join('');
        const listHtml = `<ul>${listItems}</ul>`;
        
        range.deleteContents();
        range.insertNode(range.createContextualFragment(listHtml));
      } else {
        // Insert new list
        formatText('insertUnorderedList');
        return;
      }
    }
    handleInput();
  };

  return (
    <div className={`rich-text-editor border rounded-md ${isFocused ? 'ring-2 ring-ring ring-offset-2' : ''} ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/20">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => formatText('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => formatText('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={insertList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 outline-none focus:outline-none text-foreground"
        style={{ minHeight }}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        
        .rich-text-editor [contenteditable] {
          color: hsl(var(--foreground)) !important;
          background: transparent !important;
          direction: ltr;
          unicode-bidi: normal;
        }
        
        .rich-text-editor [contenteditable] * {
          background: transparent !important;
          color: inherit !important;
        }
        
        .rich-text-editor [contenteditable] ul {
          list-style-type: disc;
          margin-left: 20px;
          margin-bottom: 10px;
        }
        
        .rich-text-editor [contenteditable] li {
          margin-bottom: 5px;
          color: inherit !important;
        }
        
        .rich-text-editor [contenteditable] strong {
          font-weight: bold;
          color: inherit !important;
        }
        
        .rich-text-editor [contenteditable] em {
          font-style: italic;
          color: inherit !important;
        }
        
        .rich-text-editor [contenteditable] p {
          margin-bottom: 10px;
          color: inherit !important;
        }
        
        .rich-text-editor [contenteditable] br {
          display: block;
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
};
