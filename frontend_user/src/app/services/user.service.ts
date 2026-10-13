import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User, UserModif } from '../models/user.model';
import { firstValueFrom } from 'rxjs';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authStorageService = inject(AuthStorageService);

  private baseUrl = 'http://localhost:3000/api';

  async getUser(id: string): Promise<User | null> {
    try {
      return await firstValueFrom(
        this.http.get<User>(`${this.baseUrl}/users/${id}`)
      );
    } catch (error) {
      console.error(`Erreur de récupération de l'utilisateur`, error);
      return null;
    }
  }

  async createUser(user: User): Promise<User | null> {
    try {
      return await firstValueFrom(
        this.http.post<User>(`${this.baseUrl}/users`, {
          user,
        })
      );
    } catch (error) {
      console.error('Erreur de création du compte', error);
      return null;
    }
  }

  async updateUser(user: UserModif): Promise<UserModif | null> {
    const token = await this.authStorageService.getToken();
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return await firstValueFrom(
        this.http.put<UserModif>(`${this.baseUrl}/users/${user.id}`, user, {
          headers,
        })
      );
    } catch (error) {
      console.error('Erreur de création du compte', error);
      return null;
    }
  }
}
