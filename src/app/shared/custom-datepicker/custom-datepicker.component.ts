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

  @Input() disabledDates: Date[] = [];
  @Input() minDate?: Date;
  @Input() placeholder: string = "SELECCIONAR FECHA...";

  isOpen = signal(false);
  currentViewDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  // Por defecto empezamos a las 9:00 AM
  selectedHour = signal(9);
  selectedMinute = signal(0);

  daysInMonth = computed(() => {
    const year = this.currentViewDate().getFullYear();
    const month = this.currentViewDate().getMonth();
    const date = new Date(year, month, 1);
    const days = [];

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

  onChange: any = () => {};
  onTouch: any = () => {};
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
    finalDate.setHours(this.selectedHour());
    finalDate.setMinutes(this.selectedMinute());

    this.selectedDate.set(finalDate);
    this.onChange(finalDate);
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

    if (this.selectedDate()) {
      const updated = new Date(this.selectedDate()!);
      updated.setHours(this.selectedHour());
      updated.setMinutes(this.selectedMinute());
      this.selectedDate.set(updated);
      this.onChange(updated);
    }
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

    // 4. Fechas ocupadas (backend)
    return this.disabledDates.some((occupied) => {
      const occ = new Date(occupied);
      return (
        occ.getDate() === date.getDate() &&
        occ.getMonth() === date.getMonth() &&
        occ.getFullYear() === date.getFullYear()
      );
    });
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
