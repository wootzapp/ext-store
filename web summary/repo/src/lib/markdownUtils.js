// src/lib/markdownUtils.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkLinkifyRegex from 'remark-linkify-regex';
import rehypeSlug from 'rehype-slug';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize from 'rehype-sanitize';
// If you *must* allow raw HTML inside markdown, use rehypeRaw instead of rehypeSanitize (less safe):
// import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import copy from 'copy-to-clipboard';

/** Open a URL in a new Chrome tab (fallback to window.open for non-extension envs) */
const openInNewTab = (url) => {
  if (!url) return;
  try {
    if (typeof chrome !== 'undefined' && chrome?.tabs?.create) {
      chrome.tabs.create({ url });
      return;
    }
  } catch (_) {}
  window.open(url, '_blank', 'noopener,noreferrer');
};

const normalizeUrl = (href = '') => {
  if (!href) return '#';
  if (/^https?:\/\//i.test(href)) return href;
  // bare domain like example.com/path
  if (/^[\w.-]+\.[A-Za-z]{2,}(\/.*)?$/i.test(href)) return `https://${href}`;
  return href; // mailto:, #anchors, etc.
};

/**
 * Kept for backward compatibility. With react-markdown you can pass MD directly.
 */
export const convertToMarkdown = (text) => (typeof text === 'string' ? text : '');

/** Custom link that works in both Chrome extension and web pages */
const Link = ({ href, children, ...props }) => {
  const url = normalizeUrl(href);
  const onClick = (e) => {
    e.preventDefault();
    openInNewTab(url);
  };
  return (
    <a
      href={url}
      onClick={onClick}
      className="text-blue-600 underline hover:text-blue-700 break-all"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  );
};

/** Code renderer with Prism highlighting (block vs inline) */
const Code = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  if (!inline) {
    return (
      <SyntaxHighlighter
        language={(match && match[1]) || 'text'}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  }
  return (
    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props}>
      {children}
    </code>
  );
};

/**
 * Render Markdown using react-markdown + remark/rehype plugins.
 * - GFM tables/task-lists
 * - Auto-linking for https://, www., and bare example.com/… domains
 * - Heading slugs + autolinked headers
 * - Sanitization for safety (swap to rehypeRaw if you *need* raw HTML)
 */
export const renderMarkdown = (text) => {
  if (!text) return null;

  // Linkify bare domains like example.com/path (no scheme / no www)
  const linkifyBareDomains = remarkLinkifyRegex(
    /(?:https?:\/\/|www\.)[^\s)]+|(?:\b[\w.-]+\.[A-Za-z]{2,}(?:\/[^\s]*)?)/g
  );

  return (
    <div className="markdown-content">
      <ReactMarkdown
        children={text}
        remarkPlugins={[remarkGfm, linkifyBareDomains]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeExternalLinks, { target: '_blank', rel: ['noreferrer'] }],
          rehypeAutolinkHeadings,
          rehypeSanitize, // safer default
          // rehypeRaw,    // ← enable instead of sanitize ONLY if you trust the content
        ]}
        components={{
          a: Link,
          code: Code,
          img: (props) => <img loading="lazy" className="max-w-full" {...props} />,
          p: (p) => (
            <p
              className="text-gray-700 text-base leading-relaxed mb-3 break-words"
              {...p}
            />
          ),
          h1: (h) => (
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-5 mt-7"
              {...h}
            />
          ),
          h2: (h) => (
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-4 mt-6"
              {...h}
            />
          ),
          h3: (h) => (
            <h3
              className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 mb-3 mt-5"
              {...h}
            />
          ),
          ul: (u) => (
            <ul
              className="list-disc list-inside text-gray-700 text-sm space-y-1 mb-3 ml-4"
              {...u}
            />
          ),
          ol: (o) => (
            <ol
              className="list-decimal list-inside text-gray-700 text-sm space-y-1 mb-3 ml-4"
              {...o}
            />
          ),
          blockquote: (q) => (
            <blockquote
              className="border-l-4 border-gray-300 pl-3 italic my-3 text-gray-700"
              {...q}
            />
          ),
          table: (t) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full text-sm" {...t} />
            </div>
          ),
          th: (th) => <th className="border px-2 py-1 text-left bg-gray-50" {...th} />,
          td: (td) => <td className="border px-2 py-1 align-top" {...td} />,
          hr: () => <hr className="my-4 border-gray-200" />,
        }}
      />
    </div>
  );
};

/** Copy text to clipboard (navigator.clipboard → copy-to-clipboard → fallback) */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {
    // ignore and try next strategy
  }
  try {
    if (copy(text)) return true;
  } catch (_) {
    // ignore and try manual fallback
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textArea);
    return ok;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/** Extracts visible text from a DOM element */
export const extractTextContent = (element) => {
  if (!element) return '';
  let text = '';
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let node;
  // eslint-disable-next-line no-cond-assign
  while ((node = walker.nextNode())) {
    text += node.textContent + ' ';
  }
  return text.replace(/\s+/g, ' ').trim();
};

/** Helpers for generating markdown from data */
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
  } else if (typeof sectionData === 'object' && sectionData !== null) {
    markdown += formatObjectToMarkdown(sectionData);
  }

  return markdown;
};

const formatObjectToMarkdown = (obj, index = null) => {
  let markdown = '';
  if (index) markdown += `## ${index}. `;

  Object.entries(obj).forEach(([key, value]) => {
    const formattedKey = key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    if (typeof value === 'string') {
      if (key === 'title' || key === 'question') {
        markdown += `${formattedKey}: **${value}**\n`;
      } else {
        markdown += `${formattedKey}: ${value}\n`;
      }
    } else if (Array.isArray(value)) {
      markdown += `${formattedKey}:\n`;
      value.forEach((item) => {
        markdown += `- ${item}\n`;
      });
    } else if (typeof value === 'object' && value !== null) {
      markdown += `${formattedKey}:\n`;
      Object.entries(value).forEach(([subKey, subValue]) => {
        const formattedSubKey = subKey
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
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

  const now = new Date();
  markdown += `**Generated:** ${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n\n`;
  markdown += `---\n\n`;

  // Add all sections
  Object.entries(pageData || {}).forEach(([sectionKey, sectionData]) => {
    if (
      sectionData &&
      (typeof sectionData === 'string' ||
        Array.isArray(sectionData) ||
        typeof sectionData === 'object')
    ) {
      const sectionTitle = sectionKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      markdown += formatSectionForCopy(sectionData, sectionTitle);
    }
  });

  return markdown;
};

/** Copy button (UI) */
export const CopyButton = ({
  text,
  className = '',
  size = 'sm',
  variant = 'default',
  children = 'Copy',
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
    lg: 'px-3 py-2 text-sm',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const variantClasses = {
    default:
      'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
    primary:
      'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-red-500 shadow-md',
    secondary:
      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border border-blue-500 shadow-md',
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
      <div className="absolute inset-0 opacity-0 hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full hover:translate-x-[-100%] transition-all duration-700" />
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
  CopyButton,
};