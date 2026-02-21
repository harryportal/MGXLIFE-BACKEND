import { Order } from "@prisma/client";
import IPagination from "../../utils/pagination/pagination.interface";



export interface IOrderRepository {
    addOrder(orderData: Omit<Order, "id">): Promise<Order>;
    getOrder(orderId: string): Promise<Order | null>;
    getAllOrders(paginationObject: IPagination): Promise<Order[]>;
  }

export const OTypes = {
    IOrderRepository: Symbol("IOrderRepository")
};