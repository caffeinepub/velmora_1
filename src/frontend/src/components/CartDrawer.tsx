import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../context/CartContext";

/* ============================================
   HELPERS
   ============================================ */

const CATEGORY_IMAGES: Record<string, string> = {
  Hoodies: "/assets/generated/velmora-product-hoodie.dim_600x700.jpg",
  Jackets: "/assets/generated/velmora-product-jacket.dim_600x700.jpg",
  Trousers: "/assets/generated/velmora-product-trousers.dim_600x700.jpg",
  Accessories: "/assets/generated/velmora-product-bag.dim_600x700.jpg",
};

function formatPrice(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(dollars);
}

/* ============================================
   CART DRAWER
   ============================================ */

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  onCheckout,
}: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();

  const handleCheckout = () => {
    onOpenChange(false);
    onCheckout();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="cart.sheet"
        side="right"
        className="w-full sm:w-[420px] bg-charcoal-deep border-l border-charcoal-light/50 p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-charcoal-light/40">
          <SheetTitle className="font-display font-black uppercase tracking-widest text-foreground text-sm flex items-center gap-3">
            <ShoppingCart className="h-4 w-4 text-gold" />
            Your Cart
            {items.length > 0 && (
              <span className="ml-auto font-body text-xs text-muted-foreground font-normal">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Content */}
        {items.length === 0 ? (
          <div
            data-ocid="cart.empty_state"
            className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-12 text-center"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border border-charcoal-light/60 flex items-center justify-center">
                <ShoppingCart className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div className="absolute -inset-2 rounded-full border border-gold/10" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-sm uppercase tracking-widest mb-2">
                Your cart is empty
              </p>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Add pieces from the collection to get started.
              </p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-bold tracking-widest uppercase text-xs rounded-none px-8 py-3 btn-gold-glow transition-all duration-300 mt-2"
            >
              Explore Collection
            </Button>
          </div>
        ) : (
          <>
            {/* Items scroll area */}
            <ScrollArea className="flex-1 px-6">
              <ul className="py-4 space-y-4">
                <AnimatePresence initial={false}>
                  {items.map((item, index) => {
                    const imgSrc =
                      CATEGORY_IMAGES[item.product.category] ??
                      CATEGORY_IMAGES.Hoodies;
                    return (
                      <motion.li
                        key={item.product.id.toString()}
                        data-ocid={`cart.item.${index + 1}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.22 }}
                        className="flex gap-4 py-4 border-b border-charcoal-light/30 last:border-0"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-sm bg-charcoal-mid">
                          <img
                            src={imgSrc}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-foreground text-sm tracking-wide line-clamp-1 mb-0.5">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground font-body uppercase tracking-widest mb-3">
                            {item.product.category}
                          </p>
                          <div className="flex items-center justify-between">
                            {/* Qty controls */}
                            <div className="flex items-center border border-charcoal-light/60 rounded-none">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-gold transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-sm font-body text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-gold transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="font-display font-bold text-gold text-sm">
                              {formatPrice(
                                item.product.price * BigInt(item.quantity),
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="flex-shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors p-1 self-start mt-1"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-charcoal-light/40 bg-charcoal-mid/30 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-muted-foreground uppercase tracking-widest">
                  Subtotal
                </span>
                <span className="font-display font-black text-xl text-gold">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                Shipping &amp; taxes calculated at checkout
              </p>
              <Button
                data-ocid="cart.checkout_button"
                onClick={handleCheckout}
                className="w-full bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-bold tracking-widest uppercase text-xs rounded-none py-6 btn-gold-glow transition-all duration-300"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
