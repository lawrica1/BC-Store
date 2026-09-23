"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ProductCategory } from "@bc-store/shared-types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/lib/products";
import { useLanguage } from "@/components/language-provider";
import { PRODUCTS_PAGE_SIZE, fetchProducts } from "@/lib/api";
import { NeonButton } from "@/components/neon-button";

const categories: Array<ProductCategory | "ALL"> = ["ALL", "CASQUE", "ECOUTEUR", "CHARGEUR", "POWERBANK", "TELEPHONE", "ORDINATEUR"];
type SortOption = "rating" | "price-asc" | "price-desc";

export default function BoutiquePage() {
  return (
    <Suspense fallback={null}>
      <BoutiqueContent />
    </Suspense>
  );
}

function BoutiqueContent() {
  const { dictionary } = useLanguage();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<ProductCategory | "ALL">("ALL");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  useEffect(() => {
    const fromUrl = searchParams.get("category") as ProductCategory | null;
    if (fromUrl && categories.includes(fromUrl)) {
      setCategory(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["products", category],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchProducts(category, pageParam),
    // A full page means there may be more; the local-fallback path returns fewer than a page, so it never shows the button.
    getNextPageParam: (lastPage, pages) => (lastPage.length >= PRODUCTS_PAGE_SIZE ? pages.length + 1 : undefined)
  });
  const apiProducts = useMemo(() => data?.pages.flat() ?? [], [data]);
  const sourceProducts = apiProducts.length ? apiProducts : products;
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12 lg:px-10">
        <h1 className="mb-4 text-2xl font-black text-textMain sm:text-3xl md:text-4xl">{dictionary.shop.title}</h1>

        <div className="mb-8 flex flex-col gap-4 border-b border-borderTech pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3 sm:gap-5">
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
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full border-borderTech bg-void text-textMain sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">{dictionary.shop.sortTopRated}</SelectItem>
              <SelectItem value="price-asc">{dictionary.shop.sortPriceAsc}</SelectItem>
              <SelectItem value="price-desc">{dictionary.shop.sortPriceDesc}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="glass-card h-max rounded-2xl p-4">
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

            <Accordion type="multiple" defaultValue={["brand"]} className="mt-2">
              <AccordionItem value="price" className="border-borderTech">
                <AccordionTrigger className="text-sm font-black uppercase tracking-normal text-textMain hover:no-underline">
                  {dictionary.shop.price}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder={dictionary.shop.priceMin}
                      value={priceMin}
                      onChange={(event) => setPriceMin(event.target.value)}
                      className="cyan-focus rounded-full border-borderTech bg-void text-textMain"
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder={dictionary.shop.priceMax}
                      value={priceMax}
                      onChange={(event) => setPriceMax(event.target.value)}
                      className="cyan-focus rounded-full border-borderTech bg-void text-textMain"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brand" className="border-none">
                <AccordionTrigger className="text-sm font-black uppercase tracking-normal text-textMain hover:no-underline">
                  {dictionary.shop.brand}
                </AccordionTrigger>
                <AccordionContent>
                  <Input
                    type="text"
                    placeholder={dictionary.shop.searchBrands}
                    value={brandSearch}
                    onChange={(event) => setBrandSearch(event.target.value)}
                    className="cyan-focus mb-3 rounded-full border-borderTech bg-void text-textMain"
                  />
                  <div className="grid gap-3">
                    {visibleBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm text-textMain">
                        <Checkbox checked={selectedBrands.includes(brand)} onCheckedChange={() => toggleBrand(brand)} />
                        {brand}
                      </label>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </aside>

          <section>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading
                ? [1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="glass-card h-60 animate-pulse rounded-2xl bg-slatePanel/60" />)
                : visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
            {hasNextPage ? (
              <div className="mt-6 flex justify-center">
                <NeonButton intent="ghost" disabled={isFetchingNextPage} onClick={() => void fetchNextPage()}>
                  {dictionary.shop.loadMore}
                </NeonButton>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
}
