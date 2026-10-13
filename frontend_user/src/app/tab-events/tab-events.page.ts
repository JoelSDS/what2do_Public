import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { CatFilterComponent } from '../components/cat-filter/cat-filter.component';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { EventCardComponent } from '../components/event-card/event-card.component';
import { Router } from '@angular/router';
import { ToolbarService } from '../services/toolbar.service';

@Component({
  selector: 'app-tab-events',
  templateUrl: './tab-events.page.html',
  styleUrls: ['./tab-events.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    CatFilterComponent,
    EventCardComponent,
    IonGrid,
    IonRow,
    IonCol,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSearchbar,
  ],
})
export class TabEventsPage implements OnInit {
  private eventServices = inject(EventService);
  private categoryService = inject(CategoryService);
  public router = inject(Router);
  private toolbarService = inject(ToolbarService);
  selectedCategory: string | null = null;
  categories: Category[] = [];
  eventsList: Event[] = [];
  page = 0;
  limit = 10;
  searchValue: string = '';
  isLoading = false;
  constructor() {}

  ngOnInit() {
    this.loadCategories();
    this.loadEvents();
  }

  async ionViewWillEnter() {
    this.loadEvents();
    this.toolbarService.setBackButtonVisible(false);
  }

  async loadCategories() {
    try {
      const categories = await this.categoryService.getCategories();
      if (categories) {
      }
      this.categories = categories || [];
    } catch (error) {
      console.error('Erreur de récupération des catégories', error);
    }
  }

  async loadEvents(e?: any) {
    if (this.isLoading) return; // évite les appels multiples
    this.isLoading = true;
    try {
      const events = await this.eventServices.getEvents(
        this.page,
        this.limit,
        this.searchValue,
        this.selectedCategory,
      );

      if (events) {
        if (this.page === 0) this.eventsList = [];
        this.eventsList.push(...events);
      }
      if (e) e.target.complete();
    } catch (error) {
      console.error('Erreur de récupération des établissements', error);
      if (e) e.target.complete();
    } finally {
      this.isLoading = false;
    }
  }

  onCategorySelected(catId: string | null) {
    this.selectedCategory = catId;
    this.page = 0;
    this.loadEvents();
  }

  onSearch() {
    this.page = 0;
    this.loadEvents();
  }

  onSearchClear(e: any) {
    if (e.target.value === '') {
      this.page = 0;
      this.loadEvents();
    }
  }

  // Infinite scroll
  loadMore(event: any) {
    this.page++;
    this.loadEvents(event).then(() => {
      if (this.eventsList.length < this.page * this.limit) {
        event.target.disabled = true; // plus rien à charger
      }
    });
  }
}
