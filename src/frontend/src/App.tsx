import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Instagram,
  Loader2,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Twitter,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiX } from "react-icons/si";
import { toast } from "sonner";
import { Category, type Product } from "./backend.d";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { CartProvider, useCart } from "./context/CartContext";
import {
  useGetFeaturedProducts,
  useGetProductsByCategory,
  useSubscribe,
} from "./hooks/useQueries";

/* ============================================
   CONSTANTS & HELPERS
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

const NAV_LINKS = [
  { label: "Home", href: "#home", ocid: "nav.home_link" },
  { label: "Collection", href: "#collection", ocid: "nav.collection_link" },
  { label: "About", href: "#about", ocid: "nav.about_link" },
  { label: "Contact", href: "#contact", ocid: "nav.contact_link" },
];

const FALLBACK_FEATURED: Product[] = [
  {
    id: 1n,
    name: "Obsidian Heavyweight Hoodie",
    description:
      "Premium 500gsm fleece, brushed interior, oversized silhouette.",
    isFeatured: true,
    category: Category.Hoodies,
    price: 28500n,
  },
  {
    id: 2n,
    name: "Phantom Bomber Jacket",
    description: "Technical shell with YKK gold hardware. Refined utility.",
    isFeatured: true,
    category: Category.Jackets,
    price: 49500n,
  },
  {
    id: 3n,
    name: "Sovereign Cargo Trousers",
    description: "Tailored tapered fit with articulated knee panelling.",
    isFeatured: true,
    category: Category.Trousers,
    price: 32000n,
  },
  {
    id: 4n,
    name: "Noir Crossbody Bag",
    description: "Full-grain leather with brushed gold hardware detailing.",
    isFeatured: true,
    category: Category.Accessories,
    price: 19500n,
  },
];

const FALLBACK_COLLECTION: Product[] = [
  ...FALLBACK_FEATURED,
  {
    id: 5n,
    name: "Shadow Zip Hoodie",
    description: "Half-zip technical fleece with tonal branding.",
    isFeatured: false,
    category: Category.Hoodies,
    price: 24000n,
  },
  {
    id: 6n,
    name: "Eclipse Harrington Jacket",
    description: "Lightweight structured jacket with contrast lining.",
    isFeatured: false,
    category: Category.Jackets,
    price: 41500n,
  },
  {
    id: 7n,
    name: "Stealth Track Trousers",
    description: "Slim tapered with elasticated waist and ankle cuffs.",
    isFeatured: false,
    category: Category.Trousers,
    price: 27500n,
  },
  {
    id: 8n,
    name: "Gold Link Chain",
    description: "Hand-forged Cuban link in brushed vermeil finish.",
    isFeatured: false,
    category: Category.Accessories,
    price: 15000n,
  },
];

/* ============================================
   PRODUCT CARD
   ============================================ */

interface ProductCardProps {
  product: Product;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const imgSrc = CATEGORY_IMAGES[product.category] ?? CATEGORY_IMAGES.Hoodies;
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`, {
      description: formatPrice(product.price),
      duration: 2500,
    });
  };

  return (
    <motion.div
      data-ocid={`product.item.${index + 1}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
      className="group relative overflow-hidden rounded-sm bg-charcoal-mid border border-charcoal-light transition-all duration-500 card-glow"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-black/60 text-gold border border-gold/30 text-[10px] tracking-widest uppercase font-body font-medium backdrop-blur-sm">
            {product.category}
          </Badge>
        </div>
        {/* Featured tag */}
        {product.isFeatured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gold/90 text-charcoal-deep border-0 text-[10px] tracking-widest uppercase font-body font-semibold">
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-foreground text-base tracking-wide mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm font-body line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-gold text-lg">
            {formatPrice(product.price)}
          </span>
          <Button
            data-ocid={`product.button.${index + 1}`}
            size="sm"
            onClick={handleAddToCart}
            className="bg-transparent border border-gold/40 text-gold hover:bg-gold hover:text-charcoal-deep transition-all duration-300 text-xs tracking-widest uppercase font-body btn-gold-glow rounded-none"
          >
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================
   SKELETON CARD
   ============================================ */

function ProductSkeleton() {
  return (
    <div className="rounded-sm bg-charcoal-mid border border-charcoal-light overflow-hidden">
      <div className="aspect-[3/4] bg-charcoal-light animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-charcoal-light rounded animate-pulse w-3/4" />
        <div className="h-3 bg-charcoal-light rounded animate-pulse w-full" />
        <div className="h-3 bg-charcoal-light rounded animate-pulse w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-charcoal-light rounded animate-pulse w-20" />
          <div className="h-8 bg-charcoal-light rounded animate-pulse w-28" />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   NAVBAR
   ============================================ */

interface NavbarProps {
  onCartOpen: () => void;
}

function Navbar({ onCartOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-charcoal-deep/95 backdrop-blur-md border-b border-charcoal-light/50"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollToSection("#home")}
            className="flex items-center"
          >
            <img
              src="/assets/generated/velmora-logo-transparent.dim_400x160.png"
              alt="Velmora"
              className="h-9 w-auto object-contain"
            />
          </button>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  data-ocid={link.ocid}
                  onClick={() => scrollToSection(link.href)}
                  className="text-muted-foreground hover:text-gold transition-colors duration-300 text-xs tracking-widest uppercase font-body font-medium"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* CTA + Cart + Mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Cart icon */}
            <button
              type="button"
              data-ocid="nav.cart_button"
              onClick={onCartOpen}
              aria-label="Open cart"
              className="relative p-2 text-muted-foreground hover:text-gold transition-colors duration-300"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gold text-charcoal-deep text-[9px] font-display font-black rounded-full flex items-center justify-center px-1 leading-none"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Button
              data-ocid="nav.shop_button"
              onClick={() => scrollToSection("#collection")}
              className="hidden md:flex bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-semibold tracking-widest uppercase text-xs rounded-none px-6 btn-gold-glow transition-all duration-300"
            >
              Shop Now
            </Button>
            <button
              type="button"
              className="md:hidden text-foreground p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 z-40 bg-charcoal-deep/98 backdrop-blur-md border-b border-charcoal-light/50 md:hidden"
          >
            <ul className="flex flex-col px-6 py-6 gap-5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    data-ocid={link.ocid}
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-gold transition-colors duration-300 text-sm tracking-widest uppercase font-body font-medium w-full text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li className="pt-2">
                <Button
                  data-ocid="nav.shop_button"
                  onClick={() => scrollToSection("#collection")}
                  className="bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-semibold tracking-widest uppercase text-xs rounded-none px-6 w-full btn-gold-glow"
                >
                  Shop Now
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================
   HERO SECTION
   ============================================ */

function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/assets/generated/velmora-hero.dim_1600x900.jpg')",
        }}
      />
      {/* Multi-layer overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-deep/70 via-charcoal-deep/40 to-charcoal-deep/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/60 via-transparent to-charcoal-deep/60" />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Pre-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-gold font-body text-xs tracking-[0.4em] uppercase mb-6"
        >
          Luxury Menswear · Est. 2024
        </motion.p>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="font-display font-black uppercase leading-none tracking-tight mb-6"
        >
          <span className="block text-[clamp(3rem,9vw,8rem)] text-foreground">
            WEAR THE
          </span>
          <span className="block text-[clamp(3rem,9vw,8rem)] text-gradient-gold">
            STREETS.
          </span>
          <span className="block text-[clamp(3rem,9vw,8rem)] text-foreground">
            OWN THE NIGHT.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-muted-foreground font-body text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Where luxury meets the streets. Crafted for the modern man who
          commands respect without asking for it.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            data-ocid="hero.cta_button"
            onClick={() =>
              document
                .querySelector("#collection")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-bold tracking-widest uppercase text-sm rounded-none px-10 py-6 btn-gold-glow transition-all duration-300 group"
          >
            Explore Collection
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={() =>
              document
                .querySelector("#about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            variant="outline"
            className="border-foreground/30 text-foreground hover:border-gold hover:text-gold bg-transparent font-display font-medium tracking-widest uppercase text-sm rounded-none px-10 py-6 transition-all duration-300"
          >
            Our Story
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-body">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.8,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="h-4 w-4 text-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ============================================
   FEATURED COLLECTION SECTION
   ============================================ */

function FeaturedSection() {
  const { data: products, isLoading } = useGetFeaturedProducts();
  const displayProducts =
    products && products.length > 0 ? products : FALLBACK_FEATURED;

  return (
    <section className="py-24 bg-charcoal-deep" id="featured">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-xs tracking-[0.4em] uppercase mb-4">
            Handpicked
          </p>
          <h2 className="font-display font-black text-[clamp(2rem,5vw,4rem)] uppercase tracking-tight text-foreground">
            Featured Pieces
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6 opacity-60" />
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable id
                <ProductSkeleton key={i} />
              ))
            : displayProducts
                .slice(0, 4)
                .map((product, i) => (
                  <ProductCard
                    key={product.id.toString()}
                    product={product}
                    index={i}
                  />
                ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FULL COLLECTION SECTION
   ============================================ */

function CollectionSection() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const { data: products, isLoading } = useGetProductsByCategory(
    activeTab === "All" ? "All" : (activeTab as Category),
  );
  const displayProducts =
    products && products.length > 0
      ? products
      : activeTab === "All"
        ? FALLBACK_COLLECTION
        : FALLBACK_COLLECTION.filter((p) => p.category === activeTab);

  const tabs = ["All", "Hoodies", "Jackets", "Trousers", "Accessories"];

  return (
    <section className="py-24 bg-background" id="collection">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-gold font-body text-xs tracking-[0.4em] uppercase mb-4">
            The Full Range
          </p>
          <h2 className="font-display font-black text-[clamp(2rem,5vw,4rem)] uppercase tracking-tight text-foreground">
            The Collection
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6 opacity-60" />
        </motion.div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-charcoal-mid border border-charcoal-light rounded-none h-auto p-1 gap-1 flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  data-ocid="collection.tab"
                  className="text-muted-foreground data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep rounded-none text-xs tracking-widest uppercase font-body font-medium px-5 py-2.5 transition-all duration-300 hover:text-foreground"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable id
                      <ProductSkeleton key={i} />
                    ))
                  : displayProducts.map((product, i) => (
                      <ProductCard
                        key={product.id.toString()}
                        product={product}
                        index={i}
                      />
                    ))}
              </div>
              {!isLoading && displayProducts.length === 0 && (
                <div
                  className="text-center py-20 text-muted-foreground"
                  data-ocid="collection.empty_state"
                >
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-body tracking-widest uppercase text-sm">
                    No products in this category
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

/* ============================================
   ABOUT SECTION
   ============================================ */

function AboutSection() {
  return (
    <section className="py-0 overflow-hidden" id="about">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-charcoal-mid px-8 md:px-16 py-24 flex flex-col justify-center"
        >
          <p className="text-gold font-body text-xs tracking-[0.4em] uppercase mb-6">
            Our Ethos
          </p>
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] uppercase leading-none tracking-tight text-foreground mb-8">
            Born From The
            <br />
            <span className="text-gradient-gold">Night's Edge</span>
          </h2>
          <div className="space-y-5 text-muted-foreground font-body leading-relaxed text-base max-w-lg">
            <p>
              Velmora was built for those who exist between worlds — those who
              carry boardroom composure into the city's shadows. Every piece is
              a negotiation between luxury and rawness, refinement and edge.
            </p>
            <p>
              We source only the finest technical fabrics from Japan and Italy,
              then hand-finish them with hardware that tells a story. No logos
              screaming status. No trends dictating movement. Just timeless
              garments engineered for presence.
            </p>
            <p>
              When you wear Velmora, you're not making a statement. You're
              becoming one.
            </p>
          </div>
          <div className="mt-10 flex items-center gap-8">
            <div>
              <p className="font-display font-black text-3xl text-gradient-gold">
                5K+
              </p>
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mt-1">
                Garments Crafted
              </p>
            </div>
            <div className="w-px h-12 bg-charcoal-light" />
            <div>
              <p className="font-display font-black text-3xl text-gradient-gold">
                40+
              </p>
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mt-1">
                Countries Worn
              </p>
            </div>
            <div className="w-px h-12 bg-charcoal-light" />
            <div>
              <p className="font-display font-black text-3xl text-gradient-gold">
                100%
              </p>
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mt-1">
                Premium Materials
              </p>
            </div>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative overflow-hidden min-h-[400px] lg:min-h-0"
        >
          <img
            src="/assets/generated/velmora-hero.dim_1600x900.jpg"
            alt="Velmora — The brand story"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-mid/40 to-transparent" />
          {/* Decorative accent line */}
          <div className="absolute bottom-8 left-8 right-8 h-px bg-gold/30" />
          <div className="absolute bottom-8 left-8">
            <p className="font-serif italic text-foreground/80 text-lg">
              "Luxury that speaks through silence."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================
   NEWSLETTER SECTION
   ============================================ */

type NewsletterStatus = "idle" | "loading" | "success" | "error";

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const subscribeMutation = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      await subscribeMutation.mutateAsync(email.trim());
      setStatus("success");
      toast.success("You've joined the Velmora inner circle.");
    } catch {
      setStatus("error");
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <section
      className="py-24 bg-charcoal-deep relative overflow-hidden"
      id="contact"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-gold/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-gold/20" />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-gold font-body text-xs tracking-[0.4em] uppercase mb-4">
            Exclusive Access
          </p>
          <h2 className="font-display font-black text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-tight text-foreground mb-4">
            Join The Inner Circle
          </h2>
          <p className="text-muted-foreground font-body text-base mb-10 leading-relaxed">
            First access to new drops, exclusive collabs, and members-only
            pricing. No spam — just culture.
          </p>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                data-ocid="newsletter.success_state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <CheckCircle2 className="h-12 w-12 text-gold" />
                <p className="font-display font-bold text-foreground text-lg tracking-wide uppercase">
                  Welcome to Velmora
                </p>
                <p className="text-muted-foreground text-sm font-body">
                  Exclusive drops will hit your inbox first.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  data-ocid="newsletter.input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="bg-charcoal-mid border-charcoal-light text-foreground placeholder:text-muted-foreground rounded-none font-body text-sm focus-visible:ring-gold focus-visible:border-gold flex-1"
                />
                <Button
                  data-ocid="newsletter.submit_button"
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-gold text-charcoal-deep hover:bg-gold-bright border-0 font-display font-bold tracking-widest uppercase text-xs rounded-none px-8 py-3 btn-gold-glow transition-all duration-300 whitespace-nowrap"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        data-ocid="newsletter.loading_state"
                      />
                      Joining...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === "error" && (
            <div
              data-ocid="newsletter.error_state"
              className="flex items-center justify-center gap-2 mt-4 text-destructive text-sm font-body"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Something went wrong. Please try again.</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER
   ============================================ */

function Footer() {
  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-charcoal-deep border-t border-charcoal-light/40">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <img
              src="/assets/generated/velmora-logo-transparent.dim_400x160.png"
              alt="Velmora"
              className="h-10 w-auto object-contain mb-4"
            />
            <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-xs">
              Luxury streetwear for men who move with intention. Every stitch, a
              statement.
            </p>
            {/* Social */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                className="text-muted-foreground hover:text-gold transition-colors duration-300 p-1"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-gold transition-colors duration-300 p-1"
                aria-label="Twitter / X"
              >
                <SiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-foreground font-display font-semibold text-xs tracking-widest uppercase mb-5">
              Navigate
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link.href)}
                    className="text-muted-foreground hover:text-gold transition-colors duration-300 text-sm font-body"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="text-foreground font-display font-semibold text-xs tracking-widest uppercase mb-5">
              Shop
            </p>
            <ul className="space-y-3">
              {["Hoodies", "Jackets", "Trousers", "Accessories"].map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => scrollTo("#collection")}
                    className="text-muted-foreground hover:text-gold transition-colors duration-300 text-sm font-body"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-charcoal-light/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs font-body">
            © {currentYear} Velmora. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs font-body">
            Built with ♥ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-muted hover:text-gold transition-colors duration-300"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ============================================
   APP SHELL (uses CartProvider)
   ============================================ */

function AppShell() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <Toaster theme="dark" position="top-right" />
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main>
        <HeroSection />
        <FeaturedSection />
        <CollectionSection />
        <AboutSection />
        <NewsletterSection />
      </main>
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}

/* ============================================
   APP ROOT
   ============================================ */

export default function App() {
  return (
    <CartProvider>
      <AppShell />
    </CartProvider>
  );
}
