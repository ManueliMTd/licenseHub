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
import axios from "axios";

const LicenseManager = () => {
  const [licenses, setLicenses] = useState([]);
  const [newLicense, setNewLicense] = useState({
    license_key: "",
    expiration_date: "",
  });
  const [editingLicense, setEditingLicense] = useState(null);

  const fetchLicenses = async () => {
    const response = await axios.get(
      "https://storingfunctions.azurewebsites.net/api/licenses"
    );
    setLicenses(response.data);
  };

  const handleCreateOrUpdate = async () => {
    if (editingLicense) {
      // Actualizar licencia
      await axios.put(
        "https://storingfunctions.azurewebsites.net/api/licenses",
        newLicense
      );
      setEditingLicense(null);
    } else {
      // Crear nueva licencia
      await axios.post(
        "https://storingfunctions.azurewebsites.net/api/licenses",
        newLicense
      );
    }
    setNewLicense({ license_key: "", expiration_date: "" });
    fetchLicenses();
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    setNewLicense(license);
  };

  const handleDelete = async (license_key) => {
    await axios.delete("https://storingfunctions.azurewebsites.net/api/licenses", {
      data: { license_key },
    });
    fetchLicenses();
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
          disabled={!!editingLicense} // No se puede editar la clave al actualizar
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
                >
                  Editar
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => handleDelete(license.license_key)}
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
