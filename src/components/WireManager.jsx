import { useState, useEffect } from 'react';
import { databases, ID } from '../lib/appwrite';
import { Button, TextField, Select, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

export default function WireManager() {
  const [wires, setWires] = useState([]);
  const [newWire, setNewWire] = useState({
    type: '',
    gauge: '',
    color: '',
    price: 0,
    stock: 0
  });

  const wireTypes = ['THHN', 'NM-B', 'UF-B', 'AC'];
  const wireGauges = ['12/2', '14/2', '12/3', '14/3'];

  useEffect(() => {
    fetchWires();
  }, []);

  const fetchWires = async () => {
    const response = await databases.listDocuments('wire_pos', 'wires');
    setWires(response.documents);
  };

  const createWire = async () => {
    try {
      const sku = `${newWire.type}-${newWire.color}-${newWire.gauge}`.replace(/\s+/g, '-').toUpperCase();
      
      await databases.createDocument(
        'wire_pos',
        'wires',
        ID.unique(),
        {
          ...newWire,
          sku,
          status: 'active'
        }
      );
      setNewWire({ type: '', gauge: '', color: '', price: 0, stock: 0 });
      await fetchWires();
    } catch (error) {
      alert(`Error creating wire: ${error.message}`);
    }
  };

  const deleteWire = async (wireId) => {
    if (window.confirm('Are you sure you want to delete this wire?')) {
      try {
        await databases.updateDocument('wire_pos', 'wires', wireId, {
          status: 'pending_deletion'
        });
        await fetchWires();
      } catch (error) {
        alert(`Deletion failed: ${error.message}`);
      }
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5">Wire Management</Typography>
      
      <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
        <Select
          value={newWire.type}
          onChange={(e) => setNewWire({...newWire, type: e.target.value})}
          displayEmpty
        >
          <MenuItem value="">Select Type</MenuItem>
          {wireTypes.map(type => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>

        <Select
          value={newWire.gauge}
          onChange={(e) => setNewWire({...newWire, gauge: e.target.value})}
          displayEmpty
        >
          <MenuItem value="">Select Gauge</MenuItem>
          {wireGauges.map(gauge => (
            <MenuItem key={gauge} value={gauge}>{gauge}</MenuItem>
          ))}
        </Select>

        <TextField
          label="Color"
          value={newWire.color}
          onChange={(e) => setNewWire({...newWire, color: e.target.value})}
        />

        <TextField
          label="Price"
          type="number"
          value={newWire.price}
          onChange={(e) => setNewWire({...newWire, price: parseFloat(e.target.value)})}
        />

        <TextField
          label="Initial Stock"
          type="number"
          value={newWire.stock}
          onChange={(e) => setNewWire({...newWire, stock: parseInt(e.target.value)})}
        />

        <Button variant="contained" onClick={createWire}>
          Add Wire
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Gauge</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wires.map(wire => (
              <TableRow key={wire.$id}>
                <TableCell>{wire.sku}</TableCell>
                <TableCell>{wire.type}</TableCell>
                <TableCell>{wire.gauge}</TableCell>
                <TableCell>{wire.color}</TableCell>
                <TableCell>${wire.price.toFixed(2)}</TableCell>
                <TableCell>{wire.stock}</TableCell>
                <TableCell>
                  <Button 
                    color="error"
                    onClick={() => deleteWire(wire.$id)}
                    disabled={wire.stock > 0}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}