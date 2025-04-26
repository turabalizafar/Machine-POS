import { useState } from 'react';
import { databases, storage, ID } from '../lib/appwrite';
import QRCode from 'qrcode.react';
import pdfMake from 'pdfmake/build/pdfmake';
import { Button, Typography, Box } from '@mui/material';

export default function ReceiptGenerator({ processSale }) {
  const [receiptData, setReceiptData] = useState(null);

  const generateReceipt = async () => {
    const transaction = await processSale();
    if (!transaction) return;

    // Generate PDF
    const docDefinition = {
      content: [
        { text: 'Transaction Receipt', style: 'header' },
        `Transaction ID: ${transaction.$id}`,
        `Date: ${new Date(transaction.$createdAt).toLocaleString()}`,
        { qr: transaction.$id, fit: 150 },
        {
          table: {
            body: [
              ['SKU', 'Quantity', 'Price'],
              ...transaction.items.map(item => [
                item.sku,
                item.quantity,
                `$${item.price.toFixed(2)}`
              ])
            ]
          }
        },
        { text: `Total: $${transaction.total.toFixed(2)}`, style: 'total' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        total: { fontSize: 14, bold: true, margin: [0, 10, 0, 0] }
      }
    };

    const pdf = pdfMake.createPdf(docDefinition);
    pdf.getBuffer(async (buffer) => {
      const file = new File([buffer], `receipt_${transaction.$id}.pdf`, {
        type: 'application/pdf'
      });

      // Store PDF
      const receiptFile = await storage.createFile(
        'receipts',
        ID.unique(),
        file
      );

      // Update transaction with PDF reference
      await databases.updateDocument(
        'wire_pos',
        'transactions',
        transaction.$id,
        { pdf_ref: receiptFile.$id }
      );

      setReceiptData(transaction);
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button 
        variant="contained" 
        color="success" 
        onClick={generateReceipt}
        disabled={!processSale}
      >
        Complete Sale
      </Button>

      {receiptData && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Transaction Complete!</Typography>
          <QRCode value={receiptData.$id} />
          <Typography variant="body2">
            Scan QR to verify transaction
          </Typography>
        </Box>
      )}
    </Box>
  );
}