// Simple test file to verify Firebase connectivity
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Test collection name
const TEST_COLLECTION = "testCollection";

// Function to test adding a document to Firestore
export const testFirebaseWrite = async () => {
  try {
    console.log("Testing Firebase write operation...");
    const testDoc = {
      message: "Test document",
      timestamp: new Date(),
    };

    const docRef = await addDoc(collection(db, TEST_COLLECTION), testDoc);
    console.log("Test document written with ID:", docRef.id);
    return {
      success: true,
      docId: docRef.id,
    };
  } catch (error) {
    console.error("Error testing Firebase write:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Function to test reading documents from Firestore
export const testFirebaseRead = async () => {
  try {
    console.log("Testing Firebase read operation...");
    const querySnapshot = await getDocs(collection(db, TEST_COLLECTION));

    const docs = [];
    querySnapshot.forEach((doc) => {
      docs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("Read test documents:", docs);
    return {
      success: true,
      docs,
    };
  } catch (error) {
    console.error("Error testing Firebase read:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
