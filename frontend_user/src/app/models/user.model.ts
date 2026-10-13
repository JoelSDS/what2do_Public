export interface User {
  id?: string;
  uti_name: string;
  uti_surname: string;
  uti_image?: string;
  uti_mail: string;
  uti_password: string;
  uti_date_creation?: Date;
  uti_isAdmin?: boolean;
  uti_isActive?: boolean;
  uti_isValidated?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface UserModif {
  id?: string;
  uti_name: string;
  uti_surname: string;
  uti_image?: string;
}
