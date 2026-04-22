import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TaskStore } from '@core/state/task.store';
import { Subtask, TaskStatus } from '@shared/models/task.model';
import { CreateTaskRequestDto, UpdateTaskRequestDto } from './data-access/task.dto';

type SubtaskFormGroup = FormGroup<{
  id: FormControl<number | null>;
  description: FormControl<string>;
  completed: FormControl<boolean>;
}>;

type TaskFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  executionDate: FormControl<string>;
  status: FormControl<TaskStatus>;
  subtasks: FormArray<SubtaskFormGroup>;
}>;

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent {
  private readonly taskStore = inject(TaskStore);

  readonly taskId = input<number | null>(null);
  readonly open = input<boolean>(false);
  readonly saved = output<void>();
  readonly closed = output<void>();

  protected readonly loadingTask = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly form: TaskFormGroup = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(4000)]
    }),
    executionDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    status: new FormControl<TaskStatus>('PROGRAMADO', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    subtasks: new FormArray<SubtaskFormGroup>([])
  });

  protected readonly subtasks = this.form.controls.subtasks;
  protected readonly isEditMode = computed(() => this.taskId() !== null);
  protected readonly canSubmit = computed(
    () => !this.submitting() && !this.loadingTask() && this.form.valid
  );
  protected readonly modalTitle = computed(() =>
    this.isEditMode() ? 'Editar tarea' : 'Crear tarea'
  );
  protected readonly statusOptions: ReadonlyArray<{ label: string; value: TaskStatus }> = [
    { label: 'Programado', value: 'PROGRAMADO' },
    { label: 'En ejecucion', value: 'EN_EJECUCION' },
    { label: 'Finalizada', value: 'FINALIZADA' },
    { label: 'Cancelada', value: 'CANCELADA' }
  ];

  private readonly formModeEffect = effect(() => {
    if (!this.open()) {
      return;
    }

    const currentTaskId = this.taskId();
    if (currentTaskId === null) {
      this.resetForCreateMode();
      return;
    }

    void this.populateForEditMode(currentTaskId);
  });

  protected addSubtask(): void {
    this.subtasks.push(this.buildSubtaskFormGroup());
  }

  protected removeSubtask(index: number): void {
    this.subtasks.removeAt(index);
    this.subtasks.markAsDirty();
  }

  protected trackBySubtaskIndex(index: number): number {
    return index;
  }

  protected closeForm(): void {
    if (this.submitting()) {
      return;
    }
    this.closed.emit();
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    try {
      const success = this.isEditMode()
        ? await this.updateTask()
        : await this.createTask();

      if (!success) {
        this.submitError.set('No se pudo guardar la tarea. Intenta nuevamente.');
        return;
      }

      this.saved.emit();
      this.closed.emit();
    } finally {
      this.submitting.set(false);
    }
  }

  private async createTask(): Promise<boolean> {
    const payload: CreateTaskRequestDto = {
      title: this.form.controls.title.value.trim(),
      description: this.normalizeDescription(this.form.controls.description.value),
      executionDate: this.form.controls.executionDate.value,
      status: this.form.controls.status.value,
      subtasks: this.normalizedSubtasks().map((subtask) => ({
        description: subtask.description,
        completed: subtask.completed
      }))
    };

    const created = await this.taskStore.createTask(payload);
    return created !== null;
  }

  private async updateTask(): Promise<boolean> {
    const currentTaskId = this.taskId();
    if (currentTaskId === null) {
      return false;
    }

    const payload: UpdateTaskRequestDto = {
      title: this.form.controls.title.value.trim(),
      description: this.normalizeDescription(this.form.controls.description.value),
      executionDate: this.form.controls.executionDate.value,
      status: this.form.controls.status.value,
      subtasks: this.normalizedSubtasks().map((subtask) => ({
        id: subtask.id ?? undefined,
        description: subtask.description,
        completed: subtask.completed
      }))
    };

    const updated = await this.taskStore.updateTask(currentTaskId, payload);
    return updated !== null;
  }

  private async populateForEditMode(taskId: number): Promise<void> {
    this.loadingTask.set(true);
    this.submitError.set(null);

    try {
      const task = await this.taskStore.loadTaskById(taskId);
      if (!task) {
        this.submitError.set('No se pudo cargar la tarea para edicion.');
        return;
      }

      this.form.patchValue({
        title: task.title,
        description: task.description ?? '',
        executionDate: this.toDateTimeLocal(task.executionDate),
        status: task.status
      });

      this.subtasks.clear();
      task.subtasks.forEach((subtask) => this.subtasks.push(this.buildSubtaskFormGroup(subtask)));
      this.form.markAsPristine();
    } finally {
      this.loadingTask.set(false);
    }
  }

  private resetForCreateMode(): void {
    this.submitError.set(null);
    this.form.reset({
      title: '',
      description: '',
      executionDate: this.defaultExecutionDate(),
      status: 'PROGRAMADO'
    });
    this.subtasks.clear();
    this.subtasks.push(this.buildSubtaskFormGroup());
    this.form.markAsPristine();
  }

  private buildSubtaskFormGroup(subtask?: Partial<Subtask>): SubtaskFormGroup {
    return new FormGroup({
      id: new FormControl(subtask?.id ?? null),
      description: new FormControl(subtask?.description ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(2000)]
      }),
      completed: new FormControl(Boolean(subtask?.completed), { nonNullable: true })
    });
  }

  private normalizedSubtasks(): Array<{ id: number | null; description: string; completed: boolean }> {
    return this.subtasks.controls
      .map((group) => ({
        id: group.controls.id.value,
        description: group.controls.description.value.trim(),
        completed: group.controls.completed.value
      }))
      .filter((subtask) => subtask.description.length > 0);
  }

  private normalizeDescription(value: string): string | null {
    const description = value.trim();
    return description.length > 0 ? description : null;
  }

  private defaultExecutionDate(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  private toDateTimeLocal(value: string): string {
    if (!value) {
      return this.defaultExecutionDate();
    }

    if (value.length >= 16) {
      return value.slice(0, 16);
    }
    return this.defaultExecutionDate();
  }
}
