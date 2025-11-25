import { useState, useEffect } from 'react';

import {
  addCriterionMetadata,
  removeCriterionMetadata,
  getAffectedUsers,
  getAssignees,
  getTechnologies,
  getTags,
  type MetadataType,
} from '../lib/admin-api';

import type { Criterion, MetadataItem } from '../lib/types';

interface MetadataEditorProps {
  criterion: Criterion;
  onUpdate: () => void;
}

interface ReferenceItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export default function MetadataEditor({
  criterion,
  onUpdate,
}: MetadataEditorProps) {
  const [affectedUsers, setAffectedUsers] = useState<ReferenceItem[]>([]);
  const [assignees, setAssignees] = useState<ReferenceItem[]>([]);
  const [technologies, setTechnologies] = useState<ReferenceItem[]>([]);
  const [tags, setTags] = useState<ReferenceItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reference data
  useEffect(() => {
    Promise.all([
      getAffectedUsers(),
      getAssignees(),
      getTechnologies(),
      getTags(),
    ])
      .then(([au, as, tech, t]) => {
        setAffectedUsers(au);
        setAssignees(as);
        setTechnologies(tech);
        setTags(t);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAdd = async (
    type: MetadataType,
    itemId: number,
    relevanceScore: number,
    reasoning: string
  ) => {
    try {
      setError(null);
      await addCriterionMetadata(criterion.id, type, itemId, {
        relevance_score: relevanceScore,
        reasoning,
      });
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add metadata');
    }
  };

  const handleRemove = async (type: MetadataType, itemId: number) => {
    try {
      setError(null);
      await removeCriterionMetadata(criterion.id, type, itemId);
      onUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to remove metadata'
      );
    }
  };

  const handleUpdate = async (
    type: MetadataType,
    itemId: number,
    relevanceScore: number,
    reasoning: string
  ) => {
    try {
      setError(null);
      await addCriterionMetadata(criterion.id, type, itemId, {
        relevance_score: relevanceScore,
        reasoning,
      });
      onUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update metadata'
      );
    }
  };

  if (loading) {
    return <div className="p-4">Loading reference data...</div>;
  }

  return (
    <div className="border border-gray-300 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold text-black">
        {criterion.num}: {criterion.title}
      </h2>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <MetadataSection
          title="Tags"
          type="tags"
          currentItems={criterion.tags || []}
          availableItems={tags}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
        />

        <MetadataSection
          title="Affected Users"
          type="affected_users"
          currentItems={criterion.affected_users || []}
          availableItems={affectedUsers}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
        />

        <MetadataSection
          title="Assignees"
          type="assignees"
          currentItems={criterion.assignees || []}
          availableItems={assignees}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
        />

        <MetadataSection
          title="Technologies"
          type="technologies"
          currentItems={criterion.technologies || []}
          availableItems={technologies}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}

interface MetadataSectionProps {
  title: string;
  type: MetadataType;
  currentItems: MetadataItem[];
  availableItems: ReferenceItem[];
  onAdd: (
    type: MetadataType,
    itemId: number,
    relevanceScore: number,
    reasoning: string
  ) => void;
  onRemove: (type: MetadataType, itemId: number) => void;
  onUpdate: (
    type: MetadataType,
    itemId: number,
    relevanceScore: number,
    reasoning: string
  ) => void;
}

function MetadataSection({
  title,
  type,
  currentItems,
  availableItems,
  onAdd,
  onRemove,
  onUpdate,
}: MetadataSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [relevanceScore, setRelevanceScore] = useState(0.8);
  const [reasoning, setReasoning] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const currentIds = new Set(currentItems.map((item) => item.id));
  const availableToAdd = availableItems.filter(
    (item) => !currentIds.has(item.id)
  );

  const handleAddSubmit = () => {
    if (selectedId) {
      onAdd(type, selectedId, relevanceScore, reasoning);
      setShowAdd(false);
      setSelectedId(null);
      setRelevanceScore(0.8);
      setReasoning('');
    }
  };

  const handleEditSubmit = (itemId: number) => {
    const item = currentItems.find((i) => i.id === itemId);
    if (item) {
      onUpdate(type, itemId, relevanceScore, reasoning);
      setEditingId(null);
    }
  };

  const startEdit = (item: MetadataItem) => {
    setEditingId(item.id);
    setRelevanceScore(item.relevance_score);
    setReasoning(item.reasoning || '');
  };

  return (
    <div className="border border-gray-300 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-black">{title}</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          disabled={availableToAdd.length === 0}
        >
          {showAdd ? 'Cancel' : `Add ${title}`}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 border border-gray-300 bg-gray-100 p-3">
          <select
            value={selectedId || ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="mb-2 w-full border border-gray-300 p-2"
          >
            <option value="">Select {title}...</option>
            {availableToAdd.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.category && ` (${item.category})`}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={relevanceScore}
            onChange={(e) => setRelevanceScore(Number(e.target.value))}
            className="mb-2 w-full border border-gray-300 p-2"
            placeholder="Relevance Score (0-1)"
          />

          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="mb-2 w-full border border-gray-300 p-2"
            rows={3}
            placeholder="Reasoning..."
          />

          <button
            onClick={handleAddSubmit}
            disabled={!selectedId}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            Add
          </button>
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 text-left text-black">
              Name
            </th>
            <th className="w-24 border border-gray-300 p-2 text-left text-black">
              Score
            </th>
            <th className="border border-gray-300 p-2 text-left text-black">
              Reasoning
            </th>
            <th className="w-32 border border-gray-300 p-2 text-left text-black">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="border border-gray-300 p-2 text-center text-gray-500"
              >
                No {title.toLowerCase()} assigned
              </td>
            </tr>
          ) : (
            currentItems.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 p-2 text-black">
                  {item.name}
                  {'category' in item && item.category && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({item.category})
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 p-2 text-black">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={relevanceScore}
                      onChange={(e) =>
                        setRelevanceScore(Number(e.target.value))
                      }
                      className="w-full border border-gray-300 p-1 text-black"
                    />
                  ) : (
                    item.relevance_score
                  )}
                </td>
                <td className="border border-gray-300 p-2 text-black">
                  {editingId === item.id ? (
                    <textarea
                      value={reasoning}
                      onChange={(e) => setReasoning(e.target.value)}
                      className="w-full border border-gray-300 p-1 text-black"
                      rows={2}
                    />
                  ) : (
                    <span className="text-sm text-black">{item.reasoning}</span>
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editingId === item.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditSubmit(item.id)}
                        className="rounded bg-green-600 px-2 py-1 text-sm text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded bg-gray-400 px-2 py-1 text-sm text-white hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onRemove(type, item.id)}
                        className="rounded bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
