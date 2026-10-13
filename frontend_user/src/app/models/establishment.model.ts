export interface Establishment {
  id?: string;
  eta_name: string;
  eta_logo?: string;
  eta_mail: string;
  eta_password?: string;
  eta_description?: string;
  eta_address?: string;
  eta_tel?: string;
  eta_photos?: string[];
  eta_opening_hours?: string;
  eta_date_creation?: Date;
  eta_isActive?: boolean;
  eta_isValidated?: boolean;
  eta_cat_id?: string; // référence à Category
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export type EstablishmentPatch = Partial<Establishment>;
