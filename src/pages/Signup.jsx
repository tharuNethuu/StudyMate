import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, getDocs, query, where, doc, setDoc,getDoc, updateDoc, increment } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo2 from '../assets/images/HomePageIcons/scrolledLogo.png'
import studentIcon from '../assets/images/HomePageIcons/student.png';
import parentIcon from '../assets/images/HomePageIcons/parent.png';
import Alert from "../components/Alert";

const SignUp = () => {
  const { role } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [grade, setGrade] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");


  const navigate = useNavigate();

  const generateUniqueStudentId = (uid) => {
    const shortUid = uid.substring(0, 3); // Take the first 3 characters of the UID
    const randomSuffix = Math.random().toString(36).substring(2, 5); // Generate a random string of 3 characters
    
    return `${shortUid.toUpperCase()}${randomSuffix.toUpperCase()}`;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
  
    try {
      // Step 1: Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Step 2: Update the user's display name
      await updateProfile(user, { displayName: name });
  
      // Step 3: Check if user already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (!userDocSnap.exists()) {
        // Generate a studentId if the user is a student
        const studentId = role === "student" ? generateUniqueStudentId(user.uid) : null;
  
        // Prepare user data to save in Firestore
        const userData = {
          uid: user.uid,
          name, // Captured from form input
          email: user.email,
          role,
          gender,
          studentId, // Only set for students
          ...(role === "student" && { grade }), // Add grade only if role is student
          createdAt: new Date(),
        };
  
        // Step 4: Save user data in Firestore
        await setDoc(userDocRef, userData);

        const statsRef = doc(db, 'stats', 'userCounts');

        // Ensure the fields exist before incrementing
        await setDoc(statsRef, {
          gender: { male: 0, female: 0, other: 0 }, // Initialize gender counts
          grades: {}, // Empty object for grades
          parentCount: 0, // Initialize parent count
        }, { merge: true });
        
        await updateDoc(statsRef, {
          [`gender.${gender}`]: increment(1), // Increment gender count
          ...(role === "student" && { [`grades.${grade}`]: increment(1) }), // Increment grade count
          ...(role === "parent" && { parentCount: increment(1) }), // Increment parent count
        });
        
        // Show success message
        toast.success("User registered successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
       
        setAlertMessage(`User registered successfully!`);
        setShowAlert(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        // Handle case where user already exists
        console.log("User already exists in Firestore");
        setAlertMessage("User already exists in Firestore");
        setShowAlert(true);
      }
    } catch (error) {
      // Handle errors
      console.error("Error signing up:", error);
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setAlertMessage(`Error: ${error.message}`);
      setShowAlert(true);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen  bg-gray-100 bg-[url('./assets/images/HomePageIcons/loginbg.jpeg')] bg-cover bg-center">
    {showAlert && <Alert message={alertMessage} onClose={() => setShowAlert(false)} />}
    <div className="bg-white p-8 rounded-lg shadow-lg w-full  max-w-4xl mx-auto">
    <div className="flex justify-center items-center mb-4">
{/* Conditionally render image based on role */}
{role === "student" ? (
 <div className="flex justify-center items-center mb-4 space-x-4">
 <img
   src={logo2}
   alt="Logo"
   className="w-[140px] h-auto pb-4"
 />
 <img
   src={studentIcon} 
   alt="Student Icon"
   className="w-[50px] h-[50px] mb-2"
 />
</div>

) : role === "parent" ? (
  <div className="flex justify-center items-center mb-4 space-x-4">
<img
  src={logo2}
  alt="Logo"
  className="w-[140px] h-auto pb-4"
/>
<img
  src={parentIcon} 
  alt="Student Icon"
  className="w-[50px] h-[50px] mb-2"
/>
</div>

) : null}
</div>

<h2 className="text-2xl font-bold mb-8 flex justify-center items-center">
{/* Conditionally render heading text based on role */}
{role === "student"
  ? "Ready to Rock Your Studies? Let’s Go!"
  : role === "parent"
  ? "Welcome, Super Parent! Let’s Get Started!"
  : ""}
</h2>
      <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Name Field */}
<div className="flex flex-col">
  <label htmlFor="name" className="font-semibold text-gray-700 mt-2">Full Name</label>
  <input
    type="text"
    id="name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Full Name"
    required
    className="w-full p-2 bg-[#bfd8fd] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
  />
</div>

{/* Email Field */}
<div className="flex flex-col">
  <label htmlFor="email" className="font-semibold text-gray-700 mt-2">Email</label>
  <input
    type="email"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email"
    required
    className="w-full p-2 bg-[#bfd8fd] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
  />
</div>

{/* Password Field */}
<div className="flex flex-col">
  <label htmlFor="password" className="font-semibold text-gray-700 mt-2">Password</label>
  <input
    type="password"
    id="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Password"
    required
    className="w-full p-2 bg-[#bfd8fd] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
  />
</div>

{/* Gender Field */}
<div className="flex flex-col">
  <label htmlFor="gender" className="font-semibold text-gray-700 mt-2">Gender</label>
  <select
    id="gender"
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full p-2 bg-[#bfd8fd] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
  >
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="other">Other</option>
  </select>
</div>

{/* Role-specific Fields (Only for Students) */}
{role === "student" && (
  <>
    {/* Grade Field */}
    <div className="flex flex-col">
      <label htmlFor="grade" className="font-semibold text-gray-700 mt-2">Grade</label>
      <select
        id="grade"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        required
        className="w-full p-2 bg-[#bfd8fd] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
      >
        <option value="">Select Grade</option>
        <option value="6-9">Grade 6-9</option>
        <option value="10-11">Grade 10-11</option>
        <option value="12-13">Grade 12-13</option>
        <option value="university">University</option>
      </select>
    </div>
  </>
)}

 

{/* Submit Button */}
<div className="col-span-2">
  <button
    type="submit"
    className="w-full  text-white font-semibold text-[16px] h-[34px] bg-gradient-to-b from-[#0570b2] to-[#0745a2] rounded-[100px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] mt-2"
    >
    Sign Up
  </button>
</div>
</form>

    </div>
  </div>
);
};

export default SignUp;
