/**
 * Client-side Routing Configuration
 * Handles page rendering based on URL paths
 */

import { renderHome } from './pages/home';
import { renderLogin } from './pages/login';
import { renderRegister } from './pages/register';
import { renderMuseums } from './pages/museums';
import { renderMuseumDetails } from './pages/museum-details';
import { renderBooking } from './pages/booking';
import { renderPayment } from './pages/payment';

/**
 * Sets up client-side routing
 * Initializes route handling and page rendering
 */
export function setupRoutes() {
  const mainContent = document.getElementById('main-content');
  
  /**
   * Handles route changes and renders appropriate content
   * @private
   */
  function handleRoute() {
    const path = window.location.pathname;
    
    // Route matching and content rendering
    switch(path) {
      case '/':
        renderHome(mainContent);
        break;
      case '/login':
        renderLogin(mainContent);
        break;
      case '/register':
        renderRegister(mainContent);
        break;
      case '/museums':
        renderMuseums(mainContent);
        break;
      case '/booking':
        renderBooking(mainContent);
        break;
      case '/payment':
        renderPayment(mainContent);
        break;
      default:
        // Handle dynamic museum detail routes
        if (path.startsWith('/museum/')) {
          const id = path.split('/')[2];
          renderMuseumDetails(mainContent, id);
        } else {
          // 404 - Page Not Found
          mainContent.innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }
  }

  // Set up event listeners for browser navigation
  window.addEventListener('popstate', handleRoute);
  // Initial route handling
  handleRoute();
}