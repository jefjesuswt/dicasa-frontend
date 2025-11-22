// src/app/services/seo.service.ts
import { DOCUMENT, Injectable, inject } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";

@Injectable({
  providedIn: "root",
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  updateSeoData(title: string, description: string, imageUrl?: string) {
    const fullTitle = `${title} | Dicasa Group`;
    this.titleService.setTitle(fullTitle);

    this.metaService.updateTag({ name: "description", content: description });

    this.metaService.updateTag({ property: "og:title", content: fullTitle });
    this.metaService.updateTag({
      property: "og:description",
      content: description,
    });

    if (imageUrl) {
      this.metaService.updateTag({ property: "og:image", content: imageUrl });
      this.metaService.updateTag({ name: "twitter:image", content: imageUrl });
    }

    this.metaService.updateTag({ name: "twitter:title", content: fullTitle });
    this.metaService.updateTag({
      name: "twitter:description",
      content: description,
    });
  }

  private doc = inject(DOCUMENT);

  createCanonicalLink() {
    const url = this.doc.URL.split("?")[0];

    let link: HTMLLinkElement =
      this.doc.querySelector('link[rel="canonical"]') ||
      this.doc.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", url);

    if (!link.parentNode) {
      this.doc.head.appendChild(link);
    }
  }
}
