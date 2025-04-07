import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import POSSystem from "./components/POSSystem";
import AdminDashboard from "./components/AdminDashboard";
import TransactionHistory from "./components/TransactionHistory";
import Checkout from "./components/checkout";

function App() {
  const [count, setCount] = useState(0);
  const [cart, setCart] = useState([]);
  const [color, setColor] = useState("");
  const [wire, setWire] = useState("");
  const [quantity, setQuantity] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  // Add to Cart functionality
  const addToCart = (item) => {
    setCart([...cart, item]);
    // Reset form fields after adding to cart
    setColor("");
    setWire("");
    setQuantity("");
  };

  // Remove from Cart
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create new item and add to cart
    const newItem = {
      color: color,
      wire: wire,
      quantity: parseInt(quantity) || 1,
    };

    addToCart(newItem);
  };

  const openCheckout = () => {
    setShowCheckout(true);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
  };

  const handleCheckoutComplete = () => {
    // Reset cart and increment invoice counter after successful checkout
    setCart([]);
    setCount((prev) => prev + 1);
    setShowCheckout(false);
  };

  return (
    <Router>
      <nav>
        <Link to="/">POS</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/transactions">Transactions</Link>
       
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="container">
              <POSSystem
                cart={cart}
                color={color}
                wire={wire}
                quantity={quantity}
                handleSubmit={handleSubmit}
                removeFromCart={removeFromCart}
                setColor={setColor}
                setWire={setWire}
                setQuantity={setQuantity}
              />
              {cart.length > 0 && (
                <button 
                  className="checkout-button" 
                  onClick={openCheckout}
                >
                  Proceed to Checkout
                </button>
              )}

              {showCheckout && (
                <Checkout 
                  isOpen={showCheckout}
                  onClose={closeCheckout}
                  cart={cart}
                  invoiceNumber={count + 1}
                  onCheckoutComplete={handleCheckoutComplete}
                />
              )}
            </div>
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/transactions" element={<TransactionHistory />} />
      </Routes>
    </Router>
  );
}

export default App;