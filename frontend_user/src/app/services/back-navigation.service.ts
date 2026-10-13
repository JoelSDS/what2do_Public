import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BackNavigationService {
  private location = inject(Location);
  private router = inject(Router);
  private fallbackPath: string = '/home';

  goBack(): void {
    this.router.navigate([this.fallbackPath]);
  }

  setFallbackPath(path: string): void {
    this.fallbackPath = path;
  }

  // Optionnel : pour forcer un retour vers une route spécifique
  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
