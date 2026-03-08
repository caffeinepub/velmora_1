import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    description: string;
    isFeatured: boolean;
    category: Category;
    price: bigint;
}
export interface Order {
    id: bigint;
    createdAt: bigint;
    totalAmount: bigint;
    shippingAddress: ShippingAddress;
    items: Array<OrderItem>;
    customerEmail: string;
}
export interface ShippingAddress {
    country: string;
    city: string;
    postalCode: string;
    state: string;
    addressLine1: string;
    addressLine2?: string;
    lastName: string;
    firstName: string;
}
export interface OrderItem {
    productId: bigint;
    productName: string;
    quantity: bigint;
    unitPrice: bigint;
}
export enum Category {
    Jackets = "Jackets",
    Accessories = "Accessories",
    Hoodies = "Hoodies",
    Trousers = "Trousers"
}
export interface backendInterface {
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getSubscriberCount(): Promise<bigint>;
    placeOrder(customerEmail: string, items: Array<OrderItem>, shippingAddress: ShippingAddress): Promise<bigint>;
    subscribe(email: string): Promise<void>;
}
