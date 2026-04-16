import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", activeCategory],
    queryFn: () => getProducts(activeCategory),
  });

  const products = data?.items || [];

  return (
    <main className="pt-20 sm:pt-24">
      <section className="section-padding max-w-7xl mx-auto">
        <div className="text-center mb-12">
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

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading collection...</p>
        ) : isError ? (
          <p className="text-center text-sm text-muted-foreground">We could not load the collection right now.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Shop;
