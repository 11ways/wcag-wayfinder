import { useState, useEffect } from 'react';

import MetadataEditor from '../components/MetadataEditor';
import { setAdminPassword } from '../lib/admin-api';
import { getCriteria, getCriterionById } from '../lib/api';

import type { Criterion } from '../lib/types';


export default function AdminPage() {
  const [error, setError] = useState<string | null>(null);

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [selectedCriterionId, setSelectedCriterionId] = useState<string | null>(
    null
  );
  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Set a default admin password (not used for actual authentication)
  useEffect(() => {
    setAdminPassword('admin');
  }, []);

  // Load all criteria
  useEffect(() => {
    setLoading(true);
    getCriteria({ pageSize: 100 })
      .then((data) => {
        setCriteria(data.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Load selected criterion with metadata
  useEffect(() => {
    if (selectedCriterionId) {
      getCriterionById(selectedCriterionId)
        .then((data) => {
          setSelectedCriterion(data);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [selectedCriterionId]);

  const handleCriterionUpdate = () => {
    // Reload the selected criterion to get updated metadata
    if (selectedCriterionId) {
      getCriterionById(selectedCriterionId)
        .then((data) => {
          setSelectedCriterion(data);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  };

  const filteredCriteria = criteria.filter(
    (c) =>
      c.num.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b border-gray-300 bg-white p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold text-black">
            WCAG Wayfinder - Admin
          </h1>
          <a href="/" className="text-blue-600 hover:underline">
            Back to Explorer
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4">
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          {/* Criteria list */}
          <div className="w-1/3 border border-gray-300 bg-white p-4">
            <div className="mb-4">
              <input
                type="search"
                placeholder="Search criteria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-gray-300 p-2 text-black"
              />
            </div>

            {loading ? (
              <p className="text-black">Loading criteria...</p>
            ) : (
              <div className="max-h-[calc(100vh-12rem)] space-y-2 overflow-y-auto">
                {filteredCriteria.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCriterionId(c.id)}
                    className={`w-full rounded border border-gray-300 p-3 text-left hover:bg-gray-100 ${
                      selectedCriterionId === c.id
                        ? 'border-blue-500 bg-blue-100'
                        : ''
                    }`}
                  >
                    <div className="font-bold text-black">{c.num}</div>
                    <div className="truncate text-sm text-gray-700">
                      {c.title}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Tags: {c.tags?.length || 0} | Affects:{' '}
                      {c.affected_users?.length || 0} | Resp:{' '}
                      {c.assignees?.length || 0} | Tech:{' '}
                      {c.technologies?.length || 0}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metadata editor */}
          <div className="flex-1">
            {selectedCriterion ? (
              <MetadataEditor
                criterion={selectedCriterion}
                onUpdate={handleCriterionUpdate}
              />
            ) : (
              <div className="border border-gray-300 bg-white p-4 text-center text-gray-600">
                Select a criterion to edit its metadata
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
