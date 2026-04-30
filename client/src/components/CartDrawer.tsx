import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { MessageCircle, Trash2, X } from "lucide-react";

const CartDrawer = () => {
  const { items, removeItem, totalPrice, isOpen, setIsOpen } = useCart();

  if (!isOpen) return null;

  const orderViaWhatsApp = () => {
    const itemLines = items.flatMap((i, index) => {
      const imageUrl = i.product.images?.[0] || i.product.image;
      return [
        `📦 *Item ${index + 1}*`,
        `📌 *Product:* ${i.product.name}`,
        `🏷️ *Category:* ${i.product.category}`,
        `🔢 *Qty:* ${i.quantity}`,
        `💰 *Price:* ${formatCurrency(i.product.price * i.quantity)}`,
        `🖼️ *Image:* ${imageUrl}`,
        ``,
      ];
    });

    const total = `💳 *Total: ${formatCurrency(totalPrice)}*`;
    const msg = [
      `🛍️ *Custom Order Request*`,
      ``,
      ...itemLines,
      total,
      ``,
      `Please let me know how to proceed with custom measurements!`,
    ].join("\n");

    const waBase = import.meta.env.VITE_WHATSAPP_BASE || "https://wa.me/";
    const url = `${waBase}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setIsOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="font-heading text-lg">Your Bag</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {items.map((item) => (
                <div key={item.product.id + item.size} className="flex gap-3 sm:gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-16 sm:w-20 h-20 sm:h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Size: {item.size} · Qty: {item.quantity}</p>
                    <p className="text-sm mt-1">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 sm:p-6 border-t border-border space-y-4">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <Button onClick={orderViaWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-primary-foreground gap-2">
                <MessageCircle size={18} />
                Order via WhatsApp
              </Button>
              <p className="text-xs text-center text-muted-foreground">Cash on Delivery available</p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
