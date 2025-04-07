import { useState } from "react";
import "../App.css";
import InvoiceTable from "./InvoiceTable";
import InvoiceForm from "./InvoiceForm";

function POSSystem({
  count,
  cart,
  color,
  wire,
  quantity,
  discount,
  totalAmount,
  change,
  showReferenceNo,
  showChange,
  paymentOption,
  qrCodeData,
  handlePaymentOptionChange,
  handleSubmit,
  removeFromCart,
  handleCheckout,
  setColor,
  setWire,
  setQuantity,
  setDiscount,
  setTotalAmount,
  setAmountPaid,
}) {
  return (
    <div>
      <InvoiceForm
        count={count}
        color={color}
        wire={wire}
        quantity={quantity}
        discount={discount}
        totalAmount={totalAmount}
        change={change}
        showReferenceNo={showReferenceNo}
        showChange={showChange}
        paymentOption={paymentOption}
        handlePaymentOptionChange={handlePaymentOptionChange}
        handleSubmit={handleSubmit}
        setColor={setColor}
        setWire={setWire}
        setQuantity={setQuantity}
        setDiscount={setDiscount}
        setTotalAmount={setTotalAmount}
        setAmountPaid={setAmountPaid}
      />

      <div className="cart">
        <h3>Shopping Cart</h3>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              {item.color} - {item.wire} - Qty: {item.quantity}
              <button onClick={() => removeFromCart(index)}>Remove</button>
            </div>
          ))
        )}
      </div>

      <InvoiceTable count={count} cart={cart} totalAmount={totalAmount} />
    </div>
  );
}

export default POSSystem;