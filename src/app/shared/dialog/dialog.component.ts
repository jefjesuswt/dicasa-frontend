import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { trigger, style, animate, transition } from "@angular/animations";

@Component({
  selector: "shared-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dialog.component.html",
  animations: [
    trigger("backdropFade", [
      transition(":enter", [
        style({ opacity: 0 }), // Estado inicial
        animate("200ms ease-out", style({ opacity: 1 })),
      ]),

      transition(":leave", [animate("150ms ease-in", style({ opacity: 0 }))]),
    ]),

    trigger("panelScale", [
      transition(":enter", [
        style({ opacity: 0, transform: "scale(0.95)" }),
        animate("200ms ease-out", style({ opacity: 1, transform: "scale(1)" })), // Final
      ]),
      transition(":leave", [
        animate(
          "150ms ease-in",
          style({ opacity: 0, transform: "scale(0.95)" })
        ),
      ]),
    ]),
  ],
})
export class DialogComponent {
  @Input() isOpen = false;
  @Input() title = "Dialogo";
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
