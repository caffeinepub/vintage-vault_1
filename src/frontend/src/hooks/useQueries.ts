import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { backendInterface as BackendAPI } from "../backend.d";
import type { Order, OrderItem, Product } from "../backend.d";
import { useActor } from "./useActor";

function getTypedActor(actor: unknown): BackendAPI {
  return actor as BackendAPI;
}

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return getTypedActor(actor).getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return getTypedActor(actor).getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return getTypedActor(actor).isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      name: string;
      description: string;
      price: bigint;
      category: string;
      imageId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return getTypedActor(actor).addProduct(
        p.name,
        p.description,
        p.price,
        p.category,
        p.imageId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      category: string;
      imageId: string;
      inStock: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return getTypedActor(actor).updateProduct(
        p.id,
        p.name,
        p.description,
        p.price,
        p.category,
        p.imageId,
        p.inStock,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return getTypedActor(actor).deleteProduct(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (p: {
      items: OrderItem[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return getTypedActor(actor).createCheckoutSession(
        p.items,
        p.successUrl,
        p.cancelUrl,
      );
    },
  });
}

export function useVerifyPayment() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Not connected");
      return getTypedActor(actor).verifyPayment(sessionId);
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return getTypedActor(actor).updateOrderStatus(p.id, p.status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
