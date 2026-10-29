import { ChangeDetectionStrategy, Component, DestroyRef, DOCUMENT, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-update-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './update-banner.html',
  styleUrl: './update-banner.scss',
})
export class UpdateBanner {
  private readonly document = inject(DOCUMENT);
  private readonly swUpdate = inject(SwUpdate);

  protected readonly updateReady = signal(false);

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        this.updateReady.set(true);
      }
    });

    // iOS keeps installed apps alive in memory: check again whenever the app comes back to the foreground
    const checkOnResume = () => {
      if (this.document.visibilityState === 'visible') {
        this.swUpdate.checkForUpdate().catch(() => {});
      }
    };
    this.document.addEventListener('visibilitychange', checkOnResume);
    inject(DestroyRef).onDestroy(() => this.document.removeEventListener('visibilitychange', checkOnResume));
  }

  protected reload(): void {
    this.document.location.reload();
  }
}
