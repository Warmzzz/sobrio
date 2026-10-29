import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { Toast } from 'primeng/toast';
import { ConsumptionItem } from '../../components/consumption-item/consumption-item';
import { ConsumedDrink, STANDARD_DRINK_GRAMS } from '../../core/drink';
import { DayGroup, groupByDay, startOfDay } from '../../core/history';
import { ConsumptionsService } from '../../services/consumptions-service';
import { formatClock, formatNumber } from '../../utils/format';

type Period = 7 | 30 | 'all';

const dayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const dayWithYearFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

@Component({
  selector: 'app-history',
  imports: [ReactiveFormsModule, ConfirmDialog, Message, SelectButton, Skeleton, Toast, ConsumptionItem],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private readonly consumptionsService = inject(ConsumptionsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly formatClock = formatClock;
  protected readonly formatNumber = formatNumber;

  protected readonly periodOptions: { label: string; value: Period }[] = [
    { label: '7 jours', value: 7 },
    { label: '30 jours', value: 30 },
    { label: 'Tout', value: 'all' },
  ];
  protected readonly period = new FormControl<Period>(7, { nonNullable: true });
  private readonly selectedPeriod = toSignal(this.period.valueChanges, { initialValue: this.period.value });

  protected readonly consumptions = signal<ConsumedDrink[] | null>(null);
  protected readonly loadFailed = signal(false);

  protected readonly days = computed(() => {
    const period = this.selectedPeriod();
    const all = this.consumptions() ?? [];
    const today = startOfDay(new Date());
    const since = period === 'all' ? null : new Date(today.getFullYear(), today.getMonth(), today.getDate() - (period - 1));

    return groupByDay(since ? all.filter((consumption) => consumption.consumedAt >= since) : all);
  });

  protected readonly stats = computed(() => {
    const days = this.days();
    const standardDrinks = days.reduce((sum, day) => sum + day.ethanolGrams, 0) / STANDARD_DRINK_GRAMS;

    return {
      drinks: days.reduce((sum, day) => sum + day.consumptions.length, 0),
      standardDrinks,
      drinkingDays: days.length,
      averagePerDrinkingDay: days.length ? standardDrinks / days.length : 0,
    };
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected dayLabel({ day }: DayGroup): string {
    const today = startOfDay(new Date());
    const daysAgo = Math.round((today.getTime() - day.getTime()) / 86_400_000);

    if (daysAgo === 0) return "Aujourd'hui";
    if (daysAgo === 1) return 'Hier';
    return (day.getFullYear() === today.getFullYear() ? dayFormat : dayWithYearFormat).format(day);
  }

  protected standardDrinks(day: DayGroup): string {
    return formatNumber(day.ethanolGrams / STANDARD_DRINK_GRAMS);
  }

  protected confirmDelete(consumption: ConsumedDrink): void {
    this.confirmationService.confirm({
      header: 'Retirer cette boisson ?',
      message: `« ${consumption.drink.name} » de ${formatClock(consumption.consumedAt)} sera retirée de ton historique.`,
      icon: 'pi pi-trash',
      acceptLabel: 'Retirer',
      rejectLabel: 'Annuler',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      defaultFocus: 'reject',
      accept: () => this.delete(consumption),
    });
  }

  private async delete(consumption: ConsumedDrink): Promise<void> {
    try {
      await this.consumptionsService.delete(consumption.id);
      this.messageService.add({ severity: 'success', summary: 'Boisson retirée', detail: consumption.drink.name, life: 3000 });
      await this.load();
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "La boisson n'a pas pu être retirée.", life: 3000 });
    }
  }

  private async load(): Promise<void> {
    try {
      // shortcut: loads the whole history in memory, fine for years of personal use; paginate if it grows to tens of thousands
      this.consumptions.set(await this.consumptionsService.getSince(new Date(0)));
      this.loadFailed.set(false);
    } catch {
      this.loadFailed.set(true);
    }
  }
}
