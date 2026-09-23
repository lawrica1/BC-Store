import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/store/cart-store";

const item = { id: "prod-1", name: "Casque", price: 45000, image: "" };

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it("starts empty", () => {
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("adds items", () => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item);
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("clears the cart", () => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("persists to localStorage", () => {
    useCartStore.getState().addItem(item);
    expect(window.localStorage.getItem("bc-store-cart")).toContain("prod-1");
  });
});
