import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Message } from 'primeng/message';
import { Skeleton } from 'primeng/skeleton';
import { Toast } from 'primeng/toast';
import { DrinkDialog } from '../../components/drink-dialog/drink-dialog';
import { DrinkItem } from '../../components/drink-item/drink-item';
import { Drink, DrinkInput } from '../../core/drink';
import { DrinksService } from '../../services/drinks-service';

@Component({
  selector: 'app-drinks',
  imports: [Button, ConfirmDialog, Message, Skeleton, Toast, DrinkDialog, DrinkItem],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drinks.html',
  styleUrl: './drinks.scss',
})
export class Drinks implements OnInit {
  private readonly drinksService = inject(DrinksService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly drinks = signal<Drink[] | null>(null);
  protected readonly loadFailed = signal(false);
  protected readonly customDrinks = computed(() => this.drinks()?.filter((drink) => drink.isCustom) ?? []);
  protected readonly defaultDrinks = computed(() => this.drinks()?.filter((drink) => !drink.isCustom) ?? []);

  protected readonly dialogVisible = signal(false);
  protected readonly editedDrink = signal<Drink | null>(null);
  protected readonly saving = signal(false);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected openCreate(): void {
    this.editedDrink.set(null);
    this.dialogVisible.set(true);
  }

  protected openEdit(drink: Drink): void {
    this.editedDrink.set(drink);
    this.dialogVisible.set(true);
  }

  protected async save(input: DrinkInput): Promise<void> {
    const edited = this.editedDrink();
    this.saving.set(true);

    try {
      if (edited) {
        await this.drinksService.update(edited.id, input);
      } else {
        await this.drinksService.create(input);
      }

      this.dialogVisible.set(false);
      this.notify('success', edited ? 'Boisson modifiée' : 'Boisson ajoutée', input.name);
      await this.load();
    } catch {
      this.notify('error', 'Erreur', "La boisson n'a pas pu être enregistrée.");
    } finally {
      this.saving.set(false);
    }
  }

  protected confirmDelete(drink: Drink): void {
    this.confirmationService.confirm({
      header: 'Supprimer la boisson ?',
      message: `« ${drink.name} » sera définitivement supprimée.`,
      icon: 'pi pi-trash',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      defaultFocus: 'reject',
      accept: () => this.delete(drink),
    });
  }

  private async delete(drink: Drink): Promise<void> {
    try {
      await this.drinksService.delete(drink.id);
      this.notify('success', 'Boisson supprimée', drink.name);
      await this.load();
    } catch {
      this.notify('error', 'Erreur', "La boisson n'a pas pu être supprimée.");
    }
  }

  private async load(): Promise<void> {
    try {
      this.drinks.set(await this.drinksService.getAll());
      this.loadFailed.set(false);
    } catch {
      this.loadFailed.set(true);
    }
  }

  private notify(severity: 'success' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 3000 });
  }
}
