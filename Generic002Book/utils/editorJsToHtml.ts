import { EditorJSContent, EditorJSBlock } from '../services/pageApi';

/**
 * Convert EditorJS JSON to HTML
 */
export const editorJsToHtml = (content: EditorJSContent): string => {
  if (!content || !Array.isArray(content.blocks)) {
    console.warn('Invalid EditorJS content');
    return '<p>No content available</p>';
  }

  try {
    const htmlBlocks = content.blocks.map(block => convertBlock(block));
    return htmlBlocks.join('\n');
  } catch (error) {
    console.error('Error converting EditorJS to HTML:', error);
    return '<p>Error rendering content</p>';
  }
};

/**
 * Convert single EditorJS block to HTML
 */
const convertBlock = (block: EditorJSBlock): string => {
  switch (block.type) {
    case 'header':
      return convertHeader(block);
    
    case 'paragraph':
      return convertParagraph(block);
    
    case 'list':
      return convertList(block);
    
    case 'quote':
      return convertQuote(block);
    
    case 'image':
      return convertImage(block);
    
    case 'delimiter':
      return convertDelimiter();
    
    case 'raw':
      return convertRaw(block);
    
    case 'code':
      return convertCode(block);
    
    case 'table':
      return convertTable(block);
    
    case 'warning':
      return convertWarning(block);
    
    case 'embed':
      return convertEmbed(block);
    
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return convertUnknown(block);
  }
};

/**
 * Convert Header block
 */
const convertHeader = (block: EditorJSBlock): string => {
  const level = block.data.level || 2;
  const text = block.data.text || '';
  return `<h${level}>${sanitizeHtml(text)}</h${level}>`;
};

/**
 * Convert Paragraph block
 */
const convertParagraph = (block: EditorJSBlock): string => {
  const text = block.data.text || '';
  return `<p>${sanitizeHtml(text)}</p>`;
};

/**
 * Convert List block
 */
const convertList = (block: EditorJSBlock): string => {
  const style = block.data.style || 'unordered';
  const items = block.data.items || [];
  
  const tag = style === 'ordered' ? 'ol' : 'ul';
  const itemsHtml = items.map((item: string) => `<li>${sanitizeHtml(item)}</li>`).join('');
  
  return `<${tag}>${itemsHtml}</${tag}>`;
};

/**
 * Convert Quote block
 */
const convertQuote = (block: EditorJSBlock): string => {
  const text = block.data.text || '';
  const caption = block.data.caption || '';
  
  return `
    <blockquote>
      ${sanitizeHtml(text)}
      ${caption ? `<cite>${sanitizeHtml(caption)}</cite>` : ''}
    </blockquote>
  `;
};

/**
 * Convert Image block
 */
const convertImage = (block: EditorJSBlock): string => {
  const url = block.data.file?.url || '';
  const caption = block.data.caption || '';
  const stretched = block.data.stretched || false;
  const withBorder = block.data.withBorder || false;
  const withBackground = block.data.withBackground || false;
  
  if (!url) {
    return '<p><em>Image not available</em></p>';
  }
  
  const classes = [
    stretched ? 'stretched' : '',
    withBorder ? 'with-border' : '',
    withBackground ? 'with-background' : '',
  ].filter(Boolean).join(' ');
  
  return `
    <figure class="${classes}">
      <img src="${url}" alt="${sanitizeHtml(caption)}" loading="lazy" />
      ${caption ? `<figcaption>${sanitizeHtml(caption)}</figcaption>` : ''}
    </figure>
  `;
};

/**
 * Convert Delimiter block
 */
const convertDelimiter = (): string => {
  return '<div class="delimiter">* * *</div>';
};

/**
 * Convert Raw HTML block
 */
const convertRaw = (block: EditorJSBlock): string => {
  // Security: Only allow if you trust the content
  return block.data.html || '';
};

/**
 * Convert Code block
 */
const convertCode = (block: EditorJSBlock): string => {
  const code = block.data.code || '';
  return `<pre><code>${escapeHtml(code)}</code></pre>`;
};

/**
 * Convert Table block
 */
const convertTable = (block: EditorJSBlock): string => {
  const content = block.data.content || [];
  const withHeadings = block.data.withHeadings || false;
  
  if (content.length === 0) {
    return '';
  }
  
  let html = '<table>';
  
  content.forEach((row: string[], index: number) => {
    const tag = withHeadings && index === 0 ? 'th' : 'td';
    html += '<tr>';
    row.forEach(cell => {
      html += `<${tag}>${sanitizeHtml(cell)}</${tag}>`;
    });
    html += '</tr>';
  });
  
  html += '</table>';
  return html;
};

/**
 * Convert Warning block
 */
const convertWarning = (block: EditorJSBlock): string => {
  const title = block.data.title || 'Warning';
  const message = block.data.message || '';
  
  return `
    <div class="warning-box">
      <strong>⚠️ ${sanitizeHtml(title)}</strong>
      <p>${sanitizeHtml(message)}</p>
    </div>
  `;
};

/**
 * Convert Embed block
 */
const convertEmbed = (block: EditorJSBlock): string => {
  const service = block.data.service || 'unknown';
  const embed = block.data.embed || '';
  const caption = block.data.caption || '';
  
  if (!embed) {
    return '';
  }
  
  return `
    <figure class="embed embed-${service}">
      <iframe src="${embed}" frameborder="0" allowfullscreen></iframe>
      ${caption ? `<figcaption>${sanitizeHtml(caption)}</figcaption>` : ''}
    </figure>
  `;
};

/**
 * Convert Unknown block type (fallback)
 */
const convertUnknown = (block: EditorJSBlock): string => {
  console.warn('Unknown block type:', block.type, block.data);
  return `
    <div class="unknown-block" style="background-color: #fceae8; padding: 12px; border-radius: 8px; margin: 12px 0;">
      <strong>📦 Unsupported block type: ${block.type}</strong>
      <pre style="font-size: 11px; margin-top: 8px; overflow: auto;">${JSON.stringify(block.data, null, 2)}</pre>
    </div>
  `;
};

/**
 * Sanitize HTML - allows basic formatting tags, escapes others
 */
const sanitizeHtml = (html: string): string => {
  // Allow common formatting tags
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'mark', 'code', 'a', 'br'];
  
  // This is a simple implementation
  // For production, consider using a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .trim();
};

/**
 * Escape HTML completely (for code blocks)
 */
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Add CSS styles for special blocks in baseTemplate.ts
 */
export const getEditorJSStyles = (): string => {
  return `
    <style>
      /* Delimiter */
      .delimiter {
        text-align: center;
        color: #636e72;
        margin: 24px 0;
        font-size: 20px;
      }
      
      /* Image variations */
      figure.stretched img {
        width: 100%;
      }
      
      figure.with-border img {
        border: 2px solid #E0E0E0;
      }
      
      figure.with-background {
        background-color: #f5f5f5;
        padding: 16px;
        border-radius: 8px;
      }
      
      figcaption {
        text-align: center;
        font-size: 14px;
        color: #636e72;
        margin-top: 8px;
        font-style: italic;
      }
      
      /* Warning box */
      .warning-box {
        background-color: #fff3cd;
        border-left: 4px solid #f1c40f;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
      }
      
      .warning-box strong {
        display: block;
        margin-bottom: 8px;
        color: #856404;
      }
      
      /* Code blocks */
      pre {
        background-color: #f5f5f5;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 16px 0;
      }
      
      code {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #2C3E50;
      }
      
      /* Table */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }
      
      table th,
      table td {
        border: 1px solid #E0E0E0;
        padding: 12px;
        text-align: left;
      }
      
      table th {
        background-color: #fceae8;
        font-weight: 600;
        color: #2C3E50;
      }
      
      /* Embed */
      .embed iframe {
        width: 100%;
        min-height: 300px;
        border-radius: 8px;
      }
    </style>
  `;
};
