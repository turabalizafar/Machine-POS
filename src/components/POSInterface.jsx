import { useState, useEffect } from 'react';
import { databases, ID } from '../lib/appwrite';
import { Button, TextField, Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import ReceiptGenerator from './ReceiptGenerator';

export default function POSInterface() {
  const [wires, setWires] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWires();
  }, []);

  const fetchWires = async () => {
    const response = await databases.listDocuments('wire_pos', 'wires');
    setWires(response.documents.filter(w => w.status === 'active'));
  };

  const addToCart = (wire) => {
    const existing = cart.find(item => item.sku === wire.sku);
    if (existing) {
      setCart(cart.map(item => 
        item.sku === wire.sku 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...wire, quantity: 1 }]);
    }
  };

  const processSale = async () => {
    try {
      // Create transaction
      const transaction = await databases.createDocument(
        'wire_pos',
        'transactions',
        ID.unique(),
        {
          items: cart.map(item => ({
            sku: item.sku,
            quantity: item.quantity,
            price: item.price
          })),
          total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      );

      // Update stock
      await Promise.all(cart.map(async item => {
        const currentWire = wires.find(w => w.sku === item.sku);
        await databases.updateDocument('wire_pos', 'wires', currentWire.$id, {
          stock: currentWire.stock - item.quantity
        });
      }));

      setCart([]);
      await fetchWires();
      return transaction;
    } catch (error) {
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5">POS Interface</Typography>
      
      <TextField
        fullWidth
        label="Search Wires"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ my: 2 }}
      />

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <Typography variant="h6">Available Wires</Typography>
          <List>
            {wires
              .filter(wire => 
                wire.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                wire.color.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(wire => (
                <ListItem 
                  key={wire.$id}
                  button
                  onClick={() => addToCart(wire)}
                  disabled={wire.stock === 0}
                >
                  <ListItemText
                    primary={`${wire.sku} - ${wire.color}`}
                    secondary={`$${wire.price} | Stock: ${wire.stock}`}
                  />
                </ListItem>
              ))}
          </List>
        </div>

        <div style={{ flex: 1 }}>
          <Typography variant="h6">Current Cart</Typography>
          <List>
            {cart.map(item => (
              <ListItem key={item.sku}>
                <ListItemText
                  primary={`${item.sku} x ${item.quantity}`}
                  secondary={`$${(item.price * item.quantity).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
          </Typography>
          <ReceiptGenerator processSale={processSale} />
        </div>
      </div>
    </Paper>
  );
}