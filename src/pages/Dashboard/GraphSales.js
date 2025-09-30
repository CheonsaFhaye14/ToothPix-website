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
  const hasData = Array.isArray(monthlySales) && monthlySales.length > 0;
  const sortedData = hasData
    ? [...monthlySales].sort((a, b) => a.month.localeCompare(b.month))
    : [];

  return (
    <div className="col-md-6">
      <div
        className="dashboard-card d-flex flex-column justify-content-between"
        style={{ height: '100%' }}
      >
        <div>
          <h4 className="dashboard-label mb-2 mt-1">Monthly Sales</h4>
          <div style={{ position: "relative", height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
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

            {!hasData && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  color: "#6c757d",
                  backgroundColor: "rgba(255,255,255,0.7)",
                }}
              >
                No sales data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
