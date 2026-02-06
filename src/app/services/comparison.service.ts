import {
  Injectable,
  signal,
  computed,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { Property } from '../interfaces/properties/property.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ComparisonService {
  private readonly STORAGE_KEY = 'dicasa_comparison_list';
  private readonly MAX_PROPERTIES = 3;

  // Signal principal para la lista de propiedades
  private propertiesSignal = signal<Property[]>([]);

  // Computed signal para saber cuántas hay seleccionadas
  count = computed(() => this.propertiesSignal().length);

  // Computed signal para exponer la lista públicamente (readonly)
  selectedProperties = computed(() => this.propertiesSignal());

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromStorage();
  }

  // Cargar desde localStorage al iniciar
  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.propertiesSignal.set(parsed);
          }
        } catch (e) {
          console.error('Error parsing comparison list', e);
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    }
  }

  // Guardar en localStorage cada vez que cambia
  private saveToStorage(properties: Property[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(properties));
    }
  }

  /**
   * Agrega o quita una propiedad de la comparación.
   * Retorna true si se agregó, false si se quitó o no se pudo agregar (límite alcanzado).
   */
  toggleProperty(property: Property): boolean {
    const current = this.propertiesSignal();
    const exists = current.some((p) => p._id === property._id);

    if (exists) {
      this.removeProperty(property._id);
      return false; // Removed
    } else {
      if (current.length >= this.MAX_PROPERTIES) {
        // Opcional: Podríamos emitir un error o notificación aquí si quisiéramos
        return false; // Limit reached
      }
      this.addProperty(property);
      return true; // Added
    }
  }

  addProperty(property: Property): void {
    this.propertiesSignal.update((props) => {
      const newProps = [...props, property];
      this.saveToStorage(newProps);
      return newProps;
    });
  }

  removeProperty(propertyId: string): void {
    this.propertiesSignal.update((props) => {
      const newProps = props.filter((p) => p._id !== propertyId);
      this.saveToStorage(newProps);
      return newProps;
    });
  }

  clear(): void {
    this.propertiesSignal.set([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  isPropertySelected(propertyId: string): boolean {
    return this.propertiesSignal().some((p) => p._id === propertyId);
  }
}
