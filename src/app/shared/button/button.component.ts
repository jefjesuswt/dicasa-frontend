import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'shared-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onClick.emit($event)"
      [type]="type"
      [disabled]="disabled"
      [class]="getButtonClasses()"
      [ngClass]="{
        'opacity-50 cursor-not-allowed': loading || disabled
      }"
    >
      <span *ngIf="loading" class="inline-block animate-spin mr-2">
        <i class="fas fa-spinner"></i>
      </span>
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() customClass: string = '';
  
  @Output() onClick = new EventEmitter<MouseEvent>();

  getButtonClasses(): string {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-lg',
      'font-medium',
      'transition-colors',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-sky-500',
      this.fullWidth ? 'w-full' : ''
    ];

    const variantClasses = {
      primary: 'bg-sky-600 text-white hover:bg-sky-700',
      secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
      outline: 'border border-sky-600 text-sky-600 hover:bg-sky-50',
      ghost: 'bg-transparent text-sky-600 hover:bg-sky-50',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return [
      ...baseClasses,
      variantClasses[this.variant],
      sizeClasses[this.size],
      this.customClass
    ].join(' ');
  }
}
