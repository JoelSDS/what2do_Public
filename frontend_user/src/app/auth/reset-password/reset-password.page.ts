import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  ToastController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { lockOpenOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
  ],
})
export class ResetPasswordPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  @Input() resetToken: string | null = null;

  public resetPasswordForm = this.fb.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
        ],
      ],
    },
    { validators: this.passwordsMatchValidator.bind(this) },
  );

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return this.passwordsMatch(password, confirmPassword)
      ? null
      : { passwordMismatch: true };
  }

  passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword && password.trim().length > 0;
  }
  ngOnInit() {
    addIcons({ lockOpenOutline });
    if (!this.resetToken) {
      this.router.navigate(['tabs/login']);
    }
  }

  onSubmit() {
    const newPassword = this.resetPasswordForm.value.newPassword;
    const response = this.authService
      .resetPassword(this.resetToken!, newPassword!)
      .then((res) => {
        this.presentToast(res.message, 'success', 3000);
      })
      .catch((error) => {
        // Ici tu gères les codes d'erreurs
        if (error.status === 400) {
          this.presentToast('Le token a expiré !', 'danger', 5000);
        } else {
          this.presentToast(
            'Une erreur est survenue, réessayez plus tard',
            'danger',
            5000,
          );
        }
        console.error(error);
      });
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
