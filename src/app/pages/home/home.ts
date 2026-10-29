import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Message } from 'primeng/message';
import { Skeleton } from 'primeng/skeleton';
import { Toast } from 'primeng/toast';
import { BacSummary } from '../../components/bac-summary/bac-summary';
import { ConsumptionDialog, ConsumptionInput } from '../../components/consumption-dialog/consumption-dialog';
import { ConsumptionList } from '../../components/consumption-list/consumption-list';
import { DrinkPicker } from '../../components/drink-picker/drink-picker';
import { ConsumedDrink, Drink } from '../../core/drink';
import { getLegislation, LegislationInfo } from '../../core/legislation';
import { Biometrics } from '../../core/preferences';
import { ConsumptionsService } from '../../services/consumptions-service';
import { DrinksService } from '../../services/drinks-service';
import { PreferencesService } from '../../services/preferences-service';
import { formatTime } from '../../utils/format';

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 3_600_000;
const dateFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

@Component({
  selector: 'app-home',
  imports: [
    ConfirmDialog,
    Message,
    Skeleton,
    Toast,
    BacSummary,
    ConsumptionDialog,
    ConsumptionList,
    DrinkPicker,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly drinksService = inject(DrinksService);
  private readonly consumptionsService = inject(ConsumptionsService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly now = signal(Date.now());
  protected readonly today = computed(() => dateFormat.format(this.now()));

  protected readonly drinks = signal<Drink[] | null>(null);
  protected readonly biometrics = signal<Biometrics | null>(null);
  protected readonly legislation = signal<LegislationInfo | null>(null);
  protected readonly consumptions = signal<ConsumedDrink[] | null>(null);
  protected readonly loadFailed = signal(false);

  protected readonly lastDay = computed(() => {
    const since = this.now() - DAY_MS;
    return (this.consumptions() ?? []).filter((consumption) => consumption.consumedAt.getTime() >= since).reverse();
  });

  protected readonly selectedDrink = signal<Drink | null>(null);
  protected readonly dialogVisible = signal(false);
  protected readonly saving = signal(false);

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), MINUTE_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  async ngOnInit(): Promise<void> {
    try {
      const [drinks, biometrics, legislation] = await Promise.all([
        this.drinksService.getAll(),
        this.preferencesService.getBiometrics(),
        this.preferencesService.getLegislation(),
        this.loadConsumptions(),
      ]);

      this.drinks.set(drinks);
      this.biometrics.set(biometrics);
      this.legislation.set(getLegislation(legislation));
    } catch {
      this.loadFailed.set(true);
    }
  }

  protected openDialog(drink: Drink): void {
    this.selectedDrink.set(drink);
    this.dialogVisible.set(true);
  }

  protected async add({ consumedVolumeMl, minutesAgo }: ConsumptionInput): Promise<void> {
    const drink = this.selectedDrink();

    if (!drink) {
      return;
    }

    this.saving.set(true);

    try {
      await this.consumptionsService.add(drink, consumedVolumeMl, new Date(Date.now() - minutesAgo * MINUTE_MS));
      this.dialogVisible.set(false);
      this.notify('success', 'Boisson ajoutée', drink.name);
      await this.refresh();
    } catch {
      this.notify('error', 'Erreur', "La boisson n'a pas pu être ajoutée.");
    } finally {
      this.saving.set(false);
    }
  }

  protected confirmDelete(consumption: ConsumedDrink): void {
    const time = formatTime(consumption.consumedAt, new Date(this.now()));

    this.confirmationService.confirm({
      header: 'Retirer cette boisson ?',
      message: `« ${consumption.drink.name} » de ${time} sera retirée de ton historique.`,
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
      this.notify('success', 'Boisson retirée', consumption.drink.name);
      await this.refresh();
    } catch {
      this.notify('error', 'Erreur', "La boisson n'a pas pu être retirée.");
    }
  }

  private async refresh(): Promise<void> {
    this.now.set(Date.now());
    await this.loadConsumptions();
  }

  private async loadConsumptions(): Promise<void> {
    // 48 h pour le calcul : de l'alcool bu juste avant la fenêtre de 24 h peut encore compter.
    this.consumptions.set(await this.consumptionsService.getSince(new Date(Date.now() - 2 * DAY_MS)));
  }

  private notify(severity: 'success' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 3000 });
  }
}
