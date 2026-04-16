import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getProduct } from "@/lib/api";
import { MessageCircle, ArrowLeft } from "lucide-react";

const ProductDetail = () => {
  const { id = "" } = useParams();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <main className="pt-20 section-padding text-center">
        <p className="text-muted-foreground">Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-20 section-padding text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
  };

  const orderWhatsApp = () => {
    const msg = `Hi! I'd like to order: ${product.name} (Size: ${selectedSize || "N/A"}) - ${formatCurrency(product.price)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded overflow-hidden bg-muted">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" width={800} height={1024} />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={img + index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-24 rounded overflow-hidden border-2 transition-colors ${
                      activeImage === index ? "border-foreground" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {product.badge && (
              <span className="text-[10px] tracking-widest uppercase text-accent-foreground bg-accent px-2 py-1 rounded-sm">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-heading">{product.name}</h1>
            <p className="text-xl">{formatCurrency(product.price)}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            <div>
              <p className="text-sm font-medium mb-3">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded text-sm transition-colors ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button onClick={handleAddToCart} disabled={!selectedSize} className="w-full">
                {selectedSize ? "Add to Bag" : "Select a Size"}
              </Button>
              <Button onClick={orderWhatsApp} variant="outline" className="w-full gap-2">
                <MessageCircle size={18} />
                Order via WhatsApp
              </Button>
              <p className="text-xs text-center text-muted-foreground">Cash on Delivery · Free shipping over {formatCurrency(3000)}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
