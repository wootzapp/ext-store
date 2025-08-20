import React from 'react';

export const convertToMarkdown = (text) => {
  if (!text) return '';
  
  let markdown = text;
  
  // Convert bold text (**text** or __text__)
  markdown = markdown.replace(/\*\*(.*?)\*\*/g, '**$1**');
  markdown = markdown.replace(/__(.*?)__/g, '**$1**');
  
  // Convert italic text (*text* or _text_)
  markdown = markdown.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '*$1*');
  markdown = markdown.replace(/(?<!_)_([^_]+)_(?!_)/g, '*$1*');
  
  // Convert code blocks
  markdown = markdown.replace(/```([\s\S]*?)```/g, '```\n$1\n```');
  
  // Convert inline code
  markdown = markdown.replace(/`([^`]+)`/g, '`$1`');
  
  // Convert lists (numbered and bulleted)
  markdown = markdown.replace(/^\d+\.\s+(.+)$/gm, '1. $1');
  markdown = markdown.replace(/^[-*+]\s+(.+)$/gm, '- $1');
  
  // Convert headers
  markdown = markdown.replace(/^### (.+)$/gm, '### $1');
  markdown = markdown.replace(/^## (.+)$/gm, '## $1');
  markdown = markdown.replace(/^# (.+)$/gm, '# $1');
  
  // Convert links
  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1]($2)');
  
  // Convert line breaks
  markdown = markdown.replace(/\n\n/g, '\n\n');
  
  return markdown;
};

export const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let listItems = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <pre key={`code-${i}`} className="bg-gray-100 rounded-lg p-3 text-sm overflow-x-auto mb-3">
            <code className="text-gray-800">{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Handle lists
    if (line.match(/^[-*+]\s+/) || line.match(/^\d+\.\s+/)) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      const listContent = line.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '');
      listItems.push(
        <li key={`list-${i}`} className="mb-1">
          {formatInlineMarkdown(listContent)}
        </li>
      );
    } else {
      // End list if we were in one
      if (inList) {
        elements.push(
          <ul key={`list-group-${i}`} className="list-disc list-inside text-gray-700 text-sm space-y-1 mb-3 ml-4">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
      
      // Handle headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-md font-semibold text-gray-800 mb-2 mt-4">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg font-semibold text-gray-800 mb-3 mt-4">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl font-bold text-gray-800 mb-3 mt-4">
            {line.substring(2)}
          </h1>
        );
      } else if (line.trim() === '') {
        // Empty line
        elements.push(<br key={`br-${i}`} />);
      } else {
        // Regular paragraph
        elements.push(
          <p key={`p-${i}`} className="text-gray-700 text-sm leading-relaxed mb-2">
            {formatInlineMarkdown(line)}
          </p>
        );
      }
    }
  }
  
  // Close any remaining list
  if (inList) {
    elements.push(
      <ul key="list-final" className="list-disc list-inside text-gray-700 text-sm space-y-1 mb-3 ml-4">
        {listItems}
      </ul>
    );
  }
  
  return <div className="markdown-content">{elements}</div>;
};

const formatInlineMarkdown = (text) => {
  const parts = [];
  let lastIndex = 0;
  
  // Handle bold text
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the bold text
    parts.push(
      <strong key={`bold-${match.index}`} className="font-semibold">
        {match[1]}
      </strong>
    );
    
    lastIndex = boldRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // Handle italic text in the remaining parts
  const processedParts = [];
  parts.forEach((part, index) => {
    if (typeof part === 'string') {
      const italicRegex = /\*([^*]+)\*/g;
      let italicMatch;
      let lastItalicIndex = 0;
      
      while ((italicMatch = italicRegex.exec(part)) !== null) {
        if (italicMatch.index > lastItalicIndex) {
          processedParts.push(part.substring(lastItalicIndex, italicMatch.index));
        }
        
        processedParts.push(
          <em key={`italic-${index}-${italicMatch.index}`} className="italic">
            {italicMatch[1]}
          </em>
        );
        
        lastItalicIndex = italicRegex.lastIndex;
      }
      
      if (lastItalicIndex < part.length) {
        processedParts.push(part.substring(lastItalicIndex));
      }
    } else {
      processedParts.push(part);
    }
  });
  
  // Handle inline code
  const finalParts = [];
  processedParts.forEach((part, index) => {
    if (typeof part === 'string') {
      const codeRegex = /`([^`]+)`/g;
      let codeMatch;
      let lastCodeIndex = 0;
      
      while ((codeMatch = codeRegex.exec(part)) !== null) {
        if (codeMatch.index > lastCodeIndex) {
          finalParts.push(part.substring(lastCodeIndex, codeMatch.index));
        }
        
        finalParts.push(
          <code key={`code-${index}-${codeMatch.index}`} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
            {codeMatch[1]}
          </code>
        );
        
        lastCodeIndex = codeRegex.lastIndex;
      }
      
      if (lastCodeIndex < part.length) {
        finalParts.push(part.substring(lastCodeIndex));
      }
    } else {
      finalParts.push(part);
    }
  });
  
  return <>{finalParts}</>;
};

export const copyToClipboard = async (text) => {
  try {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return result;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const extractTextContent = (element) => {
  if (!element) return '';
  
  let text = '';
  
  // Get all text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    text += node.textContent + ' ';
  }
  
  // Clean up the text
  return text.replace(/\s+/g, ' ').trim();
};


export const formatSectionForCopy = (sectionData, sectionTitle) => {
  let markdown = `# ${sectionTitle}\n\n`;
  
  if (typeof sectionData === 'string') {
    markdown += sectionData + '\n\n';
  } else if (Array.isArray(sectionData)) {
    sectionData.forEach((item, index) => {
      if (typeof item === 'string') {
        markdown += `${index + 1}. ${item}\n`;
      } else if (typeof item === 'object') {
        markdown += formatObjectToMarkdown(item, index + 1);
      }
    });
    markdown += '\n';
  } else if (typeof sectionData === 'object') {
    markdown += formatObjectToMarkdown(sectionData);
  }
  
  return markdown;
};

const formatObjectToMarkdown = (obj, index = null) => {
  let markdown = '';
  
  if (index) {
    markdown += `## ${index}. `;
  }
  
  Object.entries(obj).forEach(([key, value]) => {
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (typeof value === 'string') {
      if (key === 'title' || key === 'question') {
        markdown += `${formattedKey}: **${value}**\n`;
      } else {
        markdown += `${formattedKey}: ${value}\n`;
      }
    } else if (Array.isArray(value)) {
      markdown += `${formattedKey}:\n`;
      value.forEach(item => {
        markdown += `- ${item}\n`;
      });
    } else if (typeof value === 'object') {
      markdown += `${formattedKey}:\n`;
      Object.entries(value).forEach(([subKey, subValue]) => {
        const formattedSubKey = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        markdown += `  - ${formattedSubKey}: ${subValue}\n`;
      });
    }
  });
  
  return markdown + '\n';
};

export const formatPageForCopy = (pageData, pageTitle, pageUrl) => {
  let markdown = `# ${pageTitle}\n\n`;
  
  if (pageUrl) {
    markdown += `**Source:** ${pageUrl}\n\n`;
  }
  
  markdown += `**Generated:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
  markdown += `---\n\n`;
  
  // Add all sections
  Object.entries(pageData).forEach(([sectionKey, sectionData]) => {
    if (sectionData && (typeof sectionData === 'string' || Array.isArray(sectionData) || typeof sectionData === 'object')) {
      const sectionTitle = sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      markdown += formatSectionForCopy(sectionData, sectionTitle);
    }
  });
  
  return markdown;
};

export const CopyButton = ({ 
  text, 
  className = '', 
  size = 'sm',
  variant = 'default',
  children = 'Copy'
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-xs',
    lg: 'px-3 py-2 text-sm'
  };
  
  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };
  
  const variantClasses = {
    default: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
    primary: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-red-500 shadow-md',
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border border-blue-500 shadow-md'
  };
  
  return (
    <button
      onClick={handleCopy}
      className={`
        ${sizeClasses[size]}
        ${copied ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg transform scale-105' : variantClasses[variant]}
        ${className}
        rounded-lg font-medium transition-all duration-300 ease-out
        flex items-center space-x-1.5 
        hover:shadow-lg hover:transform hover:scale-105
        active:scale-95 active:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:ring-offset-2
        relative overflow-hidden
      `}
      title={copied ? 'Copied to clipboard!' : 'Copy to clipboard'}
    >
      <div className="flex items-center space-x-1.5">
        {copied ? (
          <>
            <svg className={`${iconSizes[size]} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Copied!</span>
          </>
        ) : (
          <>
            <svg className={`${iconSizes[size]} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 1.414L11.586 11H15z"/>
            </svg>
            <span className="font-medium">{children}</span>
          </>
        )}
      </div>
      
      {/* Subtle shine effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full hover:translate-x-[-100%] transition-all duration-700"></div>
    </button>
  );
};

export default {
  convertToMarkdown,
  renderMarkdown,
  copyToClipboard,
  extractTextContent,
  formatSectionForCopy,
  formatPageForCopy,
  CopyButton
};