import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="min-h-screen">
      <router-outlet></router-outlet>
    </main>
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">DICASA</h3>
            <p class="text-gray-400">
              Find your dream property with our award-winning service and get
              the best deals in the market.
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-gray-400 hover:text-white">About Us</a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white"
                  >Properties</a
                >
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white">Services</a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white">Contact</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Contact Info</h4>
            <ul class="space-y-2 text-gray-400">
              <li class="flex items-start">
                <i class="fas fa-map-marker-alt mt-1 mr-2"></i>
                <span>123 Real Estate, New York, NY 10001</span>
              </li>
              <li class="flex items-center">
                <i class="fas fa-phone-alt mr-2"></i>
                <span>+1 (555) 123-4567</span>
              </li>
              <li class="flex items-center">
                <i class="fas fa-envelope mr-2"></i>
                <span>"infodicasa.com"</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Newsletter</h4>
            <p class="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <div class="flex">
              <input
                type="email"
                placeholder="Your email"
                class="px-4 py-2 rounded-l-lg w-full focus:outline-none text-gray-900"
              />
              <button
                class="bg-indigo-600 hover:bg-indigo-700 px-4 rounded-r-lg"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        <div
          class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400"
        >
          <p>&copy; 2023 DICASA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [],
})
export class AppComponent {}
