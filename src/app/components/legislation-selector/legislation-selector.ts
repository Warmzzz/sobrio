import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { getLegislation, LEGISLATIONS } from '../../core/legislation';
import { Legislation } from '../../core/preferences';
import { PreferencesService } from '../../services/preferences-service';
import { formatNumber } from '../../utils/format';

type SaveStatus = 'idle' | 'saved' | 'error';

@Component({
  selector: 'app-legislation-selector',
  imports: [ReactiveFormsModule, Message, Select],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './legislation-selector.html',
  styleUrl: './legislation-selector.scss',
})
export class LegislationSelector implements OnInit {
  private readonly preferencesService = inject(PreferencesService);

  protected readonly options = LEGISLATIONS;
  protected readonly legislation = new FormControl<Legislation>('be', { nonNullable: true });
  protected readonly status = signal<SaveStatus>('idle');

  private readonly selected = signal<Legislation>(this.legislation.value);
  protected readonly limit = computed(() => formatNumber(getLegislation(this.selected()).drivingLimitGPerL));
  protected readonly stricterLimits = computed(() => getLegislation(this.selected()).stricterLimits);

  constructor() {
    this.legislation.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.selected.set(value);
      void this.save(value);
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.legislation.setValue(await this.preferencesService.getLegislation(), { emitEvent: false });
      this.selected.set(this.legislation.value);
    } catch {
      this.status.set('error');
    }
  }

  private async save(value: Legislation): Promise<void> {
    try {
      await this.preferencesService.setLegislation(value);
      this.status.set('saved');
    } catch {
      this.status.set('error');
    }
  }
}
