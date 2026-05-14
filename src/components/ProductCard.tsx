import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/types";
import { formatPKR } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.sale_price != null && product.sale_price < product.price;
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-sm">
        <img
          src={product.images[0] ?? "/images/perfume-1.jpg"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {onSale && (
          <span className="absolute top-3 left-3 bg-gold text-gold-foreground text-[10px] uppercase tracking-[0.15em] px-2 py-1">Sale</span>
        )}
        {!product.in_stock && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.15em] px-2 py-1">Sold Out</span>
        )}
      </div>
      <div className="mt-4 text-center">
        <h3 className="font-display text-xl">{product.name}</h3>
        {product.short_description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.short_description}</p>
        )}
        <p className="mt-2 text-sm">
          {onSale ? (
            <>
              <span className="text-muted-foreground line-through mr-2">{formatPKR(product.price)}</span>
              <span className="text-gold font-medium">{formatPKR(product.sale_price!)}</span>
            </>
          ) : (
            <span>{formatPKR(product.price)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
