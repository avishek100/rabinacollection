import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoreInfo, submitContactForm } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const { data: storeInfo } = useQuery({
    queryKey: ["store"],
    queryFn: getStoreInfo,
  });

  const contactMutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: (response) => {
      setSubmitted(true);
      setForm(initialFormState);
      toast({
        title: "Message sent",
        description: response.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Message failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    contactMutation.mutate(form);
  };

  const instagramUrl = storeInfo?.socials.find((social) => social.platform === "Instagram")?.url;
  const facebookUrl = storeInfo?.socials.find((social) => social.platform === "Facebook")?.url;
  const tiktokUrl = storeInfo?.socials.find((social) => social.platform === "TikTok")?.url;

  return (
    <main className="pt-20 sm:pt-24">
      <section className="section-padding max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">Get in Touch</p>
          <h1 className="text-3xl sm:text-4xl font-heading">Contact Us</h1>
          <p className="text-muted-foreground text-sm mt-3 max-w-2xl mx-auto">
            Questions about orders, sizes, or custom suggestions? Send us a message and our team will help you quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {submitted ? (
              <div className="bg-warm rounded p-8 text-center">
                <h3 className="font-heading text-xl mb-2">Thank you!</h3>
                <p className="text-muted-foreground text-sm">We'll get back to you soon.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">
                      Your Name
                    </label>
                    <input
                      id="name"
                      required
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      required
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    required
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto px-8" disabled={contactMutation.isPending}>
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-lg mb-4">Visit & Connect</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-foreground" />
                  <p>{storeInfo?.contact.address || "Loading address..."}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="shrink-0 text-foreground" />
                  <p>{storeInfo?.contact.phone || "Loading phone..."}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-foreground" />
                  <p>{storeInfo?.contact.email || "Loading email..."}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-lg mb-4">Follow Us</h3>
              <div className="flex gap-4 flex-wrap">
                {instagramUrl ? (
                  <a href={instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Instagram size={18} /> Instagram
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground/70">
                    <Instagram size={18} /> Instagram
                  </span>
                )}
                {facebookUrl ? (
                  <a href={facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Facebook size={18} /> Facebook
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground/70">
                    <Facebook size={18} /> Facebook
                  </span>
                )}
                {tiktokUrl ? (
                  <a href={tiktokUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.26 6.26 0 0 0 0 12.52 6.27 6.27 0 0 0 6.26-6.27V8.55a8.16 8.16 0 0 0 3.84.96V6.09a4.84 4.84 0 0 1-1-.1z" /></svg>
                    TikTok
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground/70">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.26 6.26 0 0 0 0 12.52 6.27 6.27 0 0 0 6.26-6.27V8.55a8.16 8.16 0 0 0 3.84.96V6.09a4.84 4.84 0 0 1-1-.1z" /></svg>
                    TikTok
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
