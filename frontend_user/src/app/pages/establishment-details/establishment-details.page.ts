import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonBadge,
  IonAvatar,
  IonImg,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { calendarOutline, locationOutline } from 'ionicons/icons';
import { EstablishmentService } from 'src/app/services/establishment.service';
import { Establishment } from 'src/app/models/establishment.model';
import { CategoryService } from 'src/app/services/category.service';
import { AuthService } from 'src/app/services/auth.service';
import { OpinionService } from 'src/app/services/opinion.service';
import { AuthStorageService } from 'src/app/services/auth-storage.service';
import { Opinion, OpinionForUser } from 'src/app/models/opinion.model';
import { AlertController } from '@ionic/angular';
import { ToolbarService } from 'src/app/services/toolbar.service';
import { BackNavigationService } from 'src/app/services/back-navigation.service';

@Component({
  selector: 'app-establishment-details',
  templateUrl: './establishment-details.page.html',
  styleUrls: ['./establishment-details.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonBadge,
    IonAvatar,
    IonImg,
    IonSpinner,
    IonIcon,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EstablishmentDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private establishmentService = inject(EstablishmentService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private opinionService = inject(OpinionService);
  private authStorageService = inject(AuthStorageService);
  private alertController = inject(AlertController);
  private toolbarService = inject(ToolbarService);
  private backNav = inject(BackNavigationService);
  establishment!: Establishment | null;
  isLoggedIn = false;
  userReview: Opinion | null = null;
  selectedRating = 0;
  comment: string = '';

  ngOnInit() {
    //this.toolbarService.setBackButtonVisible(true);
    addIcons({ locationOutline, calendarOutline });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEstablishment(id);
    }
  }

  ngOnDestroy() {
    this.toolbarService.setBackButtonVisible(false);
  }

  async ionViewWillEnter() {
    await this.checkLogin();
    this.toolbarService.setBackButtonVisible(true);
    this.backNav.setFallbackPath('/tabs/tab-establishments');
  }

  //si il est connecter on fait pas la requete sinon on la fait
  private async checkLogin() {
    this.isLoggedIn = await this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const userId = await this.authStorageService.getUserId();
      if (!userId) return;
      if (!this.establishment?.id) return;
      //Chercher opinion de cet utilisateur pour cet etablissement
      const opinion = await this.opinionService.getUserOpinionForEstab(
        userId,
        this.establishment?.id,
      );
      this.userReview = opinion;
      this.selectedRating = opinion?.opi_note || 0;
      this.comment = opinion?.opi_com || '';
    } else {
      this.userReview = null;
    }
  }

  async loadEstablishment(id: string) {
    try {
      const estab = await this.establishmentService.getEstablishment(id);
      this.establishment = estab;
    } catch (err) {
      console.error(err);
    }
  }
  getCategoryName(catId: string): string {
    const cat = this.categoryService.getCatNameById(catId);
    return cat ?? 'Inconnue'; // renvoie toujours un string
  }

  async submitReview() {
    try {
      const userId = await this.authStorageService.getUserId();
      if (!userId) return;
      if (!this.establishment?.id) return;
      if (!this.userReview) {
        const newOpinion: Opinion = {
          opi_eta_id: this.establishment.id,
          opi_com: this.comment,
          opi_note: this.selectedRating,
          opi_uti_id: userId,
        };
        const newOpi = await this.opinionService.createUserOpinion(
          userId,
          newOpinion,
        );
        this.userReview = newOpi;
      } else {
        const opinionModif: Opinion = {
          opi_eta_id: this.establishment.id,
          opi_com: this.comment,
          opi_note: this.selectedRating,
          opi_uti_id: userId,
        };
        const updateOpinion = await this.opinionService.updateUserOpinion(
          userId,
          opinionModif,
        );
        this.userReview = updateOpinion;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async deleteReview() {
    if (!this.userReview) return;
    const userId = await this.authStorageService.getUserId();
    if (!userId) return;
    if (!this.userReview?.id) return;
    try {
      await this.opinionService.deleteUserOpinion(userId, this.userReview.id);
      this.userReview = null;
      this.comment = '';
      this.selectedRating = 0;
    } catch (err) {
      console.error(err);
    }
  }

  async presentDeleteAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer le commentaire ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {},
        },
      ],
    });

    await alert.present(); // ✅ indispensable pour l'afficher
  }
}
