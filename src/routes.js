import { renderHome } from './pages/home';
import { renderLogin } from './pages/login';
import { renderRegister } from './pages/register';
import { renderMuseums } from './pages/museums';
import { renderMuseumDetails } from './pages/museum-details';
import { renderBooking } from './pages/booking';
import { renderPayment } from './pages/payment';

export function setupRoutes() {
  const mainContent = document.getElementById('main-content');
  
  function handleRoute() {
    const path = window.location.pathname;
    
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
        if (path.startsWith('/museum/')) {
          const id = path.split('/')[2];
          renderMuseumDetails(mainContent, id);
        } else {
          mainContent.innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }
  }

  window.addEventListener('popstate', handleRoute);
  handleRoute();
}