import { inject, Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = 'http://localhost:3000/api';
  private http = inject(HttpClient);
  private categories: Category[] | null = null;

  constructor() {}

  getCategories(): Category[] {
    return this.categories ?? [];
  }

  getCatNameById(idSearch: string): string | undefined {
    const cat = this.categories?.find((c) => c.id === idSearch);
    return cat?.cat_name;
  }

  getCatCodeById(idSearch: string): string | undefined {
    const cat = this.categories?.find((c) => c.id === idSearch);
    return cat?.cat_code;
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await lastValueFrom(
        this.http.get<Category[]>(`${this.baseUrl}/categories`)
      );
    } catch (error) {
      console.error('Erreur de récupération des catégories', error);
      this.categories = [];
    }
  }
}
