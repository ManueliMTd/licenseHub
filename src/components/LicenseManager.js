import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Modal,
  TextField,
} from "@mui/material";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import { differenceInDays, parseISO } from "date-fns";

const LicenseManager = () => {
  const [licenses, setLicenses] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'create' or 'edit'
  const [newLicense, setNewLicense] = useState({
    license_key: "",
    expiration_date: "",
  });
  const [, setEditingLicense] = useState(null);

  // Fetch licenses from the backend and transform the object into an array
  const fetchLicenses = async () => {
    try {
      const response = await axios.get(
        "https://storingfunctions.azurewebsites.net/api/licenses"
      );

      // Convert object to array
      const licensesArray = Object.entries(response.data).map(
        ([key, value]) => ({
          license_key: key,
          expiration_date: value.expiration_date,
        })
      );

      setLicenses(licensesArray);
    } catch (error) {
      console.error("Error fetching licenses:", error);
    }
  };

  // Handle opening the modal
  const handleOpenModal = (type, license = null) => {
    setModalType(type);
    if (type === "edit" && license) {
      setNewLicense(license);
      setEditingLicense(license);
    } else {
      setNewLicense({ license_key: "", expiration_date: "" });
      setEditingLicense(null);
    }
    setOpenModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewLicense({ license_key: "", expiration_date: "" });
    setEditingLicense(null);
  };

  // Handle create or update
  const handleSave = async () => {
    try {
      if (modalType === "edit") {
        // Update license
        await axios.put(
          "https://storingfunctions.azurewebsites.net/api/licenses",
          newLicense
        );
      } else {
        // Create new license
        await axios.post(
          "https://storingfunctions.azurewebsites.net/api/licenses",
          newLicense
        );
      }
      fetchLicenses();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving license:", error);
    }
  };

  // Delete a license
  const handleDelete = async (license_key) => {
    try {
      await axios.delete(
        "https://storingfunctions.azurewebsites.net/api/licenses",
        {
          data: { license_key },
        }
      );
      fetchLicenses();
    } catch (error) {
      console.error("Error deleting license:", error);
    }
  };

  // Get status message and color
  const getLicenseStatus = (expirationDate) => {
    const today = new Date();
    const expiration = parseISO(expirationDate);
    const daysRemaining = differenceInDays(expiration, today);

    if (daysRemaining > 30) {
      return { message: `${daysRemaining} days remaining`, color: "green" };
    } else if (daysRemaining > 0) {
      return { message: `${daysRemaining} days remaining`, color: "orange" };
    } else {
      return {
        message: `Expired ${Math.abs(daysRemaining)} days ago`,
        color: "red",
      };
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        License Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<FaPlus />}
        onClick={() => handleOpenModal("create")}
        style={{ marginBottom: "20px" }}
      >
        Generate New License
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Expiration Date</TableCell>
            <TableCell>Last Checked</TableCell>
            <TableCell>Actions</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {licenses.map((license) => {
            const { message, color } = getLicenseStatus(
              license.expiration_date
            );

            console.log(
              license,
              license.last_checked_date,
              "eeeeeeeeeeeeeeeeeeeeeeeeeeeee"
            );

            return (
              <TableRow key={license.license_key}>
                <TableCell>{license.license_key}</TableCell>
                <TableCell>{license.expiration_date}</TableCell>
                <TableCell>
                  {license.last_checked_date || "Not yet checked"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => handleOpenModal("edit", license)}
                    startIcon={<FaEdit />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="text"
                    color="secondary"
                    onClick={() => handleDelete(license.license_key)}
                    startIcon={<FaTrash />}
                  >
                    Delete
                  </Button>
                </TableCell>
                <TableCell style={{ color }}>{message}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Modal for creating or editing a license */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {modalType === "edit" ? "Edit License" : "Generate New License"}
          </Typography>
          <TextField
            label="License Key"
            value={newLicense.license_key}
            onChange={(e) =>
              setNewLicense({ ...newLicense, license_key: e.target.value })
            }
            margin="normal"
            fullWidth
            disabled={modalType === "edit"} // Key is not editable in edit mode
          />
          <TextField
            label="Expiration Date"
            type="date"
            value={newLicense.expiration_date}
            onChange={(e) =>
              setNewLicense({ ...newLicense, expiration_date: e.target.value })
            }
            margin="normal"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleCloseModal} style={{ marginRight: "10px" }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default LicenseManager;
