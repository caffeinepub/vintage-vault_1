import AccessControl "authorization/access-control";
import AuthMixin "authorization/MixinAuthorization";
import StorageMixin "blob-storage/Mixin";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Prim "mo:prim";

actor {
  // --- Authorization ---
  let _accessControlState = AccessControl.initState();
  include AuthMixin(_accessControlState);
  include StorageMixin();

  // --- Stable storage for access control persistence ---
  stable var _stableAdminAssigned : Bool = false;
  stable var _stableUserRoles : [(Principal, AccessControl.UserRole)] = [];

  // --- Transform for HTTP outcalls ---
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // --- Types ---
  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat; // in paise (INR)
    category : Text;
    imageId : Text;
    inStock : Bool;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type Order = {
    id : Nat;
    items : [OrderItem];
    totalAmount : Nat;
    stripeSessionId : Text;
    status : Text;
  };

  // --- State ---
  var nextProductId : Nat = 0;
  var nextOrderId : Nat = 0;
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  var initialized = false;

  // Read Stripe key once at actor init (system capability available here)
  let _stripeSecretKey : Text = switch (Prim.envVar<system>("STRIPE_SECRET_KEY")) {
    case (?k) { k };
    case (null) { "" };
  };

  func stripeConfig() : Stripe.StripeConfiguration {
    { secretKey = _stripeSecretKey; allowedCountries = ["US", "GB", "IN", "CA", "AU"] };
  };

  // --- Seed sample products ---
  func seedProducts() {
    if (initialized) return;
    initialized := true;
    let samples : [(Text, Text, Nat, Text)] = [
      ("Vintage Floral Dress", "A beautiful 1970s-inspired floral midi dress in warm earth tones.", 8999, "Dresses"),
      ("Classic Denim Jacket", "Timeless denim jacket with worn-in details and brass buttons.", 6499, "Jackets"),
      ("Retro Wide-Leg Trousers", "High-waisted wide-leg trousers in caramel brown, perfect for a vintage look.", 5499, "Bottoms"),
      ("Bohemian Blouse", "Flowy boho blouse with delicate embroidery along the neckline.", 3999, "Tops"),
      ("Wool Plaid Coat", "Structured wool blend coat in classic plaid pattern, winter staple.", 12999, "Coats"),
      ("Silk Slip Skirt", "Satin finish slip skirt in deep burgundy, elegant and versatile.", 4999, "Skirts"),
    ];
    for ((name, desc, price, category) in samples.vals()) {
      let id = nextProductId;
      nextProductId += 1;
      products.add(id, { id; name; description = desc; price; category; imageId = ""; inStock = true });
    };
  };

  system func preupgrade() {
    // Persist access control state
    _stableAdminAssigned := _accessControlState.adminAssigned;
    _stableUserRoles := _accessControlState.userRoles.toArray();
  };

  system func postupgrade() {
    // Restore access control state
    _accessControlState.adminAssigned := _stableAdminAssigned;
    for ((p, r) in _stableUserRoles.vals()) {
      _accessControlState.userRoles.add(p, r);
    };
    seedProducts();
  };
  seedProducts();

  // --- Product APIs ---
  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public shared ({ caller }) func addProduct(name : Text, description : Text, price : Nat, category : Text, imageId : Text) : async Nat {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Prim.trap("Unauthorized");
    };
    let id = nextProductId;
    nextProductId += 1;
    products.add(id, { id; name; description; price; category; imageId; inStock = true });
    id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, name : Text, description : Text, price : Nat, category : Text, imageId : Text, inStock : Bool) : async Bool {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Prim.trap("Unauthorized");
    };
    switch (products.get(id)) {
      case (null) { false };
      case (?_) {
        products.add(id, { id; name; description; price; category; imageId; inStock });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Prim.trap("Unauthorized");
    };
    switch (products.get(id)) {
      case (null) { false };
      case (?_) {
        products.remove(id);
        true;
      };
    };
  };

  // --- Stripe Checkout ---
  public shared ({ caller }) func createCheckoutSession(items : [OrderItem], successUrl : Text, cancelUrl : Text) : async Text {
    var total : Nat = 0;
    let shoppingItemsList = List.empty<Stripe.ShoppingItem>();
    for (item in items.vals()) {
      switch (products.get(item.productId)) {
        case (null) { Prim.trap("Product not found: " # item.productId.toText()) };
        case (?p) {
          total += p.price * item.quantity;
          shoppingItemsList.add({ currency = "inr"; productName = p.name; productDescription = p.description; priceInCents = p.price; quantity = item.quantity });
        };
      };
    };
    let shoppingItems = shoppingItemsList.toArray();
    let sessionId = await Stripe.createCheckoutSession(stripeConfig(), caller, shoppingItems, successUrl, cancelUrl, transform);
    let orderId = nextOrderId;
    nextOrderId += 1;
    orders.add(orderId, { id = orderId; items; totalAmount = total; stripeSessionId = sessionId; status = "pending" });
    sessionId;
  };

  public shared func verifyPayment(sessionId : Text) : async Text {
    let result = await Stripe.getSessionStatus(stripeConfig(), sessionId, transform);
    switch (result) {
      case (#completed({ response = _; userPrincipal = _ })) {
        for ((id, order) in orders.entries()) {
          if (order.stripeSessionId == sessionId and order.status == "pending") {
            orders.add(id, { order with status = "paid" });
          };
        };
        "paid";
      };
      case (#failed({ error })) { "failed: " # error };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Prim.trap("Unauthorized");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async Bool {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Prim.trap("Unauthorized");
    };
    switch (orders.get(id)) {
      case (null) { false };
      case (?order) {
        orders.add(id, { order with status });
        true;
      };
    };
  };
};
