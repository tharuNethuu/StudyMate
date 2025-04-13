import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { signOut } from 'firebase/auth';
import StDashHeader from '../components/Header/StudentDheader';
import AbsentTimesCard from '../components/AbsentTimesCard';
import EngagementChart from '../components/EngagementChart';
import SidePanel from '../components/SidePanel';
import RewardComponent from '../components/Rewards/RewardComponent';
import LastSessionSummary from '../components/LastSessionSummary';
import CountUp from 'react-countup';


const DashboardCard = ({ userId, title, children, className = '' }) => (
  <div
    className={`p-6 ${className}`}
    style={{
      background: 'white',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      borderRadius: 10,
      border: '0.02px solid rgba(154, 157, 161, 0.38)',
    }}
  >
    <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
    {children}
  </div>
);

const StudentDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(null);

  const [userId, setUserId] = useState(null);
  const [initialTime, setInitialTime] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the user ID when authenticated
        fetchPomodoroTime(user.uid);
        fetchCompletedPomodoros(user.uid);
        fetchUserData(user.uid);
        fetchTasks(user.uid);
      } else {
        console.error("User is not logged in!");
      }
    });

    return () => unsubscribe();
  }, []);


  // Fetch user details
  const fetchUserData = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        console.log('User details:', docSnap.data());
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message);
    }
  };

  // Fetch completed pomodoros
  const fetchCompletedPomodoros = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log('Fetched user data:', userData);
        setCompletedPomodoros(userData.completedPomodoros || 0);
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error fetching pomodoro data:', error);
    }
  };

  const completedSessions = completedPomodoros !== null
    ? Math.floor(completedPomodoros)
    : 0;
  // Use `onAuthStateChanged` to get the logged-in user's ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        console.log('Logged in user ID:', userId);

        // Fetch data based on the user ID
        fetchUserData(userId);
        fetchCompletedPomodoros(userId);
      } else {
        console.error('User is not logged in!');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  const fetchPomodoroTime = async (userId) => {
    try {
      const pomodoroRef = doc(db, `users/${userId}/rewards/pomodoro`);
      const pomodoroSnap = await getDoc(pomodoroRef);
      if (pomodoroSnap.exists()) {
        setInitialTime(pomodoroSnap.data().initialTime || 0);
      } else {
        console.warn("Pomodoro document not found.");
      }
    } catch (error) {
      console.error("Error fetching initial time:", error);
    }
  };

  const fetchTasks = async (userId) => {
    try {
      const userTasksRef = collection(db, `users/${userId}/tasks`);
      const q = query(userTasksRef);
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasks);

      const completed = tasks.filter(task => task.completed).length;
      setCompletedTasks(completed);
    } catch (error) {
      console.error("Error fetching tasks from Firestore:", error);
    }
  };

  // Convert seconds to H:M:S format
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600000);
    const m = Math.floor((seconds % 3600000) / 60000);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }; 

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error) {
      toast.error(error.message);
    }
  };
  const sidePanelStyle = {
    position: 'fixed', // Fixes the panel position
    left: -10,
    top: '240px',
        }


  return (
    <div className="min-h-screen bg-white">
      <div style={sidePanelStyle}>
        <SidePanel/>
      </div>
      <StDashHeader userDetails={userDetails}/>
      <div className='p-40'>
      <div className="flex justify-between items-center mb-8">
       </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  {/* Personal Details Section - Left Column */}
  <DashboardCard title="Personal Details">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-black">Name</p>
        <p className="font-medium">{userDetails?.name}</p>
      </div>
      <div>
        <p className="text-black">Email</p>
        <p className="font-medium">{userDetails?.email}</p>
      </div>
      <div>
      <p className="text-black">Student ID</p>
      <p className="font-medium">{userDetails?.studentId}</p>
      </div>
      
    </div>
  </DashboardCard>

  {/* Stats Grid - Right Column */}
<div className="flex gap-6">
  {/* Task Progress Card */}
  <DashboardCard title="Task Progress" className="flex-1">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-green-100 rounded-full">
        <CheckCircle className="text-green-600" size={24} />
      </div>
      <div>

        <p className="text-2xl font-bold text-black">{completedTasks}/{tasks.length}</p>
        <p className="text-black text-sm mt-2">Tasks Completed</p>

      </div>
    </div>
  </DashboardCard>

  {/* Pomodoro Sessions Card */}
  <DashboardCard title="Pomodoro Sessions" className="flex-1">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-100 rounded-full">
        <Clock className="text-blue-600" size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold text-black">
        {completedPomodoros !== null ? (
              <CountUp start={0} end={completedPomodoros} duration={2} separator="," />
            ) : (
              "Loading..."
            )}
        </p>
        <p className="text-black text-sm">Total Completed Pomodoros</p>
      </div>

                <p className="text-2xl font-bold text-black">
                  {initialTime !== null ?  <CountUp
                start={0}
                end={initialTime}
                duration={2}
                formattingFn={(value) => formatTime(value)} // Formats time correctly
              /> : "Loading..."}
                </p>
                <p className="text-black text-sm">Total Pomodoro Time</p>
       

    </div>
  </DashboardCard>
</div>

</div>
<div className='mt-15 mb-10'>
      <RewardComponent userId={userId} />
    </div>

    <div className='mt-15 mb-10'>
    <LastSessionSummary userId={userId}/>
    </div> 
{/* Weekly Progress Chart */}
<DashboardCard className='mt-15'>

  <EngagementChart userId={userId}/>
</DashboardCard>



{/* <div className='mt-20'>
<h3 className="text-lg font-semibold mb-4 text-gray-800">
        We noticed you are not focused on studying in these times... 🧐
      </h3>
 <AbsentTimesCard userId={userId} /> 
</div> */}

      </div>
    </div>
  );
};

export default StudentDashboard;
