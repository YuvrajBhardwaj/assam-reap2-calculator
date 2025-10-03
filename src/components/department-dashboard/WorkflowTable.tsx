import React from "react";

interface WorkflowRow {
  id: number;
  requestor: string;
  requestDate: string;
  status: string;
  approver: string;
  approvalDate?: string;
  department: string;
  departmentAction?: string;
}

const mockData: WorkflowRow[] = [
  {
    id: 1,
    requestor: "User A",
    requestDate: "2024-05-20",
    status: "Pending Approval",
    approver: "Approver X",
    department: "Revenue Dept",
  },
  {
    id: 2,
    requestor: "User B",
    requestDate: "2024-05-18",
    status: "Approved",
    approver: "Approver Y",
    approvalDate: "2024-05-19",
    department: "Revenue Dept",
    departmentAction: "Processed"
  },
  {
    id: 3,
    requestor: "User C",
    requestDate: "2024-05-17",
    status: "Rejected",
    approver: "Approver Z",
    approvalDate: "2024-05-18",
    department: "Revenue Dept",
    departmentAction: "N/A"
  }
];

const WorkflowTable: React.FC = () => {
  return (
    <div>
      <h3>Workflow Tracking Table</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Sl. No.</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Requestor</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Request Date</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Status</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Approver</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Approval Date</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Department</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Department Action</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((row, idx) => (
            <tr key={row.id}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{idx + 1}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.requestor}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.requestDate}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.status}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.approver}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.approvalDate || "-"}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.department}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.departmentAction || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowTable;