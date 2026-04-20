import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    AdminCategory,
    ProductPayload,
    createAdminCategory,
    createAdminProduct,
    deleteAdminProduct,
    getAdminCategories,
    getAdminProducts,
    updateAdminProduct,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Grid2x2, ImageIcon, LogOut, PackagePlus, Tags } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type ProductFormState = {
    id: string | null;
    name: string;
    price: string;
    category: string;
    image: string;
    galleryImages: string[];
    description: string;
    sizes: string;
    badge: string;
};

type AdminView = "inventory" | "product" | "categories" | "uploads";

const emptyProductForm: ProductFormState = {
    id: null,
    name: "",
    price: "",
    category: "",
    image: "",
    galleryImages: [],
    description: "",
    sizes: "",
    badge: "",
};

const MAX_GALLERY = 6;

const getStoredAdminKey = () => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("rabina-admin-key") || "";
};

const AdminDashboard = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();

    const [adminKey, setAdminKey] = useState(getStoredAdminKey);
    const [categoryName, setCategoryName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<AdminView>("inventory");
    const [inventorySearch, setInventorySearch] = useState("");
    const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
    const [uploadedImages, setUploadedImages] = useState<{ filename: string; url: string }[]>([]);
    const [loadingUploads, setLoadingUploads] = useState(false);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productGalleryFiles, setProductGalleryFiles] = useState<File[]>([]);
    const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);
    const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        if (!adminKey) navigate("/admin");
    }, [adminKey, navigate]);

    const categoriesQuery = useQuery({
        queryKey: ["admin", "categories", adminKey],
        queryFn: () => getAdminCategories(adminKey),
        enabled: Boolean(adminKey),
    });

    const productsQuery = useQuery({
        queryKey: ["admin", "products", adminKey],
        queryFn: () => getAdminProducts(adminKey),
        enabled: Boolean(adminKey),
    });

    const availableCategories = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
    const inventoryProducts = useMemo(
        () => (productsQuery.data?.items || []).filter((product) => !selectedCategory || product.category === selectedCategory),
        [productsQuery.data?.items, selectedCategory],
    );
    const filteredProducts = useMemo(() => {
        const term = inventorySearch.trim().toLowerCase();
        if (!term) return inventoryProducts;
        return inventoryProducts.filter((product) => {
            const combined = `${product.name} ${product.category} ${product.badge || ""}`.toLowerCase();
            return combined.includes(term);
        });
    }, [inventoryProducts, inventorySearch]);
    const lowStockHintProducts = useMemo(
        () => (productsQuery.data?.items || []).filter((product) => product.sizes.length <= 1),
        [productsQuery.data?.items],
    );

    const refreshAdminData = () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["admin"] });
    };

    const clearProductForm = () => {
        setProductForm(emptyProductForm);
        setProductImageFile(null);
        setProductGalleryFiles([]);
        setMainPreviewUrl(null);
        setGalleryPreviewUrls([]);
    };

    const openAddProduct = () => {
        clearProductForm();
        navigate("/admin/dashboard/add-product");
        setActiveView("product");
    };

    const createCategoryMutation = useMutation({
        mutationFn: (payload: { name: string }) => createAdminCategory(adminKey, payload),
        onSuccess: (response) => {
            setCategoryName("");
            refreshAdminData();
            toast({ title: "Category saved", description: response.message });
        },
        onError: (error: Error) => {
            toast({ title: "Category failed", description: error.message, variant: "destructive" });
        },
    });

    const saveProductMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string | null; payload: ProductPayload }) =>
            id ? updateAdminProduct(adminKey, id, payload) : createAdminProduct(adminKey, payload),
        onSuccess: (response) => {
            clearProductForm();
            navigate("/admin/dashboard/products");
            setActiveView("inventory");
            refreshAdminData();
            toast({ title: "Product saved", description: response.message });
        },
        onError: (error: Error) => {
            toast({ title: "Product failed", description: error.message, variant: "destructive" });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (productId: string) => deleteAdminProduct(adminKey, productId),
        onSuccess: (response) => {
            refreshAdminData();
            toast({ title: "Product deleted", description: response.message });
        },
        onError: (error: Error) => {
            toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        },
    });

    const deleteUploadMutation = useMutation({
        mutationFn: (filename: string) => import("@/lib/api").then((m) => m.deleteAdminUpload(adminKey, filename)),
        onSuccess: () => {
            loadUploads();
            toast({ title: "File deleted" });
        },
        onError: (error: Error) => {
            toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        },
    });

    const clearAdminKey = () => {
        window.localStorage.removeItem("rabina-admin-key");
        setAdminKey("");
        queryClient.removeQueries({ queryKey: ["admin"] });
        navigate("/admin");
    };

    const handleCategorySubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createCategoryMutation.mutate({ name: categoryName });
    };

    const handleProductChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setProductForm((current) => ({ ...current, [name]: value }));
    };

    const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let mainImageUrl = productForm.image.trim();
        const extraImages = productForm.galleryImages || [];
        const uploadedGalleryUrls: string[] = [];

        if (productImageFile) {
            try {
                const up = await import("@/lib/api").then((m) => m.uploadAdminFile(getStoredAdminKey(), productImageFile));
                mainImageUrl = up.url;
            } catch (err) {
                toast({ title: "Upload failed", description: (err as Error).message || "Could not upload main image", variant: "destructive" });
                return;
            }
        }

        if (productGalleryFiles.length > 0) {
            for (const file of productGalleryFiles) {
                try {
                    const up = await import("@/lib/api").then((m) => m.uploadAdminFile(getStoredAdminKey(), file));
                    uploadedGalleryUrls.push(up.url);
                } catch (err) {
                    toast({ title: "Upload failed", description: (err as Error).message || "Could not upload gallery image", variant: "destructive" });
                    return;
                }
            }
        }

        const sizes = productForm.sizes
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean);

        const images = [mainImageUrl, ...extraImages, ...uploadedGalleryUrls].filter(Boolean);

        saveProductMutation.mutate({
            id: productForm.id,
            payload: {
                name: productForm.name.trim(),
                price: Number(productForm.price),
                category: productForm.category.trim(),
                image: mainImageUrl,
                images,
                description: productForm.description.trim(),
                sizes,
                badge: productForm.badge.trim(),
            },
        });
    };

    const loadUploads = async () => {
        if (!adminKey) {
            setUploadedImages([]);
            return;
        }

        setLoadingUploads(true);
        try {
            const res = await import("@/lib/api").then((m) => m.getAdminUploads(adminKey));
            setUploadedImages(res.items || []);
        } catch (err) {
            toast({ title: "Could not load uploads", description: (err as Error).message || "", variant: "destructive" });
        } finally {
            setLoadingUploads(false);
        }
    };

    useEffect(() => {
        if (adminKey) loadUploads();
        else setUploadedImages([]);
    }, [adminKey]);

    const startEdit = (product: Product) => {
        navigate("/admin/dashboard/add-product");
        setActiveView("product");
        setProductForm({
            id: product.id,
            name: product.name,
            price: String(product.price),
            category: product.category,
            image: product.image,
            galleryImages: product.images.filter((image) => image !== product.image),
            description: product.description,
            sizes: product.sizes.join(", "),
            badge: product.badge || "",
        });
        setProductImageFile(null);
        setProductGalleryFiles([]);
        setMainPreviewUrl(null);
        setGalleryPreviewUrls([]);
    };

    const addGalleryImage = (imageUrl: string) => {
        setProductForm((current) => {
            const currentGallery = current.galleryImages || [];
            if (currentGallery.includes(imageUrl)) return current;
            const currentCount = (current.image ? 1 : 0) + currentGallery.length + productGalleryFiles.length;
            if (currentCount >= MAX_GALLERY) {
                toast({ title: "Gallery full", description: `Maximum ${MAX_GALLERY} images allowed` });
                return current;
            }
            return { ...current, galleryImages: [...currentGallery, imageUrl] };
        });
    };

    const handleDeleteProduct = (productId: string, productName: string) => {
        const confirmed = window.confirm(`Delete "${productName}"? This action cannot be undone.`);
        if (!confirmed) return;
        deleteProductMutation.mutate(productId);
    };

    useEffect(() => {
        if (location.pathname.endsWith("/add-product")) {
            setActiveView("product");
            return;
        }
        if (location.pathname.endsWith("/products")) {
            setActiveView("inventory");
        }
    }, [location.pathname]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const editId = params.get("edit");
        if (editId && productsQuery.data?.items) {
            const product = productsQuery.data.items.find((item: Product) => item.id === editId);
            if (product) startEdit(product);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, productsQuery.data]);

    const inventoryTitle = selectedCategory ? `${selectedCategory} Inventory` : "Inventory";

    return (
        <main className="pt-20 sm:pt-24">
            <section className="section-padding max-w-7xl mx-auto space-y-10">
                <div className="text-center">
                    <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">Dashboard</p>
                    <h1 className="text-3xl sm:text-4xl font-heading">Admin Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-3 max-w-2xl mx-auto">Manage categories and products for the storefront.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-6 lg:gap-8 items-start">
                    <aside className="border border-border rounded-2xl bg-card p-5 space-y-6 xl:sticky xl:top-28">
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Admin Panel</p>
                                    <h2 className="font-heading text-2xl mt-2">Inventory Menu</h2>
                                </div>
                                <Button variant="outline" size="icon" onClick={clearAdminKey} aria-label="Logout">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button className="w-full justify-start gap-2" onClick={openAddProduct}>
                                <PackagePlus className="h-4 w-4" />
                                Add Product
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <p className="px-1 text-xs tracking-[0.3em] uppercase text-muted-foreground">Main Pages</p>
                            <button
                                type="button"
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${activeView === "inventory" ? "bg-foreground text-background" : "bg-muted/60 hover:bg-muted"}`}
                                onClick={() => {
                                    navigate("/admin/dashboard/products");
                                    setActiveView("inventory");
                                    setSelectedCategory(null);
                                }}
                            >
                                <Grid2x2 className="h-4 w-4" />
                                <span>All Products</span>
                            </button>
                            <button
                                type="button"
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${activeView === "product" ? "bg-foreground text-background" : "bg-muted/60 hover:bg-muted"}`}
                                onClick={openAddProduct}
                            >
                                <PackagePlus className="h-4 w-4" />
                                <span>Add Product</span>
                            </button>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="pt-3">
                                <p className="px-1 text-xs tracking-[0.3em] uppercase text-muted-foreground">Filter by Category</p>
                            </div>

                            {categoriesQuery.isLoading ? (
                                <p className="px-1 text-sm text-muted-foreground">Loading categories...</p>
                            ) : availableCategories.length === 0 ? (
                                <p className="px-1 text-sm text-muted-foreground">No categories yet.</p>
                            ) : (
                                availableCategories.map((category: AdminCategory) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${activeView === "inventory" && selectedCategory === category.name ? "bg-foreground text-background" : "bg-muted/60 hover:bg-muted"}`}
                                        onClick={() => {
                                            navigate("/admin/dashboard/products");
                                            setSelectedCategory(category.name);
                                            setActiveView("inventory");
                                        }}
                                    >
                                        <FolderKanban className="h-4 w-4" />
                                        <span>{category.name}</span>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="border-t border-border pt-4 space-y-2">
                            <p className="px-1 text-xs tracking-[0.3em] uppercase text-muted-foreground">Tools</p>
                            <button
                                type="button"
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${activeView === "categories" ? "bg-foreground text-background" : "bg-muted/60 hover:bg-muted"}`}
                                onClick={() => setActiveView("categories")}
                            >
                                <Tags className="h-4 w-4" />
                                <span>Manage Categories</span>
                            </button>
                            <button
                                type="button"
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${activeView === "uploads" ? "bg-foreground text-background" : "bg-muted/60 hover:bg-muted"}`}
                                onClick={() => setActiveView("uploads")}
                            >
                                <ImageIcon className="h-4 w-4" />
                                <span>Uploads</span>
                            </button>
                        </div>
                    </aside>

                    <section className="border border-border rounded-2xl p-4 sm:p-6 bg-card overflow-hidden">
                        {activeView === "inventory" && (
                            <div className="space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h2 className="font-heading text-2xl">{inventoryTitle}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {filteredProducts.length} of {productsQuery.data?.total || 0} products visible
                                        </p>
                                    </div>
                                    <Button variant="outline" onClick={openAddProduct}>Add Product</Button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                                        <p className="text-xs tracking-widest uppercase text-muted-foreground">Total Products</p>
                                        <p className="mt-2 text-xl font-semibold">{productsQuery.data?.total || 0}</p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                                        <p className="text-xs tracking-widest uppercase text-muted-foreground">Visible In View</p>
                                        <p className="mt-2 text-xl font-semibold">{filteredProducts.length}</p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                                        <p className="text-xs tracking-widest uppercase text-muted-foreground">Needs Size Check</p>
                                        <p className="mt-2 text-xl font-semibold">{lowStockHintProducts.length}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                    <input
                                        value={inventorySearch}
                                        onChange={(event) => setInventorySearch(event.target.value)}
                                        placeholder="Search by product, category, or badge"
                                        className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    {inventorySearch && (
                                        <Button variant="outline" onClick={() => setInventorySearch("")}>
                                            Clear Search
                                        </Button>
                                    )}
                                </div>

                                {productsQuery.isLoading ? (
                                    <p className="text-sm text-muted-foreground">Loading products...</p>
                                ) : productsQuery.isError ? (
                                    <p className="text-sm text-muted-foreground">Could not load admin products. Check your login and database connection.</p>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
                                        <p className="font-medium">No products found in this view.</p>
                                        <p className="mt-2 text-sm text-muted-foreground">Choose another category or create a new product from the sidebar.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredProducts.map((product) => (
                                            <article key={product.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4">
                                                <img src={product.image} alt={product.name} className="w-full md:w-28 h-36 object-cover rounded bg-muted" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <h3 className="font-medium">{product.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{product.category} · {formatCurrency(product.price)}</p>
                                                        </div>
                                                        {product.badge && (
                                                            <span className="text-[10px] tracking-widest uppercase text-accent-foreground bg-accent px-2 py-1 rounded-sm">{product.badge}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                                    <p className="text-xs text-muted-foreground">Sizes: {product.sizes.join(", ")}</p>
                                                    <div className="flex flex-wrap gap-3 pt-2">
                                                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => startEdit(product)}>Edit</Button>
                                                        <Button
                                                            className="w-full sm:w-auto"
                                                            variant="outline"
                                                            onClick={() => handleDeleteProduct(product.id, product.name)}
                                                            disabled={deleteProductMutation.isPending}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeView === "categories" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="font-heading text-2xl">Manage Categories</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Create categories, then use the sidebar to jump straight into each inventory group.</p>
                                </div>

                                <form className="space-y-4 max-w-xl" onSubmit={handleCategorySubmit}>
                                    <div>
                                        <label htmlFor="categoryName" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Category Name</label>
                                        <input id="categoryName" required value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                                    </div>
                                    <Button type="submit" disabled={createCategoryMutation.isPending}>{createCategoryMutation.isPending ? "Saving..." : "Save Category"}</Button>
                                </form>

                                <div className="space-y-3">
                                    <p className="text-xs tracking-widest uppercase text-muted-foreground">Current Categories</p>
                                    {categoriesQuery.isLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading categories...</p>
                                    ) : availableCategories.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No categories created yet.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-3">
                                            {availableCategories.map((category: AdminCategory) => (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    className="rounded-full bg-muted px-4 py-2 text-sm hover:bg-muted/80"
                                                    onClick={() => {
                                                        setSelectedCategory(category.name);
                                                        setActiveView("inventory");
                                                    }}
                                                >
                                                    {category.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeView === "product" && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h2 className="font-heading text-2xl">{productForm.id ? "Edit Product" : "Add Product"}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Create new products or update existing ones from a single form.</p>
                                    </div>
                                    <Button variant="outline" onClick={() => navigate("/admin/dashboard/products")}>Back to Inventory</Button>
                                </div>

                                <form className="space-y-4" onSubmit={handleProductSubmit}>
                                    <div>
                                        <label htmlFor="name" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Product Name</label>
                                        <input id="name" name="name" required value={productForm.name} onChange={handleProductChange} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="price" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Price</label>
                                            <input id="price" name="price" required type="number" min="0" value={productForm.price} onChange={handleProductChange} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                                        </div>
                                        <div>
                                            <label htmlFor="badge" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Badge</label>
                                            <input id="badge" name="badge" value={productForm.badge} onChange={handleProductChange} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="category" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Category</label>
                                        <select id="category" name="category" required value={productForm.category} onChange={handleProductChange} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                                            <option value="">Select category</option>
                                            {availableCategories.map((category) => (
                                                <option key={category.id} value={category.name}>{category.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Main Image</label>
                                        {mainPreviewUrl ? (
                                            <div className="mb-3">
                                                <img src={mainPreviewUrl} alt="main-preview" className="w-full h-48 object-cover rounded" />
                                            </div>
                                        ) : productForm.image ? (
                                            <div className="mb-3">
                                                <img src={productForm.image} alt="main" className="w-full h-48 object-cover rounded" />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mb-3">No main image selected. Choose from uploaded images below or upload from your computer.</p>
                                        )}

                                        <div className="mb-3">
                                            <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Upload main image (from computer)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => {
                                                    const file = event.target.files?.[0] || null;
                                                    setProductImageFile(file);
                                                    if (file) setMainPreviewUrl(URL.createObjectURL(file));
                                                    else setMainPreviewUrl(null);
                                                }}
                                            />
                                        </div>

                                        <div className="mt-2">
                                            <Button type="button" size="sm" onClick={() => loadUploads()} disabled={!adminKey || loadingUploads}>
                                                {loadingUploads ? "Loading..." : "Browse uploaded images"}
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-2">Click an uploaded image to set as main or add to gallery. Use delete to remove from server.</p>
                                            <div className="mt-3 grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {uploadedImages.map((img) => (
                                                    <div key={img.filename} className="border rounded overflow-hidden">
                                                        <img src={img.url} alt={img.filename} className="w-full h-24 object-cover" />
                                                        <div className="p-2 flex flex-wrap gap-2">
                                                            <Button type="button" size="sm" onClick={() => setProductForm((current) => ({ ...current, image: img.url }))}>Set main</Button>
                                                            <Button type="button" size="sm" onClick={() => addGalleryImage(img.url)}>Add</Button>
                                                            <Button type="button" size="sm" variant="destructive" onClick={() => deleteUploadMutation.mutate(img.filename)} disabled={deleteUploadMutation.isPending}>Del</Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Gallery Images</label>
                                        <div className="mb-3">
                                            <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Upload gallery images (multiple)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                disabled={((productForm.galleryImages || []).length + (productForm.image ? 1 : 0) + productGalleryFiles.length) >= MAX_GALLERY}
                                                onChange={(event) => {
                                                    const files = event.target.files ? Array.from(event.target.files) : [];
                                                    const existingCount = (productForm.galleryImages || []).length + (productForm.image ? 1 : 0) + productGalleryFiles.length;
                                                    const remaining = Math.max(0, MAX_GALLERY - existingCount);
                                                    if (remaining === 0) {
                                                        toast({ title: "Gallery full", description: `Maximum ${MAX_GALLERY} images allowed` });
                                                        event.currentTarget.value = "";
                                                        return;
                                                    }
                                                    const allowed = files.slice(0, remaining);
                                                    if (files.length > remaining) {
                                                        toast({ title: "Trimmed selection", description: `Only ${remaining} files accepted` });
                                                    }
                                                    if (allowed.length === 0) {
                                                        event.currentTarget.value = "";
                                                        return;
                                                    }
                                                    setProductGalleryFiles((current) => [...current, ...allowed]);
                                                    setGalleryPreviewUrls((current) => [...current, ...allowed.map((file) => URL.createObjectURL(file))]);
                                                    event.currentTarget.value = "";
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            {galleryPreviewUrls.map((previewUrl, index) => (
                                                <div key={previewUrl} className="flex flex-wrap items-center gap-3">
                                                    <img src={previewUrl} alt="preview" className="w-20 h-12 object-cover rounded" />
                                                    <div className="flex-1 text-sm text-muted-foreground">Local file</div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setProductGalleryFiles((current) => current.filter((_, idx) => idx !== index));
                                                            setGalleryPreviewUrls((current) => current.filter((_, idx) => idx !== index));
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}

                                            {(productForm.galleryImages || []).map((url) => (
                                                <div key={url} className="flex flex-wrap items-center gap-3">
                                                    <img src={url} alt="gallery" className="w-20 h-12 object-cover rounded" />
                                                    <div className="flex-1 text-sm text-muted-foreground">Existing</div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setProductForm((current) => ({ ...current, galleryImages: (current.galleryImages || []).filter((imageUrl) => imageUrl !== url) }))}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}

                                            {!(productForm.galleryImages || []).length && !galleryPreviewUrls.length && <p className="text-sm text-muted-foreground">No gallery images. Add from uploaded images below or upload files.</p>}

                                            <div className="pt-2 text-xs text-muted-foreground">Using {(productForm.image ? 1 : 0) + (productForm.galleryImages || []).length + productGalleryFiles.length} of {MAX_GALLERY} images</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="sizes" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Sizes</label>
                                        <input id="sizes" name="sizes" required value={productForm.sizes} onChange={handleProductChange} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Description</label>
                                        <textarea id="description" name="description" required rows={5} value={productForm.description} onChange={handleProductChange} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button type="submit" className="sm:min-w-40" disabled={saveProductMutation.isPending}>{saveProductMutation.isPending ? "Saving..." : productForm.id ? "Update Product" : "Create Product"}</Button>
                                        {productForm.id && (
                                            <Button type="button" variant="outline" onClick={openAddProduct}>Clear Form</Button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeView === "uploads" && (
                            <div className="space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h2 className="font-heading text-2xl">Uploaded Images</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Use these files for product covers and gallery images.</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => loadUploads()} disabled={!adminKey || loadingUploads}>
                                        {loadingUploads ? "Loading..." : "Refresh"}
                                    </Button>
                                </div>

                                {uploadedImages.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No uploaded images found.</p>
                                ) : (
                                    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {uploadedImages.map((img) => (
                                            <div key={img.filename} className="border rounded overflow-hidden">
                                                <img src={img.url} alt={img.filename} className="w-full h-24 object-cover" />
                                                <div className="p-2 flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => {
                                                            setProductForm((current) => ({ ...current, image: img.url }));
                                                            setActiveView("product");
                                                        }}
                                                    >
                                                        Set main
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => {
                                                            addGalleryImage(img.url);
                                                            setActiveView("product");
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                    <Button type="button" size="sm" variant="destructive" onClick={() => deleteUploadMutation.mutate(img.filename)} disabled={deleteUploadMutation.isPending}>Del</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </main>
    );
};

export default AdminDashboard;
