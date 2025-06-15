import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/CommonComponents';

const SetupPINScreen: React.FC = () => {
  const { theme } = useTheme();
  const { setNewPin } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [petName, setPetName] = useState<string>('');
  const [step, setStep] = useState<'create' | 'confirm' | 'securityQuestion'>('create');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References to PIN input fields
  const pinInputRefs = Array(4).fill(0).map(() => useRef<TextInput>(null));
  const confirmPinInputRefs = Array(4).fill(0).map(() => useRef<TextInput>(null));

  // Handle PIN input for create PIN step
  const handlePinInput = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const chars = value.split('');
      let pinArray = pin.split('');
      
      chars.forEach((char, charIndex) => {
        if (index + charIndex < 4) {
          pinArray[index + charIndex] = char;
        }
      });
      
      const newPin = pinArray.join('');
      setPin(newPin);
      
      if (newPin.length === 4) {
        setStep('confirm');
        setTimeout(() => {
          confirmPinInputRefs[0].current?.focus();
        }, 100);
      }
      return;
    }

    // Handle single character input
    if (value) {
      // Update the PIN
      const newPin = pin.substring(0, index) + value + pin.substring(index + 1);
      setPin(newPin);

      // Move to next input
      if (index < 3) {
        pinInputRefs[index + 1].current?.focus();
      } else if (newPin.length === 4) {
        setStep('confirm');
        setTimeout(() => {
          confirmPinInputRefs[0].current?.focus();
        }, 100);
      }
    }
  };

  // Handle PIN input for confirm PIN step
  const handleConfirmPinInput = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const chars = value.split('');
      let confirmPinArray = confirmPin.split('');
      
      chars.forEach((char, charIndex) => {
        if (index + charIndex < 4) {
          confirmPinArray[index + charIndex] = char;
        }
      });
      
      const newConfirmPin = confirmPinArray.join('');
      setConfirmPin(newConfirmPin);
      
      if (newConfirmPin.length === 4) {
        if (newConfirmPin === pin) {
          setStep('securityQuestion');
        } else {
          setErrorMessage('PINs do not match. Please try again.');
          resetConfirmPinInputs();
        }
      }
      return;
    }

    // Handle single character input
    if (value) {
      // Update the confirm PIN
      const newConfirmPin = confirmPin.substring(0, index) + value + confirmPin.substring(index + 1);
      setConfirmPin(newConfirmPin);

      // Move to next input
      if (index < 3) {
        confirmPinInputRefs[index + 1].current?.focus();
      } else if (newConfirmPin.length === 4) {
        // Check if PINs match
        if (newConfirmPin === pin) {
          setErrorMessage(null);
          setStep('securityQuestion');
        } else {
          setErrorMessage('PINs do not match. Please try again.');
          resetConfirmPinInputs();
        }
      }
    }
  };

  // Reset confirm PIN inputs
  const resetConfirmPinInputs = () => {
    setConfirmPin('');
    confirmPinInputRefs.forEach(ref => {
      ref.current?.setNativeProps({ text: '' });
    });
    confirmPinInputRefs[0].current?.focus();
  };

  // Handle backspace for create PIN step
  const handleKeyPress = (index: number, key: string, currentRefs: React.RefObject<TextInput>[]) => {
    if (key === 'Backspace' && index > 0 && (step === 'create' ? !pin[index] : !confirmPin[index])) {
      currentRefs[index - 1].current?.focus();
    }
  };

  // Complete PIN setup
  const handleCompleteSetup = () => {
    if (!petName.trim()) {
      Alert.alert('Error', 'Please enter your pet name for PIN recovery.');
      return;
    }

    const success = setNewPin(pin, confirmPin, petName);
    if (!success) {
      Alert.alert('Error', 'There was a problem setting up your PIN. Please try again.');
    }
  };

  // Focus first input on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (step === 'create') {
        pinInputRefs[0].current?.focus();
      } else if (step === 'confirm') {
        confirmPinInputRefs[0].current?.focus();
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [step]);

  // Render PIN input fields
  const renderPinInputs = (
    currentStep: string,
    value: string,
    handleInput: (index: number, value: string) => void,
    refs: React.RefObject<TextInput>[],
    handleKey: (index: number, key: string) => void
  ) => {
    return (
      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TextInput
            key={index}
            ref={refs[index]}
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
            onChangeText={(value) => handleInput(index, value)}
            onKeyPress={({ nativeEvent }) => {
              handleKey(index, nativeEvent.key);
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.container, 
          { backgroundColor: theme.background }
        ]}
      >
        <View style={styles.contentContainer}>
          {step === 'create' && (
            <>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Create PIN</Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>
                  Set a 4-digit PIN to secure your FinMate app
                </Text>
              </View>
              {renderPinInputs(
                'create',
                pin,
                handlePinInput,
                pinInputRefs,
                (index, key) => handleKeyPress(index, key, pinInputRefs)
              )}
            </>
          )}

          {step === 'confirm' && (
            <>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Confirm PIN</Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>
                  Re-enter your 4-digit PIN to confirm
                </Text>
              </View>
              {renderPinInputs(
                'confirm',
                confirmPin,
                handleConfirmPinInput,
                confirmPinInputRefs,
                (index, key) => handleKeyPress(index, key, confirmPinInputRefs)
              )}
              {errorMessage && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errorMessage}</Text>
              )}
            </>
          )}

          {step === 'securityQuestion' && (
            <>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Set Recovery Question</Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>
                  For PIN recovery, enter your pet name
                </Text>
              </View>
              <View style={styles.securityQuestionContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  What is your pet name?
                </Text>
                <TextInput
                  style={[
                    styles.lastExpenseInput,
                    {
                      borderColor: theme.border,
                      color: theme.text,
                      backgroundColor: theme.inputBackground,
                    },
                  ]}
                  value={petName}
                  onChangeText={setPetName}
                  placeholder="Enter your pet name"
                  placeholderTextColor={theme.subtext}
                />
                <Text style={[styles.helperText, { color: theme.subtext }]}>
                  This will be used as a security question if you forget your PIN
                </Text>
                <Button
                  title="Complete Setup"
                  onPress={handleCompleteSetup}
                  style={styles.completeButton}
                  fullWidth
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
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
  securityQuestionContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  lastExpenseInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  completeButton: {
    marginTop: 16,
  },
});

export default SetupPINScreen;