import React from 'react';
import { useActivityLogs } from '../../Hooks/ActivityLogs';
import CommonTable from '../../Components/Table/Table';

function ActivityLog() {
  const { logs, isLoading, error, handleDelete, handleUndo } = useActivityLogs();

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'table_name', label: 'Table' },
    { key: 'description', label: 'Description' },
    {
      key: 'created_at',
      label: 'Created At',
      render: (value) => {
        const d = new Date(value);
        // Format as MM/DD/YYYY and show time on the next line
        const dateStr = d.toLocaleDateString('en-PH', {
          timeZone: 'Asia/Manila',
        });
        const timeStr = d.toLocaleTimeString('en-PH', {
          timeZone: 'Asia/Manila',
        });
        return (
          <div>
            {dateStr}
            <br />
            <small className="text-muted">{timeStr}</small>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container py-4">
      <h1>Activity Log</h1>
      <div className="alert alert-info">
        Logs are automatically deleted after 30 days. Actions that have already been undone or deleted cannot be undone.
      </div>

      {isLoading && <div className="text-center">Loading activity logs...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!isLoading && !error && (
        <CommonTable
          columns={columns}
          data={logs}
          onDelete={handleDelete}
          onUndo={(id) => {
            const log = logs.find((l) => l.id === id);
            if (log && log.action !== 'UNDO' && !log.is_undone) {
              handleUndo(id);
            }
          }}
          emptyMessage="No activity logs found."
        />
      )}
    </div>
  );
}

export default ActivityLog;
