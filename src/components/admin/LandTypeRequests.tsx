import React from "react";

interface LandTypeRequest {
  id: number;
  user: string;
  type: "Agriculture" | "Plot" | "Structure";
  subType: string;
  status: string;
  date: string;
}

interface LandTypeRequestsProps {
  requests: LandTypeRequest[];
}

const LandTypeRequests: React.FC<LandTypeRequestsProps> = ({ requests }) => {
  const grouped = requests.reduce<{ [key: string]: LandTypeRequest[] }>((acc, req) => {
    if (!acc[req.type]) acc[req.type] = [];
    acc[req.type].push(req);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.keys(grouped).map((type) => (
        <div key={type}>
          <h3 className="text-lg font-semibold text-assam-blue mb-3">{type} Land Requests</h3>
          
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-assam-light-blue">
                <tr>
                  <th className="py-2 px-4 text-left">User</th>
                  <th className="py-2 px-4 text-left">Sub-type</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {grouped[type].map((req) => (
                  <tr key={req.id} className="border-t">
                    <td className="py-2 px-4">{req.user}</td>
                    <td className="py-2 px-4">{req.subType}</td>
                    <td className="py-2 px-4">{req.status}</td>
                    <td className="py-2 px-4">{req.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LandTypeRequests;
