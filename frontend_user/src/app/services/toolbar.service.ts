import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  private showBackButtonSignal = signal(false);
  readonly showBackButton = this.showBackButtonSignal.asReadonly();

  setBackButtonVisible(visible: boolean) {
    this.showBackButtonSignal.set(visible);
  }
}
