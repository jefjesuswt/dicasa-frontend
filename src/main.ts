import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Initialize theme early to prevent flash
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark' || savedTheme === null;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

initTheme();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
