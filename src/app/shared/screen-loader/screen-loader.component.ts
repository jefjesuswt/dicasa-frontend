import { Component } from "@angular/core";

@Component({
  selector: "shared-screen-loader",
  standalone: true,
  template: `
    <div
      class="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-9998"
    ></div>

    <div class="fixed inset-0 flex items-center justify-center z-9999">
      <div
        class="h-16 w-16 animate-spin rounded-full border-4 border-solid border-sky-600 border-t-transparent"
        role="status"
      >
        <span class="sr-only">Cargando...</span>
      </div>
    </div>
  `,
})
export class ScreenLoaderComponent {}
