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
export enum Category {
    Jackets = "Jackets",
    Accessories = "Accessories",
    Hoodies = "Hoodies",
    Trousers = "Trousers"
}
export interface backendInterface {
    getAllProducts(): Promise<Array<Product>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getSubscriberCount(): Promise<bigint>;
    subscribe(email: string): Promise<void>;
}
