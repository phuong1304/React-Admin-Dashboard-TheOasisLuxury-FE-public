import React, { useState, useEffect } from 'react';

const Card = () => {
  const [payments, setPayments] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  console.log('payments',payments);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/v1/users/get/Payments", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('data', data);
        setPayments(Array.isArray(data.result) ? data.result : []);
        calculateTotalAmount(data.result);
      } else {
        console.error("Failed to fetch payments" + response.status);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const calculateTotalAmount = (payments) => {
    let total = 0;
    payments.forEach(payment => {
      if (payment.status === "PAID") { 
        total += payment.amount;
      }
    });
    
    setTotalAmount(total);
  };

 
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="container mx-auto ml-24 w-11/12 ">
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'purple', padding: '40px', borderRadius: '5px' }}>
        <h1 className="text-white font-bold mb-4 text-xl">Revenue Order Completed</h1>
        <h2 className="text-white font-bold mt-4 text-xl">Total Amount: {formatCurrency(totalAmount)}</h2>
      </div>
    </div>
  );
};

export default Card;
