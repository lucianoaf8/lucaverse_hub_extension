/**
 * Chrome Extension Content Script
 * Runs on web pages to provide context-aware functionality
 */

// Content script state
let isInitialized = false;
let extensionAPI: any = null;
let pageContext: any = {};

// Initialize content script
async function initializeContentScript(): Promise<void> {
  if (isInitialized) return;

  try {
    console.log('Lucaverse Hub content script initializing...');

    // Get page context
    pageContext = {
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname,
      timestamp: Date.now(),
    };

    // Setup message listener
    chrome.runtime.onMessage.addListener(handleMessage);

    // Setup page monitoring
    setupPageMonitoring();

    // Setup smart bookmark detection
    setupSmartBookmarkDetection();

    // Setup context menu enhancements
    setupContextMenus();

    isInitialized = true;
    console.log('Content script initialized successfully');
  } catch (error) {
    console.error('Content script initialization failed:', error);
  }
}

/**
 * Handle messages from background/popup
 */
function handleMessage(message: any, sender: any, sendResponse: Function): boolean {
  console.log('Content script received message:', message);

  switch (message.action) {
    case 'getPageContext':
      sendResponse({
        success: true,
        data: {
          ...pageContext,
          selectedText: getSelectedText(),
          visibleLinks: getVisibleLinks(),
          metadata: getPageMetadata(),
        },
      });
      break;

    case 'extractContent':
      sendResponse({
        success: true,
        data: {
          content: extractMainContent(),
          images: extractImages(),
          links: extractLinks(),
        },
      });
      break;

    case 'highlightElement':
      highlightElement(message.data.selector);
      sendResponse({ success: true });
      break;

    case 'injectBookmarkButton':
      injectQuickBookmarkButton();
      sendResponse({ success: true });
      break;

    default:
      console.warn('Unknown message action:', message.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }

  return false; // Synchronous response
}

/**
 * Setup page monitoring for dynamic content
 */
function setupPageMonitoring(): void {
  // Monitor URL changes (for SPAs)
  let currentUrl = window.location.href;

  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      pageContext.url = currentUrl;
      pageContext.title = document.title;

      // Notify background of page change
      chrome.runtime
        .sendMessage({
          action: 'pageChanged',
          data: pageContext,
        })
        .catch(() => {
          // Ignore errors if background is not available
        });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Monitor title changes
  const titleObserver = new MutationObserver(() => {
    if (document.title !== pageContext.title) {
      pageContext.title = document.title;
    }
  });

  if (document.querySelector('title')) {
    titleObserver.observe(document.querySelector('title')!, {
      childList: true,
    });
  }
}

/**
 * Setup smart bookmark detection
 */
function setupSmartBookmarkDetection(): void {
  // Detect bookmarkable content
  const detectBookmarkableContent = () => {
    const content = {
      hasArticle: !!document.querySelector('article, .article, [role="article"]'),
      hasVideo: !!document.querySelector('video, iframe[src*="youtube"], iframe[src*="vimeo"]'),
      hasCode: !!document.querySelector('pre, code, .code, .highlight'),
      hasForm: !!document.querySelector('form'),
      isDocumentation: /docs|documentation|guide|tutorial|manual/.test(
        window.location.href.toLowerCase()
      ),
      isGitHub: window.location.hostname.includes('github.com'),
      isStackOverflow: window.location.hostname.includes('stackoverflow.com'),
    };

    return content;
  };

  // Store page classification
  pageContext.classification = detectBookmarkableContent();

  // Auto-categorize bookmarks
  const suggestCategory = () => {
    const { classification } = pageContext;

    if (classification.isGitHub) return 'development';
    if (classification.isStackOverflow) return 'development';
    if (classification.isDocumentation) return 'documentation';
    if (classification.hasVideo) return 'media';
    if (classification.hasArticle) return 'articles';
    if (classification.hasCode) return 'development';

    return 'general';
  };

  pageContext.suggestedCategory = suggestCategory();
}

/**
 * Setup context menu enhancements
 */
function setupContextMenus(): void {
  // Track selection for context menu
  document.addEventListener('mouseup', () => {
    const selectedText = getSelectedText();
    if (selectedText.length > 0) {
      pageContext.lastSelection = {
        text: selectedText,
        timestamp: Date.now(),
      };
    }
  });

  // Track links for context menu
  document.addEventListener('contextmenu', event => {
    const target = event.target as Element;
    const link = target.closest('a');

    if (link) {
      pageContext.lastContextLink = {
        url: link.href,
        text: link.textContent?.trim() || '',
        title: link.title || '',
      };
    }
  });
}

/**
 * Get selected text
 */
function getSelectedText(): string {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

/**
 * Get visible links on the page
 */
function getVisibleLinks(): Array<{ url: string; text: string; title: string }> {
  const links = Array.from(document.querySelectorAll('a[href]'));

  return links
    .filter(link => {
      const rect = link.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    })
    .slice(0, 20) // Limit to first 20 visible links
    .map(link => ({
      url: (link as HTMLAnchorElement).href,
      text: link.textContent?.trim() || '',
      title: link.getAttribute('title') || '',
    }));
}

/**
 * Get page metadata
 */
function getPageMetadata(): any {
  const getMetaContent = (name: string): string => {
    const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta?.getAttribute('content') || '';
  };

  return {
    description: getMetaContent('description') || getMetaContent('og:description'),
    keywords: getMetaContent('keywords'),
    author: getMetaContent('author'),
    ogTitle: getMetaContent('og:title'),
    ogImage: getMetaContent('og:image'),
    ogType: getMetaContent('og:type'),
    twitterCard: getMetaContent('twitter:card'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    language: document.documentElement.lang || '',
  };
}

/**
 * Extract main content from the page
 */
function extractMainContent(): string {
  // Try various content selectors
  const contentSelectors = [
    'article',
    '.article',
    '[role="article"]',
    'main',
    '.main',
    '.content',
    '.post-content',
    '.entry-content',
    '#content',
    '.markdown-body', // GitHub
  ];

  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || '';
    }
  }

  // Fallback: get body text but remove nav, footer, aside
  const body = document.body.cloneNode(true) as HTMLElement;
  const unwantedSelectors = ['nav', 'footer', 'aside', '.sidebar', '.navigation', 'header'];

  unwantedSelectors.forEach(selector => {
    const elements = body.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  return body.textContent?.trim() || '';
}

/**
 * Extract images from the page
 */
function extractImages(): Array<{ src: string; alt: string; title: string }> {
  const images = Array.from(document.querySelectorAll('img[src]'));

  return images
    .filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.width > 100 && rect.height > 100; // Only meaningful images
    })
    .slice(0, 10) // Limit to first 10 images
    .map(img => ({
      src: (img as HTMLImageElement).src,
      alt: img.getAttribute('alt') || '',
      title: img.getAttribute('title') || '',
    }));
}

/**
 * Extract all links from the page
 */
function extractLinks(): Array<{ url: string; text: string; type: string }> {
  const links = Array.from(document.querySelectorAll('a[href]'));

  return links
    .slice(0, 50) // Limit to first 50 links
    .map(link => {
      const href = (link as HTMLAnchorElement).href;
      const text = link.textContent?.trim() || '';

      let type = 'general';
      if (href.includes('github.com')) type = 'github';
      else if (href.includes('docs.') || href.includes('/docs/')) type = 'documentation';
      else if (href.includes('youtube.com') || href.includes('vimeo.com')) type = 'video';
      else if (href.includes('.pdf')) type = 'pdf';
      else if (href.startsWith('mailto:')) type = 'email';
      else if (href.startsWith('tel:')) type = 'phone';

      return { url: href, text, type };
    });
}

/**
 * Highlight element on the page
 */
function highlightElement(selector: string): void {
  // Remove existing highlights
  document.querySelectorAll('.lucaverse-highlight').forEach(el => {
    el.classList.remove('lucaverse-highlight');
  });

  // Add new highlight
  const element = document.querySelector(selector);
  if (element) {
    element.classList.add('lucaverse-highlight');

    // Add highlight styles
    if (!document.getElementById('lucaverse-highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'lucaverse-highlight-styles';
      style.textContent = `
        .lucaverse-highlight {
          outline: 3px solid #3B82F6 !important;
          outline-offset: 2px !important;
          background-color: rgba(59, 130, 246, 0.1) !important;
          border-radius: 4px !important;
          animation: lucaverse-pulse 2s infinite !important;
        }
        
        @keyframes lucaverse-pulse {
          0%, 100% { outline-color: #3B82F6; }
          50% { outline-color: #10B981; }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto-remove highlight after 5 seconds
    setTimeout(() => {
      element.classList.remove('lucaverse-highlight');
    }, 5000);
  }
}

/**
 * Inject quick bookmark button
 */
function injectQuickBookmarkButton(): void {
  // Remove existing button
  const existing = document.getElementById('lucaverse-quick-bookmark');
  if (existing) existing.remove();

  // Create floating bookmark button
  const button = document.createElement('div');
  button.id = 'lucaverse-quick-bookmark';
  button.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999999;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      color: white;
      padding: 12px;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
      user-select: none;
    " title="Save to Lucaverse Hub">
      🔖
    </div>
  `;

  // Add hover effects
  const bookmarkBtn = button.firstElementChild as HTMLElement;
  bookmarkBtn.addEventListener('mouseenter', () => {
    bookmarkBtn.style.transform = 'scale(1.1)';
    bookmarkBtn.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.4)';
  });

  bookmarkBtn.addEventListener('mouseleave', () => {
    bookmarkBtn.style.transform = 'scale(1)';
    bookmarkBtn.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
  });

  // Add click handler
  bookmarkBtn.addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'quickBookmark',
        data: {
          url: window.location.href,
          title: document.title,
          description: getPageMetadata().description,
          category: pageContext.suggestedCategory,
        },
      });

      if (response.success) {
        // Show success feedback
        bookmarkBtn.innerHTML = '✅';
        bookmarkBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';

        setTimeout(() => {
          bookmarkBtn.innerHTML = '🔖';
          bookmarkBtn.style.background = 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save bookmark:', error);

      // Show error feedback
      bookmarkBtn.innerHTML = '❌';
      bookmarkBtn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';

      setTimeout(() => {
        bookmarkBtn.innerHTML = '🔖';
        bookmarkBtn.style.background = 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
      }, 2000);
    }
  });

  document.body.appendChild(button);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('lucaverse-quick-bookmark')) {
      button.remove();
    }
  }, 10000);
}

/**
 * Detect and handle special page types
 */
function handleSpecialPages(): void {
  // GitHub integration
  if (window.location.hostname.includes('github.com')) {
    const repoName = window.location.pathname.split('/')[2];
    if (repoName) {
      pageContext.github = {
        repo: repoName,
        owner: window.location.pathname.split('/')[1],
        isRepo: window.location.pathname.split('/').length === 3,
        isIssue: window.location.pathname.includes('/issues/'),
        isPR: window.location.pathname.includes('/pull/'),
      };
    }
  }

  // Documentation pages
  if (pageContext.classification.isDocumentation) {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h =>
      h.textContent?.trim()
    );
    pageContext.documentation = {
      headings: headings.slice(0, 10),
      hasCodeExamples: !!document.querySelector('pre code, .highlight'),
      hasAPI: /api|reference|method|function/.test(document.body.textContent?.toLowerCase() || ''),
    };
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}

// Handle special pages
handleSpecialPages();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeContentScript,
    getPageMetadata,
    extractMainContent,
    getSelectedText,
  };
}

console.log('Lucaverse Hub content script loaded');
