/** Sección del menú lateral (estilo DIAMOND: título en mayúsculas + ítems). */
export interface SidebarSection {
  title: string;
  items: { label: string; icon: string; routerLink: string | string[] }[];
}
