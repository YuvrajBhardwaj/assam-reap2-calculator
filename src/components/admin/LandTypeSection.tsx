import React, { useState } from "react";

interface LandType {
  id: number;
  name: string;
  category: "Agriculture" | "Residential" | "Commercial" | "Industrial";
  status: "Pending" | "Approved" | "Rejected";
}

const initialTypes: LandType[] = [
  { id: 1, name: "Rice Field", category: "Agriculture", status: "Approved" },
  { id: 2, name: "Urban Plot", category: "Residential", status: "Pending" },
];

const LandTypeSection: React.FC = () => {
  const [types, setTypes] = useState(initialTypes);
  const [newType, setNewType] = useState<Omit<LandType, "id">>({
    name: "",
    category: "Agriculture",
    status: "Pending",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<LandType | null>(null);

  const handleAdd = () => {
    if (newType.name.trim()) {
      const nextId = Math.max(...types.map(t => t.id), 0) + 1;
      setTypes([...types, { ...newType, id: nextId }]);
      setNewType({ name: "", category: "Agriculture", status: "Pending" });
    }
  };

  const handleEdit = (type: LandType) => {
    setEditingId(type.id);
    setEditingType({ ...type });
  };

  const handleUpdate = () => {
    if (editingType && editingType.name.trim()) {
      setTypes(types.map(t => t.id === editingId ? editingType : t));
      setEditingId(null);
      setEditingType(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this land type?")) {
      setTypes(types.filter(t => t.id !== id));
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold text-assam-blue mb-4">
        Land Type Management
      </h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          placeholder="Land Type Name"
          value={newType.name}
          onChange={(e) => setNewType({ ...newType, name: e.target.value })}
          className="border px-3 py-2 rounded w-full sm:w-auto flex-1"
        />
        <select
          value={newType.category}
          onChange={(e) =>
            setNewType({ ...newType, category: e.target.value as any })
          }
          className="border px-3 py-2 rounded w-full sm:w-auto"
        >
          <option value="Agriculture">Agriculture</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Industrial">Industrial</option>
        </select>
        <button
          onClick={handleAdd}
          className="bg-assam-blue text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-assam-light-blue">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">
                  {editingId === t.id ? (
                    <input
                      value={editingType?.name || ""}
                      onChange={(e) => setEditingType(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    t.name
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === t.id ? (
                    <select
                      value={editingType?.category || "Agriculture"}
                      onChange={(e) => setEditingType(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="Agriculture">Agriculture</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  ) : (
                    t.category
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === t.id ? (
                    <select
                      value={editingType?.status || "Pending"}
                      onChange={(e) => setEditingType(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        t.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : t.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {t.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {editingId === t.id ? (
                    <>
                      <button 
                        onClick={handleUpdate}
                        className="text-green-600 hover:underline mr-3"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEdit(t)}
                        className="text-assam-blue hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <button className="bg-assam-blue text-white px-4 py-2 rounded w-full sm:w-auto">
          Review
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto">
          Submit for Approval
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LandTypeSection;
