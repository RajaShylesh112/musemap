/**
 * Navigation Setup
 * Handles client-side navigation for internal links
 */

/**
 * Sets up client-side navigation for all internal links
 * Intercepts clicks on internal links and handles them with the History API
 */
export function setupNavigation() {
  // Add click event listeners to all anchor tags
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Check if the link is internal (starts with '/')
      if (link.getAttribute('href').startsWith('/')) {
        // Prevent default navigation
        e.preventDefault();
        // Get the target path
        const path = link.getAttribute('href');
        // Update browser history
        window.history.pushState({}, '', path);
        // Trigger popstate event to handle route change
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  });
}