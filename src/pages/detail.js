import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Dialog,
  TextField,
  DialogActions
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';

const DetailsPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();

  const [contractDetails, setContractDetails] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [role, setRole] = useState("");
  const userId = localStorage.getItem("user_id");
  const accessToken = localStorage.getItem("token");
  console.log('role', role);

  // Add new states
  const [openModal, setOpenModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');


  useEffect(() => {
    if (userId && accessToken) {
      axios.get(`http://localhost:5000/api/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }).then((res) => {
        console.log("role", role);
        const userRole = res.data.user.role_name;
        setRole(userRole);
      }).catch((err) => {
        console.error(err);
      });
    }
  }, [userId, accessToken]);

  useEffect(() => {
    console.log('Contract ID:', contractId);
    const fetchContractDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/v1/users/contracts/${contractId}`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Thêm token vào header
          },
        });
        if (response.ok) {
          const data = await response.json();
          setContractDetails(data);
        } else {
          console.error('Failed to fetch contract details:', response.status);
        }
      } catch (error) {
        console.error('Error fetching contract details:', error);
      }
    };

    fetchContractDetails();
  }, [contractId]);

  useEffect(() => {
    if (contractDetails) {
      const insertDate = new Date(contractDetails.insert_date);
      const expiryDate = new Date(insertDate.getTime() + 24 * 60 * 60 * 1000);
      const updateCountdown = () => {
        const now = new Date();
        const timeLeft = expiryDate - now;

        if (timeLeft <= 0) {
          // Khi thời gian đếm ngược kết thúc
          setCountdown('Expired');
          if (!contractDetails.sign_contract) {
            handleAutoReject();
          }
        } else {
          // Cập nhật đồng hồ đếm ngược
          setCountdown(new Date(timeLeft).toISOString().substr(11, 8));
        }
      };

      updateCountdown();
      const intervalId = setInterval(updateCountdown, 1000);

      return () => clearInterval(intervalId);
    }
  }, [contractDetails]);

  const handleConfirm = async () => {
    setOpenModal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/users/confirm-contract/${contractId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      if (response.ok) {
        console.log('Contract confirmed successfully.');
        navigate('/contracts');
        toast.success('Contract confirmed successfully');

      } else {
        console.error('Failed to confirm contract:', response.status);
        toast.error('Failed to confirm contract:');
      }
    } catch (error) {
      console.error('Error confirming contract:', error);
      toast.error('Error confirming contract');
    }
  };

  const handleSendAndApprove = async () => {
    // Close modal first
    setOpenModal(false);

    // Send Email Notification
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/v1/users/contract/send-email/${contractId}`, { text: notificationMessage }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // If email sent successfully, then approve the contract
      const response = await axios.patch(`http://localhost:5000/api/v1/users/confirm-contract/${contractId}`, { status: 'APPROVED' }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        toast.success('Contract approved and notification sent successfully.');
        navigate('/contracts');
      }
    } catch (error) {
      console.error('Error sending notification or approving contract:', error);
      toast.error('Error sending notification or approving contract');
    }
  };

  const handleSendAndApproveStaff = async () => {
    // Close modal first
    setOpenModal(false);

    // Send Email Notification
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/v1/users/contract/send-email/${contractId}`, { text: notificationMessage }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200) {
        toast.success('Sent Mail successfully.');
        navigate('/contracts');
      }
    } catch (error) {
      console.error('Error sending notification contract:', error);
      toast.error('Error sending notification contract');
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAutoReject = async () => {
    try {
      const token = localStorage.getItem('token');
      // Cập nhật trạng thái của hợp đồng thành 'REJECTED'
      const contractResponse = await fetch(`http://localhost:5000/api/v1/users/confirm-contract/${contractId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'REJECTED' })
      });

      if (contractResponse.ok) {
        console.log('Contract auto-rejected successfully.');

        // Cập nhật trạng thái của đơn hàng liên quan thành 'CANCELLED'
        if (contractDetails.order_id) {
          const orderResponse = await fetch(`http://localhost:5000/api/v1/orders/${contractDetails.order_id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'CANCELLED' })
          });

          if (orderResponse.ok) {
            console.log('Order status updated to CANCELLED.');
          } else {
            console.error('Failed to update order status:', orderResponse.status);
          }
        }
      } else {
        console.error('Failed to auto-reject contract:', contractResponse.status);
      }
    } catch (error) {
      console.error('Error during auto-reject process:', error);
    }
  };


  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/users/confirm-contract/${contractId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (response.ok) {
        console.log('Contract rejected successfully.');
        navigate('/contracts');
        toast.success('Contract rejected successfully.');
      } else {
        console.error('Failed to reject contract:', response.status);
        toast.error('Failed to reject contract:')
      }
    } catch (error) {
      console.error('Error rejecting contract:', error);
      toast.error('Failed to reject contract:')
    }
  };

  const handleBackClick = () => {
    navigate(`/contracts`);
  };

  return (
    <div className='mt-36 overflow-y-auto	'>
      <div className='flex justify-between'>
        <h2 className="text-xl font-bold ml-48 mb-10">THÔNG TIN CHI TIẾT HỢP ĐỒNG</h2>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-0 px-4 rounded float-right mr-10 h-10"
          onClick={handleBackClick}
        >
          Back
        </button>
      </div>

      <Box className=' ml-40'>
        {contractDetails ? (
          <Paper elevation={3} style={{ padding: '8px' }}>
            <Typography variant="h5" gutterBottom>
              MÃ HỢP ĐỒNG:  {contractDetails._id}
            </Typography>
            <div> Thời hạn ký hợp đồng này sau:  {countdown && <p>Time left: {countdown}</p>}</div>
            <div>
              <Typography variant="h6" gutterBottom>
                Contract Name: {contractDetails.contract_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Insert Date: {new Date(contractDetails.insert_date).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Sign Contract: {contractDetails.sign_contract ? 'Đã Ký' : 'Chưa Ký'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Update Date: {new Date(contractDetails.update_date).toLocaleString()}
              </Typography>
              <img src={contractDetails.url_image} />
              {role === 'ADMIN' && (
                <Box mt={8}>
                  <Grid container spacing={8}>
                    <Grid item>
                      <Button variant="contained" color="primary" onClick={handleConfirm}>APPROVED</Button>
                      <Dialog open={openModal} onClose={handleCloseModal}>
                        <DialogTitle>Send Notification</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            Please enter the notification message you want to send to the user.
                          </DialogContentText>
                          <TextField
                            autoFocus
                            margin="dense"
                            id="message"
                            label="Notification Message"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={notificationMessage}
                            onChange={(e) => setNotificationMessage(e.target.value)}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleCloseModal}>Cancel</Button>
                          <Button onClick={handleSendAndApprove}>Send and Approve Contract</Button>
                        </DialogActions>
                      </Dialog>
                    </Grid>
                    <Grid item>
                      <Button variant="contained" color="secondary" onClick={handleReject}>REJECTED</Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
              {role === 'STAFF' && (
                <Box mt={8}>
                  <Grid container spacing={8}>
                    <Grid item>
                      <Button variant="contained" color="primary" onClick={handleConfirm}>SEND MAIL CONFIRM FOR USER</Button>
                      <Dialog open={openModal} onClose={handleCloseModal}>
                        <DialogTitle>Send Notification Confirm for User</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            Please enter the notification message you want to send to the user.
                          </DialogContentText>
                          <TextField
                            autoFocus
                            margin="dense"
                            id="message"
                            label="Notification Message"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={notificationMessage}
                            onChange={(e) => setNotificationMessage(e.target.value)}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleCloseModal}>Cancel</Button>
                          <Button onClick={handleSendAndApproveStaff}>Send Mail Confirm</Button>
                        </DialogActions>
                      </Dialog>
                    </Grid>
                    <Grid item>
                      <Button variant="contained" color="secondary" onClick={handleReject}>REJECTED</Button>
                    </Grid>
                  </Grid>
                </Box>
              )}

            </div>
          </Paper>
        ) : (
          <p>Loading...</p>
        )}
      </Box>
    </div>
  );
};

export default DetailsPage;
