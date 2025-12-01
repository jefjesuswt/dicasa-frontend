import {
  Component,
  Input,
  forwardRef,
  signal,
  computed,
  ElementRef,
  HostListener,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-custom-datepicker",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./custom-datepicker.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatepickerComponent),
      multi: true,
    },
  ],
})
export class CustomDatepickerComponent implements ControlValueAccessor {
  private elementRef = inject(ElementRef);

  disabledDatesSignal = signal<Date[]>([]);
  @Input() set disabledDates(value: Date[]) {
    this.disabledDatesSignal.set(value);
  }
  @Input() minDate?: Date;
  @Input() placeholder: string = "SELECCIONAR FECHA...";

  isOpen = signal(false);
  currentViewDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  // Por defecto empezamos a las 9:00 AM
  selectedHour = signal(9);
  selectedMinute = signal(0);

  daysInMonth = computed(() => {
    const viewDate = this.currentViewDate();
    if (!viewDate || isNaN(viewDate.getTime())) return [];

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const date = new Date(year, month, 1);
    const days: (Date | null)[] = [];

    const firstDayIndex = date.getDay();

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  });

  onChange: any = () => { };
  onTouch: any = () => { };
  isDisabled = false;

  @HostListener("document:click", ["$event"])
  onClickOutside(event: MouseEvent) {
    if (!this.isOpen()) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeCalendar();
    }
  }

  writeValue(value: any): void {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        this.selectedDate.set(date);
        this.selectedHour.set(date.getHours());
        this.selectedMinute.set(date.getMinutes());
        this.currentViewDate.set(date);
      }
    } else {
      this.selectedDate.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggleCalendar() {
    if (!this.isDisabled) {
      this.isOpen.update((v) => !v);
      if (!this.isOpen()) this.onTouch();
    }
  }

  closeCalendar() {
    this.isOpen.set(false);
    this.onTouch();
  }

  changeMonth(delta: number) {
    const newDate = new Date(this.currentViewDate());
    newDate.setMonth(newDate.getMonth() + delta);
    this.currentViewDate.set(newDate);
  }

  selectDate(date: Date) {
    if (this.isDateDisabled(date)) return;

    const finalDate = new Date(date);

    // Al seleccionar fecha, verificar si la hora actual (selectedHour) está bloqueada en esa nueva fecha
    // Si está bloqueada, buscar la primera disponible desde las 8 o desde la actual
    if (this.isTimeBlockedOnDate(date, this.selectedHour())) {
      const firstFree = this.findFirstAvailableHour(date);
      if (firstFree !== null) {
        this.selectedHour.set(firstFree);
      }
    }

    finalDate.setHours(this.selectedHour());
    finalDate.setMinutes(this.selectedMinute());

    this.selectedDate.set(finalDate);
    this.onChange(finalDate);
  }

  private isTimeBlockedOnDate(date: Date, hour: number): boolean {
    const blocked = this.getBlockedHours(date);
    if (blocked.has(hour)) return true;

    // Validar horas pasadas si es hoy
    if (this.isToday(date)) {
      const now = new Date();
      // Bloqueamos si la hora es menor o igual a la actual
      // Ejemplo: Son las 14:15. Bloqueamos 14, 13, 12...
      if (hour <= now.getHours()) return true;
    }

    return false;
  }

  private findFirstAvailableHour(date: Date): number | null {
    // Buscar entre 8 y 18
    for (let h = 8; h <= 18; h++) {
      if (!this.isTimeBlockedOnDate(date, h)) return h;
    }
    return null; // Día completo ocupado
  }

  private isToday(date: Date): boolean {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  updateTime(type: "hour" | "minute", increment: number) {
    if (type === "hour") {
      let h = this.selectedHour() + increment;
      if (h > 18) h = 8;
      if (h < 8) h = 18;
      this.selectedHour.set(h);
    } else {
      let m = this.selectedMinute() + increment;
      if (m >= 60) m = 0;
      if (m < 0) m = 30;
      this.selectedMinute.set(m);
    }

    // Validar si la nueva hora está bloqueada
    // Si está bloqueada, intentamos buscar la siguiente libre (solo si cambiamos hora)
    if (type === 'hour' && this.isTimeBlocked(this.selectedHour())) {
      this.findNextAvailableHour(increment);
    }

    if (this.selectedDate()) {
      const updated = new Date(this.selectedDate()!);
      updated.setHours(this.selectedHour());
      updated.setMinutes(this.selectedMinute());

      // Si aun asi es invalido (ej. cambio de minutos en hora bloqueada), no emitimos o mostramos error?
      // Mejor forzamos una hora valida si es posible.
      if (this.isTimeBlocked(this.selectedHour())) {
        // Si la hora actual está bloqueada (ej. por cambio de fecha o minuto), buscar una libre
        this.findNextAvailableHour(1);
        updated.setHours(this.selectedHour());
      }

      this.selectedDate.set(updated);
      this.onChange(updated);
    }
  }

  private findNextAvailableHour(direction: number) {
    let h = this.selectedHour();
    let attempts = 0;
    // Evitar loop infinito
    while (this.isTimeBlocked(h) && attempts < 24) {
      h += direction;
      if (h > 18) h = 8;
      if (h < 8) h = 18;
      attempts++;
    }
    // Si encontramos una libre, la seteamos
    if (!this.isTimeBlocked(h)) {
      this.selectedHour.set(h);
    }
  }

  isTimeBlocked(hour: number): boolean {
    if (!this.selectedDate()) return false;
    return this.isTimeBlockedOnDate(this.selectedDate()!, hour);
  }

  private getBlockedHours(date: Date): Set<number> {
    const blocked = new Set<number>();
    if (!date) return blocked;

    this.disabledDatesSignal().forEach((d) => {
      const occ = new Date(d);
      // Verificar si es el mismo día
      if (
        occ.getDate() === date.getDate() &&
        occ.getMonth() === date.getMonth() &&
        occ.getFullYear() === date.getFullYear()
      ) {
        const h = occ.getHours();
        blocked.add(h);
        blocked.add(h + 1); // Bloquear la siguiente hora también
      }
    });
    return blocked;
  }

  isDateDisabled(date: Date): boolean {
    const now = new Date();

    // Normalizar fechas a medianoche para comparar solo días
    const dateMidnight = new Date(date);
    dateMidnight.setHours(0, 0, 0, 0);

    const nowMidnight = new Date(now);
    nowMidnight.setHours(0, 0, 0, 0);

    // 1. Fin de semana
    const day = date.getDay();
    if (day === 0 || day === 6) return true;

    // 2. Pasado (minDate)
    if (this.minDate) {
      const minMidnight = new Date(this.minDate);
      minMidnight.setHours(0, 0, 0, 0);
      if (dateMidnight < minMidnight) return true;
    }

    // 3. REGLA ESPECIAL DE LAS 18:00
    // Si la fecha es HOY y ya son las 18:00 o más... bloquear HOY.
    if (dateMidnight.getTime() === nowMidnight.getTime()) {
      if (now.getHours() >= 18) {
        return true;
      }
    }

    // 4. Fechas ocupadas (backend) - YA NO BLOQUEAMOS EL DÍA ENTERO
    // Queremos que el usuario pueda entrar y ver las horas ocupadas.
    return false;
  }

  unavailableHours = computed(() => {
    const date = this.selectedDate();
    if (!date) return [];

    const blockedHours = this.getBlockedHours(date);
    const result: Date[] = [];

    blockedHours.forEach(h => {
      const d = new Date(date);
      d.setHours(h, 0, 0, 0);
      result.push(d);
    });

    return result.sort((a, b) => a.getTime() - b.getTime());
  });

  formatHour(date: Date): string {
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes} ${ampm}`;
  }

  formatDate(date: Date | null): string {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime =
      hours + ":" + date.getMinutes().toString().padStart(2, "0") + " " + ampm;

    return `${day}/${month}/${year} ${strTime}`;
  }
}
