import { Product } from "@prisma/client";
import IPagination from "../../utils/pagination/pagination.interface";

export interface SingleProduct {
  productId: string;
  title: string;
  price: number;
  image: string;
}

export type updateProduct = Pick<Product, "bonusAmount" | "bonusType">;

export interface IProductRepository {
  getProduct(shopifyId: string): Promise<Product | null>;
  getAllProducts(take: number, skip: number): Promise<Product[]>;
  addProduct(productData: SingleProduct): Promise<string>;
  updateProduct(productData: updateProduct, productId: string): Promise<Product>;
}

export interface IProductService {
  addProduct(productData: SingleProduct): Promise<string | undefined>;
  getAllProducts(paginationObject: IPagination): Promise<Product[]>;
  updateProduct(productData: updateProduct, productId: string): Promise<Product>;
  getProduct(shopifyId: string): Promise<Product>;
}

export const PdTypes = {
  IProductRepository:Symbol("IProductRepository"),
  IProductService:Symbol("IProductService")
}
