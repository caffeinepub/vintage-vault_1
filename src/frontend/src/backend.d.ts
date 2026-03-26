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
    price: bigint; // in cents
    category: string;
    imageId: string;
    inStock: boolean;
}

export interface OrderItem {
    productId: bigint;
    quantity: bigint;
}

export interface Order {
    id: bigint;
    items: OrderItem[];
    totalAmount: bigint;
    stripeSessionId: string;
    status: string;
}

export type UserRole = { admin: null } | { user: null } | { guest: null };

export interface backendInterface {
    // Auth
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;

    // Products
    getProducts(): Promise<Product[]>;
    getProduct(id: bigint): Promise<Option<Product>>;
    addProduct(name: string, description: string, price: bigint, category: string, imageId: string): Promise<bigint>;
    updateProduct(id: bigint, name: string, description: string, price: bigint, category: string, imageId: string, inStock: boolean): Promise<boolean>;
    deleteProduct(id: bigint): Promise<boolean>;

    // Orders
    createCheckoutSession(items: OrderItem[], successUrl: string, cancelUrl: string): Promise<string>;
    verifyPayment(sessionId: string): Promise<string>;
    getOrders(): Promise<Order[]>;
    updateOrderStatus(id: bigint, status: string): Promise<boolean>;
}
