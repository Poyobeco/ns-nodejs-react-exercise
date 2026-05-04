import React, { useEffect, useState } from 'react';

interface Tag {
  id: number;
  name: string;
}

interface GridTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  category_name: string;
  tags: Tag[];
}

interface GridResponse {
  items: GridTransaction[];
  total: number;
}

type SortOrder = 'asc' | 'desc';
type SortColumn = 'date' | 'description' | 'amount' | 'category';

const PAGE_SIZE = 10;

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'category', label: 'Category' }
];

const TransactionGrid: React.FC = () => {
  const [items, setItems] = useState<GridTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortColumn>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrid = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const params = new URLSearchParams({
          page: String(page),
          size: String(PAGE_SIZE),
          sort_by: sortBy,
          sort_order: sortOrder
        });
        const response = await fetch(`${backendUrl}/api/v1/transactions/grid?${params}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: GridResponse = await response.json();
        setItems(data.items);
        setTotal(data.total);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGrid();
  }, [page, sortBy, sortOrder]);

  const handleSort = (column: SortColumn) => {
    if (column === sortBy) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (error) {
    return <div className="text-red-500 mt-8">Error loading grid: {error}</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction Grid</h3>
      </div>
      <div className="border-t border-gray-200">
        {loading ? (
          <div className="px-6 py-4 text-gray-700">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  >
                    {col.label}
                    {sortBy === col.key ? (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    ) : (
                      <span className="ml-1 text-gray-300">↕</span>
                    )}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={item.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                      {item.type === 'credit' ? '+' : '-'}${(+item.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {(item.tags ?? []).map(tag => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages || 1} &mdash; {total} total
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-200 disabled:hover:bg-gray-100"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-200 disabled:hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TransactionGrid);
