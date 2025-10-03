import React from "react";

interface MasterDataTableProps {
  isAdmin: boolean;
  landTypes: { name: string; subTypes: number; status: string }[];
  onEdit?: (name: string) => void;
  onView?: (name: string) => void;
}

const MasterDataTable: React.FC<MasterDataTableProps> = ({ isAdmin, landTypes, onEdit, onView }) => {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-3 p-4 bg-assam-light-blue border-b">
        <button className="bg-assam-blue text-white px-4 py-2 rounded whitespace-nowrap">
          Jurisdiction
        </button>
        <button className="bg-assam-blue text-white px-4 py-2 rounded whitespace-nowrap">
          Parameters for Market Value Determination
        </button>
        <button className="bg-assam-blue text-white px-4 py-2 rounded whitespace-nowrap">
          Land Type
        </button>
        <a
          href="#"
          className="bg-white border border-assam-blue text-assam-blue px-4 py-2 rounded flex items-center hover:bg-assam-blue hover:text-white transition-colors whitespace-nowrap"
        >
          View RoR Copy
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-assam-light-blue">
            <tr>
              <th className="py-3 px-4 text-left">Land Type</th>
              <th className="py-3 px-4 text-left">Sub-types</th>
              <th className="py-3 px-4 text-left">Status</th>
              {isAdmin && <th className="py-3 px-4 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {landTypes.map((type) => (
              <tr key={type.name} className="border-t border-gray-200">
                <td className="py-3 px-4">{type.name}</td>
                <td className="py-3 px-4">{type.subTypes} sub-types</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      type.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {type.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      className="text-assam-blue hover:underline mr-3"
                      onClick={() => onView?.(type.name)}
                    >
                      View
                    </button>
                    <button
                      className="text-assam-blue hover:underline"
                      onClick={() => onEdit?.(type.name)}
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterDataTable;
