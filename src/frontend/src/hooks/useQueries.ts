import { useMutation, useQuery } from "@tanstack/react-query";
import type { Category } from "../backend.d";
import { useActor } from "./useActor";

export function useGetFeaturedProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductsByCategory(category: Category | "All") {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["productsByCategory", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getAllProducts();
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubscribe() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.subscribe(email);
    },
  });
}
