import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonIcon,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ToolbarService } from 'src/app/services/toolbar.service';
import { BackNavigationService } from 'src/app/services/back-navigation.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
})
export class ForgotPasswordPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  private toolbarService = inject(ToolbarService);
  private backNav = inject(BackNavigationService);

  ngOnInit() {
    //this.toolbarService.setBackButtonVisible(true);
    addIcons({ lockClosedOutline });
  }

  async ionViewWillEnter() {
    this.toolbarService.setBackButtonVisible(true);
    this.backNav.setFallbackPath('/tabs/login');
  }

  ngOnDestroy() {
    this.toolbarService.setBackButtonVisible(false);
  }

  forgotForm = this.fb.group({
    accountType: ['User', Validators.required],
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    ],
  });

  onSubmit() {
    if (this.forgotForm.valid) {
      const email = this.forgotForm.value.email;
      const accountType = this.forgotForm.value.accountType as
        | 'User'
        | 'Establishment';
      const response = this.authService
        .forgotPassword(email!, accountType)
        .then((res) => {
          this.presentToast(res.message, 'success', 3000);
        })
        .catch((error) => {
          this.presentToast(
            'Une erreur est survenue, réessayez plus tard',
            'danger',
            5000,
          );
          console.error(error);
        });
    }
  }

  async presentToast(messageIncome: string, color: string, duration: number) {
    const toast = await this.toastController.create({
      message: messageIncome,
      duration: duration,
      color: color,
    });
    toast.present();
    if (color === 'success') {
      toast.onDidDismiss().then(() => {
        this.router.navigate(['tabs/login']);
      });
    }
  }

  cancel() {
    this.router.navigate(['tabs/login']);
  }
}
