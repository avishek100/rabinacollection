import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";
import { Button } from "@/components/ui/button";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", activeCategory],
    queryFn: () => getProducts(activeCategory),
  });

  const products = data?.items || [];
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category} ${product.badge || ""}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <main className="pt-20 sm:pt-24">
      <section className="section-padding max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">Shop</p>
          <h1 className="text-3xl sm:text-4xl font-heading mb-3">Our Collection</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Thoughtfully curated pieces for every occasion</p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-4 mb-10 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-xs sm:text-sm tracking-widest uppercase px-4 py-2 rounded transition-colors ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <label htmlFor="shop-search" className="block text-xs tracking-widest uppercase text-muted-foreground mb-2">
            Search Products
          </label>
          <div className="flex gap-2">
            <input
              id="shop-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, category, or badge"
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading collection...</p>
        ) : isError ? (
          <p className="text-center text-sm text-muted-foreground">We could not load the collection right now.</p>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <p className="font-medium">No products match this filter.</p>
            <p className="mt-2 text-sm text-muted-foreground">Try another category or clear your search.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-center text-sm text-muted-foreground">
              Showing {filteredProducts.length} products{activeCategory !== "All" ? ` in ${activeCategory}` : ""}.
            </p>
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Shop;
