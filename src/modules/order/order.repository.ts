import { inject, injectable } from "inversify";
import IPagination from "../../utils/pagination/pagination.interface";
import {IOrderRepository } from "./order.dtos";
import { Prisma, PrismaClient } from "@prisma/client";

@injectable()
export class OrderRepository implements IOrderRepository{
    private readonly order;
    constructor(@inject(PrismaClient)prisma:PrismaClient){
        this.order = prisma.order;
    }

    public addOrder = async(orderData:Prisma.OrderCreateInput)=>{
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