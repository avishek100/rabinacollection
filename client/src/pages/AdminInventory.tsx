import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteAdminProduct, getAdminProducts } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const getStoredAdminKey = () => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("rabina-admin-key") || "";
};

const AdminInventory = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        const key = getStoredAdminKey();
        if (!key) return setItems([]);
        setLoading(true);
        try {
            const res = await getAdminProducts(key);
            setItems(res.items || []);
        } catch (err) {
            toast({ title: "Could not load products", description: (err as Error).message || "", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = async (id: string) => {
        const key = getStoredAdminKey();
        if (!key) return toast({ title: "Not logged in", description: "Admin login required", variant: "destructive" });
        try {
            await deleteAdminProduct(key, id);
            toast({ title: "Deleted" });
            load();
        } catch (err) {
            toast({ title: "Delete failed", description: (err as Error).message, variant: "destructive" });
        }
    };

    return (
        <main className="pt-20 sm:pt-24">
            <section className="section-padding max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h1 className="text-2xl font-heading">Inventory</h1>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => load()} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
                        <Button onClick={() => navigate('/admin/dashboard/products')}>Open Dashboard</Button>
                    </div>
                </div>

                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products found.</p>
                ) : (
                    <div className="space-y-4">
                        {items.map((product) => (
                            <article key={product.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4">
                                <img src={product.image} alt={product.name} className="w-full md:w-28 h-36 object-cover rounded bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-medium">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground">{product.category} · {product.price}</p>
                                        </div>
                                        {product.badge && (
                                            <span className="text-[10px] tracking-widest uppercase text-accent-foreground bg-accent px-2 py-1 rounded-sm">{product.badge}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate(`/admin/dashboard/add-product?edit=${product.id}`)}>Edit</Button>
                                        <Button className="w-full sm:w-auto" variant="destructive" onClick={() => handleDelete(product.id)}>Delete</Button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default AdminInventory;
