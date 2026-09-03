'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Plus, ArrowUpDown } from 'lucide-react';
import { useData, Product } from '@/context/data-context';

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialQuery = searchParams.get('q') || '';
  const initialInStock = searchParams.get('inStock') === 'true';

  const { categories, products, addToCart } = useData();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outOfStock'>(
    initialInStock ? 'instock' : 'all'
  );
  const [sortBy, setSortBy] = useState<'priceLow' | 'priceHigh' | 'newest' | 'popular'>('popular');
  const [maxPrice] = useState<number>(1000);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        const matchQuery =
          !searchQuery.trim() ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchCategory =
          selectedCategory === 'ALL' || p.category_id === selectedCategory;

        // Stock availability filter
        const matchStock =
          stockFilter === 'all'
            ? true
            : stockFilter === 'instock'
            ? p.stock_quantity > 0
            : p.stock_quantity <= 0;

        // Price range filter
        const matchPrice = p.selling_price <= maxPrice;

        return matchQuery && matchCategory && matchStock && matchPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'priceLow') return a.selling_price - b.selling_price;
        if (sortBy === 'priceHigh') return b.selling_price - a.selling_price;
        if (sortBy === 'newest') return (b.id > a.id ? 1 : -1);
        return a.stock_quantity > b.stock_quantity ? -1 : 1; // Popular (higher stock)
      });
  }, [products, searchQuery, selectedCategory, stockFilter, maxPrice, sortBy]);

  const handleAddToCart = (prod: Product) => {
    addToCart(prod, 1);
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">All Products</h1>
        <p className="text-xs text-slate-400 mt-1">
          Browse real-time shop inventory with transparent prices and instant stock statuses.
        </p>
      </div>

      {/* Search & Main Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Instant Search Bar */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by product name, category, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Stock Filter & Sort Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Availability Pills */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                stockFilter === 'all' ? 'bg-emerald-600 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('instock')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                stockFilter === 'instock' ? 'bg-emerald-600 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter('outOfStock')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                stockFilter === 'outOfStock' ? 'bg-emerald-600 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Out of Stock
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'priceLow' | 'priceHigh' | 'newest' | 'popular')}
              className="bg-transparent text-slate-100 font-semibold focus:outline-none"
            >
              <option value="popular" className="bg-slate-900">Sort: Popular</option>
              <option value="priceLow" className="bg-slate-900">Price: Low → High</option>
              <option value="priceHigh" className="bg-slate-900">Price: High → Low</option>
              <option value="newest" className="bg-slate-900">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          All Categories ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-3">
          <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Products Found</h3>
          <p className="text-xs text-slate-400">
            We couldn&apos;t find any products matching &quot;{searchQuery}&quot;. Try searching for something else or clear filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setStockFilter('all');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const isOutOfStock = prod.stock_quantity <= 0;
            const categoryName = categories.find((c) => c.id === prod.category_id)?.name || 'General';

            return (
              <div
                key={prod.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl group"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {isOutOfStock ? (
                      <span className="bg-red-500/90 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                        Out of Stock
                      </span>
                    ) : prod.stock_quantity <= prod.low_stock_limit ? (
                      <span className="bg-amber-500/90 text-slate-950 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                        Low Stock ({prod.stock_quantity} left)
                      </span>
                    ) : (
                      <span className="bg-emerald-500/90 text-slate-950 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                        In Stock ({prod.stock_quantity})
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-emerald-400">{prod.brand}</span>
                      <span>{categoryName}</span>
                    </div>

                    <Link href={`/products/${prod.id}`}>
                      <h3 className="font-bold text-sm text-slate-100 hover:text-emerald-400 transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400">Selling Price</span>
                      <p className="text-lg font-black text-white">₹{prod.selling_price}</p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      disabled={isOutOfStock}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isOutOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : addedId === prod.id
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 hover:scale-105'
                      }`}
                    >
                      {addedId === prod.id ? (
                        <>✓ Added</>
                      ) : isOutOfStock ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
