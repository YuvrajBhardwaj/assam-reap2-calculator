import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserLogItem {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details?: string;
}

export const UserHistoryLog = () => {
  const [userLogs, setUserLogs] = useState<UserLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const fetchUserLogs = async () => {
      setLoading(true);
      // In a real application, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      setUserLogs([
        { id: '1', action: 'User Created', user: 'admin_user', role: 'admin', timestamp: '2023-10-26 10:00:00', details: 'New user John Doe created' },
        { id: '2', action: 'Role Changed', user: 'department_user', role: 'department', timestamp: '2023-10-26 10:30:00', details: 'User Jane Smith role changed to department' },
        { id: '3', action: 'User Deleted', user: 'admin_user', role: 'admin', timestamp: '2023-10-26 11:00:00', details: 'User Bob removed' },
      ]);
      setLoading(false);
    };

    fetchUserLogs();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User History Log</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading user history...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.role}</Badge>
                    </TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))}
                {!userLogs.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                      No user history logs to display.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};