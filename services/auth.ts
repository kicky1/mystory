// Mock user data
const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123', // In a real app, this would be hashed
  },
];

// Mock verification codes
const mockVerificationCodes = new Map<string, string>();

// Types
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ErrorResponse {
  message: string;
}

// Helper function to generate a mock JWT token
const generateToken = (userId: string): string => {
  return `mock-jwt-token-${userId}-${Date.now()}`;
};

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Login
  async login(email: string, password: string): Promise<AuthResponse | ErrorResponse> {
    await delay(1000); // Simulate network delay

    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return {
        message: 'Invalid email or password',
      };
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: generateToken(user.id),
    };
  },

  // Register
  async register(username: string, email: string, password: string): Promise<AuthResponse | ErrorResponse> {
    await delay(1000);

    if (mockUsers.some(u => u.email === email)) {
      return {
        message: 'Email already registered',
      };
    }

    if (mockUsers.some(u => u.username === username)) {
      return {
        message: 'Username already taken',
      };
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      username,
      email,
      password,
    };

    mockUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      token: generateToken(newUser.id),
    };
  },

  // Send verification code
  async sendVerificationCode(email: string): Promise<{ success: boolean } | ErrorResponse> {
    await delay(1000);

    if (!mockUsers.some(u => u.email === email)) {
      return {
        message: 'Email not found',
      };
    }

    const code = Math.random().toString().slice(2, 8);
    mockVerificationCodes.set(email, code);

    console.log('Verification code for', email, ':', code); // For testing purposes

    return { success: true };
  },

  // Verify code
  async verifyCode(email: string, code: string): Promise<{ success: boolean } | ErrorResponse> {
    await delay(1000);

    const storedCode = mockVerificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      return {
        message: 'Invalid verification code',
      };
    }

    mockVerificationCodes.delete(email);
    return { success: true };
  },

  // Reset password
  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean } | ErrorResponse> {
    await delay(1000);

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return {
        message: 'User not found',
      };
    }

    user.password = newPassword;
    return { success: true };
  },

  // Get current user
  async getCurrentUser(token: string): Promise<User | ErrorResponse> {
    await delay(500);

    // In a real app, we would verify the JWT token
    const userId = token.split('-')[3];
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return {
        message: 'Invalid token',
      };
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
}; 