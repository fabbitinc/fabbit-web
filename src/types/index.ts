export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
}
