import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Button,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";

const CreateVillaDialog = ({ open, handleClose, setVillas, villas }) => {
    const [newVilla, setNewVilla] = useState({
        villa_name: '',
        address: '',
        area: '',
        status: '',
        fluctuates_price: 0,
        stiff_price: 0,
        subdivision_name: '',
        start_date: '',
        end_date: '',
        url_image: [''], 
    });


    const handleChange = (prop) => (event) => {
        setNewVilla({ ...newVilla, [prop]: event.target.value });
    };
    const [subdivisions, setSubdivisions] = useState([]);
    const handleAdd = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/v1/villas/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newVilla),
            });

            if (response.ok) {
                const addedVilla = await response.json();
               
                addedVilla.url_image = newVilla.url_image;
                setVillas([...villas, addedVilla]);
                const villaId = addedVilla._id;
                const subdivisionId = newVilla.subdivision_id;
                
                // Gọi API để cập nhật subdivision
                await updateSubdivision(subdivisionId, villaId, token);
                console.log("Villa added successfully");
                toast.success("Villa added successfully")
            } else {
                console.error("Failed to add Villa");
                toast.error("Failed to add Villa")
            }
        } catch (error) {
            console.error("Error adding villa:", error);
            toast.success("Villa added successfully")
        }
        handleClose();
    };

    const updateSubdivision = async (subdivisionId, villaId, token) => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/subdivisions/${subdivisionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ $push: { villas: villaId } }), // Thêm villaId vào mảng villas
            });
    
            if (response.ok) {
                console.log("Subdivision updated successfully");
            } else {
                console.error("Failed to update subdivision");
            }
        } catch (error) {
            console.error("Error updating subdivision:", error);
        }
    };

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

    const handleImageUrlChange = (index) => (event) => {
        const newUrls = [...newVilla.url_image];
        newUrls[index] = event.target.value;
        setNewVilla({ ...newVilla, url_image: newUrls });
    };

    const handleAddImageUrl = () => {
        setNewVilla({ ...newVilla, url_image: [...newVilla.url_image, ''] });
    };

    const handleRemoveImageUrl = (index) => {
        const newUrls = [...newVilla.url_image];
        newUrls.splice(index, 1);
        setNewVilla({ ...newVilla, url_image: newUrls });
    };

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Add New Villa</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="villa_name"
                    label="Villa Name"
                    type="text"
                    fullWidth
                    value={newVilla.villa_name}
                    onChange={handleChange('villa_name')}
                />

                <TextField
                    margin="dense"
                    id="start_date"
                    label="StartDate"
                    type="date"
                    fullWidth
                    value={newVilla.start_date}
                    onChange={handleChange('start_date')}
                />
                <TextField
                    margin="dense"
                    id="end_date"
                    label="EndDate"
                    type="date"
                    fullWidth
                    value={newVilla.end_date}
                    onChange={handleChange('end_date')}
                />
                <TextField
                    margin="dense"
                    id="address"
                    label="address"
                    type="text"
                    fullWidth
                    value={newVilla.address}
                    onChange={handleChange('address')}
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel id="subdivision-label">Subdivision Name</InputLabel>
                    <Select
                        labelId="subdivision-label"
                        id="subdivision_id"
                        value={newVilla.subdivision_id}
                        onChange={handleChange('subdivision_id')}
                        label="Subdivision"
                    >
                        {Array.isArray(subdivisions) && subdivisions.map((subdivision, index) => (
                            <MenuItem key={subdivision?._id} value={subdivision?._id}>
                                {subdivision?.subdivision_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    margin="dense"
                    id="area"
                    label="area"
                    type="text"
                    fullWidth
                    value={newVilla.area}
                    onChange={handleChange('area')}
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={newVilla.status}
                        onChange={handleChange('status')}
                        label="Status"
                    >
                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                        <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="dense"
                    id="fluctuates_price"
                    label="Fluctuates Price"
                    type="number"
                    fullWidth
                    value={newVilla.fluctuates_price}
                    onChange={handleChange('fluctuates_price')}
                />
                <TextField
                    margin="dense"
                    id="stiff_price"
                    label="Stiff Price"
                    type="number"
                    fullWidth
                    value={newVilla.stiff_price}
                    onChange={handleChange('stiff_price')}
                />
                {newVilla.url_image.map((url, index) => (
                    <div key={index}>
                        <TextField
                            margin="dense"
                            label={`Image URL ${index + 1}`}
                            type="text"
                            fullWidth
                            value={url}
                            onChange={handleImageUrlChange(index)}
                        />
                        <Button onClick={() => handleRemoveImageUrl(index)}>Remove</Button>
                    </div>
                ))}
                <Button onClick={handleAddImageUrl}>Add Image URL</Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleAdd} color="primary">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateVillaDialog;
