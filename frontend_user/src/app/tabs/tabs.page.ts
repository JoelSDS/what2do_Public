import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  todayOutline,
  businessOutline,
  logInOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { AuthStorageService } from '../services/auth-storage.service';
import { Subscription, tap, filter, switchMap, combineLatest } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  public authStorageService = inject(AuthStorageService);
  private authService = inject(AuthService);
  public isLoggedIn = false;
  userId: string | null = null;
  accountType: string | null = null;
  private subscription = new Subscription();

  constructor() {}

  async ngOnInit() {
    addIcons({
      todayOutline,
      businessOutline,
      logInOutline,
      personCircleOutline,
    });

    this.subscription.add(
      this.authStorageService.isLoggedIn$
        .pipe(
          tap((status) => {
            this.isLoggedIn = status;
          }),
          filter((status) => status === true),
          switchMap(() =>
            combineLatest([
              this.authStorageService.userId$Observable,
              this.authStorageService.accountType$Observable,
            ])
          )
        )
        .subscribe(([id, type]) => {
          this.userId = id;
          this.accountType = type;
        })
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

/*
    this.isLoggedIn = await this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userId = await this.authStorageService.getUserId();
      this.accountType = await this.authStorageService.getAccountType();
    }
      */
