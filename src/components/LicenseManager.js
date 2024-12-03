import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const LicenseManager = () => {
  const [licenses, setLicenses] = useState([]);
  const [newLicense, setNewLicense] = useState({
    license_key: "",
    expiration_date: "",
  });
  const [editingLicense, setEditingLicense] = useState(null);

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

  // Create or update a license
  const handleCreateOrUpdate = async () => {
    try {
      if (editingLicense) {
        // Update license
        await axios.put(
          "https://storingfunctions.azurewebsites.net/api/licenses",
          newLicense
        );
        setEditingLicense(null);
      } else {
        // Create new license
        await axios.post(
          "https://storingfunctions.azurewebsites.net/api/licenses",
          newLicense
        );
      }
      setNewLicense({ license_key: "", expiration_date: "" });
      fetchLicenses();
    } catch (error) {
      console.error("Error creating/updating license:", error);
    }
  };

  // Edit a license
  const handleEdit = (license) => {
    setEditingLicense(license);
    setNewLicense(license);
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

  useEffect(() => {
    fetchLicenses();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Licencias
      </Typography>
      <Box mb={2}>
        <TextField
          label="Clave de Licencia"
          value={newLicense.license_key}
          onChange={(e) =>
            setNewLicense({ ...newLicense, license_key: e.target.value })
          }
          margin="normal"
          disabled={!!editingLicense} // Disable key field when editing
        />
        <TextField
          label="Fecha de Expiración"
          type="date"
          value={newLicense.expiration_date}
          onChange={(e) =>
            setNewLicense({ ...newLicense, expiration_date: e.target.value })
          }
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={handleCreateOrUpdate}
          style={{ marginTop: "10px" }}
        >
          {editingLicense ? "Actualizar Licencia" : "Crear Licencia"}
        </Button>
        {editingLicense && (
          <Button
            variant="outlined"
            onClick={() => {
              setEditingLicense(null);
              setNewLicense({ license_key: "", expiration_date: "" });
            }}
            style={{ marginLeft: "10px", marginTop: "10px" }}
          >
            Cancelar
          </Button>
        )}
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Clave</TableCell>
            <TableCell>Fecha de Expiración</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {licenses.map((license) => (
            <TableRow key={license.license_key}>
              <TableCell>{license.license_key}</TableCell>
              <TableCell>{license.expiration_date}</TableCell>
              <TableCell>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => handleEdit(license)}
                  startIcon={<FaEdit />}
                >
                  Editar
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => handleDelete(license.license_key)}
                  startIcon={<FaTrash />}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default LicenseManager;
