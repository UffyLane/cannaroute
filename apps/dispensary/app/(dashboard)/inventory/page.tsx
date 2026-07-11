'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { inventoryApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, toTitleCase } from '@/lib/utils';
import { Product } from '@/types';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await inventoryApi.get('/inventory/products?limit=100');
      return data.data ?? data;
    },
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: (product: Product) =>
      inventoryApi.patch(`/inventory/products/${product.id}`, { isActive: !product.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
    },
  });

  const filtered = products.filter((p) =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const lowStock = filtered.filter((p) => p.stockQuantity < 10 && p.isActive);

  return (
    <div className="space-y-4">
      {/* ── Low stock alert ── */}
      {lowStock.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl border"
          style={{
            backgroundColor: 'rgba(245,158,11,0.06)',
            borderColor: 'rgba(245,158,11,0.24)',
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
            {lowStock.length} product{lowStock.length !== 1 ? 's' : ''} running low on stock
          </p>
        </div>
      )}

      {/* ── Search + add ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a3a3a3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
          />
        </div>
        <Button variant="primary">+ Add Product</Button>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2"
              style={{ borderColor: 'rgba(15,76,53,0.20)', borderTopColor: '#0f4c35' }}
            />
          </div>
        ) : (
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>THC</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <p className="font-semibold text-neutral-900">{product.name}</p>
                    {product.strain && (
                      <p className="text-xs text-neutral-400 mt-0.5">{product.strain}</p>
                    )}
                  </td>
                  <td>
                    <Badge label={toTitleCase(product.category)} variant="neutral" />
                  </td>
                  <td className="text-neutral-600">
                    {product.thcPercentage !== undefined
                      ? `${product.thcPercentage.toFixed(1)}%`
                      : '—'}
                  </td>
                  <td className="font-bold text-neutral-900">{formatCurrency(product.pricePerUnit)}</td>
                  <td>
                    <span
                      className={`font-semibold ${
                        product.stockQuantity < 10 ? 'text-red-500' : 'text-neutral-700'
                      }`}
                    >
                      {product.stockQuantity}
                      {product.stockQuantity < 10 && (
                        <span className="ml-1 text-xs font-normal text-red-400">low</span>
                      )}
                    </span>
                  </td>
                  <td>
                    <Badge
                      label={product.isActive ? 'Active' : 'Inactive'}
                      variant={product.isActive ? 'success' : 'neutral'}
                    />
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => toggleActive(product)}>
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400 text-sm">
                    {search ? `No products matching "${search}"` : 'No products found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
