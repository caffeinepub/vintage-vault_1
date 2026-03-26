import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useDeleteProduct,
  useIsAdmin,
  useOrders,
  useProducts,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

interface AdminPanelProps {
  onBack: () => void;
}

const CATEGORIES = [
  "Dresses",
  "Jackets",
  "Tops",
  "Bottoms",
  "Coats",
  "Skirts",
  "Accessories",
];
const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  imageId: string;
  inStock: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "Dresses",
  imageId: "",
  inStock: true,
};

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const { actor } = useActor();
  const isLoggedIn = !!identity;
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const storageClient = useStorageClient();
  const queryClient = useQueryClient();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin setup state
  const [setupToken, setSetupToken] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const handleLogin = () => login();
  const handleLogout = () => clear();

  const handleClaimAdmin = async () => {
    if (!actor || !setupToken.trim()) return;
    setSetupLoading(true);
    setSetupError(null);
    try {
      await actor._initializeAccessControlWithSecret(setupToken.trim());
      await queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      await queryClient.refetchQueries({ queryKey: ["isAdmin"] });
      const refreshed = queryClient.getQueryData<boolean>(["isAdmin"]);
      if (refreshed === false) {
        setSetupError("Invalid token. Check your Caffeine dashboard.");
      }
    } catch (e) {
      setSetupError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSetupLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setProductDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toFixed(2),
      category: product.category,
      imageId: product.imageId,
      inStock: product.inStock,
    });
    setProductDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!storageClient) {
      toast.error("Storage not ready");
      return;
    }
    try {
      setUploadProgress(0);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setUploadProgress(pct),
      );
      setForm((prev) => ({ ...prev, imageId: hash }));
      toast.success("Image uploaded!");
    } catch (e) {
      toast.error(
        `Upload failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setUploadProgress(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    const priceCents = BigInt(Math.round(Number.parseFloat(form.price) * 100));
    if (editingProduct) {
      updateProduct.mutate(
        {
          id: editingProduct.id,
          name: form.name,
          description: form.description,
          price: priceCents,
          category: form.category,
          imageId: form.imageId,
          inStock: form.inStock,
        },
        {
          onSuccess: () => {
            toast.success("Product updated");
            setProductDialogOpen(false);
          },
          onError: (e) => toast.error(`Error: ${e.message}`),
        },
      );
    } else {
      addProduct.mutate(
        {
          name: form.name,
          description: form.description,
          price: priceCents,
          category: form.category,
          imageId: form.imageId,
        },
        {
          onSuccess: () => {
            toast.success("Product added");
            setProductDialogOpen(false);
          },
          onError: (e) => toast.error(`Error: ${e.message}`),
        },
      );
    }
  };

  const handleDelete = (id: bigint) => {
    deleteProduct.mutate(id, {
      onSuccess: () => toast.success("Product deleted"),
      onError: (e) => toast.error(`Error: ${e.message}`),
    });
  };

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-vintage-dark flex flex-col">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-vintage-ivory/10">
          <button
            type="button"
            onClick={onBack}
            className="text-vintage-ivory/60 hover:text-vintage-gold transition-colors"
            data-ocid="admin.back.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl text-vintage-ivory tracking-wider">
            Store Owner Login
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-vintage-gold/20 flex items-center justify-center mx-auto mb-6">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: "var(--vintage-gold)" }}
                aria-hidden="true"
              >
                <title>User icon</title>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-vintage-ivory mb-3">
              Welcome Back
            </h2>
            <p className="font-body text-sm text-vintage-ivory/60 mb-8">
              Sign in with Internet Identity to manage your store.
            </p>
            <button
              type="button"
              onClick={handleLogin}
              disabled={loginStatus === "logging-in"}
              data-ocid="admin.login.primary_button"
              className="w-full font-body text-xs font-bold tracking-[0.2em] uppercase px-6 py-4 bg-vintage-gold text-vintage-darker hover:bg-vintage-gold-light disabled:opacity-60 transition-colors rounded-sm flex items-center justify-center gap-2"
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in with Internet Identity"
              )}
            </button>
            {loginStatus === "loginError" && (
              <p
                className="font-body text-xs text-red-400 mt-3"
                data-ocid="admin.login.error_state"
              >
                Login failed. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading admin status
  if (isAdminLoading) {
    return (
      <div
        className="min-h-screen bg-vintage-dark flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--vintage-gold)" }}
        />
      </div>
    );
  }

  // Logged in but not admin — show setup screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-vintage-dark flex flex-col">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-vintage-ivory/10">
          <button
            type="button"
            onClick={onBack}
            className="text-vintage-ivory/60 hover:text-vintage-gold transition-colors"
            data-ocid="admin.back.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl text-vintage-ivory tracking-wider">
            Admin Setup
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-vintage-gold/20 flex items-center justify-center mx-auto mb-6">
              <KeyRound
                className="w-8 h-8"
                style={{ color: "var(--vintage-gold)" }}
              />
            </div>
            <h2 className="font-display text-2xl text-vintage-ivory mb-2 text-center">
              Claim Store Access
            </h2>
            <p className="font-body text-sm text-vintage-ivory/60 mb-8 text-center">
              Enter the admin token from your Caffeine dashboard to claim store
              owner access.
            </p>

            <div className="space-y-3">
              <Label
                htmlFor="setup-token"
                className="font-body text-xs tracking-wider uppercase text-vintage-ivory/60"
              >
                Admin Setup Token
              </Label>
              <Input
                id="setup-token"
                type="password"
                value={setupToken}
                onChange={(e) => {
                  setSetupToken(e.target.value);
                  setSetupError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleClaimAdmin()}
                placeholder="Paste your admin token here"
                data-ocid="admin.setup.input"
                className="font-body bg-vintage-ivory/5 border-vintage-ivory/20 text-vintage-ivory placeholder:text-vintage-ivory/30 focus:border-vintage-gold"
              />
              {setupError && (
                <p
                  className="font-body text-xs text-red-400"
                  data-ocid="admin.setup.error_state"
                >
                  {setupError}
                </p>
              )}
              <button
                type="button"
                onClick={handleClaimAdmin}
                disabled={setupLoading || !setupToken.trim()}
                data-ocid="admin.setup.primary_button"
                className="w-full font-body text-xs font-bold tracking-[0.2em] uppercase px-6 py-4 bg-vintage-gold text-vintage-darker hover:bg-vintage-gold-light disabled:opacity-60 transition-colors rounded-sm flex items-center justify-center gap-2"
              >
                {setupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  "Claim Admin Access"
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="font-body text-xs tracking-widest uppercase text-vintage-gold/60 hover:text-vintage-gold transition-colors"
                data-ocid="admin.logout.button"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-vintage-dark px-6 py-4 flex items-center justify-between border-b border-vintage-ivory/10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            data-ocid="admin.back.button"
            className="text-vintage-ivory/60 hover:text-vintage-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl text-vintage-ivory tracking-wider">
            Admin Panel
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body text-xs text-vintage-ivory/50 hidden sm:inline">
            {identity?.getPrincipal().toString().slice(0, 12)}…
          </span>
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="admin.logout.button"
            className="font-body text-xs tracking-widest uppercase text-vintage-gold/70 hover:text-vintage-gold transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="products" data-ocid="admin.tabs">
          <TabsList className="mb-6">
            <TabsTrigger
              value="products"
              data-ocid="admin.products.tab"
              className="font-body text-xs tracking-wider uppercase"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="admin.orders.tab"
              className="font-body text-xs tracking-wider uppercase"
            >
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Products</h2>
              <button
                type="button"
                onClick={openAddDialog}
                data-ocid="admin.add_product.button"
                className="font-body text-xs font-semibold tracking-[0.15em] uppercase px-5 py-2.5 bg-vintage-dark text-vintage-ivory hover:bg-vintage-darker transition-colors rounded-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {productsLoading ? (
              <div
                className="space-y-3"
                data-ocid="admin.products.loading_state"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading state
                  <Skeleton key={i} className="h-14 w-full rounded" />
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg border border-border overflow-hidden"
                data-ocid="admin.products.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Product
                      </TableHead>
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Category
                      </TableHead>
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Price
                      </TableHead>
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Status
                      </TableHead>
                      <TableHead className="font-body text-xs tracking-wider uppercase text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(products ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-muted-foreground"
                          data-ocid="admin.products.empty_state"
                        >
                          No products yet. Add your first product.
                        </TableCell>
                      </TableRow>
                    )}
                    {(products ?? []).map((product, idx) => (
                      <TableRow
                        key={String(product.id)}
                        data-ocid={`admin.product.row.${idx + 1}`}
                      >
                        <TableCell>
                          <p className="font-body text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="font-body text-xs text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="font-body text-xs"
                          >
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-body text-sm font-semibold">
                          ₹{(Number(product.price) / 100).toFixed(0)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.inStock ? "default" : "destructive"
                            }
                            className="font-body text-xs"
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditDialog(product)}
                              data-ocid={`admin.product.edit.button.${idx + 1}`}
                              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              aria-label="Edit product"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  data-ocid={`admin.product.delete.button.${idx + 1}`}
                                  className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                                  aria-label="Delete product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent data-ocid="admin.delete_product.dialog">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display">
                                    Delete Product
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="font-body">
                                    Are you sure you want to delete &quot;
                                    {product.name}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    data-ocid="admin.delete_product.cancel_button"
                                    className="font-body text-xs"
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(product.id)}
                                    data-ocid="admin.delete_product.confirm_button"
                                    className="font-body text-xs bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="mb-6">
              <h2 className="font-display text-2xl">Orders</h2>
            </div>

            {ordersLoading ? (
              <div className="space-y-3" data-ocid="admin.orders.loading_state">
                {Array.from({ length: 5 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading state
                  <Skeleton key={i} className="h-14 w-full rounded" />
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg border border-border overflow-hidden"
                data-ocid="admin.orders.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Order ID
                      </TableHead>
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Items
                      </TableHead>
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Total
                      </TableHead>
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Status
                      </TableHead>
                      <TableHead className="font-body text-xs tracking-wider uppercase">
                        Update
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(orders ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-muted-foreground"
                          data-ocid="admin.orders.empty_state"
                        >
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {(orders ?? []).map((order, idx) => (
                      <TableRow
                        key={String(order.id)}
                        data-ocid={`admin.order.row.${idx + 1}`}
                      >
                        <TableCell className="font-body text-xs text-muted-foreground">
                          #{String(order.id)}
                        </TableCell>
                        <TableCell className="font-body text-sm">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="font-body text-sm font-semibold">
                          ₹{(Number(order.totalAmount) / 100).toFixed(0)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="font-body text-xs capitalize"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(val) =>
                              updateOrderStatus.mutate(
                                { id: order.id, status: val },
                                {
                                  onSuccess: () =>
                                    toast.success("Status updated"),
                                },
                              )
                            }
                          >
                            <SelectTrigger
                              className="w-32 h-8 font-body text-xs"
                              data-ocid={`admin.order.status.select.${idx + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="font-body text-xs capitalize"
                                >
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent
          className="max-w-lg bg-vintage-cream"
          data-ocid="admin.product.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-body text-xs tracking-wider uppercase text-muted-foreground">
                Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. 1970s Silk Wrap Dress"
                data-ocid="admin.product.name.input"
                className="font-body"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-body text-xs tracking-wider uppercase text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Describe the garment, its history, condition…"
                rows={3}
                data-ocid="admin.product.description.textarea"
                className="font-body resize-none"
              />
            </div>

            {/* Price + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-body text-xs tracking-wider uppercase text-muted-foreground">
                  Price (INR) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="0.00"
                    data-ocid="admin.product.price.input"
                    className="font-body pl-7"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-xs tracking-wider uppercase text-muted-foreground">
                  Category *
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(val) =>
                    setForm((p) => ({ ...p, category: val }))
                  }
                >
                  <SelectTrigger
                    data-ocid="admin.product.category.select"
                    className="font-body"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="font-body">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label className="font-body text-xs tracking-wider uppercase text-muted-foreground">
                Product Image
              </Label>
              <button
                type="button"
                className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-vintage-gold transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="admin.product.image.dropzone"
              >
                {uploadProgress !== null ? (
                  <div>
                    <p className="font-body text-sm text-muted-foreground mb-2">
                      Uploading… {uploadProgress}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-vintage-gold h-1.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : form.imageId ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded overflow-hidden">
                      <img
                        src={`/api/v1/blobs/${form.imageId}`}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      Image uploaded ✓
                    </p>
                    <p className="font-body text-xs text-vintage-gold">
                      Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground/50" />
                    <p className="font-body text-sm text-muted-foreground">
                      Click to upload image
                    </p>
                    <p className="font-body text-xs text-muted-foreground/60">
                      JPG, PNG, WEBP up to 10MB
                    </p>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                data-ocid="admin.product.image.upload_button"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>

            {/* In Stock Toggle */}
            {editingProduct && (
              <div className="flex items-center gap-3">
                <Switch
                  id="instock"
                  checked={form.inStock}
                  onCheckedChange={(val) =>
                    setForm((p) => ({ ...p, inStock: val }))
                  }
                  data-ocid="admin.product.instock.switch"
                />
                <Label htmlFor="instock" className="font-body text-sm">
                  In Stock
                </Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setProductDialogOpen(false)}
              data-ocid="admin.product.dialog.cancel_button"
              className="font-body text-xs tracking-wider uppercase px-5 py-2.5 border border-border rounded-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={addProduct.isPending || updateProduct.isPending}
              data-ocid="admin.product.dialog.save_button"
              className="font-body text-xs font-bold tracking-[0.15em] uppercase px-5 py-2.5 bg-vintage-dark text-vintage-ivory hover:bg-vintage-darker disabled:opacity-60 transition-colors rounded-sm flex items-center gap-2"
            >
              {addProduct.isPending || updateProduct.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                </>
              ) : editingProduct ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
