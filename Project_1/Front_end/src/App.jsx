import { useState } from 'react';
import axios from 'axios';

import './App.css'

function App() {
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/signup', signupData);
      console.log(response.data.message);
      setVerificationMessage('An OTP has been sent to your email');
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await axios.post('http://localhost:5000/api/verify-otp', { email: signupData.email, otp });
      console.log('OTP verified successfully');
      setVerificationMessage('OTP verified successfully');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setVerificationMessage('Invalid OTP or OTP expired');
    }
  };

  return (
    <>
      <div>
        <h1>Signup</h1>
        <input type="text" placeholder="Username" value={signupData.username} onChange={(e) => setSignupData({ ...signupData, username: e.target.value })} />
        <input type="email" placeholder="Email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />
        <input type="password" placeholder="Password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
        <button onClick={handleSignup}>Signup</button>

        {verificationMessage && <p>{verificationMessage}</p>}
        {verificationMessage && (
          <div>
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button onClick={handleVerifyOTP}>Verify OTP</button>
          </div>
        )}
      </div>
    </>
  )
}

export default App
