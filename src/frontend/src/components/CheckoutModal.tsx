import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Loader2, Package, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ShippingAddress } from "../backend.d";
import { useCart } from "../context/CartContext";
import { usePlaceOrder } from "../hooks/useQueries";

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

function formatOrderNumber(id: bigint): string {
  return `#VMR-${id.toString().padStart(6, "0")}`;
}

/* ============================================
   FORM FIELD COMPONENT
   ============================================ */

interface FormFieldProps {
  label: string;
  ocid: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  error?: string;
  autoComplete?: string;
}

function FormField({
  label,
  ocid,
  required = false,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  autoComplete,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={ocid}
        className="text-[10px] tracking-widest uppercase font-body font-medium text-muted-foreground"
      >
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </Label>
      <Input
        id={ocid}
        data-ocid={ocid}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`bg-charcoal-mid border-charcoal-light text-foreground placeholder:text-muted-foreground/50 rounded-none font-body text-sm focus-visible:ring-gold focus-visible:border-gold transition-colors h-11 ${
          error ? "border-destructive focus-visible:ring-destructive" : ""
        }`}
      />
      {error && (
        <p
          data-ocid={`${ocid}_error`}
          className="text-xs text-destructive font-body"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================
   ORDER CONFIRMATION
   ============================================ */

interface OrderConfirmationProps {
  orderId: bigint;
  shippingAddress: ShippingAddress;
  onClose: () => void;
}

function OrderConfirmation({
  orderId,
  shippingAddress,
  onClose,
}: OrderConfirmationProps) {
  const { items, subtotal, clearCart } = useCart();

  const handleContinue = () => {
    clearCart();
    onClose();
  };

  return (
    <motion.div
      data-ocid="checkout.success_state"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center text-center px-6 py-10 gap-6 max-w-lg mx-auto"
    >
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-gold/40 flex items-center justify-center bg-gold/10">
          <CheckCircle2 className="h-9 w-9 text-gold" />
        </div>
        <div className="absolute -inset-3 rounded-full border border-gold/15 animate-pulse" />
      </div>

      {/* Order confirmed */}
      <div>
        <p className="text-gold font-body text-xs tracking-[0.4em] uppercase mb-2">
          Order Confirmed
        </p>
        <h2 className="font-display font-black text-3xl uppercase tracking-tight text-foreground mb-1">
          Thank You
        </h2>
        <p className="text-muted-foreground font-body text-sm mb-3">
          Your order has been placed successfully.
        </p>
        <div className="inline-block border border-gold/40 px-6 py-2.5 bg-gold/10">
          <p className="font-display font-black text-gold text-xl tracking-wider">
            {formatOrderNumber(orderId)}
          </p>
        </div>
      </div>

      {/* Items ordered */}
      <div className="w-full border border-charcoal-light/50 bg-charcoal-mid/40">
        <div className="px-5 py-3 border-b border-charcoal-light/40">
          <p className="text-[10px] tracking-widest uppercase font-body text-muted-foreground flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            Order Summary
          </p>
        </div>
        <ul className="divide-y divide-charcoal-light/30">
          {items.map((item) => (
            <li
              key={item.product.id.toString()}
              className="flex items-center justify-between px-5 py-3 gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-12 flex-shrink-0 overflow-hidden bg-charcoal-light/30">
                  <img
                    src={
                      CATEGORY_IMAGES[item.product.category] ??
                      CATEGORY_IMAGES.Hoodies
                    }
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-foreground text-xs line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-muted-foreground font-body text-[10px] tracking-widest uppercase">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-display font-bold text-gold text-sm flex-shrink-0">
                {formatPrice(item.product.price * BigInt(item.quantity))}
              </span>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3 border-t border-charcoal-light/40 flex justify-between items-center">
          <span className="text-[10px] tracking-widest uppercase font-body text-muted-foreground">
            Total
          </span>
          <span className="font-display font-black text-gold text-lg">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>

      {/* Shipping address */}
      <div className="w-full border border-charcoal-light/50 bg-charcoal-mid/40 px-5 py-4 text-left">
        <p className="text-[10px] tracking-widest uppercase font-body text-muted-foreground mb-3">
          Ships To
        </p>
        <p className="font-display font-semibold text-foreground text-sm">
          {shippingAddress.firstName} {shippingAddress.lastName}
        </p>
        <p className="text-muted-foreground font-body text-xs mt-1 leading-relaxed">
          {shippingAddress.addressLine1}
          {shippingAddress.addressLine2
            ? `, ${shippingAddress.addressLine2}`
            : ""}
          <br />
          {shippingAddress.city}, {shippingAddress.state}{" "}
          {shippingAddress.postalCode}
          <br />
          {shippingAddress.country}
        </p>
      </div>

      {/* CTA */}
      <Button
        data-ocid="checkout.close_button"
        onClick={handleContinue}
        className="w-full bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-bold tracking-widest uppercase text-xs rounded-none py-6 btn-gold-glow transition-all duration-300"
      >
        Continue Shopping
      </Button>
    </motion.div>
  );
}

/* ============================================
   CHECKOUT FORM STATE
   ============================================ */

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";
  if (!form.email.trim() || !form.email.includes("@"))
    errors.email = "Valid email is required";
  if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.state.trim()) errors.state = "State/Region is required";
  if (!form.postalCode.trim()) errors.postalCode = "Postal code is required";
  if (!form.country.trim()) errors.country = "Country is required";
  return errors;
}

/* ============================================
   CHECKOUT MODAL
   ============================================ */

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, subtotal } = useCart();
  const placeOrder = usePlaceOrder();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmedOrderId, setConfirmedOrderId] = useState<bigint | null>(null);
  const [confirmedAddress, setConfirmedAddress] =
    useState<ShippingAddress | null>(null);

  const setField = (key: keyof FormState) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const shippingAddress: ShippingAddress = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
    };

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: BigInt(item.quantity),
      unitPrice: item.product.price,
    }));

    try {
      const orderId = await placeOrder.mutateAsync({
        customerEmail: form.email.trim(),
        items: orderItems,
        shippingAddress,
      });
      setConfirmedOrderId(orderId);
      setConfirmedAddress(shippingAddress);
    } catch (err) {
      console.error("Order placement failed", err);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset on close (after animation)
    setTimeout(() => {
      setForm(EMPTY_FORM);
      setErrors({});
      setConfirmedOrderId(null);
      setConfirmedAddress(null);
      placeOrder.reset();
    }, 300);
  };

  if (!open) return null;

  const isConfirmed = confirmedOrderId !== null && confirmedAddress !== null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            onClick={!isConfirmed ? handleClose : undefined}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            data-ocid="checkout.dialog"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <dialog
              open
              aria-label="Checkout"
              className="relative w-full max-w-4xl bg-charcoal-deep border border-charcoal-light/50 shadow-deep pointer-events-auto max-h-[90vh] flex flex-col m-0 p-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal-light/40 flex-shrink-0">
                <div>
                  <p className="text-gold font-body text-[10px] tracking-[0.4em] uppercase mb-0.5">
                    Velmora
                  </p>
                  <h2 className="font-display font-black uppercase tracking-widest text-foreground text-base">
                    {isConfirmed ? "Order Confirmed" : "Checkout"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-none hover:bg-charcoal-light/30"
                  aria-label="Close checkout"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {isConfirmed ? (
                    <ScrollArea
                      key="confirmation"
                      className="h-full max-h-[calc(90vh-5rem)]"
                    >
                      <OrderConfirmation
                        orderId={confirmedOrderId}
                        shippingAddress={confirmedAddress}
                        onClose={handleClose}
                      />
                    </ScrollArea>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] max-h-[calc(90vh-5rem)]">
                        {/* Left: Form */}
                        <ScrollArea className="border-r border-charcoal-light/40">
                          <form
                            onSubmit={handleSubmit}
                            id="checkout-form"
                            className="px-6 py-6 space-y-6"
                          >
                            {/* Contact */}
                            <div>
                              <p className="text-[10px] tracking-widest uppercase font-body text-gold mb-4">
                                Contact Information
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  label="First Name"
                                  ocid="checkout.firstname_input"
                                  required
                                  placeholder="Marcus"
                                  value={form.firstName}
                                  onChange={setField("firstName")}
                                  autoComplete="given-name"
                                  error={errors.firstName}
                                />
                                <FormField
                                  label="Last Name"
                                  ocid="checkout.lastname_input"
                                  required
                                  placeholder="Sterling"
                                  value={form.lastName}
                                  onChange={setField("lastName")}
                                  autoComplete="family-name"
                                  error={errors.lastName}
                                />
                              </div>
                              <div className="mt-4">
                                <FormField
                                  label="Email Address"
                                  ocid="checkout.email_input"
                                  required
                                  type="email"
                                  placeholder="marcus@example.com"
                                  value={form.email}
                                  onChange={setField("email")}
                                  autoComplete="email"
                                  error={errors.email}
                                />
                              </div>
                            </div>

                            {/* Shipping divider */}
                            <div className="relative">
                              <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-charcoal-light/40" />
                              <p className="relative inline-block bg-charcoal-deep pr-3 text-[10px] tracking-widest uppercase font-body text-gold">
                                Shipping Address
                              </p>
                            </div>

                            {/* Shipping */}
                            <div className="space-y-4">
                              <FormField
                                label="Address Line 1"
                                ocid="checkout.address1_input"
                                required
                                placeholder="123 Nightfall Avenue"
                                value={form.addressLine1}
                                onChange={setField("addressLine1")}
                                autoComplete="address-line1"
                                error={errors.addressLine1}
                              />
                              <FormField
                                label="Address Line 2"
                                ocid="checkout.address2_input"
                                placeholder="Apt 4B, Floor 12 (optional)"
                                value={form.addressLine2}
                                onChange={setField("addressLine2")}
                                autoComplete="address-line2"
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  label="City"
                                  ocid="checkout.city_input"
                                  required
                                  placeholder="New York"
                                  value={form.city}
                                  onChange={setField("city")}
                                  autoComplete="address-level2"
                                  error={errors.city}
                                />
                                <FormField
                                  label="State / Region"
                                  ocid="checkout.state_input"
                                  required
                                  placeholder="NY"
                                  value={form.state}
                                  onChange={setField("state")}
                                  autoComplete="address-level1"
                                  error={errors.state}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  label="Postal Code"
                                  ocid="checkout.postalcode_input"
                                  required
                                  placeholder="10001"
                                  value={form.postalCode}
                                  onChange={setField("postalCode")}
                                  autoComplete="postal-code"
                                  error={errors.postalCode}
                                />
                                <FormField
                                  label="Country"
                                  ocid="checkout.country_input"
                                  required
                                  placeholder="United States"
                                  value={form.country}
                                  onChange={setField("country")}
                                  autoComplete="country-name"
                                  error={errors.country}
                                />
                              </div>
                            </div>

                            {/* Submit error */}
                            {placeOrder.isError && (
                              <div
                                data-ocid="checkout.error_state"
                                className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-body"
                              >
                                <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  Failed to place order. Please try again.
                                </span>
                              </div>
                            )}

                            {/* Mobile submit */}
                            <div className="lg:hidden pt-2">
                              <Button
                                data-ocid="checkout.submit_button"
                                type="submit"
                                disabled={placeOrder.isPending}
                                className="w-full bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-bold tracking-widest uppercase text-xs rounded-none py-6 btn-gold-glow transition-all duration-300"
                              >
                                {placeOrder.isPending ? (
                                  <>
                                    <Loader2
                                      className="mr-2 h-4 w-4 animate-spin"
                                      data-ocid="checkout.loading_state"
                                    />
                                    Placing Order...
                                  </>
                                ) : (
                                  `Place Order · ${formatPrice(subtotal)}`
                                )}
                              </Button>
                            </div>
                          </form>
                        </ScrollArea>

                        {/* Right: Order Summary */}
                        <div className="flex flex-col bg-charcoal-mid/30">
                          <div className="px-5 py-4 border-b border-charcoal-light/40">
                            <p className="text-[10px] tracking-widest uppercase font-body text-muted-foreground">
                              Order Summary
                            </p>
                          </div>
                          <ScrollArea className="flex-1">
                            <ul className="divide-y divide-charcoal-light/30 px-5">
                              {items.map((item) => {
                                const imgSrc =
                                  CATEGORY_IMAGES[item.product.category] ??
                                  CATEGORY_IMAGES.Hoodies;
                                return (
                                  <li
                                    key={item.product.id.toString()}
                                    className="flex items-center gap-3 py-4"
                                  >
                                    <div className="relative w-14 h-16 flex-shrink-0 overflow-hidden bg-charcoal-light/20">
                                      <img
                                        src={imgSrc}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-charcoal-light/80 border border-charcoal-light flex items-center justify-center">
                                        <span className="text-[9px] font-display font-bold text-foreground">
                                          {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-display font-semibold text-foreground text-xs line-clamp-1">
                                        {item.product.name}
                                      </p>
                                      <p className="text-muted-foreground font-body text-[10px] tracking-widest uppercase mt-0.5">
                                        {item.product.category}
                                      </p>
                                    </div>
                                    <span className="font-display font-bold text-gold text-sm flex-shrink-0">
                                      {formatPrice(
                                        item.product.price *
                                          BigInt(item.quantity),
                                      )}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </ScrollArea>
                          <div className="px-5 py-5 border-t border-charcoal-light/40 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground font-body uppercase tracking-widest">
                                Subtotal
                              </span>
                              <span className="font-display font-black text-xl text-gold">
                                {formatPrice(subtotal)}
                              </span>
                            </div>
                            <div className="hidden lg:block">
                              <Button
                                data-ocid="checkout.submit_button"
                                type="submit"
                                form="checkout-form"
                                disabled={placeOrder.isPending}
                                className="w-full bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-bold tracking-widest uppercase text-xs rounded-none py-6 btn-gold-glow transition-all duration-300"
                              >
                                {placeOrder.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Placing Order...
                                  </>
                                ) : (
                                  `Place Order · ${formatPrice(subtotal)}`
                                )}
                              </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 font-body text-center">
                              By placing your order you agree to our terms of
                              service.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </dialog>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
