export interface Event {
  id?: string;
  eve_nom: string;
  eve_eta_id: { eta_name: string; eta_logo?: string; eta_address?: string }; // référence à Establishment
  eve_cat_id: string; // référence vers Category
  eve_images?: string[];
  eve_description?: string;
  eve_date_debut: Date;
  eve_date_fin: Date;
  eve_isActive?: boolean;
}

export interface EventPure {
  id?: string;
  eve_nom: string;
  eve_eta_id: string;
  eve_cat_id: string; // référence vers Category
  eve_images?: string[];
  eve_description?: string;
  eve_date_debut: Date;
  eve_date_fin: Date;
  eve_isActive?: boolean;
}
