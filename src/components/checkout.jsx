import { useState, useEffect, useRef } from "react";
import { Client, Databases } from "appwrite";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import InvoiceForm from "./InvoiceForm";
import "../App.css";
import { saveInvoiceToDatabase } from './lib/appwrite';

const Checkout = ({ isOpen, onClose, cart, invoiceNumber, onCheckoutComplete }) => {
  const [paymentOption, setPaymentOption] = useState("");
  const [formdata, setformdata] = useState({quantity: 1, color: "", wire: ""});
  const [discount, setDiscount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");
  const [change, setChange] = useState("");
  const [showReferenceNo, setShowReferenceNo] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [transactionID, setTransactionID] = useState("");
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const qrCodeRef = useRef(null);
  const receiptRef = useRef(null);
  
  // Calculate total amount when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const total = cart.reduce((sum, item) => {
        // Replace with your actual pricing logic
        const itemPrice = 100; // Placeholder price
        return sum + itemPrice * item.quantity;
      }, 0);

      // Apply discount if any
      const totalAfterDiscount = discount
        ? total - total * (discount / 100)
        : total;
      setTotalAmount(totalAfterDiscount);
    } else {
      setTotalAmount(0);
    }
  }, [cart, discount]);

  // Update payment option UI elements
  useEffect(() => {
    setShowReferenceNo(paymentOption === "bank transfer");
    setShowChange(paymentOption === "cash");
  }, [paymentOption]);

  const handlePaymentOptionChange = (event) => {
    setPaymentOption(event.target.value);
    setError(""); // Clear any previous errors
  };

  const handleAmountPaidChange = (e) => {
    // Only allow numeric input (prevents 'e' character)
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountPaid(value);
      
      // Calculate change automatically
      if (paymentOption === "cash" && value !== "") {
        const calculatedChange = Number(value) - Number(totalAmount);
        setChange(calculatedChange >= 0 ? calculatedChange : 0);
      }
    }
  };

  const generateQRCode = () => {
    const transactionData = {
      invoice_no: invoiceNumber,
      total: totalAmount,
      paymentMethod: paymentOption,
      discount: discount,
      timestamp: new Date().toISOString(),
      customerName: name,
      customerPhone: phoneNo,
      items: cart.map(item => ({
        color: item.color,
        wire: item.wire,
        quantity: item.quantity
      }))
    };
    
    setQrCodeData(JSON.stringify(transactionData));
  };

  const saveToDatabase = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      
      // Your database and collection IDs (verify these in Appwrite console)
      const DATABASE_ID = "6795f2d000274f52f413";
      const COLLECTION_ID = "67d522e8000ac03dd399";
      
      // Initialize Appwrite client
      const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1') // Adjust if your endpoint is different
        .setProject('6795f2860034f57c40c2'); // Replace with your project ID
      
      const databases = new Databases(client);
      
      // Create transaction document
      const allColors = cart.map(item => item.color || "N/A").join(", ");
const allWires = cart.map(item => item.wire || "N/A").join(", ");
const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

const response = await databases.createDocument(
  DATABASE_ID,
  COLLECTION_ID,
  {
    Name: name, // removed unnecessary braces
    mobileno: phoneNo, // removed unnecessary braces
    wirecolor: allColors, // or firstItem.color if you want just the first item
    wiresize: allWires, // or firstItem.wire if you want just the first item
    quantity: totalQuantity, // or firstItem.quantity if you want just the first item
    discount: discount, // removed unnecessary braces
    paymentoption: paymentOption, // removed unnecessary braces
    transactionID: transactionID, // removed unnecessary braces
    ClientPayment: amountPaid, // removed unnecessary braces
    ClientChange: change, // removed unnecessary braces
    Invoice_no: invoiceNumber, // removed unnecessary braces
    Total: totalAmount // removed unnecessary braces
  }
);

      
      setIsSuccess(true);
      return response;
    } catch (error) {
      console.error("Database error:", error);
      setError(`Failed to save to database: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const printReceipt = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    // Add company logo/header
    doc.setFontSize(18);
    doc.text("Receipt", 105, 20, { align: "center" });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoiceNumber}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 49);
    
    // Customer details
    if (name) doc.text(`Customer: ${name}`, 20, 56);
    if (phoneNo) doc.text(`Phone: ${phoneNo}`, 20, 63);
    
    // Payment details
    doc.text(`Payment Method: ${paymentOption}`, 20, 70);
    if (transactionID) doc.text(`Transaction ID: ${transactionID}`, 20, 77);
    
    // Items table
    let yPos = 90;
    doc.text("Items:", 20, yPos);
    yPos += 7;
    
    // Table header
    doc.text("Color", 20, yPos);
    doc.text("Wire", 70, yPos);
    doc.text("Qty", 120, yPos);
    doc.text("Price", 150, yPos);
    yPos += 7;
    
    // Draw line
    doc.line(20, yPos, 190, yPos);
    yPos += 7;
    
    // Table content
    cart.forEach(item => {
      doc.text(item.color || "N/A", 20, yPos);
      doc.text(item.wire || "N/A", 70, yPos);
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text("$100", 150, yPos); // Replace with actual price
      yPos += 7;
    });
    
    // Draw line
    yPos += 3;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Totals
    if (discount) {
      doc.text(`Subtotal: $${(totalAmount / (1 - discount/100)).toFixed(2)}`, 130, yPos);
      yPos += 7;
      doc.text(`Discount (${discount}%): -$${((totalAmount / (1 - discount/100)) * discount/100).toFixed(2)}`, 130, yPos);
      yPos += 7;
    }
    
    doc.text(`Total: $${totalAmount.toFixed(2)}`, 130, yPos);
    yPos += 7;
    
    if (paymentOption === "cash") {
      doc.text(`Amount Paid: $${Number(amountPaid).toFixed(2)}`, 130, yPos);
      yPos += 7;
      doc.text(`Change: $${Number(change).toFixed(2)}`, 130, yPos);
    }
    
    // Add QR code
    if (qrCodeData) {
      // Create a temporary canvas for the QR code
      const canvas = document.createElement('canvas');
      const qrCode = new QRCodeSVG({
        value: qrCodeData,
        size: 128,
        level: "H"
      });
      
      // Convert SVG to data URL
      const svgString = new XMLSerializer().serializeToString(qrCode);
      const img = new Image();
      const svg = new Blob([svgString], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(svg);
      
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL('image/png');
        
        doc.addImage(imgData, 'PNG', 75, yPos + 20, 50, 50);
        
        // Footer
        doc.setFontSize(10);
        doc.text("Thank you for your business!", 105, 280, { align: "center" });
        
        // Save or print the PDF
        doc.save(`receipt-${invoiceNumber}.pdf`);
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } else {
      // Save or print the PDF without QR code
      doc.save(`receipt-${invoiceNumber}.pdf`);
    }
  };

  const handleCheckout = async () => {
    // Validate required fields
    if (!paymentOption) {
      setError("Please select a payment method");
      return;
    }
    
    if (paymentOption === "cash" && (!amountPaid || Number(amountPaid) < totalAmount)) {
      setError("Amount paid must be equal to or greater than the total amount");
      return;
    }
    
    if (paymentOption === "bank transfer" && !transactionID) {
      setError("Please enter the transaction reference number");
      return;
    }
    
    // Generate QR code
    generateQRCode();
    
    // Save to database
    const savedTransaction = await saveToDatabase();
    
    if (savedTransaction) {
      // Show receipt
      setShowReceipt(true);
    }
  };

  const handleFinishCheckout = () => {
    // Reset all states and close the checkout
    onCheckoutComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal">
      <div className="checkout-content">
        <div className="checkout-header">
          <h2>Checkout</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {!showReceipt ? (
          <div className="checkout-body">
            <div className="checkout-section">
              <h3>Invoice #{invoiceNumber}</h3>
              <div className="checkout-form">
                <div className="form-group">
                  {/* <label>Name</label> */}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  {/* <label>Phone Number</label> */}
                  <input
                    type="text"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    placeholder="Phone No"
                    required
                  />
                </div>
                
                <div className="form-group">
                  {/* <label>Discount (%)</label> */}
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="Discount"
                  />
                </div>
              </div>
            </div>
            
            <div className="checkout-section">
              <h3>Shopping Cart</h3>
              <div className="cart-items">
                {cart.length > 0 ? (
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th>Color</th>
                        <th>Wire</th>
                        <th>Quantity</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={index}>
                          <td>{item.color || "N/A"}</td>
                          <td>{item.wire || "N/A"}</td>
                          <td>{item.quantity}</td>
                          <td>PKR{(100 * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No items in cart</p>
                )}
                
                <div className="cart-total">
                  {discount > 0 && (
                    <div className="discount-info">
                      <span>Subtotal:</span>
                      <span>${((totalAmount / (1 - discount/100)).toFixed(2))}</span>
                      <span>Discount ({discount}%):</span>
                      <span>-${(((totalAmount / (1 - discount/100)) * discount/100).toFixed(2))}</span>
                    </div>
                  )}
                  <div className="total-line">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="checkout-section">
              <h3>Payment Options</h3>
              <div className="payment-options">
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="cash"
                      checked={paymentOption === "cash"}
                      onChange={handlePaymentOptionChange}
                    />
                    Cash
                  </label>
                  
                  <label>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="bank transfer"
                      checked={paymentOption === "bank transfer"}
                      onChange={handlePaymentOptionChange}
                    />
                    Bank Transfer
                  </label>
                </div>
                
                {showChange && (
                  <div className="form-group">
                    
                    <input
                      type="text"
                      value={amountPaid}
                      onChange={handleAmountPaidChange}
                      placeholder="Enter amount paid"
                    />
                    
                    <div className="change-display">
                      <span>Change: PKR</span>
                      <input type="number" name="" id="" value={Number(change).toFixed(2)} readOnly/>
                      {/* <span>${Number(change).toFixed(2)}</span> */}
                    </div>
                  </div>
                )}
                
                {showReferenceNo && (
                  <div className="form-group">
                    {/* <label>Transaction Reference No.</label> */}
                    <input
                      type="text"
                      value={transactionID}
                      onChange={(e) => setTransactionID(e.target.value)}
                      placeholder="Reference No"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="checkout-actions">
              <button 
                className="checkout-button"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Complete Checkout"}
              </button>
            </div>
          </div>
        ) : (
          <div className="receipt-container">
            <div className="receipt" ref={receiptRef}>
              <h4>Invoice #{invoiceNumber}</h4>
              
              <div className="receipt-details">
                <p><strong>Customer:</strong> {name || "Guest"}</p>
                <p><strong>Phone:</strong> {phoneNo || "N/A"}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                <p><strong>Payment Method:</strong> {paymentOption}</p>
                
                <h5>Items:</h5>
                <table className="receipt-table">
                  <thead>
                    <tr>
                      <th>Color</th>
                      <th>Wire</th>
                      <th>Quantity</th>
                      <th>Price (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td>{item.color}</td>
                        <td>{item.wire}</td>
                        <td>{item.quantity}</td>
                        <td>100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {discount > 0 && (
                  <>
                    <p><strong>Subtotal:</strong> PKR{(totalAmount / (1 - discount/100)).toFixed(2)}</p>
                    <p><strong>Discount:</strong> {discount}%</p>
                  </>
                )}
                
                <p><strong>Total:</strong> PKR{totalAmount.toFixed(2)}</p>
                {paymentOption === "cash" && (
                  <>
                    <p><strong>Amount Paid:</strong> PKR{amountPaid}</p>
                    <p><strong>Change:</strong> PKR{change.toFixed(2)}</p>
                  </>
                )}
                {paymentOption === "bank transfer" && (
                  <p><strong>Reference No:</strong> {transactionID}</p>
                )}
              </div>
              
              <div className="qr-code-container">
                <p><strong>Scan for digital receipt:</strong></p>
                <QRCodeSVG 
                  value={qrCodeData}
                  size={128}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            
            <div className="receipt-actions">
              <button 
                className="print-button"
                onClick={printReceipt}
              >
                Print Receipt (PDF)
              </button>
              
              <button 
                className="finish-button"
                onClick={handleFinishCheckout}
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;