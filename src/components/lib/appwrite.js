import { Client, Databases, ID } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6795f2860034f57c40c2'); // Your project ID

// Initialize Databases service
export const databases = new Databases(client);

// Database and collection constants
export const DATABASE_ID = '6795f2d000274f52f413';
export const COLLECTION_ID = 'Imamdin';

/**
 * Save invoice data to Appwrite database
 * @param {Object} invoiceData - The invoice data to save
 * @returns {Promise} - Promise resolving to the created document
 */
export const saveInvoiceToDatabase = async (invoiceData) => {
  try {
    // Create a document with the provided data
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(), // Generate a unique document ID
      invoiceData  // The data object containing all invoice information
    );
    
    console.log('Document created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error; // Re-throw so the component can handle it
  }
};

// databaseID=6795f2d000274f52f413
// imam_din_sons collectionID=67d522e8000ac03dd399
// projectID=6795f2860034f57c40c2
// secretkey=standard_8b9dd43b1430dd375f417748b1d64629d9b146ba2a188be7c99fe483965d6c6b81a713bbd32cd943f1453cfb29d9e3e0558545ed84222830392459e9ee2be6169ea2ac90783ddd44c524a6222fd33931cb9b841dd23b9adf260b8ce94c104e160a231082d4e84890e144ef57f1dc882e6a27e14dc996f33ec0c626cbb8931a9d;

// admin collectionID=67d954a3000891b10501