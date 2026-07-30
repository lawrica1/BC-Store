"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ProductCategory } from "@bc-store/shared-types";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/lib/products";
import { useLanguage } from "@/components/language-provider";
import { fetchProducts } from "@/lib/api";

const categories: Array<ProductCategory | "ALL"> = ["ALL", "CASQUE", "ECOUTEUR", "CHARGEUR", "POWERBANK", "TELEPHONE", "ORDINATEUR"];
type SortOption = "rating" | "price-asc" | "price-desc";

export default function BoutiquePage() {
  const { dictionary } = useLanguage();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<ProductCategory | "ALL">("ALL");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [priceOpen, setPriceOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(true);

  useEffect(() => {
    const fromUrl = searchParams.get("category") as ProductCategory | null;
    if (fromUrl && categories.includes(fromUrl)) {
      setCategory(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data: apiProducts, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: () => fetchProducts(category)
  });
  const sourceProducts = apiProducts?.length ? apiProducts : products;
  const categoryProducts = useMemo(
    () => (category === "ALL" ? sourceProducts : sourceProducts.filter((product) => product.category === category)),
    [category, sourceProducts]
  );

  const availableBrands = useMemo(
    () => Array.from(new Set(categoryProducts.map((product) => product.brand))).sort(),
    [categoryProducts]
  );

  const visibleBrands = useMemo(
    () => availableBrands.filter((brand) => brand.toLowerCase().includes(brandSearch.toLowerCase())),
    [availableBrands, brandSearch]
  );

  const visibleProducts = useMemo(() => {
    const min = priceMin !== "" ? Number(priceMin) : null;
    const max = priceMax !== "" ? Number(priceMax) : null;
    const filtered = categoryProducts.filter((product) => {
      if (selectedBrands.length && !selectedBrands.includes(product.brand)) return false;
      if (min !== null && product.price < min) return false;
      if (max !== null && product.price > max) return false;
      return true;
    });
    const sorted = [...filtered];
    if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [categoryProducts, selectedBrands, priceMin, priceMax, sortBy]);

  function toggleBrand(brand: string) {
    setSelectedBrands((current) => (current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]));
  }

  function resetFilters() {
    setSelectedBrands([]);
    setPriceMin("");
    setPriceMax("");
    setBrandSearch("");
  }

  const hasActiveFilters = selectedBrands.length > 0 || priceMin !== "" || priceMax !== "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
        <Breadcrumb items={[{ label: dictionary.nav.home, href: "/" }, { label: dictionary.nav.shop }]} />
        <h1 className="mb-6 text-4xl font-black text-textMain md:text-5xl">{dictionary.shop.title}</h1>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-borderTech pb-4">
          <div className="flex flex-wrap gap-5">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`border-b-2 pb-3 text-sm font-bold transition ${
                  category === item ? "border-buyCyan text-buyCyan" : "border-transparent text-textMuted hover:text-textMain"
                }`}
              >
                {dictionary.categories[item]}
              </button>
            ))}
          </div>
          <select
            className="cyan-focus rounded-full border border-borderTech bg-void px-4 py-2 text-sm text-textMain"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
          >
            <option value="rating">{dictionary.shop.sortTopRated}</option>
            <option value="price-asc">{dictionary.shop.sortPriceAsc}</option>
            <option value="price-desc">{dictionary.shop.sortPriceDesc}</option>
          </select>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="glass-card h-max rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-normal text-textMain">{dictionary.shop.filters}</h2>
              {hasActiveFilters ? (
                <button type="button" onClick={resetFilters} className="text-xs font-bold text-serviceOrange hover:underline">
                  ✕ {dictionary.shop.resetFilters}
                </button>
              ) : null}
            </div>

            {selectedBrands.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className="flex items-center gap-1 rounded-full border border-buyCyan/40 bg-buyCyan/10 px-3 py-1 text-xs font-bold text-buyCyan"
                  >
                    {brand} ✕
                  </button>
                ))}
              </div>
            ) : null}

            <CollapsibleSection title={dictionary.shop.price} open={priceOpen} onToggle={() => setPriceOpen((value) => !value)}>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder={dictionary.shop.priceMin}
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                  className="cyan-focus w-full rounded-full border border-borderTech bg-void px-3 py-2 text-sm text-textMain"
                />
                <input
                  type="number"
                  min={0}
                  placeholder={dictionary.shop.priceMax}
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                  className="cyan-focus w-full rounded-full border border-borderTech bg-void px-3 py-2 text-sm text-textMain"
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title={dictionary.shop.brand} open={brandOpen} onToggle={() => setBrandOpen((value) => !value)}>
              <input
                type="text"
                placeholder={dictionary.shop.searchBrands}
                value={brandSearch}
                onChange={(event) => setBrandSearch(event.target.value)}
                className="cyan-focus mb-3 w-full rounded-full border border-borderTech bg-void px-3 py-2 text-sm text-textMain"
              />
              <div className="grid gap-2">
                {visibleBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 text-sm text-textMain">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 accent-buyCyan"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </CollapsibleSection>
          </aside>

          <section>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? [1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="glass-card h-80 animate-pulse rounded-3xl bg-slatePanel/60" />)
                : visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 border-t border-borderTech pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="mb-3 flex w-full items-center justify-between text-sm font-black uppercase tracking-normal text-textMain"
      >
        {title}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open ? children : null}
    </div>
  );
}
