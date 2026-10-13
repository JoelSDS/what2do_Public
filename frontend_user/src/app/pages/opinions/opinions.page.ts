import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonAvatar,
} from '@ionic/angular/standalone';
import { OpinionForUser } from 'src/app/models/opinion.model';
import { OpinionService } from 'src/app/services/opinion.service';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { ToolbarService } from 'src/app/services/toolbar.service';
import { BackNavigationService } from 'src/app/services/back-navigation.service';

@Component({
  selector: 'app-opinions',
  templateUrl: './opinions.page.html',
  styleUrls: ['./opinions.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardContent,
    IonIcon,
    IonAvatar,
  ],
})
export class OpinionsPage implements OnInit {
  @Input() id!: string;
  private opinionService = inject(OpinionService);
  private toolbarService = inject(ToolbarService);
  private backNav = inject(BackNavigationService);
  opinions: OpinionForUser[] = [];
  constructor() {}

  ngOnInit() {
    addIcons({ star });
    this.loadOpinions();
  }

  ionViewWillEnter() {
    const pathProfil = '/tabs/profil-user/' + this.id;

    this.toolbarService.setBackButtonVisible(true);
    this.backNav.setFallbackPath(pathProfil);
  }

  ngOnDestroy() {
    this.toolbarService.setBackButtonVisible(false);
  }

  async loadOpinions() {
    this.opinions = await this.opinionService.getUserOpinions(this.id);
  }

  getStars(note: number): number[] {
    return Array(5).fill(0);
  }
}
