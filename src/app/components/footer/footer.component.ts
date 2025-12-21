import { ChangeDetectionStrategy, Component, inject, computed } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ThemeService } from "../../services/theme.service";

@Component({
  selector: "app-footer",
  imports: [RouterLink],
  templateUrl: "./footer.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent {
  private themeService = inject(ThemeService);
  public isDarkMode = computed(() => this.themeService.isDarkMode());
}
