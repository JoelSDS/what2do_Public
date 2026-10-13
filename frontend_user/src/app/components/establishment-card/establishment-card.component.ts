import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { register } from 'swiper/element/bundle';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { CategoryService } from 'src/app/services/category.service';
import { Establishment } from 'src/app/models/establishment.model';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';

register();

@Component({
  selector: 'app-establishment-card',
  templateUrl: './establishment-card.component.html',
  styleUrls: ['./establishment-card.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NgClass, CommonModule],
})
export class EstablishmentCardComponent implements OnInit {
  @Input() establishment!: Establishment;
  @Input() showLike = false;
  @Input() isFavorite = false;
  @Output() toggleFavorite = new EventEmitter<string>();
  private categoryService = inject(CategoryService);
  isOpen = true; // à adapter selon ta logique

  ngOnInit(): void {
    addIcons({ chevronForwardOutline });
  }
  /*
  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    // Ici tu peux aussi appeler ton service pour sauvegarder en base
  }
    */

  getCategoryName(catId: string): string {
    const cat = this.categoryService.getCatNameById(catId);
    return cat ?? 'Inconnue'; // renvoie toujours un string
  }

  onClickFavorite() {
    this.isFavorite = !this.isFavorite; // update visuel immédiat
    this.toggleFavorite.emit(this.establishment.id);
  }
}
