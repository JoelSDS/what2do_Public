export interface Favorite {
  id?: string;
  fav_date_of_add?: Date;
  fav_uti_id: string; // référence à User
  fav_eta_id: string;
}

interface Establishment {
  _id: string;
  eta_logo: string;
  eta_name: string;
  eta_address: string;
}

export interface FavoriteWithPreview {
  id: string;
  fav_uti_id: string;
  fav_eta_id: Establishment; // PAS string !
}
