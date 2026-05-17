import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPKR } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import { useCartDrawer } from "@/components/CartDrawer";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";

export function ProductCard({ product, collectionLabel }: { product: Product; collectionLabel?: string }) {
  const { add } = useCart();
  const { setOpen } = useCartDrawer();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const onSale = product.sale_price != null && product.sale_price < product.price;
  const price = product.sale_price ?? product.price;
  const off = onSale ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0;
  const image = product.images[0] ?? "/images/perfume-1.jpg";
  const label = collectionLabel ?? (product.category_slug ? `${product.category_slug.toUpperCase()} COLLECTION` : "SIGNATURE COLLECTION");

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({ product_id: product.id, slug: product.slug, name: product.name, price, image }, 1);
    toast.success(`${product.name} added to cart`);
    setOpen(true);
  };

  return (
    <div className="group bg-zinc-950 text-white border border-white/10 hover:border-gold/40 transition-all duration-300 flex flex-col">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-black">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {onSale && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2 py-1 rounded">
              -{off}%
            </span>
          )}
          {!product.in_stock && (
            <span className="absolute top-3 left-3 bg-zinc-800 text-white text-[10px] uppercase tracking-[0.15em] px-2 py-1">
              Sold Out
            </span>
          )}
          <button
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition"
          >
            <Heart className={`h-4 w-4 transition-all ${wished ? "text-red-500 fill-red-500 scale-110" : "text-white"}`} />
          </button>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to="/products/$slug" params={{ slug: product.slug }} className="block flex-1">
          <p className="text-[10px] tracking-[0.2em] text-gold font-medium">{label}</p>
          <h3 className="font-display text-2xl mt-1 leading-tight">{product.name}</h3>
          <p className="mt-2 text-sm flex items-center gap-2">
            {onSale && <span className="text-white/40 line-through text-xs">{formatPKR(product.price)}</span>}
            <span className="text-white font-medium">{formatPKR(price)}</span>
          </p>
          {product.short_description && (
            <p className="text-xs text-white/50 mt-1.5 line-clamp-1">{product.short_description}</p>
          )}
        </Link>
        <button
          onClick={handleAdd}
          disabled={!product.in_stock}
          className="mt-4 w-full bg-gold text-black font-semibold uppercase tracking-[0.15em] text-xs py-3.5 hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.in_stock ? "+ Add to Cart" : "Sold Out"}
        </button>
      </div>
    </div>
  );
}
