import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isPinSet: boolean;
  isLoading: boolean;
  pin: string | null;
  securityAnswer: string | null;
  login: (enteredPin: string) => boolean;
  logout: (callback?: () => void) => void;
  setNewPin: (newPin: string, confirmPin: string, securityAnswer: string) => boolean;
  resetPin: (currentPin: string, newPin: string, securityAnswer: string) => boolean;
  resetPinWithSecurityAnswer: (securityAnswer: string, newPin: string) => boolean;
  updateSecurityAnswer: (answer: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pin, setPin] = useState<string | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedPin = await AsyncStorage.getItem('@finance_pin');
        const storedSecurityAnswer = await AsyncStorage.getItem('@security_answer');
        
        setPin(storedPin);
        setSecurityAnswer(storedSecurityAnswer);
        setIsPinSet(!!storedPin);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading auth state:', error);
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = (enteredPin: string): boolean => {
    if (enteredPin === pin) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = async (callback?: () => void) => {
    try {
      // Clear stored data
      await Promise.all([
        AsyncStorage.removeItem('@finance_pin'),
        AsyncStorage.removeItem('@security_answer'),
      ]);
      // Reset authentication states
      setIsAuthenticated(false);
      setIsPinSet(false);
      setPin(null);
      setSecurityAnswer(null);
      // Execute callback if provided
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still execute callback to ensure navigation occurs even on error
      if (callback) {
        callback();
      }
    }
  };

  const setNewPin = (newPin: string, confirmPin: string, newSecurityAnswer: string): boolean => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      return false; // PIN must be exactly 4 digits
    }
    
    if (newPin !== confirmPin) {
      return false; // PINs don't match
    }
    
    if (!newSecurityAnswer.trim()) {
      return false; // Security answer is required
    }

    // Save the new PIN and security answer
    AsyncStorage.setItem('@finance_pin', newPin);
    AsyncStorage.setItem('@security_answer', newSecurityAnswer);
    
    setPin(newPin);
    setSecurityAnswer(newSecurityAnswer);
    setIsPinSet(true);
    setIsAuthenticated(true);
    
    return true;
  };

  const resetPin = (currentPin: string, newPin: string, newSecurityAnswer: string): boolean => {
    // Verify current PIN
    if (currentPin !== pin) {
      return false; // Current PIN doesn't match
    }
    
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      return false; // New PIN must be exactly 4 digits
    }
    
    if (!newSecurityAnswer.trim()) {
      return false; // Security answer is required
    }
    
    // Save the new PIN and security answer
    AsyncStorage.setItem('@finance_pin', newPin);
    AsyncStorage.setItem('@security_answer', newSecurityAnswer);
    
    setPin(newPin);
    setSecurityAnswer(newSecurityAnswer);
    
    return true;
  };

  const resetPinWithSecurityAnswer = (enteredSecurityAnswer: string, newPin: string): boolean => {
    if (enteredSecurityAnswer !== securityAnswer) {
      return false; // Security answer doesn't match
    }
    
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      return false; // PIN must be exactly 4 digits
    }
    
    // Save the new PIN
    AsyncStorage.setItem('@finance_pin', newPin);
    setPin(newPin);
    setIsAuthenticated(true);
    
    return true;
  };

  const updateSecurityAnswer = (answer: string) => {
    AsyncStorage.setItem('@security_answer', answer);
    setSecurityAnswer(answer);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isPinSet,
        isLoading,
        pin,
        securityAnswer,
        login,
        logout,
        setNewPin,
        resetPin,
        resetPinWithSecurityAnswer,
        updateSecurityAnswer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};