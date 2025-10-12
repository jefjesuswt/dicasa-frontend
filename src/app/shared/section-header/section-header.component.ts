import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'shared-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center mb-12" [class]="containerClass">
      <h2 
        class="text-3xl font-bold text-gray-900 mb-2"
        [class]="titleClass"
      >
        {{ title }}
      </h2>
      <p 
        *ngIf="subtitle" 
        class="text-gray-600 max-w-2xl mx-auto"
        [class]="subtitleClass"
      >
        {{ subtitle }}
      </p>
    </div>
  `,
  styles: []
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  
  // Optional custom classes
  @Input() containerClass: string = '';
  @Input() titleClass: string = '';
  @Input() subtitleClass: string = '';
}
