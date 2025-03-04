import React from 'react';
import { useState, useEffect } from "react";
import {
  IconButton,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  TableHead,
  TableRow,
  Tooltip,
  Container,
  Box,
  Typography,
  DialogContentText,
  TextField
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateSubdivisionDialog from '../Popup/CreateSubdivision';
import EditSubdivisionDialog from '../Popup/EditSubdivision';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
export default function SubdivisionTable() {
  const makeStyle = (status) => {
    if (status === 'ACTIVE') {
      return {
        background: 'rgb(145 254 159 / 47%)',
        color: 'green',
      }
    }
    else if (status === 'INACTIVE') {
      return {
        background: '#ffadad8f',
        color: 'red',
      }
    }
  }
  const [subdivisions, setSubdivisions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSubdivision, setNewSubdivision] = useState({
    name: '',
    location: '',
    insertDate: '',
    updateDate: '',
    quantityVilla: '',
    status: '',
    url_image: [],
  });
  const [editSubdivision, setEditSubdivision] = useState(null); // State cho dự án đang chỉnh sửa
  const [openEditDialog, setOpenEditDialog] = useState(false); // State để mở và đóng dialog chỉnh sửa
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [accountIdToDelete, setAccountIdToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [role, setRole] = useState("");
  const userId = localStorage.getItem("user_id");
  const accessToken = localStorage.getItem("token");
  console.log('role', role);


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
    fetchSubdivisions();
  }, []);

  const fetchSubdivisions = async () => {
    try {

      const token = localStorage.getItem('token'); // Lấy token từ localStorage


      const response = await fetch("http://localhost:5000/api/v1/subdivisions/", {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm token vào header
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('data', data);
        setSubdivisions(Array.isArray(data.result) ? data.result : []);
      } else {
        console.error("Failed to fetch subdivisions" + response.status);
      }
    } catch (error) {
      console.error("Error fetching subdivisions:", error);
    }
  };


  const handleDelete = async (subdivisionId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error("Token is missing. Unable to delete subdivision.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/v1/subdivisions/${subdivisionId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchSubdivisions();
        console.log("Subdivision deleted successfully");
        toast.success("Subdivision deleted successfully");
      } else {

        if (response.status === 401 || response.status === 403) {
          console.error("Unauthorized: Check if the provided token is valid.");
        } else {

          const errorMessage = await response.text();
          console.error(`Failed to delete subdivision. Server response: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error("Error deleting subdivision:", error.message);
      toast.error("Error deleting subdivision");
    }
  };



  const handleOpenEditDialog = (subdivion) => {
    setEditSubdivision(subdivion);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditSubdivision(null);
  };


  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };
  const handleChange = (prop) => (event) => {
    setNewSubdivision({ ...newSubdivision, [prop]: event.target.value });
  };
  const handleUpdate = async () => {
    console.log('editSubdivision', editSubdivision);
    try {
      const token = localStorage.getItem('token');

      const subdivisionData = { ...editSubdivision };
      delete subdivisionData._id;

      const response = await fetch(`http://localhost:5000/api/v1/subdivisions/${editSubdivision._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subdivisionData),
      });
      if (response.ok) {

        fetchSubdivisions();
        console.log("Subdivision update successfully");
        toast.success("Subdivision update successfully");
      } else {
        console.error("Failed to update Subdivision");
        toast.error("Failed to update Subdivision");
      }
    } catch (error) {
      console.error("Error updating Subdivision:", error);
      toast.error("Error updating Subdivision:");
    }
    handleCloseEditDialog();
  };
  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/subdivisions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSubdivision),
      });

      if (response.ok) {
        const addedSubdivision = await response.json();
        setSubdivisions([...subdivisions, addedSubdivision]);
        addedSubdivision.url_image = newSubdivision.url_image;
        setSubdivisions([...subdivisions, addedSubdivision]);
        console.log("Subdivision added successfully");
        toast.success("Subdivision added successfully");
      } else {
        console.error("Failed to add Subdivision");
        toast.success("Failed to add Subdivision");
      }
    } catch (error) {
      console.error("Error adding subdivision:", error);
      toast.error("Error adding subdivision")
    }
    handleClose();
  };

  const [projects, setProjects] = useState([]);


  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/v1/projects/", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data.result) ? data.result : []);
        console.log('projects', projects);
      } else {
        console.error("Failed to fetch projects: " + response.status);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSubdivisions = subdivisions.filter(subdivision =>
    subdivision.subdivision_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleOpenConfirmDelete = (accountId) => {
    setAccountIdToDelete(accountId);
    setConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDelete(false);
  };

  const handleDeleteClick = (accountId) => {
    handleOpenConfirmDelete(accountId);
  };
  const totalPages = Math.ceil(filteredSubdivisions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubdivisions.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };



  const startNumber = (currentPage - 1) * itemsPerPage + 1;
  return (

    <Container maxWidth="md" sx={{}}>
      <Typography variant="h6">Subdivision List</Typography>
      <Box display="flex" justifyContent="flex-start" mb={2} >
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: '#707070' }} />
              </InputAdornment>
            ),
            style: {
              backgroundColor: 'white',
              borderRadius: '4px',
            },
          }}
          sx={{ width: '100%' }}
        />
        <Tooltip title="Add New Subdivision">
          <IconButton color="primary" onClick={handleClickOpen}>
            <AddCircleOutlineIcon />
          </IconButton>
        </Tooltip>

      </Box>
      {role === 'ADMIN' && (
      <CreateSubdivisionDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        handleSubdivisionAdd={handleAdd}
      />
        )}
      <EditSubdivisionDialog
        editSubdivision={editSubdivision}
        setEditSubdivision={setEditSubdivision}
        openEditDialog={openEditDialog}
        handleCloseEditDialog={handleCloseEditDialog}
        handleUpdate={handleUpdate}
      />
      <Dialog
        open={confirmDelete}
        onClose={handleCloseConfirmDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc muốn xóa không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={() => {
            handleDelete(accountIdToDelete);
            handleCloseConfirmDelete();
          }} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ padding: '16px', width: '100%' }}>
        <Paper sx={{ width: '130%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell align="left">Name</TableCell>
                  <TableCell align="center">Image</TableCell>
                  <TableCell align="left">Location</TableCell>
                  <TableCell align="left">Insert Date</TableCell>
                  <TableCell align="left">Update Date</TableCell>
                  <TableCell align="left">Quantity</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Project Name</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {currentItems.map((subdivision, index) => {
                  const project = projects.find(p => p._id === subdivision.project_id);
                  return (
                    <TableRow key={subdivision._id}>
                      <TableCell>{startNumber + index}</TableCell>
                      <TableCell align="left" style={{ whiteSpace: 'nowrap' }} >{subdivision.subdivision_name || 'N/A'}</TableCell>
                      <TableCell align="left"><img src={subdivision.url_image} /></TableCell>
                      <TableCell align="left" style={{ whiteSpace: 'nowrap' }} >{subdivision.location || 'N/A'}</TableCell>
                      <TableCell align="left" >
                        {subdivision.insert_date
                          ? new Date(subdivision.insert_date).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="left">
                        {subdivision.update_date
                          ? new Date(subdivision.update_date).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          : 'N/A'}
                      </TableCell>

                      <TableCell align="left">{subdivision.quantityVilla || '0'}</TableCell>
                      <TableCell align="center">
                        <span className="status" style={makeStyle(subdivision.status || 'INACTIVE')}>{subdivision.status || 'INACTIVE'}</span>
                      </TableCell>
                      <TableCell key={project?._id} value={project?._id} align="left">{project?.project_name}</TableCell>
                      <TableCell align="center">
                        <div className="flex">
                          <IconButton onClick={() => handleOpenEditDialog(subdivision)}><EditIcon /></IconButton>
                          {role === 'ADMIN' && (
                            <IconButton onClick={() => handleDeleteClick(subdivision._id)}><DeleteIcon /></IconButton>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
        {Array.from({ length: totalPages }).map((_, index) => (
          <Button key={index} onClick={() => goToPage(index + 1)}>{index + 1}</Button>
        ))}
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
      </div>
      <ToastContainer />
    </Container>
  );
}