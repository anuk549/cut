export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  premium: boolean;
  discount: number;
  image_urls: string[] | null;
  created_at: string;
  hidden: boolean;
};
