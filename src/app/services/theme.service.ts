import {
    Injectable,
    signal,
    computed,
    inject,
    PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
    providedIn: "root",
})
export class ThemeService {
    private platformId = inject(PLATFORM_ID);
    private _isDarkMode = signal<boolean>(true); // Default to dark mode

    public isDarkMode = computed(() => this._isDarkMode());

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.initializeTheme();
        }
    }

    /**
     * Initialize theme from localStorage
     */
    private initializeTheme(): void {
        const savedTheme = localStorage.getItem("theme");
        const isDark = savedTheme === "dark" || savedTheme === null; // Default to dark if no preference
        this._isDarkMode.set(isDark);
        this.applyTheme(isDark);
    }

    /**
     * Toggle between dark and light mode
     */
    public toggleTheme(): void {
        const newMode = !this._isDarkMode();
        this._isDarkMode.set(newMode);
        this.applyTheme(newMode);
        this.saveTheme(newMode);
    }

    /**
     * Apply theme to document element
     */
    private applyTheme(isDark: boolean): void {
        if (isPlatformBrowser(this.platformId)) {
            if (isDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    }

    /**
     * Save theme preference to localStorage
     */
    private saveTheme(isDark: boolean): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("theme", isDark ? "dark" : "light");
        }
    }
}
