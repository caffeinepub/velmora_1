import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";

module {
  // Types repeated for migration compatibility
  type OldCategory = {
    #Hoodies;
    #Jackets;
    #Trousers;
    #Accessories;
  };

  type OldProduct = {
    id : Nat;
    name : Text;
    category : OldCategory;
    price : Nat;
    description : Text;
    isFeatured : Bool;
  };

  type OldActor = {
    products : List.List<OldProduct>;
    subscribers : Map.Map<Text, ()>;
  };

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

  type NewCategory = OldCategory;
  type NewProduct = OldProduct;

  type NewActor = {
    products : List.List<NewProduct>;
    subscribers : Map.Map<Text, ()>;
    orders : Map.Map<Nat, Order>;
    nextOrderId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = Map.empty<Nat, Order>();
    { old with orders = newOrders; nextOrderId = 1 };
  };
};
