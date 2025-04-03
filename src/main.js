import './style.css';
import { setupNavigation } from './navigation';
import { setupRoutes } from './routes';
import { initSupabase } from './supabase';

// Initialize Supabase
initSupabase();

// Setup navigation and routing
document.querySelector('#app').innerHTML = `
  <nav class="navbar">
    <div class="logo font-bold text-xl">MuseMap</div>
    <ul class="nav-links">
      <li><a href="/" class="active">Home</a></li>
      <li><a href="/booking">Booking</a></li>
      <li><a href="/chatbot">Chatbot</a></li>
      <li><a href="/quiz">Quiz</a></li>
      <li><a href="/admin">Admin</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/login">Login</a></li>
    </ul>
  </nav>
  <main id="main-content"></main>
  <footer class="footer">
    <div class="footer-links">
      <a href="#">Contact Us</a>
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Service</a>
      <a href="/about">About</a>
    </div>
    <div class="social-icons">
      <span>📘</span> <span>🐦</span> <span>📸</span>
    </div>
    <p>&copy; 2025 MuseMap. All rights reserved.</p>
  </footer>
`;

setupNavigation();
setupRoutes();