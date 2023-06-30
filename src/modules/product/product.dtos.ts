import { Product } from "@prisma/client";

export interface SingleProduct {
  productId: string;
  title: string;
  price: number;
  image: string;
}

export type updateProduct = Pick<Product, "bonusAmount" | "bonusType">;