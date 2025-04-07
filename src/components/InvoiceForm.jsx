function InvoiceForm({
  count,
  color,
  wire,
  quantity,
  handleSubmit,
  setColor,
  setWire,
  setQuantity,
  cartHasItems
}) {
  return (
    <div className="form">
      <form onSubmit={handleSubmit}>
        <label>Invoice No {count + 1}</label>
        
        <label>Choose color</label>
        <select
          name="color"
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required={!cartHasItems}
        >
          <option value="">Select Color</option>
          <option value="black">Black</option>
          <option value="white">White</option>
          <option value="green">Green</option>
          <option value="golden">Golden</option>
        </select>

        <label>Choose wire type</label>
        <select
          name="wire"
          id="wire"
          value={wire}
          onChange={(e) => setWire(e.target.value)}
          required={!cartHasItems}
        >
          <option value="">Select Wire Type</option>
          <option value="white copper">White Copper</option>
          <option value="30.76">30.76</option>
          <option value="40.76">40.76</option>
          <option value="23.76">23.76</option>
        </select>

        <label>Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          required={!cartHasItems}
        />

        <input type="submit" value="Add to Cart" />

       
      </form>
    </div>
  );
}
export default InvoiceForm;