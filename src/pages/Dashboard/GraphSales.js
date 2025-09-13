import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function GraphSales({ monthlySales }) {
  const sortedData = [...monthlySales].sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  return (
    <div className="col-md-6">
      <div className="dashboard-card d-flex flex-column justify-content-between" style={{ height: '100%' }}>
        <div>
          <h4 className="dashboard-label mb-2 mt-1">Monthly Sales</h4>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart
              data={sortedData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₱${value}`} />
              <Tooltip formatter={(value) => `₱${parseFloat(value).toFixed(2)}`} />
              <Line
                type="monotone"
                dataKey="total_sales"
                stroke="#098bdc"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
