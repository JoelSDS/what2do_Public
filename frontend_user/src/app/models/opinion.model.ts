export interface Opinion {
  id?: string;
  opi_note?: number;
  opi_com?: string;
  opi_date?: Date;
  opi_eta_id: string;
  opi_uti_id: string;
}

export interface OpinionForUser {
  id?: string;
  opi_note?: number;
  opi_com?: string;
  opi_date?: Date;
  opi_eta_id: { eta_name: string; eta_logo?: string };
  opi_uti_id: string;
}

export interface OpinionForEstablishment {
  id?: string;
  opi_note?: number;
  opi_com?: string;
  opi_date?: Date;
  opi_eta_id: string;
  opi_uti_id: { uti_nom: string; uti_prenom: string; uti_image?: string };
}
