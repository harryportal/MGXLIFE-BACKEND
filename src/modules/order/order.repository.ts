import { inject, injectable } from "inversify";
import IPagination from "../../utils/pagination/pagination.interface";
import { AddOrder, IOrderRepository } from "./order.dtos";
import { IPrismaClient, PrismaType } from "../../utils/db/prisma";

@injectable()
export class OrderRepository implements IOrderRepository{
    private readonly order;
    constructor(@inject(PrismaType.IPrismaClient)prisma:IPrismaClient){
        this.order = prisma.order;
    }

    public addOrder = async(orderData:AddOrder)=>{
        const order = await this.order.create({
            data: {
                ...orderData
            }
        });
        return order;  
    }

    public getOrder = async(orderId:string)=>{
        const order = await this.order.findUnique({
            where:{ shopifyId: orderId}
        })
        return order;
    }

    public getAllOrders = async(paginationObject:IPagination)=>{
        const {take, skip} = paginationObject;
        const orders = await this.order.findMany({take, skip});
        return orders;
    }
}