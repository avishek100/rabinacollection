import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadAdminFile } from "@/lib/api";
import { useState } from "react";
import { Link } from "react-router-dom";

const getStoredAdminKey = () => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("rabina-admin-key") || "";
};

const UploadNew = () => {
    const { toast } = useToast();
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);

    const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files ? Array.from(e.target.files) : [];
        setFiles((curr) => [...curr, ...f]);
        setPreviews((curr) => [...curr, ...f.map((x) => URL.createObjectURL(x))]);
        e.currentTarget.value = "";
    };

    const removeAt = (idx: number) => {
        setFiles((curr) => curr.filter((_, i) => i !== idx));
        setPreviews((curr) => curr.filter((_, i) => i !== idx));
    };

    const handlePost = async () => {
        const key = getStoredAdminKey();
        if (!key) return toast({ title: "Not logged in", description: "Admin login required", variant: "destructive" });
        if (files.length === 0) return toast({ title: "No files", description: "Select at least one image" });

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (const f of files) {
                const res = await uploadAdminFile(key, f);
                uploadedUrls.push(res.url);
            }
            // Optionally you could POST a "post" object to your backend here containing caption and uploadedUrls
            toast({ title: "Uploaded", description: "Images uploaded successfully" });
            setFiles([]);
            setPreviews([]);
            setCaption("");
        } catch (err) {
            toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="pt-20 sm:pt-24">
            <section className="section-padding max-w-2xl mx-auto">
                <div className="border border-border rounded-lg p-6 bg-card">
                    <h1 className="text-xl font-heading mb-3">Create Post</h1>
                    <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's on your mind?" className="w-full mb-3 p-3 rounded border border-border resize-none" rows={4} />

                    <div className="mb-3">
                        <input type="file" accept="image/*" multiple onChange={onSelect} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                        {previews.map((p, i) => (
                            <div key={p} className="relative">
                                <img src={p} className="w-full h-28 object-cover rounded" />
                                <button type="button" className="absolute top-1 right-1 bg-white rounded-full p-1" onClick={() => removeAt(i)}>x</button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handlePost} disabled={uploading}>{uploading ? "Posting..." : "Post"}</Button>
                        <Button asChild variant="outline"><Link to="/uploads">View Uploads</Link></Button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default UploadNew;
