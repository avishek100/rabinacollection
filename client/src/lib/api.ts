import { Product } from "@/types/product";

type ProductsResponse = {
  items: Product[];
  total: number;
};

export type AdminCategory = {
  id: string;
  name: string;
};

export type StoreInfo = {
  brand: string;
  tagline: string;
  currency: string;
  currencyLabel: string;
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  socials: Array<{
    platform: string;
    url: string;
  }>;
};

type ContactPayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

type NewsletterPayload = {
  email: string;
};

export type ProductPayload = {
  name: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  badge?: string;
};

async function apiRequest<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  const base = import.meta.env.VITE_API_URL || "";
  const url = endpoint.startsWith("http") ? endpoint : `${base}${endpoint}`;

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

export function loginAdmin(username: string, password: string) {
  const base = import.meta.env.VITE_API_URL || "";

  return apiRequest<{ message: string; adminKey: string }>(`${base}/api/admin/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

function adminHeaders(adminKey: string) {
  return {
    "x-admin-key": adminKey,
  };
}

export function getProducts(category?: string) {
  const params = new URLSearchParams();

  if (category && category !== "All") {
    params.set("category", category);
  }

  const query = params.toString();

  return apiRequest<ProductsResponse>(`/api/products${query ? `?${query}` : ""}`);
}

export function getProduct(productId: string) {
  return apiRequest<Product>(`/api/products/${productId}`);
}

export function getCategories() {
  return apiRequest<string[]>("/api/categories");
}

export function getStoreInfo() {
  return apiRequest<StoreInfo>("/api/store");
}

export function submitContactForm(payload: ContactPayload) {
  return apiRequest<{ message: string }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function subscribeToNewsletter(payload: NewsletterPayload) {
  return apiRequest<{ message: string }>("/api/newsletter", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminCategories(adminKey: string) {
  return apiRequest<AdminCategory[]>("/api/admin/categories", {
    headers: adminHeaders(adminKey),
  });
}

export function createAdminCategory(adminKey: string, payload: { name: string }) {
  return apiRequest<{ message: string; category: AdminCategory }>("/api/admin/categories", {
    method: "POST",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(payload),
  });
}

export function getAdminProducts(adminKey: string) {
  return apiRequest<ProductsResponse>("/api/admin/products", {
    headers: adminHeaders(adminKey),
  });
}

export function createAdminProduct(adminKey: string, payload: ProductPayload) {
  return apiRequest<{ message: string; product: Product }>("/api/admin/products", {
    method: "POST",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(payload),
  });
}

export function updateAdminProduct(adminKey: string, productId: string, payload: ProductPayload) {
  return apiRequest<{ message: string; product: Product }>(`/api/admin/products/${productId}`, {
    method: "PUT",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminProduct(adminKey: string, productId: string) {
  return apiRequest<{ message: string }>(`/api/admin/products/${productId}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
}

export async function uploadAdminFile(adminKey: string, file: File) {
  const base = import.meta.env.VITE_API_URL || "";

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${base}/api/admin/upload`, {
    method: "POST",
    body: form,
    headers: {
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.message || "Upload failed");

  return data as { message: string; url: string };
}

export function getAdminUploads(adminKey: string) {
  return apiRequest<{ items: { filename: string; url: string }[]; total: number }>(
    "/api/admin/uploads",
    {
      headers: adminHeaders(adminKey),
    },
  );
}

export function deleteAdminUpload(adminKey: string, filename: string) {
  const base = import.meta.env.VITE_API_URL || "";
  return apiRequest<{ message: string }>(`${base}/api/admin/uploads/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
}
