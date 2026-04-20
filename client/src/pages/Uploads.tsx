import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteAdminUpload, getAdminUploads } from "@/lib/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const getStoredAdminKey = () => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("rabina-admin-key") || "";
};

const Uploads = () => {
    const { toast } = useToast();
    const [items, setItems] = useState<{ filename: string; url: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        const key = getStoredAdminKey();
        if (!key) return setItems([]);
        setLoading(true);
        try {
            const res = await getAdminUploads(key);
            setItems(res.items || []);
        } catch (err) {
            toast({ title: "Could not load uploads", description: (err as Error).message || "", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (filename: string) => {
        const key = getStoredAdminKey();
        if (!key) return toast({ title: "No admin key", description: "Login first", variant: "destructive" });
        try {
            await deleteAdminUpload(key, filename);
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
                    <h1 className="text-2xl font-heading">Uploaded Images</h1>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
                        <Button asChild><Link to="/uploads/new">New Upload</Link></Button>
                    </div>
                </div>

                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No uploads found.</p>
                ) : (
                    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {items.map((it) => (
                            <div key={it.filename} className="border rounded overflow-hidden bg-card">
                                <img src={it.url} alt={it.filename} className="w-full h-40 object-cover" />
                                <div className="p-2 flex items-center justify-between gap-2">
                                    <div className="text-xs truncate flex-1 min-w-0">{it.filename}</div>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(it.filename)}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default Uploads;
