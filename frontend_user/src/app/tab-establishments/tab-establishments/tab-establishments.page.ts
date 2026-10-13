import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EstablishmentCardComponent } from 'src/app/components/establishment-card/establishment-card.component';
import { CatFilterComponent } from 'src/app/components/cat-filter/cat-filter.component';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Establishment } from 'src/app/models/establishment.model';
import { EstablishmentService } from 'src/app/services/establishment.service';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category.model';
import { alertCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Favorite } from 'src/app/models/favorite.model';
import { AuthService } from 'src/app/services/auth.service';
import { FavoriteService } from 'src/app/services/favorite.service';
import { AuthStorageService } from 'src/app/services/auth-storage.service';
import { Router } from '@angular/router';
import { ToolbarService } from 'src/app/services/toolbar.service';

@Component({
  selector: 'app-tab-establishments',
  templateUrl: './tab-establishments.page.html',
  styleUrls: ['./tab-establishments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstablishmentCardComponent,
    CatFilterComponent,
    IonContent,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class TabEstablishmentsPage implements OnInit {
  private establishmentService = inject(EstablishmentService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private favoriteServices = inject(FavoriteService);
  private authStorageService = inject(AuthStorageService);
  private toolbarService = inject(ToolbarService);
  public router = inject(Router);
  establishments: Establishment[] = [];
  categories: Category[] = [];
  userFavorites: Favorite[] = [];
  selectedCategory: string | null = null;
  page = 0;
  limit = 10; // Nombre d'établissements par requête
  searchValue: string = '';
  isLoading = false;
  isLoggedIn = false;
  isUserAccount = false;

  constructor() {}

  ngOnInit() {
    addIcons({ alertCircleOutline });
    this.loadCategories();
    this.loadEstablishments();
  }

  async ionViewWillEnter() {
    this.toolbarService.setBackButtonVisible(false);
    await this.checkLogin();
    this.loadEstablishments();
    const accountType = await this.authStorageService.getAccountType();
    if (accountType === 'User') {
      this.isUserAccount = true;
    } else {
      this.isUserAccount = false;
    }
  }

  //si il est connecter on fait pas la requete sinon on la fait
  private async checkLogin() {
    this.isLoggedIn = await this.authService.isLoggedIn();
    if (this.isLoggedIn && this.isUserAccount) {
      const userId = await this.authStorageService.getUserId();
      this.userFavorites = await this.favoriteServices.getUserFavorites(
        userId!,
      );
    } else {
      this.userFavorites = []; // on vide si pas connecté
    }
  }

  loadCategories() {
    try {
      const categories = this.categoryService.getCategories();
      this.categories = categories || [];
    } catch (error) {
      console.error('Erreur de récupération des catégories', error);
    }
  }

  async loadEstablishments(event?: any) {
    if (this.isLoading) return; // évite les appels multiples
    this.isLoading = true;
    try {
      const estabs = await this.establishmentService.getEstablishments(
        this.page,
        this.limit,
        this.searchValue,
        this.selectedCategory,
      );

      if (estabs) {
        if (this.page === 0) this.establishments = [];
        this.establishments.push(...estabs);
      }

      if (event) event.target.complete();
    } catch (error) {
      console.error('Erreur de récupération des établissements', error);
      if (event) event.target.complete();
    } finally {
      this.isLoading = false;
    }
  }

  // Infinite scroll
  loadMore(event: any) {
    this.page++;
    this.loadEstablishments(event).then(() => {
      if (this.establishments.length < this.page * this.limit) {
        event.target.disabled = true; // plus rien à charger
      }
    });
  }

  onSearch() {
    this.page = 0;
    this.loadEstablishments();
  }

  onSearchClear(event: any) {
    if (event.target.value === '') {
      this.page = 0;
      this.loadEstablishments();
    }
  }

  // Filtre par catégorie
  filterByCategory(categoryId: string) {
    if (this.selectedCategory === categoryId) {
      this.selectedCategory = null; // désélection
    } else {
      this.selectedCategory = categoryId;
    }
    this.page = 0;
    this.loadEstablishments();
  }

  onCategorySelected(catId: string | null) {
    this.selectedCategory = catId;
    this.page = 0;
    this.loadEstablishments();
  }

  isFavorite(establishmentId: string): boolean {
    if (!this.userFavorites) return false;
    const isFav = this.userFavorites.some(
      (fav) => fav.fav_eta_id === establishmentId,
    );
    return isFav;
  }

  async onToggleFavorite(establishmentId: string) {
    if (!this.isLoggedIn) return;
    const userId = await this.authStorageService.getUserId();
    if (!this.userFavorites) this.userFavorites = [];
    // Vérifie si le favoris existe déjà
    const existingIndex = this.userFavorites.findIndex(
      (fav) => fav.fav_eta_id === establishmentId,
    );
    if (existingIndex > -1) {
      // On supprime le favori
      const favToRemove: Favorite = this.userFavorites[existingIndex];
      await this.favoriteServices.deleteUserFavorite(
        userId!,
        favToRemove.fav_eta_id,
      ); // id en BDD
      this.userFavorites.splice(existingIndex, 1);
    } else {
      // On ajoute le favori
      const newFav = await this.favoriteServices.createUserFavorite(
        userId!,
        establishmentId,
      );
      if (newFav) {
        this.userFavorites.push(newFav);
      }
    }
  }

  goToDetails(establishmentId: string) {
    this.router.navigate([
      'tabs/tab-establishments/establishment-details',
      establishmentId,
    ]);
  }
}
