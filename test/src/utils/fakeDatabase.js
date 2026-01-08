// Fake Database for Testing
// This simulates a backend database with user data

const fakeDatabase = {
  users: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Traveler',
      email: 'traveler@bdrap.com',
      password: 'traveller321', // Password: Traveler@123
      role: 'public-traveler',
      createdAt: '2025-01-01',
    },
    {
      id: 1,
      firstName: 'Adnan',
      lastName: 'Traveler',
      email: 'tarekadnan67@gmail.com',
      password: 'Adnan123', // Password: Traveler@123
      role: 'public-traveler',
      createdAt: '2025-01-01',
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Analyst',
      email: 'analyst@bdrap.com',
      password: 'anal321', // Password: Analyst@456
      role: 'analyst',
      createdAt: '2025-01-02',
    },
    {
      id: 3,
      firstName: 'Admin',
      lastName: 'BDRap',
      email: 'admin@bdrap.com',
      password: 'Admin@789', // Password: Admin@789
      role: 'admin',
      createdAt: '2025-01-03',
    },
  ],
  otpStorage: {}, // Temporary storage for OTPs
  passwordResetTokens: {}, // Temporary storage for reset tokens
};

// ===== Helper Functions =====

/**
 * Simple hash function for OTP (non-reversible)
 * @param {string} otp - OTP to hash
 * @returns {string} - Hashed OTP
 */
const hashOTP = (otp) => {
  let hash = 0;
  for (let i = 0; i < otp.length; i++) {
    const char = otp.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Login Function
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - { success: boolean, message: string, user: Object }
 */
export const loginUser = (email, password) => {
  // Validate inputs
  if (!email || !password) {
    return {
      success: false,
      message: 'Email and password are required',
      user: null,
    };
  }

  // Find user by email
  const user = fakeDatabase.users.find((u) => u.email === email);

  if (!user) {
    return {
      success: false,
      message: 'Email not found. Please sign up first.',
      user: null,
    };
  }

  // Check password
  if (user.password !== password) {
    return {
      success: false,
      message: 'Invalid password. Please try again.',
      user: null,
    };
  }

  // Remove password from response for security
  const { password: _, ...userWithoutPassword } = user;

  return {
    success: true,
    message: `Welcome back, ${user.firstName}!`,
    user: userWithoutPassword,
  };
};

/**
 * Sign Up Function
 * @param {Object} userData - { firstName, lastName, email, password, role }
 * @returns {Object} - { success: boolean, message: string, user: Object }
 */
export const signUpUser = (userData) => {
  const { firstName, lastName, email, password, role } = userData;

  // Validate inputs
  if (!firstName || !lastName || !email || !password || !role) {
    return {
      success: false,
      message: 'All fields are required',
      user: null,
    };
  }

  // Check if email already exists
  const existingUser = fakeDatabase.users.find((u) => u.email === email);

  if (existingUser) {
    return {
      success: false,
      message: 'Email already registered. Please log in or use a different email.',
      user: null,
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email format',
      user: null,
    };
  }

  // Validate password strength
  if (password.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters',
      user: null,
    };
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return {
      success: false,
      message: 'Password must contain uppercase, lowercase, and numbers',
      user: null,
    };
  }

  // Create new user
  const newUser = {
    id: fakeDatabase.users.length + 1,
    firstName,
    lastName,
    email,
    password,
    role,
    createdAt: new Date().toISOString().split('T')[0],
  };

  // Add to database
  fakeDatabase.users.push(newUser);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;

  return {
    success: true,
    message: `Account created successfully! Welcome, ${firstName}!`,
    user: userWithoutPassword,
  };
};

/**
 * Send OTP for Forgot Password
 * @param {string} email - User email
 * @returns {Object} - { success: boolean, message: string, otp: string }
 */
export const sendOTPForPasswordReset = (email) => {
  // Validate email
  if (!email) {
    return {
      success: false,
      message: 'Email is required',
      otp: null,
    };
  }

  // Check if user exists
  const user = fakeDatabase.users.find((u) => u.email === email);

  if (!user) {
    return {
      success: false,
      message: 'Email not found in our system',
      otp: null,
    };
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = hashOTP(otp);

  // Store OTP temporarily (in real app, this would expire after 10 minutes)
  fakeDatabase.otpStorage[email] = {
    otpHash: hashedOtp, // ⭐ Hashed OTP (non-reversible)
    createdAt: new Date(),
    attempts: 0,
  };

  console.log(
    `[DEMO] OTP sent to ${email}: ${otp} (Hashed: ${hashedOtp})`
  );

  return {
    success: true,
    message: `OTP sent to ${email}. (Demo: ${otp})`,
    otp, // In real app, don't return OTP to client
  };
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP entered by user
 * @returns {Object} - { success: boolean, message: string }
 */
export const verifyOTP = (email, otp) => {
  // Validate inputs
  if (!email || !otp) {
    return {
      success: false,
      message: 'Email and OTP are required',
    };
  }

  // Check if OTP exists for this email
  const storedOTP = fakeDatabase.otpStorage[email];

  if (!storedOTP) {
    return {
      success: false,
      message: 'No OTP found. Please request a new one.',
    };
  }

  // Check OTP expiration (10 minutes)
  const timeDiff = new Date() - storedOTP.createdAt;
  const tenMinutes = 10 * 60 * 1000;

  if (timeDiff > tenMinutes) {
    delete fakeDatabase.otpStorage[email];
    return {
      success: false,
      message: 'OTP expired. Please request a new one.',
    };
  }

  // Check maximum attempts
  if (storedOTP.attempts >= 3) {
    delete fakeDatabase.otpStorage[email];
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.',
    };
  }

  // Verify OTP by comparing hashes
  const enteredOtpHash = hashOTP(otp.toString());
  if (storedOTP.otpHash !== enteredOtpHash) {
    storedOTP.attempts++;
    return {
      success: false,
      message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.`,
    };
  }

  // OTP verified - generate password reset token
  const resetToken = Math.random().toString(36).substring(2, 15);
  fakeDatabase.passwordResetTokens[email] = {
    token: resetToken,
    createdAt: new Date(),
  };

  // Clean up OTP
  delete fakeDatabase.otpStorage[email];

  return {
    success: true,
    message: 'OTP verified successfully',
  };
};

/**
 * Reset Password
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @returns {Object} - { success: boolean, message: string }
 */
export const resetPassword = (email, newPassword) => {
  // Validate inputs
  if (!email || !newPassword) {
    return {
      success: false,
      message: 'Email and password are required',
    };
  }

  // Check if reset token exists
  const resetToken = fakeDatabase.passwordResetTokens[email];

  if (!resetToken) {
    return {
      success: false,
      message: 'Invalid reset request. Please start over.',
    };
  }

  // Find user
  const user = fakeDatabase.users.find((u) => u.email === email);

  if (!user) {
    return {
      success: false,
      message: 'User not found',
    };
  }

  // Validate password
  if (newPassword.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters',
    };
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    return {
      success: false,
      message: 'Password must contain uppercase, lowercase, and numbers',
    };
  }

  // Update password
  user.password = newPassword;

  // Clean up reset token
  delete fakeDatabase.passwordResetTokens[email];

  return {
    success: true,
    message: 'Password reset successfully',
  };
};

/**
 * Get all users (for testing/debugging)
 * @returns {Array} - Array of all users (without passwords)
 */
export const getAllUsers = () => {
  return fakeDatabase.users.map(({ password: _, ...user }) => user);
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Object} - User object (without password)
 */
export const getUserByEmail = (email) => {
  const user = fakeDatabase.users.find((u) => u.email === email);
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Check if email exists
 * @param {string} email - User email
 * @returns {boolean} - True if email exists
 */
export const emailExists = (email) => {
  return fakeDatabase.users.some((u) => u.email === email);
};

export default fakeDatabase;
