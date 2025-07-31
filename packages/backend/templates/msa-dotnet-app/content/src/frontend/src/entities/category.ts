export interface Category {
  id: number;
  name: string;
}

export interface CategoryCreate {
  prefix: string;
  category: string;
}
