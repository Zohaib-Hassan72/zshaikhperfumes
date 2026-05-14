export type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price: number;
  sale_price: number | null;
  images: string[];
  category_slug: string | null;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type Banner = {
  id: string;
  key: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  active: boolean;
  sort_order: number;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  content: string;
  page_type: string;
  published: boolean;
};

export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type Settings = Record<string, any>;
