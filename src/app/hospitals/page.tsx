'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hospitalApi } from '@/lib/api';
import SearchFilters from '@/components/SearchFilters';
import HospitalCard from '@/components/HospitalCard';
import { Hospital, SearchParams } from '@/types';
import { Loader2, Hospital as HospitalIcon, AlertCircle } from 'lucide-react';

export default function HospitalsPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['hospitals', searchParams],
    queryFn: async () => {
      const response = await hospitalApi.search(searchParams);
      return response.data;
    },
  });

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
  };

  const hospitals: Hospital[] = data?.data?.hospitals || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            🏥 Find Hospitals
          </h1>
          <p className="text-lg text-gray-600">
            Search for hospitals with available beds and blood supplies near you
          </p>
        </div>

        {/* Search Filters */}
        <SearchFilters onSearch={handleSearch} isLoading={isLoading} />

        {/* Results */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Searching for hospitals...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error loading hospitals
              </h3>
              <p className="text-gray-600">
                Please try again or adjust your search filters.
              </p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HospitalIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hospitals found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search filters or location.
              </p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{hospitals.length}</span> of{' '}
                  <span className="font-semibold">{pagination?.total || 0}</span> hospitals
                </p>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, sortBy: e.target.value as any })
                  }
                  value={searchParams.sortBy || 'distance'}
                >
                  <option value="distance">Sort by Distance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="beds">Sort by Bed Availability</option>
                  <option value="updated">Sort by Recently Updated</option>
                </select>
              </div>

              {/* Hospital Cards */}
              <div className="grid gap-6">
                {hospitals.map((hospital) => (
                  <HospitalCard key={hospital._id} hospital={hospital} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setSearchParams({ ...searchParams, page })}
                        className={`px-4 py-2 rounded-lg ${
                          page === (searchParams.page || 1)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <>
                      <span className="px-2 py-2">...</span>
                      <button
                        onClick={() =>
                          setSearchParams({ ...searchParams, page: pagination.totalPages })
                        }
                        className="px-4 py-2 rounded-lg bg-white text-gray-700 border hover:bg-gray-50"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
