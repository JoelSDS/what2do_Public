import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthStorageService } from './services/auth-storage.service';
import { CategoryService } from './services/category.service';
import { register } from 'swiper/element/bundle';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { arrowBackOutline, logOutOutline } from 'ionicons/icons';
import { ToolbarService } from './services/toolbar.service';
import { BackNavigationService } from './services/back-navigation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  private authStorageService = inject(AuthStorageService);
  private categoryService = inject(CategoryService);
  public toolbarService = inject(ToolbarService);
  private backNav = inject(BackNavigationService);
  private router = inject(Router);
  isLoggedIn = false;
  private subscription = new Subscription();

  constructor() {
    this.initializeStorageOnAppLaunch();
    this.loadCategories();
  }

  ngOnInit(): void {
    addIcons({ arrowBackOutline, logOutOutline });
    this.subscription.add(
      this.authStorageService.isLoggedIn$.subscribe((status) => {
        this.isLoggedIn = status;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private async loadCategories(): Promise<void> {
    await this.categoryService.loadCategories();
  }
  private async initializeStorageOnAppLaunch(): Promise<void> {
    await this.authStorageService.init();
    console.log('✅ Storage initialisé au démarrage de l’app');
  }

  logout(): void {
    this.authStorageService.logout();
    this.router.navigate(['tabs/login']);
  }

  onBackClick() {
    this.backNav.goBack();
  }
}
