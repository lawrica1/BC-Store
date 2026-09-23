"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { ProductViewModel } from "@/lib/products";
import { useLanguage } from "@/components/language-provider";
import { useCartStore } from "@/store/cart-store";
import { formatXaf } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/neon-button";

export function ProductCard({ product }: { product: ProductViewModel }) {
  const { dictionary, locale } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const inStock = product.stock > 0;
  const [wishlisted, setWishlisted] = useState(false);
  const onSale = product.originalPrice != null && product.originalPrice > product.price;
  const salePercent = onSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  return (
    <article className="glass-card lift-glow group grid gap-2.5 rounded-2xl p-3 hover:border-buyCyan/60 hover:shadow-cyanGlow">
      <div className="relative grid aspect-[4/3] place-items-center rounded-xl border border-borderTech bg-slatePanel/80">
        {onSale ? (
          <Badge variant="sale" className="absolute left-2 top-2 text-[10px]">
            {dictionary.shop.saleBadge.replace("{percent}", String(salePercent))}
          </Badge>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Wishlist"
          aria-pressed={wishlisted}
          onClick={() => setWishlisted((value) => !value)}
          className={`absolute right-2 top-2 h-7 w-7 rounded-full transition hover:-translate-y-0.5 ${
            wishlisted ? "border-serviceOrange bg-serviceOrange/10 text-serviceOrange" : "border-borderTech bg-void/60 text-textMuted"
          }`}
        >
          <Heart className="h-3.5 w-3.5" fill={wishlisted ? "currentColor" : "none"} />
        </Button>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-buyCyan/25 to-buyBlue/25 text-xl font-black text-buyCyan">
          {product.category.slice(0, 2)}
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-black uppercase tracking-normal text-textMuted">{product.brand}</span>
          <span className="flex items-center gap-1 font-bold text-textMain">
            <Star className="h-3 w-3 fill-serviceOrange text-serviceOrange" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-black text-buyCyan">{formatXaf(product.price, locale)}</span>
          {onSale ? <span className="text-xs text-textMuted line-through">{formatXaf(product.originalPrice!, locale)}</span> : null}
        </div>
        <h3 className="text-sm font-bold text-textMain">{product.name[locale]}</h3>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Badge variant={inStock ? "success" : "destructive"} className="text-[10px]">{inStock ? dictionary.shop.stock : dictionary.shop.out}</Badge>
        <Link className="text-xs font-black text-buyCyan hover:underline" href={`/boutique/${product.slug}`}>
          {dictionary.shop.view}
        </Link>
      </div>
      <div>
        <NeonButton
          intent="buy"
          disabled={!inStock}
          className="min-h-9 w-full px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => addItem({ id: product.id, name: product.name[locale], price: product.price, image: product.image })}
        >
          {dictionary.shop.add}
        </NeonButton>
      </div>
    </article>
  );
}
