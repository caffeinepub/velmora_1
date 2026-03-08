import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Category = {
    #Hoodies;
    #Jackets;
    #Trousers;
    #Accessories;
  };

  type Product = {
    id : Nat;
    name : Text;
    category : Category;
    price : Nat;
    description : Text;
    isFeatured : Bool;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  let products = List.fromArray<Product>([
    {
      id = 1;
      name = "Midnight Fog Hoodie";
      category = #Hoodies;
      price = 12900;
      description = "Premium black French terry hoodie with embroidered logo.";
      isFeatured = true;
    },
    {
      id = 2;
      name = "Concrete Jungle Jacket";
      category = #Jackets;
      price = 22000;
      description = "Oversized cargo jacket in durable water-resistant fabric.";
      isFeatured = false;
    },
    {
      id = 3;
      name = "Skyline Joggers";
      category = #Trousers;
      price = 11500;
      description = "Tapered sweatpants with adjustable cuffs and reflective piping.";
      isFeatured = true;
    },
    {
      id = 4;
      name = "Shadow Beanie";
      category = #Accessories;
      price = 4500;
      description = "Black knit beanie with subtle rubberized Velmora logo.";
      isFeatured = false;
    },
    {
      id = 5;
      name = "Urban Armor Hoodie";
      category = #Hoodies;
      price = 13500;
      description = "Thick fleece hoodie with zippered pockets and thumb holes.";
      isFeatured = false;
    },
    {
      id = 6;
      name = "Cityscape Trench Jacket";
      category = #Jackets;
      price = 19500;
      description = "Longline wind and weather resistant trench coat with removable hood.";
      isFeatured = true;
    },
    {
      id = 7;
      name = "Stealth Tech Trousers";
      category = #Trousers;
      price = 12800;
      description = "Slim-fit technical pants with reflective stripes.";
      isFeatured = false;
    },
    {
      id = 8;
      name = "Signature Logo Cap";
      category = #Accessories;
      price = 3900;
      description = "Structured cap with embroidered Velmora logo on front.";
      isFeatured = false;
    },
  ]);

  // Newsletter
  let subscribers = Map.empty<Text, ()>();

  // Orders
  type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    unitPrice : Nat;
  };

  type ShippingAddress = {
    firstName : Text;
    lastName : Text;
    addressLine1 : Text;
    addressLine2 : ?Text;
    city : Text;
    state : Text;
    postalCode : Text;
    country : Text;
  };

  type Order = {
    id : Nat;
    customerEmail : Text;
    items : [OrderItem];
    shippingAddress : ShippingAddress;
    totalAmount : Nat;
    createdAt : Int;
  };

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  // Product Queries
  public query ({ caller }) func getAllProducts() : async [Product] {
    products.toArray().sort();
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    products.filter(func(p) { p.category == category }).toArray();
  };

  public query ({ caller }) func getFeaturedProducts() : async [Product] {
    products.filter(func(p) { p.isFeatured }).toArray();
  };

  // Newsletter Functions
  public shared ({ caller }) func subscribe(email : Text) : async () {
    if (email.size() < 3 or not email.contains(#char '@')) {
      Runtime.trap("Invalid email address");
    };
    if (subscribers.containsKey(email)) {
      Runtime.trap("Already subscribed");
    };
    subscribers.add(email, ());
  };

  public query ({ caller }) func getSubscriberCount() : async Nat {
    subscribers.size();
  };

  // Order Management
  public shared ({ caller }) func placeOrder(customerEmail : Text, items : [OrderItem], shippingAddress : ShippingAddress) : async Nat {
    if (customerEmail.size() < 3 or not customerEmail.contains(#char '@')) {
      Runtime.trap("Invalid email address");
    };

    if (items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    let totalAmount = items.foldLeft(
      0,
      func(acc, item) { acc + (item.unitPrice * item.quantity) },
    );

    if (totalAmount == 0) {
      Runtime.trap("Total amount cannot be zero");
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id = orderId;
      customerEmail;
      items;
      shippingAddress;
      totalAmount;
      createdAt = Time.now();
    };

    orders.add(orderId, order);
    orderId;
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    orders.get(orderId);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };
};

