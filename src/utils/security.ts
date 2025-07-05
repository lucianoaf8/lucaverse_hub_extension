/**
 * Security - Production security configuration and utilities
 * Implements CSP, input sanitization, secure storage, and security headers
 */

export interface SecurityConfig {
  enableCSP: boolean;
  enableXSSProtection: boolean;
  enableInputSanitization: boolean;
  enableSecureStorage: boolean;
  enableRateLimiting: boolean;
  enableSecurityHeaders: boolean;
  cspDirectives: Record<string, string[]>;
  rateLimitRules: Array<{ path: string; maxRequests: number; windowMs: number }>;
}

class SecurityManager {
  private config: SecurityConfig;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableCSP: true,
      enableXSSProtection: true,
      enableInputSanitization: true,
      enableSecureStorage: true,
      enableRateLimiting: true,
      enableSecurityHeaders: true,
      cspDirectives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.lucaverse.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'connect-src': ["'self'", 'https://api.lucaverse.com', 'wss://api.lucaverse.com'],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': []
      },
      rateLimitRules: [
        { path: '/api/', maxRequests: 100, windowMs: 60000 },
        { path: '/auth/', maxRequests: 5, windowMs: 60000 }
      ],
      ...config
    };

    this.initializeSecurity();
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input: string): string {
    if (!this.config.enableInputSanitization) return input;

    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate and sanitize HTML content
   */
  sanitizeHTML(html: string): string {
    if (!this.config.enableInputSanitization) return html;

    // Remove dangerous tags and attributes
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input'];
    const dangerousAttributes = ['onload', 'onclick', 'onmouseover', 'onerror', 'javascript:'];

    let sanitized = html;

    // Remove dangerous tags
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove dangerous attributes
    dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`${attr}="[^"]*"`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  /**
   * Secure storage wrapper
   */
  secureStorage = {
    setItem: (key: string, value: string): void => {
      if (!this.config.enableSecureStorage) {
        localStorage.setItem(key, value);
        return;
      }

      try {
        // Simple encryption (in production, use proper encryption)
        const encrypted = btoa(value);
        localStorage.setItem(key, encrypted);
      } catch (error) {
        console.error('Secure storage setItem failed:', error);
      }
    },

    getItem: (key: string): string | null => {
      if (!this.config.enableSecureStorage) {
        return localStorage.getItem(key);
      }

      try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;

        // Simple decryption (in production, use proper encryption)
        return atob(encrypted);
      } catch (error) {
        console.error('Secure storage getItem failed:', error);
        return null;
      }
    },

    removeItem: (key: string): void => {
      localStorage.removeItem(key);
    }
  };

  /**
   * Check rate limiting for requests
   */
  checkRateLimit(path: string, clientId: string): boolean {
    if (!this.config.enableRateLimiting) return true;

    const rule = this.config.rateLimitRules.find(r => path.startsWith(r.path));
    if (!rule) return true;

    const key = `${clientId}:${rule.path}`;
    const now = Date.now();
    const entry = this.requestCounts.get(key);

    if (!entry || now > entry.resetTime) {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + rule.windowMs
      });
      return true;
    }

    entry.count++;
    return entry.count <= rule.maxRequests;
  }

  /**
   * Generate Content Security Policy header
   */
  generateCSPHeader(): string {
    if (!this.config.enableCSP) return '';

    const directives = Object.entries(this.config.cspDirectives)
      .map(([directive, sources]) => {
        if (sources.length === 0) return directive;
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');

    return directives;
  }

  /**
   * Apply security headers
   */
  applySecurityHeaders(): void {
    if (!this.config.enableSecurityHeaders || typeof document === 'undefined') return;

    // Add CSP meta tag
    if (this.config.enableCSP) {
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = this.generateCSPHeader();
      document.head.appendChild(cspMeta);
    }

    // Add other security headers via meta tags
    const headers = [
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
      { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    headers.forEach(header => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header.httpEquiv;
      meta.content = header.content;
      document.head.appendChild(meta);
    });
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string): boolean {
    // In production, implement proper CSRF validation
    const expectedToken = this.secureStorage.getItem('csrf-token');
    return token === expectedToken;
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Audit security configuration
   */
  auditSecurity(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (!this.config.enableCSP) {
      issues.push('Content Security Policy is disabled');
      recommendations.push('Enable CSP to prevent XSS attacks');
      score -= 20;
    }

    if (!this.config.enableInputSanitization) {
      issues.push('Input sanitization is disabled');
      recommendations.push('Enable input sanitization to prevent injection attacks');
      score -= 25;
    }

    if (!this.config.enableSecureStorage) {
      issues.push('Secure storage is disabled');
      recommendations.push('Enable secure storage for sensitive data');
      score -= 15;
    }

    if (!this.config.enableRateLimiting) {
      issues.push('Rate limiting is disabled');
      recommendations.push('Enable rate limiting to prevent abuse');
      score -= 10;
    }

    // Check for insecure CSP directives
    if (this.config.cspDirectives['script-src']?.includes("'unsafe-eval'")) {
      issues.push("CSP allows 'unsafe-eval' for scripts");
      recommendations.push("Remove 'unsafe-eval' from script-src directive");
      score -= 15;
    }

    return { score: Math.max(0, score), issues, recommendations };
  }

  private initializeSecurity(): void {
    // Apply security headers
    this.applySecurityHeaders();

    // Generate and store CSRF token
    if (!this.secureStorage.getItem('csrf-token')) {
      const csrfToken = this.generateSecureToken();
      this.secureStorage.setItem('csrf-token', csrfToken);
    }

    // Override console methods in production to prevent information leakage
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
      // Keep warn and error for important messages
    }

    console.log('Security manager initialized');
  }
}

// Global security manager instance
export const globalSecurity = new SecurityManager();

// Make security manager available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__SECURITY__ = globalSecurity;
}

export default SecurityManager;