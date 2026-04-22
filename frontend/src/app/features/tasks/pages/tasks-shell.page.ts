import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TasksListComponent } from '../ui/tasks-list/tasks-list.component';

@Component({
  selector: 'app-tasks-shell-page',
  imports: [TasksListComponent],
  templateUrl: './tasks-shell.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksShellPage {}
