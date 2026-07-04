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
      const { data } = await inventoryApi.get('/products?limit=100');
      return data.data ?? data;
    },
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: (product: Product) =>
      inventoryApi.patch(`/products/${product.id}`, { isActive: !product.isActive }),
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
    <div className="space-y-5">
      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-800 font-medium">
            {lowStock.length} product{lowStock.length !== 1 ? 's' : ''} running low on stock
          </p>
        </div>
      )}

      {/* Search + add */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
        <Button variant="primary">+ Add Product</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
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
                    <p className="font-medium">{product.name}</p>
                    {product.strain && (
                      <p className="text-xs text-neutral-400">{product.strain}</p>
                    )}
                  </td>
                  <td>
                    <Badge label={toTitleCase(product.category)} variant="neutral" />
                  </td>
                  <td>
                    {product.thcPercentage !== undefined
                      ? `${product.thcPercentage.toFixed(1)}%`
                      : '—'}
                  </td>
                  <td className="font-semibold">{formatCurrency(product.pricePerUnit)}</td>
                  <td>
                    <span
                      className={
                        product.stockQuantity < 10 ? 'text-red-600 font-semibold' : ''
                      }
                    >
                      {product.stockQuantity}
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
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
