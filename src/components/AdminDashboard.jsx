// import { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import { Client, Databases } from "appwrite";
// import { QRCodeSVG } from "qrcode.react";
// import "../App.css";



// function AdminDashboard() {
//     const [wires, setWires] = useState([]);
//     const [newWire, setNewWire] = useState({ name: "", price: 0, stock: 0 });
  
//     useEffect(() => {
//       fetchWires();
//     }, []);
  
//     const fetchWires = async () => {
//       try {
//         const response = await appwrite.database.listDocuments("wires");
//         setWires(response.documents);
//       } catch (error) {
//         console.error("Error fetching wires:", error);
//       }
//     };
  
//     const updateWire = async (wireId, newData) => {
//       try {
//         await appwrite.database.updateDocument("wires", wireId, newData);
//         fetchWires();
//       } catch (error) {
//         console.error("Error updating wire:", error);
//       }
//     };
  
//     return (
//       <div className="admin-panel">
//         <h2>Wire Management</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Price</th>
//               <th>Stock</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {wires.map((wire) => (
//               <tr key={wire.$id}>
//                 <td>
//                   <input
//                     value={wire.name}
//                     onChange={(e) =>
//                       updateWire(wire.$id, { ...wire, name: e.target.value })
//                     }
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="number"
//                     value={wire.price}
//                     onChange={(e) =>
//                       updateWire(wire.$id, {
//                         ...wire,
//                         price: parseFloat(e.target.value),
//                       })
//                     }
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="number"
//                     value={wire.stock}
//                     onChange={(e) =>
//                       updateWire(wire.$id, {
//                         ...wire,
//                         stock: parseInt(e.target.value),
//                       })
//                     }
//                   />
//                 </td>
//                 <td>
//                   <button onClick={() => updateWire(wire.$id, wire)}>Save</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
  
//         <div className="add-wire-form">
//           <h3>Add New Wire</h3>
//           <input
//             type="text"
//             placeholder="Wire Name"
//             value={newWire.name}
//             onChange={(e) => setNewWire({ ...newWire, name: e.target.value })}
//           />
//           <input
//             type="number"
//             placeholder="Price"
//             value={newWire.price}
//             onChange={(e) =>
//               setNewWire({ ...newWire, price: parseFloat(e.target.value) })
//             }
//           />
//           <input
//             type="number"
//             placeholder="Stock"
//             value={newWire.stock}
//             onChange={(e) =>
//               setNewWire({ ...newWire, stock: parseInt(e.target.value) })
//             }
//           />
//           <button
//             onClick={async () => {
//               try {
//                 await appwrite.database.createDocument(
//                   "wires",
//                   "unique()",
//                   newWire
//                 );
//                 setNewWire({ name: "", price: 0, stock: 0 });
//                 fetchWires();
//               } catch (error) {
//                 console.error("Error adding new wire:", error);
//               }
//             }}
//           >
//             Add Wire
//           </button>
//         </div>
//       </div>
//     );
//   }
//   export default AdminDashboard;

import { useState, useEffect } from "react";
import { Client, Databases } from "appwrite";
import "../App.css";

const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject('6795f2860034f57c40c2'); // Your project ID

function AdminDashboard() {
  const [wires, setWires] = useState([]);
  const [newWire, setNewWire] = useState({ name: "", price: 0, type: "", stock: 0, color: "" });
  const [error, setError] = useState();

  useEffect(() => {
    fetchWires();
  }, []);

  const fetchWires = async () => {
    try {
      const response = await databases.listDocuments("6795f2d000274f52f413", "67d954a3000891b10501");
      setWires(response.documents);
      setError("");
    } catch (error) {
      console.error("Error fetching wires:", error);
      setError("Failed to fetch wires. Please try again.");
    }
  };

  const updateWire = async (wireId, newData) => {
    try {
      // Don't call updateDocument on every input change
      // Instead, we'll only save when the Save button is clicked
      setError("");
    } catch (error) {
      console.error("Error updating wire:", error);
      setError("Failed to update wire. Please try again.");
    }
  };

  const saveWire = async (wireId, wireData) => {
    try {
      await databases.updateDocument("6795f2d000274f52f413", "67d954a3000891b10501", wireId, wireData);
      fetchWires();
      setError("");
    } catch (error) {
      console.error("Error saving wire:", error);
      setError("Failed to save wire. Please try again.");
    }
  };

  const deleteWire = async (wireId) => {
    try {
      await databases.deleteDocument("6795f2d000274f52f413", "67d954a3000891b10501", wireId);
      fetchWires();
      setError("");
    } catch (error) {
      console.error("Error deleting wire:", error);
      setError("Failed to delete wire. Please try again.");
    }
  };

  const addWire = async () => {
    // Validate required fields
    if (!newWire.name || !newWire.type) {
      setError("Name and Type are required fields.");
      return;
    }

    try {
      await databases.createDocument("6795f2d000274f52f413", "67d954a3000891b10501", newWire);
      setNewWire({ name: "", price: 0, type: "", stock: 0, color: "" });
      fetchWires();
      setError("");
    } catch (error) {
      console.log("Error adding new wire:");
      setError("Failed to add new wire. Please try again.", error);
    }
  };

  // Handle local state changes without immediate API calls
  const handleWireChange = (wire, field, value) => {
    const updatedWires = wires.map(w => {
      if (w.$id === wire.$id) {
        return { ...w, [field]: value };
      }
      return w;
    });
    setWires(updatedWires);
  };

  return (
    <div className="admin-panel">
      <h2>Wire Management</h2>
      
      {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Type</th>
            <th>Color</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {wires.map((wire) => (
            <tr key={wire.$id}>
              <td>
                <input
                  value={wire.name || ""}
                  onChange={(e) =>
                    handleWireChange(wire, "name", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={wire.price || 0}
                  onChange={(e) =>
                    handleWireChange(wire, "price", parseFloat(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <input
                  value={wire.type || ""}
                  onChange={(e) =>
                    handleWireChange(wire, "type", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={wire.color || ""}
                  onChange={(e) =>
                    handleWireChange(wire, "color", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={wire.stock || 0}
                  onChange={(e) =>
                    handleWireChange(wire, "stock", parseInt(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <button onClick={() => saveWire(wire.$id, wire)}>Save</button>
                <button onClick={() => deleteWire(wire.$id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="add-wire-form">
        <h3>Add New Wire</h3>
        <input
          type="text"
          placeholder="Wire Name"
          value={newWire.name}
          onChange={(e) => setNewWire({ ...newWire, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Wire Type"
          value={newWire.type}
          onChange={(e) => setNewWire({ ...newWire, type: e.target.value })}
        />
        <input
          type="text"
          placeholder="Wire Color"
          value={newWire.color}
          onChange={(e) => setNewWire({ ...newWire, color: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newWire.price}
          onChange={(e) =>
            setNewWire({ ...newWire, price: parseFloat(e.target.value) || 0 })
          }
        />
        <input
          type="number"
          placeholder="Stock"
          value={newWire.stock}
          onChange={(e) =>
            setNewWire({ ...newWire, stock: parseInt(e.target.value) || 0 })
          }
        />
        <button onClick={addWire}>Add Wire</button>
      </div>
    </div>
  );
}

export default AdminDashboard;