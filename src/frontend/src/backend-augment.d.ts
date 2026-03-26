import type { Principal } from "@icp-sdk/core/principal";
import type { Option, Order, OrderItem, Product, UserRole } from "./backend.d";

type BackendMethods = {
  _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
  getCallerUserRole(): Promise<UserRole>;
  isCallerAdmin(): Promise<boolean>;
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  getProducts(): Promise<Product[]>;
  getProduct(id: bigint): Promise<Option<Product>>;
  addProduct(
    name: string,
    description: string,
    price: bigint,
    category: string,
    imageId: string,
  ): Promise<bigint>;
  updateProduct(
    id: bigint,
    name: string,
    description: string,
    price: bigint,
    category: string,
    imageId: string,
    inStock: boolean,
  ): Promise<boolean>;
  deleteProduct(id: bigint): Promise<boolean>;
  createCheckoutSession(
    items: OrderItem[],
    successUrl: string,
    cancelUrl: string,
  ): Promise<string>;
  verifyPayment(sessionId: string): Promise<string>;
  getOrders(): Promise<Order[]>;
  updateOrderStatus(id: bigint, status: string): Promise<boolean>;
};

declare module "./backend" {
  interface backendInterface extends BackendMethods {}
  interface Backend extends BackendMethods {}
}
