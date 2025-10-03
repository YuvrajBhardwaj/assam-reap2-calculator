import React, { useState } from "react";

interface JurisdictionEntry {
  id: number;
  district: string;
  circle: string;
  village: string;
  villageId: string;
  mouza: string;
}

const initialData: JurisdictionEntry[] = [
  { id: 1, district: "Kamrup", circle: "Guwahati", village: "Bhangagarh", villageId: "V101", mouza: "Mouza A" },
  { id: 2, district: "Dibrugarh", circle: "Tingkhong", village: "Jhanji", villageId: "V102", mouza: "Mouza B" }
];

const JurisdictionSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<"nomenclature" | "mapping">("nomenclature");
  const [data, setData] = useState<JurisdictionEntry[]>(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<JurisdictionEntry>>({});

  const handleEdit = (entry: JurisdictionEntry) => {
    setEditingId(entry.id);
    setFormData(entry);
  };

  const handleSave = () => {
    if (!formData.id) return;
    setData(data.map(item => (item.id === formData.id ? formData as JurisdictionEntry : item)));
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold text-assam-blue mb-4">Jurisdiction</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setViewMode("nomenclature")}
          className={`px-4 py-2 rounded ${viewMode === "nomenclature" ? "bg-assam-blue text-white" : "bg-gray-200"}`}
        >
          Nomenclature
        </button>
        <button
          onClick={() => setViewMode("mapping")}
          className={`px-4 py-2 rounded ${viewMode === "mapping" ? "bg-assam-blue text-white" : "bg-gray-200"}`}
        >
          Mapping
        </button>
      </div>

      {viewMode === "nomenclature" && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-assam-light-blue">
              <tr>
                <th className="py-2 px-3">District</th>
                <th className="py-2 px-3">Circle</th>
                <th className="py-2 px-3">Village</th>
                <th className="py-2 px-3">Village ID</th>
                <th className="py-2 px-3">Mouza</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) =>
                editingId === row.id ? (
                  <tr key={row.id} className="border-t">
                    <td><input name="district" value={formData.district} onChange={handleChange} className="border px-2 py-1 w-full" /></td>
                    <td><input name="circle" value={formData.circle} onChange={handleChange} className="border px-2 py-1 w-full" /></td>
                    <td><input name="village" value={formData.village} onChange={handleChange} className="border px-2 py-1 w-full" /></td>
                    <td><input name="villageId" value={formData.villageId} onChange={handleChange} className="border px-2 py-1 w-full" /></td>
                    <td><input name="mouza" value={formData.mouza} onChange={handleChange} className="border px-2 py-1 w-full" /></td>
                    <td className="flex flex-col md:flex-row gap-2 py-2">
                      <button onClick={handleSave} className="bg-assam-blue text-white px-2 py-1 rounded">Save</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-300 px-2 py-1 rounded">Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2">{row.district}</td>
                    <td className="px-3 py-2">{row.circle}</td>
                    <td className="px-3 py-2">{row.village}</td>
                    <td className="px-3 py-2">{row.villageId}</td>
                    <td className="px-3 py-2">{row.mouza}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => handleEdit(row)} className="text-assam-blue hover:underline">Edit</button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "mapping" && (
        <p className="mt-4 text-gray-600 text-sm">This is the mapping view where you can assign villages/mouzas to districts or circles.</p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button className="bg-assam-blue text-white px-4 py-2 rounded">Review</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded">Submit for Approval</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </div>
  );
};

export default JurisdictionSection;
