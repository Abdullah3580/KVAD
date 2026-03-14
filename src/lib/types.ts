export interface Product {
  id: number;
  name: string;
  cat: string;
  sub: string;
  brand: string;
  price: number;
  was: number;
  rating: number;
  reviews: number;
  stock: number;
  badge: string | null;
  images: string[];
  img: string;
  gallery: string[];
  desc: string;
  colors: string[];
  sizes: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
}

export interface CartItem extends Product {
  qty: number;
  selectedSize?: string;
  selectedColor?: string;
  cartKey: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string; 
  status: string;
  total: number;
  subtotal?: number;
  discount?: number;
  shipping_cost?: number;
  shipping_name?: string;
  shipping_line1?: string;
  shipping_city?: string;
  shipping_zip?: string;
  shipping_country?: string;
  payment_method?: string;
  shipping_address?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  product_image?: string;
  selected_size?: string;
  selected_color?: string;
  unit_price: number;
  quantity: number;
}

export interface Review {
  id: string;
  product_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export type ViewMode = "grid3" | "grid4" | "list";
export type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest" | "discount" | "popular";
export type DeliveryKey = "standard" | "express" | "same_day";
export type PayMethod = "cod" | "bkash" | "nagad" | "rocket";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
