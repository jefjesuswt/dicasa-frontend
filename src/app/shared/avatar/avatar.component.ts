import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { computed } from "@angular/core";

@Component({
  selector: "shared-avatar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="imageUrlToDisplay"
      (error)="onImageError($event)"
      [alt]="alt"
      class="w-full h-full rounded-full object-cover"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block",
  },
})
export class AvatarComponent {
  @Input() src: string | null | undefined = null;

  @Input() id: string | null | undefined = "User";

  @Input() alt: string = "Avatar de perfil";

  get imageUrlToDisplay(): string {
    if (this.src) {
      return this.src;
    }
    const seed = this.id || "User";
    return `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`;
  }

  onImageError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = `https://api.dicebear.com/8.x/avataaars/svg?seed=${
      this.id || "User"
    }`;
  }
}
