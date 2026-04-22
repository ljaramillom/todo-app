import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirmar');
  readonly message = input('');
  readonly confirmLabel = input('Aceptar');
  readonly cancelLabel = input('Cancelar');
  readonly confirmDanger = input(true);

  readonly confirm = output<void>();
  readonly closed = output<void>();

  protected onConfirm(): void {
    this.confirm.emit();
  }

  protected onDismiss(): void {
    this.closed.emit();
  }
}
