import { messaging } from '~/modules/messaging';
import { ExtensionMessage } from '~/types';
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Initialize messaging
    messaging.initialize();

    // Handle tool execution
    messaging.onMessage('EXECUTE_TOOL', async (data, sender) => {
      const { tool, params } = data;

      try {
        let result: any;

        switch (tool) {
          case 'click_element':
            result = await handleClickElement(params);
            break;
          case 'fill_form':
            result = await handleFillForm(params);
            break;
          case 'extract_content':
            result = await handleExtractContent(params);
            break;
          case 'scroll_page':
            result = await handleScrollPage(params);
            break;
          case 'execute_script':
            result = await handleExecuteScript(params);
            break;
          case 'get_page_content':
            result = await handleGetPageContent(params);
            break;
          case 'take_screenshot':
            result = await handleTakeScreenshot(params);
            break;
          default:
            throw new Error(`Unknown tool: ${tool}`);
        }

        return { success: true, result };
      } catch (error) {
        console.error('Tool execution error:', error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Handle page content request
    messaging.onMessage('GET_PAGE_CONTENT', async (data, sender) => {
      const { format = 'text' } = data;

      try {
        let content: string;

        switch (format) {
          case 'text':
            content = document.body.innerText;
            break;
          case 'html':
            content = document.body.innerHTML;
            break;
          case 'markdown':
            content = convertToMarkdown(document.body);
            break;
          default:
            throw new Error(`Unknown format: ${format}`);
        }

        return { success: true, content };
      } catch (error) {
        console.error('Get page content error:', error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Tool handlers
    async function handleClickElement(params: any): Promise<any> {
      const { selector } = params;
      const element = document.querySelector(selector);

      if (!element) {
        throw new Error('Element not found');
      }

      // Highlight element
      highlightElement(element);

      // Wait for user confirmation
      const confirmed = await confirmAction('Click this element?');
      if (!confirmed) {
        return { cancelled: true };
      }

      // Click element
      (element as HTMLElement).click();
      return { clicked: true };
    }

    async function handleFillForm(params: any): Promise<any> {
      const { selector, value, submit = false } = params;
      const element = document.querySelector(selector) as HTMLInputElement;

      if (!element) {
        throw new Error('Element not found');
      }

      highlightElement(element);
      const confirmed = await confirmAction(`Fill "${value}" into this field?`);
      if (!confirmed) {
        return { cancelled: true };
      }

      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));

      if (submit) {
        const form = element.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
        }
      }

      return { filled: true };
    }

    async function handleExtractContent(params: any): Promise<any> {
      const { selector, format = 'text' } = params;
      const element = selector ? document.querySelector(selector) : document.body;

      if (!element) {
        throw new Error('Element not found');
      }

      let content: string;

      switch (format) {
        case 'text':
          content = element.textContent || '';
          break;
        case 'html':
          content = element.innerHTML;
          break;
        case 'markdown':
          content = convertToMarkdown(element);
          break;
        default:
          throw new Error(`Unknown format: ${format}`);
      }

      return { content };
    }

    async function handleScrollPage(params: any): Promise<any> {
      const { direction = 'down', amount = 500 } = params;

      switch (direction) {
        case 'up':
          window.scrollBy(0, -amount);
          break;
        case 'down':
          window.scrollBy(0, amount);
          break;
        case 'top':
          window.scrollTo(0, 0);
          break;
        case 'bottom':
          window.scrollTo(0, document.body.scrollHeight);
          break;
        default:
          throw new Error(`Unknown direction: ${direction}`);
      }

      return { scrolled: true, scrollY: window.scrollY };
    }

    async function handleExecuteScript(params: any): Promise<any> {
      const { script } = params;

      try {
        const result = eval(script);
        return { result };
      } catch (error) {
        throw new Error(`Script execution error: ${(error as Error).message}`);
      }
    }

    async function handleGetPageContent(params: any): Promise<any> {
      const { format = 'text' } = params;

      switch (format) {
        case 'text':
          return { content: document.body.innerText };
        case 'html':
          return { content: document.body.innerHTML };
        case 'markdown':
          return { content: convertToMarkdown(document.body) };
        case 'dom':
          return { structure: getDOMStructure(document.body, 3, true) };
        default:
          throw new Error(`Unknown format: ${format}`);
      }
    }

    async function handleTakeScreenshot(params: any): Promise<any> {
      const { selector, format = 'png' } = params;

      // Use chrome.tabs.captureVisibleTab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        throw new Error('No active tab');
      }

      const dataUrl = await chrome.tabs.captureVisibleTab(tab.id, { format });
      return { dataUrl };
    }

    // Helper functions
    function highlightElement(element: Element): void {
      const originalStyle = element.getAttribute('style');
      element.setAttribute('style', 'outline: 3px solid red !important;');

      setTimeout(() => {
        if (originalStyle) {
          element.setAttribute('style', originalStyle);
        } else {
          element.removeAttribute('style');
        }
      }, 2000);
    }

    function confirmAction(message: string): Promise<boolean> {
      return new Promise((resolve) => {
        const confirmed = window.confirm(message);
        resolve(confirmed);
      });
    }

    function convertToMarkdown(element: Element): string {
      let markdown = '';

      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          markdown += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          const tag = el.tagName.toLowerCase();

          switch (tag) {
            case 'h1':
              markdown += `# ${el.textContent}\n\n`;
              break;
            case 'h2':
              markdown += `## ${el.textContent}\n\n`;
              break;
            case 'h3':
              markdown += `### ${el.textContent}\n\n`;
              break;
            case 'p':
              markdown += `${el.textContent}\n\n`;
              break;
            case 'a':
              markdown += `[${el.textContent}](${el.getAttribute('href')})`;
              break;
            case 'ul':
              markdown += '\n';
              el.querySelectorAll('li').forEach((li) => {
                markdown += `- ${li.textContent}\n`;
              });
              markdown += '\n';
              break;
            case 'ol':
              markdown += '\n';
              el.querySelectorAll('li').forEach((li, index) => {
                markdown += `${index + 1}. ${li.textContent}\n`;
              });
              markdown += '\n';
              break;
            case 'code':
              markdown += `\`${el.textContent}\``;
              break;
            case 'pre':
              markdown += `\`\`\`\n${el.textContent}\n\`\`\`\n\n`;
              break;
            case 'strong':
            case 'b':
              markdown += `**${el.textContent}**`;
              break;
            case 'em':
            case 'i':
              markdown += `*${el.textContent}*`;
              break;
            default:
              markdown += convertToMarkdown(el);
          }
        }
      });

      return markdown;
    }

    function getDOMStructure(
      element: Element,
      depth: number,
      includeText: boolean,
      currentDepth: number = 0
    ): any {
      if (currentDepth >= depth) {
        return includeText ? { text: element.textContent } : {};
      }

      return {
        tag: element.tagName.toLowerCase(),
        id: element.id,
        className: element.className,
        ...(includeText && { text: element.textContent?.slice(0, 100) }),
        children: Array.from(element.children).map(child =>
          getDOMStructure(child, depth, includeText, currentDepth + 1)
        )
      };
    }
  }
});
