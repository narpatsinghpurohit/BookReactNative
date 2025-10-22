import { PageApiPayload, EditorJSContent } from '../types/book.types';

/**
 * Fetch page content using PageType API
 * Called every time we need to render a content page
 */
export const fetchPageContent = async (
  bookId: string,
  payload: PageApiPayload
): Promise<EditorJSContent> => {
  try {
    const response = await fetch(`/api/books/${bookId}/page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: payload
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data) {
      throw new Error('No content received from server');
    }

    return data as EditorJSContent;
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
};

/**
 * Validate EditorJS content structure
 */
export const validateEditorJSContent = (content: any): content is EditorJSContent => {
  if (!content) return false;
  if (!Array.isArray(content.blocks)) return false;
  return true;
};

/**
 * Convert EditorJS blocks to HTML for WebView rendering
 */
export const editorJSToHTML = (content: EditorJSContent): string => {
  if (!content.blocks || content.blocks.length === 0) {
    return '<div class="empty-content">No content available</div>';
  }

  const blocksHTML = content.blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
        return `<p class="editor-paragraph">${block.data.text || ''}</p>`;
      
      case 'header':
        const level = block.data.level || 2;
        return `<h${level} class="editor-header editor-header-${level}">${block.data.text || ''}</h${level}>`;
      
      case 'list':
        const listType = block.data.style === 'ordered' ? 'ol' : 'ul';
        const items = (block.data.items || []).map((item: string) => `<li>${item}</li>`).join('');
        return `<${listType} class="editor-list editor-list-${block.data.style}">${items}</${listType}>`;
      
      case 'quote':
        return `<blockquote class="editor-quote">
          <p>${block.data.text || ''}</p>
          ${block.data.caption ? `<cite>${block.data.caption}</cite>` : ''}
        </blockquote>`;
      
      case 'code':
        return `<pre class="editor-code"><code>${block.data.code || ''}</code></pre>`;
      
      case 'delimiter':
        return '<div class="editor-delimiter">* * *</div>';
      
      case 'table':
        if (!block.data.content || !Array.isArray(block.data.content)) {
          return '<div class="editor-table-error">Invalid table data</div>';
        }
        const rows = block.data.content.map((row: string[]) => {
          const cells = row.map(cell => `<td>${cell || ''}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        return `<table class="editor-table"><tbody>${rows}</tbody></table>`;
      
      default:
        console.warn('Unknown EditorJS block type:', block.type);
        return `<div class="editor-unknown" data-type="${block.type}">Unsupported content type: ${block.type}</div>`;
    }
  }).join('\n');

  return blocksHTML;
};