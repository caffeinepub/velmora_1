# Velmora

## Current State

The app is a luxury menswear brand site with:
- Hero section, featured products, full collection with category filters
- About section and newsletter signup
- Backend: products, categories, subscriber list
- No cart, no checkout, no order flow

## Requested Changes (Diff)

### Add
- Shopping cart: add products to cart from product cards, view cart with quantities and totals
- Cart drawer/modal: slides open from the side or as an overlay showing cart items, subtotal, and a "Checkout" button
- Checkout page/modal: collects full shipping address (first name, last name, email, address line 1, address line 2 optional, city, state/region, postal code, country) and simple order form fields (no real payment processing)
- Order confirmation screen: shown after submitting the form, displays order summary (items, total, shipping address), a unique order reference number, and a thank-you message
- Backend: `placeOrder` mutation to store orders with items, shipping address, customer info, and return an order ID

### Modify
- ProductCard: "Add to Cart" button now adds the item to cart state and triggers a brief visual feedback
- Navbar: add a cart icon with item count badge

### Remove
- Nothing removed

## Implementation Plan

1. Backend: add `OrderItem`, `ShippingAddress`, `Order` types and `placeOrder` / `getOrder` endpoints
2. Frontend: implement cart state (React context or useState at App level) tracking items + quantities
3. Frontend: CartDrawer component — slides in from the right, lists items with quantities, subtotal, "Checkout" CTA
4. Frontend: CheckoutModal — full-screen or large modal with two sections: Shipping Address form + Order Summary, and a "Place Order" submit button
5. Frontend: OrderConfirmation view — shown after successful `placeOrder` call, shows order ID, items, total, address
6. Frontend: wire ProductCard "Add to Cart" to cart state, update Navbar with cart icon + badge
