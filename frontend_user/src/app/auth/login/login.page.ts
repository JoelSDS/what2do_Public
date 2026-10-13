import { Component, inject, OnInit } from '@angular/core';
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
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { AuthStorageService } from '../../services/auth-storage.service';
import { addIcons } from 'ionicons';
import { alertCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { Establishment } from 'src/app/models/establishment.model';
import { UserService } from 'src/app/services/user.service';
import { EstablishmentService } from 'src/app/services/establishment.service';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category.model';
import { ToolbarService } from 'src/app/services/toolbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSegmentContent,
    IonSegmentView,
  ],
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private authStorageService = inject(AuthStorageService);
  private establishmentService = inject(EstablishmentService);
  private userService = inject(UserService);
  private categoryService = inject(CategoryService);
  private toolbarService = inject(ToolbarService);
  private toastController = inject(ToastController);
  private router = inject(Router);
  public selectedSegment = 'Connexion';
  public categories: Category[] = [];

  loginForm = this.fb.group({
    accountType: ['User', Validators.required],
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        //Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'),
      ],
    ],
  });

  inscriptionForm = this.fb.group(
    {
      name: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/)],
      ],
      surname: [''], // required activé/désactivé dynamiquement selon accountType
      accountType: ['User', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          ),
        ],
      ],
      password: [
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
      categorie: [''], // required activé/désactivé dynamiquement selon accountType
    },
    { validators: this.passwordsMatchValidator.bind(this) },
  );

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return this.passwordsMatch(password, confirmPassword)
      ? null
      : { passwordMismatch: true };
  }

  passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword && password.trim().length > 0;
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  ngOnInit() {
    addIcons({
      alertCircleOutline,
    });
    this.loadCategories();
    this.changeValidators();
  }

  async ionViewWillEnter() {
    this.toolbarService.setBackButtonVisible(false);
  }

  //Changement des validateurs pour les champs "surname" et "categorie"
  changeValidators() {
    this.inscriptionForm.get('accountType')?.valueChanges.subscribe((type) => {
      const surnameControl = this.inscriptionForm.get('surname');
      const categorieControl = this.inscriptionForm.get('categorie');
      if (type === 'User') {
        surnameControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/),
        ]);
        categorieControl?.clearValidators();
        categorieControl?.setValue('');
      } else {
        categorieControl?.setValidators([Validators.required]);
        surnameControl?.clearValidators();
        surnameControl?.setValue('');
      }
      surnameControl?.updateValueAndValidity();
    });
  }

  loadCategories() {
    try {
      this.categories = this.categoryService.getCategories();
    } catch (error) {
      console.error('Erreur de récupération des catégories', error);
    }
  }

  async onSubmitLogin() {
    if (this.loginForm.invalid) return;

    const { email, password, accountType } = this.loginForm.value;
    try {
      const result = await this.authService.login(
        email!,
        password!,
        accountType as 'User' | 'Establishment',
      );

      if (result && result.account.accountType === 'User') {
        /*cela peut être interressant, si authguards bloque la route car utilisateur ne peut pas y accès car il n'est
        connecter, l'authguards le renvois dans la page login (voir auth.guards.ts) et une fois connecté, avec cette
        ligne de code ci dessous, il le renvoi à la page qu'il souhaiter consulter !
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || this.router.navigateByUrl(returnUrl);
        */
        const user = await this.userService.getUser(result.account.id);
        const userToRegister = user as User;
        if (!userToRegister) return;
        this.authStorageService.setCurrentUser(userToRegister);

        this.router.navigate(['/tabs/profil-user', result.account.id]);
      } else {
        const estab = await this.establishmentService.getEstablishment(
          result.account.id,
        );
        const establi = estab as Establishment;
        if (!estab) return;
        this.authStorageService.setCurrentUser(establi);
        this.router.navigate(['/tabs/profil-estab']);
      }
    } catch (err) {
      console.error('Erreur login', err);
      this.presentToast(
        'Erreur de connexion. Veuillez vérifier vos identifiants ou le type de compte !',
        'danger',
        4000,
        'alert-circle-outline',
      );
    }
  }

  async onSubmitInscription() {
    const accountType = this.inscriptionForm.get('accountType')?.value;
    if (accountType === 'User') {
      const user: User = {
        uti_name: this.inscriptionForm.get('name')?.value ?? '',
        uti_surname: this.inscriptionForm.get('surname')?.value ?? '',
        uti_mail: this.inscriptionForm.get('email')?.value ?? '',
        uti_password: this.inscriptionForm.get('password')?.value ?? '',
      };
      const response = await this.userService.createUser(user);
      if (response) {
        this.presentToast(
          'Compte utilisateur créé avec succès.',
          'success',
          4000,
          'checkmark-circle-outline',
        );
        //this.router.navigate(['/login']);
      } else {
        this.presentToast(
          'Erreur lors de la création du compte utilisateur.',
          'danger',
          4000,
          'alert-circle-outline',
        );
      }
    } else if (accountType === 'Establishment') {
      const establishment: Establishment = {
        eta_name: this.inscriptionForm.get('name')?.value ?? '',
        eta_mail: this.inscriptionForm.get('email')?.value ?? '',
        eta_password: this.inscriptionForm.get('password')?.value ?? '',
        eta_cat_id: this.inscriptionForm.get('categorie')?.value ?? '',
      };
      const response =
        await this.establishmentService.createUser(establishment);
      if (response) {
        this.presentToast(
          'Compte établissement créé avec succès.',
          'success',
          4000,
          'checkmark-circle-outline',
        );
        //this.router.navigate(['/login']);
      } else {
        this.presentToast(
          'Erreur lors de la création du compte établissement.',
          'danger',
          4000,
          'alert-circle-outline',
        );
      }
    }
  }

  async presentToast(
    message: string,
    color: string,
    duration: number,
    icon: string,
  ) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: duration,
      icon: icon,
    });
    toast.present();
    if (color === 'success') {
      this.selectedSegment = 'Connexion';
    }
  }

  forgotPassword() {
    this.router.navigate(['/tabs/login/forgot-password']);
  }
}
