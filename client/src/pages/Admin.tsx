import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type ProductFormState = {
    id: string | null;
    name: string;
    price: string;
    category: string;
    image: string;
    galleryImages: string[];
    description: string;
    badge: string;
};

const emptyProductForm: ProductFormState = {
    id: null,
    name: "",
    price: "",
    category: "",
    image: "",
    galleryImages: [],
    description: "",
    badge: "",
};

const MAX_GALLERY = 6;

const getStoredAdminKey = () => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("rabina-admin-key") || "";
};

const Admin = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [adminKey, setAdminKey] = useState(getStoredAdminKey);
    const [adminUsername, setAdminUsername] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    const [categoryName, setCategoryName] = useState("");
    const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productGalleryFiles, setProductGalleryFiles] = useState<File[]>([]);
    const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);
    const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<{ filename: string; url: string }[]>([]);
    const [loadingUploads, setLoadingUploads] = useState(false);

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

    const refreshAdminData = () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["admin"] });
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
            setProductForm(emptyProductForm);
            setProductImageFile(null);
            setProductGalleryFiles([]);
            setMainPreviewUrl(null);
            setGalleryPreviewUrls([]);
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

    const loginMutation = useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) =>
            import("@/lib/api").then((m) => m.loginAdmin(username, password)),
        onSuccess: (response) => {
            const key = response.adminKey;
            window.localStorage.setItem("rabina-admin-key", key);
            setAdminKey(key);
            toast({ title: "Logged in", description: "Admin access granted" });
        },
        onError: (error: Error) => {
            toast({ title: "Login failed", description: error.message, variant: "destructive" });
        },
    });

    const clearAdminKey = () => {
        window.localStorage.removeItem("rabina-admin-key");
        setAdminKey("");
        queryClient.removeQueries({ queryKey: ["admin"] });
    };

    const loadUploads = async () => {
        if (!adminKey) return setUploadedImages([]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminKey]);

    const handleCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createCategoryMutation.mutate({ name: categoryName });
    };

    const handleProductChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setProductForm((current) => ({ ...current, [name]: value }));
    };

    const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        let mainImageUrl = productForm.image || "";
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
            for (const f of productGalleryFiles) {
                try {
                    const up = await import("@/lib/api").then((m) => m.uploadAdminFile(getStoredAdminKey(), f));
                    uploadedGalleryUrls.push(up.url);
                } catch (err) {
                    toast({ title: "Upload failed", description: (err as Error).message || "Could not upload gallery image", variant: "destructive" });
                    return;
                }
            }
        }

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
                badge: productForm.badge.trim(),
            },
        });
    };

    const startEdit = (product: Product) => {
        setProductForm({
            id: product.id,
            name: product.name,
            price: String(product.price),
            category: product.category,
            image: product.image,
            galleryImages: product.images.filter((image) => image !== product.image),
            description: product.description,
            badge: product.badge || "",
        });
    };

    return (
        <main className="pt-20 sm:pt-24">
            <section className="section-padding max-w-7xl mx-auto space-y-10">
                <div className="text-center">
                    <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">Dashboard</p>
                    <h1 className="text-3xl sm:text-4xl font-heading">Admin Panel</h1>
                    <p className="text-muted-foreground text-sm mt-3 max-w-2xl mx-auto">Add categories, create new clothes, and update your storefront inventory.</p>
                </div>

                <section className="border border-border rounded-lg p-6 bg-card">
                    <h2 className="font-heading text-xl mb-4">Admin Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                        <div>
                            <label htmlFor="adminUser" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">
                                Admin Username
                            </label>
                            <input id="adminUser" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                        </div>
                        <div>
                            <label htmlFor="adminPass" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Admin Password</label>
                            <input id="adminPass" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                        </div>
                        <div className="md:col-span-2 flex gap-3">
                            <Button onClick={() => loginMutation.mutate({ username: adminUsername, password: adminPassword })} disabled={loginMutation.isPending}>
                                {loginMutation.isPending ? "Logging in..." : "Login"}
                            </Button>
                            {adminKey && (
                                <Button variant="outline" onClick={clearAdminKey}>
                                    Logout
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Use your admin username and password to sign in.</p>
                </section>

                {!adminKey ? (
                    <section className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">Log in to load categories and manage products.</section>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-8">
                        <section className="space-y-8">
                            <div className="border border-border rounded-lg p-4 bg-card">
                                <Tabs defaultValue="product">
                                    <TabsList>
                                        <TabsTrigger value="category">Category</TabsTrigger>
                                        <TabsTrigger value="product">Product</TabsTrigger>
                                        <TabsTrigger value="uploads">Uploads</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="category">
                                        <div className="p-4">
                                            <h3 className="font-heading text-lg mb-3">Add Category</h3>
                                            <form className="space-y-4" onSubmit={handleCategorySubmit}>
                                                <div>
                                                    <label htmlFor="categoryName" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Category Name</label>
                                                    <input id="categoryName" required value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={createCategoryMutation.isPending}>{createCategoryMutation.isPending ? "Saving..." : "Save Category"}</Button>
                                            </form>

                                            <div className="mt-5 space-y-2">
                                                <p className="text-xs tracking-widest uppercase text-muted-foreground">Current Categories</p>
                                                {categoriesQuery.isLoading ? (
                                                    <p className="text-sm text-muted-foreground">Loading categories...</p>
                                                ) : (
                                                    availableCategories.map((category: AdminCategory) => (
                                                        <div key={category.id} className="text-sm bg-muted px-3 py-2 rounded">{category.name}</div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="product">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <h3 className="font-heading text-lg">{productForm.id ? "Edit Product" : "Add Product"}</h3>
                                                {productForm.id && (
                                                    <Button variant="outline" onClick={() => setProductForm(emptyProductForm)}>Cancel Edit</Button>
                                                )}
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
                                                        <input type="file" accept="image/*" onChange={(e) => {
                                                            const f = e.target.files?.[0] || null;
                                                            setProductImageFile(f);
                                                            if (f) setMainPreviewUrl(URL.createObjectURL(f));
                                                            else setMainPreviewUrl(null);
                                                        }} />
                                                    </div>

                                                    <div className="mt-2">
                                                        <Button size="sm" onClick={() => loadUploads()} disabled={!adminKey || loadingUploads}>{loadingUploads ? "Loading..." : "Browse uploaded images"}</Button>
                                                        <p className="text-xs text-muted-foreground mt-2">Click an uploaded image to set as main or add to gallery. Use delete to remove from server.</p>
                                                        <div className="mt-3 grid grid-cols-3 gap-2">
                                                            {uploadedImages.map((img) => (
                                                                <div key={img.filename} className="border rounded overflow-hidden">
                                                                    <img src={img.url} alt={img.filename} className="w-full h-24 object-cover" />
                                                                    <div className="p-2 flex gap-2">
                                                                        <Button size="sm" onClick={() => setProductForm((c) => ({ ...c, image: img.url }))}>Set main</Button>
                                                                        <Button size="sm" onClick={() => setProductForm((c) => ({ ...c, galleryImages: [...(c.galleryImages || []), img.url] }))}>Add</Button>
                                                                        <Button size="sm" variant="destructive" onClick={() => deleteUploadMutation.mutate(img.filename)} disabled={deleteUploadMutation.isPending}>Del</Button>
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
                                                            onChange={(e) => {
                                                                const files = e.target.files ? Array.from(e.target.files) : [];
                                                                const existingCount = (productForm.galleryImages || []).length + (productForm.image ? 1 : 0) + productGalleryFiles.length;
                                                                const remaining = Math.max(0, MAX_GALLERY - existingCount);
                                                                if (remaining === 0) {
                                                                    toast({ title: 'Gallery full', description: `Maximum ${MAX_GALLERY} images allowed` });
                                                                    e.currentTarget.value = "";
                                                                    return;
                                                                }
                                                                let allowed = files.slice(0, remaining);
                                                                if (files.length > remaining) {
                                                                    toast({ title: 'Trimmed selection', description: `Only ${remaining} files accepted` });
                                                                }
                                                                if (allowed.length === 0) {
                                                                    e.currentTarget.value = "";
                                                                    return;
                                                                }
                                                                setProductGalleryFiles((curr) => [...curr, ...allowed]);
                                                                const previews = allowed.map((f) => URL.createObjectURL(f));
                                                                setGalleryPreviewUrls((curr) => [...curr, ...previews]);
                                                                e.currentTarget.value = "";
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        {galleryPreviewUrls.map((p, i) => (
                                                            <div key={p} className="flex items-center gap-3">
                                                                <img src={p} alt="preview" className="w-20 h-12 object-cover rounded" />
                                                                <div className="flex-1 text-sm text-muted-foreground">Local file</div>
                                                                <Button size="sm" variant="outline" onClick={() => {
                                                                    setProductGalleryFiles((curr) => curr.filter((_, idx) => idx !== i));
                                                                    setGalleryPreviewUrls((curr) => curr.filter((_, idx) => idx !== i));
                                                                }}>Remove</Button>
                                                            </div>
                                                        ))}

                                                        <div className="pt-2 text-xs text-muted-foreground">Using {(productForm.image ? 1 : 0) + (productForm.galleryImages || []).length + productGalleryFiles.length} of {MAX_GALLERY} images</div>

                                                        {(productForm.galleryImages || []).map((url) => (
                                                            <div key={url} className="flex items-center gap-3">
                                                                <img src={url} alt="gallery" className="w-20 h-12 object-cover rounded" />
                                                                <div className="flex-1 text-sm text-muted-foreground">Existing</div>
                                                                <Button size="sm" variant="outline" onClick={() => setProductForm((c) => ({ ...c, galleryImages: (c.galleryImages || []).filter((u) => u !== url) }))}>Remove</Button>
                                                            </div>
                                                        ))}

                                                        {!(productForm.galleryImages || []).length && !galleryPreviewUrls.length && <p className="text-sm text-muted-foreground">No gallery images. Add from uploaded images below or upload files.</p>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="description" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Description</label>
                                                    <textarea id="description" name="description" required rows={5} value={productForm.description} onChange={handleProductChange} className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={saveProductMutation.isPending}>{saveProductMutation.isPending ? "Saving..." : productForm.id ? "Update Product" : "Create Product"}</Button>
                                            </form>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="uploads">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-heading text-lg">Uploaded Images</h3>
                                                <Button size="sm" onClick={() => loadUploads()} disabled={!adminKey || loadingUploads}>{loadingUploads ? "Loading..." : "Refresh"}</Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">Click an uploaded image to set as main, add to gallery or delete.</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {uploadedImages.map((img) => (
                                                    <div key={img.filename} className="border rounded overflow-hidden">
                                                        <img src={img.url} alt={img.filename} className="w-full h-24 object-cover" />
                                                        <div className="p-2 flex gap-2">
                                                            <Button size="sm" onClick={() => setProductForm((c) => ({ ...c, image: img.url }))}>Set main</Button>
                                                            <Button size="sm" onClick={() => setProductForm((c) => ({ ...c, galleryImages: [...(c.galleryImages || []), img.url] }))}>Add</Button>
                                                            <Button size="sm" variant="destructive" onClick={() => deleteUploadMutation.mutate(img.filename)} disabled={deleteUploadMutation.isPending}>Del</Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </section>

                        <section className="border border-border rounded-lg p-6 bg-card">
                            <div className="flex items-center justify-between gap-3 mb-5">
                                <div>
                                    <h2 className="font-heading text-xl">Inventory</h2>
                                    <p className="text-sm text-muted-foreground">{productsQuery.data?.total || 0} products currently in the store</p>
                                </div>
                            </div>

                            {productsQuery.isLoading ? (
                                <p className="text-sm text-muted-foreground">Loading products...</p>
                            ) : productsQuery.isError ? (
                                <p className="text-sm text-muted-foreground">Could not load admin products. Check your login and database connection.</p>
                            ) : (
                                <div className="space-y-4">
                                    {productsQuery.data?.items.map((product) => (
                                        <article key={product.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4">
                                            <img src={product.image} alt={product.name} className="w-full md:w-28 h-36 object-cover rounded bg-muted" />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-medium">{product.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{product.category} · {formatCurrency(product.price)}</p>
                                                    </div>
                                                    {product.badge && (
                                                        <span className="text-[10px] tracking-widest uppercase text-accent-foreground bg-accent px-2 py-1 rounded-sm">{product.badge}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{product.description}</p>
                                                <div className="flex gap-3 pt-2">
                                                    <Button variant="outline" onClick={() => startEdit(product)}>Edit</Button>
                                                    <Button variant="outline" onClick={() => deleteProductMutation.mutate(product.id)} disabled={deleteProductMutation.isPending}>Delete</Button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </section>
        </main>
    );
};

export default Admin;
