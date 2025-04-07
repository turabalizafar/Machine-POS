import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Client, Databases } from "appwrite";
import { QRCodeSVG } from "qrcode.react";
import "../App.css";



function InvoiceTable({ count, cart, totalAmount }) {
    return (
      <div className="invoice-table">
        <h3>Current Invoice</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Item</th>
              <th>Color</th>
              <th>Wire</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index}>
                <td>{count + 1}</td>
                <td>{index + 1}</td>
                <td>{item.color}</td>
                <td>{item.wire}</td>
                <td>{item.quantity}</td>
                <td>100</td>
                {/* Replace with actual price calculation if available */}
              </tr>
            ))}
            {cart.length > 0 && (
              <tr className="total-row">
                <td colSpan="5" align="right">
                  Total:
                </td>
                <td>{totalAmount}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
  export default InvoiceTable;