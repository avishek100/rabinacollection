import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/product";

const ProductCard = ({ product }: { product: Product }) => (
  <Link to={`/product/${product.id}`} className="group block">
    <article className="rounded-xl border border-border/70 bg-card p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="image-zoom rounded-lg overflow-hidden bg-muted aspect-[3/4]">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        width={800}
        height={1024}
      />
    </div>
    <div className="mt-3 space-y-1 px-1 pb-1">
      {product.badge && (
        <span className="text-[10px] tracking-widest uppercase text-accent-foreground bg-accent px-2 py-0.5 rounded-sm">
          {product.badge}
        </span>
      )}
      <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
      <p className="text-sm text-muted-foreground">{product.category}</p>
      <p className="text-sm font-medium">{formatCurrency(product.price)}</p>
    </div>
    </article>
  </Link>
);

export default ProductCard;
