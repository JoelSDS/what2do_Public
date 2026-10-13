import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonCardContent,
  IonCardSubtitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
} from '@ionic/angular/standalone';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, heartOutline, trashOutline } from 'ionicons/icons';
import { FavoriteService } from 'src/app/services/favorite.service';
import { OpinionService } from 'src/app/services/opinion.service';
import { OpinionForUser } from 'src/app/models/opinion.model';
import { FavoriteWithPreview } from 'src/app/models/favorite.model';
import { User, UserModif } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { AuthStorageService } from 'src/app/services/auth-storage.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ToolbarService } from 'src/app/services/toolbar.service';

@Component({
  selector: 'app-profil-user',
  templateUrl: './profil-user.page.html',
  styleUrls: ['./profil-user.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButton,
    IonGrid,
    IonItem,
    IonList,
    IonIcon,
    IonRow,
    IonCol,
    IonLabel,
  ],
})
export class ProfilUserPage implements OnInit {
  @Input() id!: string;
  private userService = inject(UserService);
  private favoriteService = inject(FavoriteService);
  private opinionService = inject(OpinionService);
  private authStorageService = inject(AuthStorageService);
  private alertController = inject(AlertController);
  private toolbarService = inject(ToolbarService);
  private router = inject(Router);
  user: User | null = null;
  opinions: OpinionForUser[] = [];
  favorites: FavoriteWithPreview[] = [];
  isEditing = false;
  editableUser: any = {};
  isEditingProfile = false;
  editSurname = '';
  editName = '';

  originalUser: UserModif = {
    id: '',
    uti_name: '',
    uti_surname: '',
    uti_image: '',
  };
  editedUser: UserModif = { ...this.originalUser };

  //images
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  // Image actuelle (par ex. venant de ton API ou base de données)
  imageActuelle: string = this.getProfileImage();
  selectedImageBase64: string | null = null;

  ngOnInit() {
    this.toolbarService.setBackButtonVisible(false);
    addIcons({ trashOutline, createOutline, heartOutline });
    addIcons({ trashOutline, createOutline });
    this.loadData();
  }

  async ionViewWillEnter() {
    this.loadData();
  }

  async loadData() {
    if (this.id) {
      this.opinions = await this.opinionService.getUserOpinions(this.id);
      this.favorites = await this.favoriteService.getUserFavoritesWithPreview(
        this.id,
      );
      if (!this.favorites || this.favorites.length === 0) {
        this.favorites = [];
      }

      this.user = await this.userService.getUser(this.id);
      this.originalUser.id = this.user?.id;
      this.originalUser.uti_name = this.user?.uti_name ?? '';
      this.originalUser.uti_surname = this.user?.uti_surname ?? '';
      this.originalUser.uti_image = this.user?.uti_image ?? '';
      this.editedUser = { ...this.originalUser };
    } else {
      console.error('ID utilisateur non fourni');
    }
  }

  getProfileImage(): string {
    return this.user?.uti_image?.trim()
      ? this.user.uti_image
      : 'assets/defaultProfile.jpg';
  }

  showAllComments() {
    this.router.navigate([`/tabs/profil-user/${this.id}/opinions`]);
  }

  async deleteFav(etabId: string) {
    try {
      await this.favoriteService.deleteUserFavorite(this.id, etabId);

      // Supprimer aussi en local
      this.favorites = this.favorites.filter(
        (fav) => !(fav.fav_uti_id === this.id && fav.fav_eta_id._id === etabId),
      );
    } catch (error) {
      console.error('Erreur lors de la suppression du favori :', error);
    }
  }

  async presentDeleteAlert(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer ce favori ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.deleteFav(id); // ta méthode de suppression
          },
        },
      ],
    });

    await alert.present();
  }

  startEditingProfile() {
    this.isEditingProfile = true;
  }

  // ENREGISTRER : on prend les valeurs éditées et on les envoie au backend
  async saveProfile() {
    try {
      const response = await this.userService.updateUser(this.editedUser);
      console.log('resp : ', response);
      // Si succès → synchro les valeurs originales et edit mode false
      this.originalUser = { ...this.editedUser };
      this.isEditingProfile = false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour', error);
    }
  }

  // ANNULER : on remet les valeurs originales
  cancelEditingProfile() {
    this.editedUser = { ...this.originalUser };
    this.isEditingProfile = false;
  }

  openFilePicker() {
    this.fileInput.nativeElement.value = ''; // réinitialise pour pouvoir re-sélectionner la même image si besoin
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        console.error("Le fichier n'est pas une image.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.editedUser.uti_image = base64;
      };
      reader.readAsDataURL(file);
    }
  }
}
