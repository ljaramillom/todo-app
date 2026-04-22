import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section
      class="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <p class="text-sm font-medium uppercase tracking-wide text-primary">404</p>
      <h1 class="text-3xl font-bold">Ruta no encontrada</h1>
      <p class="text-base-content/70">
        La vista que buscas no existe en esta fase inicial del frontend.
      </p>
      <a routerLink="/" class="btn btn-primary">Volver al inicio</a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPage {}
