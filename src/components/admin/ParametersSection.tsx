import React, { useState } from "react";

interface Parameter {
  id: string;
  label: string;
  type: "single" | "list" | "band-weight";
  values: Array<{ band?: string; weight?: number; value?: number }>;
}

const initialParams: Parameter[] = [
  {
    id: "base-value",
    label: "Base Value",
    type: "single",
    values: [{ value: 100 }],
  },
  {
    id: "conversion-factor",
    label: "Conversion Factor",
    type: "list",
    values: [
      { band: "Agriculture", weight: 1.2 },
      { band: "Residential", weight: 1.5 },
      { band: "Commercial", weight: 2.0 },
      { band: "Industrial", weight: 1.8 },
    ],
  },
  {
    id: "distance-from-road",
    label: "Distance From Road",
    type: "band-weight",
    values: [
      { band: "<100m", weight: 1.5 },
      { band: "100-200m", weight: 1.2 },
      { band: ">200m", weight: 1.0 },
    ],
  },
];

const ParametersSection: React.FC = () => {
  const [params, setParams] = useState(initialParams);

  const handleSingleChange = (id: string, newValue: number) => {
    setParams(
      params.map((p) =>
        p.id === id ? { ...p, values: [{ value: newValue }] } : p
      )
    );
  };

  const handleBandWeightChange = (
    id: string,
    index: number,
    field: "band" | "weight",
    value: string | number
  ) => {
    setParams(
      params.map((p) =>
        p.id === id
          ? {
              ...p,
              values: p.values.map((v, i) =>
                i === index ? { ...v, [field]: value } : v
              ),
            }
          : p
      )
    );
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold text-assam-blue mb-4">
        Parameters for Market Value Determination
      </h2>

      {params.map((param) => (
        <div key={param.id} className="mb-6">
          <h3 className="font-medium text-assam-blue text-base mb-2">
            {param.label}
          </h3>

          {param.type === "single" && (
            <input
              type="number"
              value={param.values[0].value}
              onChange={(e) =>
                handleSingleChange(param.id, parseFloat(e.target.value))
              }
              className="border px-3 py-2 w-full sm:w-64 rounded"
            />
          )}

          {(param.type === "list" || param.type === "band-weight") && (
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full text-sm border">
                <thead className="bg-assam-light-blue text-left">
                  <tr>
                    {param.type === "band-weight" && (
                      <th className="px-3 py-2">Band</th>
                    )}
                    <th className="px-3 py-2">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {param.values.map((val, idx) => (
                    <tr key={idx} className="border-t">
                      {param.type === "band-weight" && (
                        <td className="px-3 py-2">
                          <input
                            value={val.band}
                            disabled
                            className="border px-2 py-1 w-full rounded bg-gray-100"
                          />
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={val.weight}
                          onChange={(e) =>
                            handleBandWeightChange(
                              param.id,
                              idx,
                              "weight",
                              parseFloat(e.target.value)
                            )
                          }
                          className="border px-2 py-1 w-full rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="bg-assam-blue text-white px-4 py-2 rounded">
          Review
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Submit for Approval
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ParametersSection;
