import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { toast } = useToast();
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) =>
            import("@/lib/api").then((m) => m.loginAdmin(username, password)),
        onSuccess: (response) => {
            const key = response.adminKey;
            window.localStorage.setItem("rabina-admin-key", key);
            toast({ title: "Logged in", description: "Admin access granted" });
            navigate('/admin/dashboard/products');
        },
        onError: (error: Error) => {
            toast({ title: "Login failed", description: error.message, variant: "destructive" });
        },
    });

    return (
        <main className="pt-20 sm:pt-24">
            <section className="section-padding max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-heading">Admin Login</h1>
                <div className="border border-border rounded-lg p-6 bg-card">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Username</label>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded text-sm" />
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => loginMutation.mutate({ username, password })} disabled={loginMutation.isPending}>
                                {loginMutation.isPending ? 'Logging in...' : 'Login'}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AdminLogin;
