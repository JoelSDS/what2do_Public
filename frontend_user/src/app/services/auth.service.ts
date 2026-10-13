import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthStorageService } from './auth-storage.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(AuthStorageService);

  private baseUrl = 'http://localhost:3000/api';
  //private baseUrlDocker = 'http://localhost:3333/api';

  async login(
    email: string,
    password: string,
    accountType: 'User' | 'Establishment'
  ): Promise<any> {
    try {
      const body = { email, password, accountType };
      const response: any = await firstValueFrom(
        this.http.post(`${this.baseUrl}/login`, body)
      );

      if (response?.token) {
        await this.storage.setToken(response.token);
        await this.storage.setUserId(response.account.id);
        await this.storage.setAccountType(response.account.accountType);
      }

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.storage.getToken();
      const userId = await this.storage.getUserId();
      const accountType = await this.storage.getAccountType();
      return !!token && !!userId && !!accountType;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async forgotPassword(
    email: string,
    accountType: 'User' | 'Establishment'
  ): Promise<any> {
    try {
      const body = { email, accountType };
      return await firstValueFrom(
        this.http.post(`${this.baseUrl}/forgot-password`, body)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    try {
      const body = { token, newPassword };
      return await firstValueFrom(
        this.http.post(`${this.baseUrl}/reset-password`, body)
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
