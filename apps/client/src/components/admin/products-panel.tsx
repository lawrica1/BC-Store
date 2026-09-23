"use client";

import { useRef, useState } from "react";
import type { DragEvent, FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import type { ProductCategory } from "@bc-store/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { NeonButton } from "@/components/neon-button";
import { useLanguage } from "@/components/language-provider";
import { createProduct, deactivateProduct, fetchAdminProducts, updateProduct, uploadProductImage } from "@/lib/api";
import { formatXaf } from "@/lib/utils";

const CATEGORIES: ProductCategory[] = ["CASQUE", "ECOUTEUR", "CHARGEUR", "POWERBANK", "TELEPHONE", "ORDINATEUR"];

export function ProductsPanel() {
  const { dictionary, locale } = useLanguage();
  const copy = dictionary.admin.products;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: fetchAdminProducts });

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("CASQUE");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [togglingId, setTogglingId] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function pickImage(file: File | null) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    if (!file && fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) pickImage(file);
  }

  function resetForm() {
    setName("");
    setCategory("CASQUE");
    setPrice("");
    setStock("");
    setDescription("");
    pickImage(null);
  }

  async function refreshProducts() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] })
    ]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isInteger(parsedStock) || parsedStock < 0) {
      setFeedback({ ok: false, message: copy.error });
      return;
    }

    setSubmitting(true);
    try {
      const images = imageFile ? [(await uploadProductImage(imageFile)).url] : [];
      await createProduct({
        name: name.trim(),
        category,
        price: parsedPrice,
        stock: parsedStock,
        description: description.trim() || undefined,
        images
      });
      await refreshProducts();
      setFeedback({ ok: true, message: copy.success });
      resetForm();
    } catch (error) {
      setFeedback({ ok: false, message: error instanceof Error ? error.message : copy.error });
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setTogglingId(id);
    try {
      await (isActive ? deactivateProduct(id) : updateProduct(id, { isActive: true }));
      await refreshProducts();
    } finally {
      setTogglingId("");
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="glass-card grid gap-4 rounded-2xl p-4 sm:p-5">
        <h2 className="text-lg font-black text-textMain">{copy.addProduct}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Label className="grid gap-2 text-sm font-bold text-textMain">
            <span>{copy.name}</span>
            <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder={copy.namePlaceholder} className="border-borderTech bg-void text-textMain" />
          </Label>
          <Label className="grid gap-2 text-sm font-bold text-textMain">
            <span>{copy.category}</span>
            <Select value={category} onValueChange={(value) => setCategory(value as ProductCategory)}>
              <SelectTrigger aria-label={copy.category} className="border-borderTech bg-void text-textMain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {dictionary.categories[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
          <Label className="grid gap-2 text-sm font-bold text-textMain">
            <span>{copy.price}</span>
            <Input type="number" min={0} required value={price} onChange={(event) => setPrice(event.target.value)} className="border-borderTech bg-void text-textMain" />
          </Label>
          <Label className="grid gap-2 text-sm font-bold text-textMain">
            <span>{copy.stock}</span>
            <Input type="number" min={0} step={1} required value={stock} onChange={(event) => setStock(event.target.value)} className="border-borderTech bg-void text-textMain" />
          </Label>
        </div>
        <Label className="grid gap-2 text-sm font-bold text-textMain">
          <span>{copy.description}</span>
          <Textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="border-borderTech bg-void text-textMain" />
        </Label>

        <div className="grid gap-2">
          <span className="text-sm font-bold text-textMain">{copy.photo}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(event) => pickImage(event.target.files?.[0] ?? null)}
          />
          {imagePreview ? (
            <div className="relative w-fit">
              <img src={imagePreview} alt="" className="h-28 w-28 rounded-xl border border-borderTech object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => pickImage(null)}
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs text-white"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed py-8 text-sm text-textMuted transition ${
                dragOver ? "border-buyCyan bg-buyCyan/5" : "border-borderTech"
              }`}
            >
              <ImageIcon className="h-7 w-7" />
              {copy.dropPhoto}
            </div>
          )}
        </div>

        {feedback ? (
          <p className={`text-sm font-bold ${feedback.ok ? "text-successEmerald" : "text-red-400"}`}>{feedback.message}</p>
        ) : null}

        <NeonButton type="submit" intent="buy" disabled={submitting} className="justify-self-start disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? copy.submitting : copy.publish}
        </NeonButton>
      </form>

      <section className="grid gap-3">
        <h2 className="text-lg font-black text-textMain">{copy.existing}</h2>
        {isLoading ? (
          <div className="grid gap-2">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !products?.length ? (
          <p className="text-sm text-textMuted">{copy.none}</p>
        ) : (
          <div className="glass-card overflow-x-auto rounded-2xl">
            <Table className="min-w-[620px]">
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-borderTech">
                    <TableCell className="w-14">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg border border-dashed border-borderTech text-textMuted">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-textMain">{product.name}</TableCell>
                    <TableCell className="text-textMuted">{dictionary.categories[product.category]}</TableCell>
                    <TableCell className="text-buyCyan">{formatXaf(Number(product.price), locale)}</TableCell>
                    <TableCell className="text-textMuted">{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "success" : "destructive"}>{product.isActive ? copy.active : copy.inactive}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={togglingId === product.id}
                        onClick={() => void toggleActive(product.id, product.isActive)}
                        className="border-borderTech text-textMain"
                      >
                        {product.isActive ? copy.deactivate : copy.activate}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
