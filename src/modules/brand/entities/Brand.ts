export interface Brand {
  name?: string;
  logo: {
    principal: string;
    favicon: string;
  };
  cor_principal: string;
  social: {
    facebook: string;
    instagram: string;
    x: string;
    linkedin: string;
    youtube: string;
    threads: string;
  };
}
