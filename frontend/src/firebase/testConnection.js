// Simple test file to verify Firebase connectivity
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// Use the real `entries` collection for test operations so security rules
// behave the same as production usage. Tests that write must include the
// authenticated user's UID (userId / ownerId) to satisfy Firestore rules.
const TEST_COLLECTION = "entries";

// Function to test adding a document to Firestore (scoped to current user)
export const testFirebaseWrite = async () => {
  try {
    console.log("Testing Firebase write operation to entries collection...");
    const currentUid = auth && auth.currentUser ? auth.currentUser.uid : null;
    if (!currentUid) {
      throw new Error("Not signed in: sign in before running the test write.");
    }

    const testDoc = {
      message: "Test document",
      userId: currentUid,
      ownerId: currentUid,
      createdAt: serverTimestamp(),
      test: true,
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

// Function to test reading documents from Firestore (scoped to current user)
export const testFirebaseRead = async () => {
  try {
    console.log("Testing Firebase read operation for current user...");
    const currentUid = auth && auth.currentUser ? auth.currentUser.uid : null;
    if (!currentUid) {
      throw new Error("Not signed in: sign in before running the test read.");
    }

    const q = query(collection(db, TEST_COLLECTION), where("userId", "==", currentUid));
    const querySnapshot = await getDocs(q);

    const docs = [];
    querySnapshot.forEach((doc) => {
      docs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("Read test documents for user:", docs);
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
