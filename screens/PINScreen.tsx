import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  Modal,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/CommonComponents';
import { useNavigation } from '@react-navigation/native';

const PINScreen = () => {
  const { theme } = useTheme();
  const { login, isPinSet, resetPinWithSecurityAnswer } = useAuth();
  const navigation = useNavigation();
  const [pin, setPin] = useState<string>('');
  const [showForgotPinDialog, setShowForgotPinDialog] = useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPin, setNewPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References to PIN input fields
  const pinInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Handle PIN input
  const handlePinInput = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste event by distributing characters
      const chars = value.split('');
      let pinArray = pin.split('');
      
      chars.forEach((char, charIndex) => {
        if (index + charIndex < 4) {
          pinArray[index + charIndex] = char;
          if (pinInputRefs[index + charIndex]?.current) {
            pinInputRefs[index + charIndex].current?.setNativeProps({ text: char });
          }
        }
      });
      
      const newPin = pinArray.join('');
      setPin(newPin);
      
      if (newPin.length === 4) {
        handleLogin(newPin);
      } else if (index + chars.length < 4) {
        pinInputRefs[index + chars.length]?.current?.focus();
      }
      return;
    }

    // Handle single character input
    if (value) {
      // Update the PIN
      const newPin = pin.substring(0, index) + value + pin.substring(index + 1);
      setPin(newPin);

      // Move to next input if available
      if (index < 3) {
        pinInputRefs[index + 1]?.current?.focus();
      } else if (newPin.length === 4) {
        // Try to login when PIN is complete
        handleLogin(newPin);
        Keyboard.dismiss();
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && index > 0 && !pin[index]) {
      pinInputRefs[index - 1]?.current?.focus();
    }
  };

  // Handle login attempt
  const handleLogin = (currentPin: string) => {
    setErrorMessage(null);
    
    if (login(currentPin)) {
      // Navigation will be handled by App.tsx via the isAuthenticated state
    } else {
      setErrorMessage('Incorrect PIN. Please try again.');
      // Reset PIN input fields
      setPin('');
      pinInputRefs.forEach((ref) => {
        ref.current?.setNativeProps({ text: '' });
      });
      pinInputRefs[0].current?.focus();
    }
  };

  // Handle forgot PIN
  const handleForgotPin = () => {
    setShowForgotPinDialog(true);
  };

  // Handle create new user
  const handleCreateNewUser = () => {
    setShowNewUserDialog(false);
    navigation.navigate('SetupPIN' as never);
  };

  // Reset PIN with security answer
  const handlePinReset = () => {
    if (newPin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }
    
    if (resetPinWithSecurityAnswer(securityAnswer, newPin)) {
      Alert.alert('PIN Reset', 'Your PIN has been reset successfully.');
      setShowForgotPinDialog(false);
      setSecurityAnswer('');
      setNewPin('');
    } else {
      Alert.alert('Error', 'Security answer is incorrect. Please try again.');
    }
  };

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      pinInputRefs[0].current?.focus();
    }, 100);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!showForgotPinDialog ? (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Enter PIN</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Please enter your 4-digit PIN to access FinMate
            </Text>
          </View>

          <View style={styles.pinContainer}>
            {[0, 1, 2, 3].map((index) => (
              <TextInput
                key={index}
                ref={pinInputRefs[index]}
                style={[
                  styles.pinInput,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.inputBackground,
                  },
                ]}
                keyboardType="numeric"
                maxLength={1}
                secureTextEntry={true}
                onChangeText={(value) => handlePinInput(index, value)}
                onKeyPress={({ nativeEvent }) => {
                  handleKeyPress(index, nativeEvent.key);
                }}
              />
            ))}
          </View>

          {errorMessage && (
            <Text style={[styles.errorText, { color: theme.error }]}>{errorMessage}</Text>
          )}

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleForgotPin}>
              <Text style={{ color: theme.primary }}>Forgot PIN?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowNewUserDialog(true)}
            >
              <Text style={{ color: theme.primary }}>New User?</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                setShowForgotPinDialog(false);
                setSecurityAnswer('');
                setNewPin('');
              }}
            >
              <FontAwesome name="chevron-left" size={16} color={theme.primary} />
              <Text style={[styles.backButtonText, { color: theme.primary }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Reset PIN</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Answer your security question to reset your PIN
            </Text>
          </View>

          <View style={styles.forgotPinForm}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>What is your pet name?</Text>
            <TextInput
              style={[
                styles.securityInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.inputBackground,
                },
              ]}
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              placeholder="Enter your pet name"
              placeholderTextColor={theme.subtext}
            />

            <Text style={[styles.inputLabel, { color: theme.text, marginTop: 16 }]}>New PIN</Text>
            <TextInput
              style={[
                styles.securityInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.inputBackground,
                },
              ]}
              value={newPin}
              onChangeText={setNewPin}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor={theme.subtext}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={true}
            />

            <Button
              title="Reset PIN"
              onPress={handlePinReset}
              style={styles.resetButton}
            />
          </View>
        </>
      )}

      {/* New User Modal */}
      <Modal
        visible={showNewUserDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNewUserDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create New User</Text>
            <Text style={[styles.modalText, { color: theme.subtext }]}>
              Do you want to set up a new PIN and create a new user profile? This will replace any existing user data.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { borderColor: theme.border }]} 
                onPress={() => setShowNewUserDialog(false)}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.primary }]} 
                onPress={handleCreateNewUser}
              >
                <Text style={{ color: '#fff' }}>Create New User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    maxWidth: 280,
  },
  pinInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    maxWidth: 280,
    marginTop: 24,
  },
  actionButton: {
    padding: 8,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
  },
  forgotPinForm: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  securityInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  resetButton: {
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
});

export default PINScreen;