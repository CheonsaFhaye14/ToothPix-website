import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [report, setReport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('jwt_token');

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch pending payments
      const paymentRes = await axios.get(`${BASE_URL}/api/website/payment`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filteredPayments = (paymentRes.data.payments || []).filter(
        (p) => p.paymentstatus.toLowerCase() !== 'paid'
      );
      setPayments(filteredPayments);

      // Fetch full payment report
      const reportRes = await axios.get(`${BASE_URL}/api/reports/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(reportRes.data.payments || []);
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleMarkAsPaid = async (payment) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/website/payment/${payment.idappointment}`,
        {
          total_paid: payment.total_price,
          total_price: payment.total_price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = response.data.updatedRecord;

      setPayments((prev) =>
        prev.map((p) =>
          p.idappointment === payment.idappointment
            ? { ...p, ...updated, still_owe: 0 }
            : p
        )
      );

      // Refresh the report and payments
      fetchPayments();
    } catch (err) {
      console.error('Error marking payment as paid:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, report, isLoading, error, fetchPayments, handleMarkAsPaid };
}
