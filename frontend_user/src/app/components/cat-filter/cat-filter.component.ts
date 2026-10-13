import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-cat-filter',
  templateUrl: './cat-filter.component.html',
  styleUrls: ['./cat-filter.component.scss'],
})
export class CatFilterComponent implements OnInit {
  @Input() categories: any[] = [];
  @Input() selectedCategory: string | null = null;
  @Output() categorySelected = new EventEmitter<string | null>();

  selectCategory(catId: string) {
    const newSelected = this.selectedCategory === catId ? null : catId;
    this.categorySelected.emit(newSelected);
  }

  ngOnInit(): void {}
}
