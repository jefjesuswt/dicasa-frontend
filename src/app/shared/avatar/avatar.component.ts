import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { computed } from "@angular/core";

@Component({
  selector: "shared-avatar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="avatarUrl()"
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

  public avatarUrl = computed(() => {
    if (this.src) {
      return this.src;
    }

    return `https://api.dicebear.com/8.x/avataaars/svg?seed=${
      this.id || "User"
    }`;
  });

  onImageError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = `https://api.dicebear.com/8.x/avataaars/svg?seed=${
      this.id || "User"
    }`;
  }
}
