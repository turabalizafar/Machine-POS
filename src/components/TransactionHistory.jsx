import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Client, Databases } from "appwrite";
import { QRCodeSVG } from "qrcode.react";
import "../App.css";

// Initialize Appwrite
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6795f2860034f57c40c2");

const databases1 = new Databases(client);

function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
  
    useEffect(() => {
      fetchTransactions();
    }, []);
  
    const fetchTransactions = async () => {
      try {
        const response = await appwrite.database.listDocuments("transactions");
        setTransactions(response.documents);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
  
    const deleteTransaction = async (transactionId) => {
      try {
        await appwrite.database.deleteDocument("transactions", transactionId);
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    };
  
    const viewTransactionDetails = (transaction) => {
      setSelectedTransaction(transaction);
    };
  
    return (
      <div className="transactions">
        <h2>Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.$id}>
                <td>{transaction.invoiceNo}</td>
                <td>{new Date(transaction.timestamp).toLocaleDateString()}</td>
                <td>{transaction.total}</td>
                <td>{transaction.paymentMethod}</td>
                <td>
                  <button onClick={() => viewTransactionDetails(transaction)}>
                    View Details
                  </button>
                  <button onClick={() => deleteTransaction(transaction.$id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {selectedTransaction && (
          <div className="transaction-details">
            <h3>Transaction Details</h3>
            <button
              className="close-btn"
              onClick={() => setSelectedTransaction(null)}
            >
              ×
            </button>
            <div>
              <p>
                <strong>Invoice #:</strong> {selectedTransaction.invoiceNo}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedTransaction.timestamp).toLocaleString()}
              </p>
              <p>
                <strong>Payment Method:</strong>{" "}
                {selectedTransaction.paymentMethod}
              </p>
              <p>
                <strong>Total Amount:</strong> {selectedTransaction.total}
              </p>
              {selectedTransaction.discount && (
                <p>
                  <strong>Discount:</strong> {selectedTransaction.discount}%
                </p>
              )}
  
              <h4>Items</h4>
              <table>
                <thead>
                  <tr>
                    <th>Color</th>
                    <th>Wire</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaction.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.color}</td>
                      <td>{item.wire}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
  
              <div className="qr-code-container">
                <QRCodeSVG value={JSON.stringify(selectedTransaction)} />
                <button onClick={() => window.print()}>Print Receipt</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  export default TransactionHistory;