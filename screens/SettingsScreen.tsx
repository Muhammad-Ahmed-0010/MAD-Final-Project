import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, SectionHeader } from '../components/CommonComponents';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { logout, resetPin } = useAuth();
  const navigation = useNavigation();
  
  // Reset PIN modal state
  const [resetPinModalVisible, setResetPinModalVisible] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  
  // About modal state
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  
  // Confirm logout
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'PIN' }],
    });
  };
  
  // Handle PIN reset
  const handleResetPin = () => {
    // Reset any previous errors
    setResetError(null);
    
    // Basic validation
    if (currentPin.length !== 4) {
      setResetError('Current PIN must be 4 digits');
      return;
    }
    
    if (newPin.length !== 4) {
      setResetError('New PIN must be 4 digits');
      return;
    }
    
    if (newPin !== confirmPin) {
      setResetError('New PIN and confirmation do not match');
      return;
    }
    
    if (securityAnswer.trim() === '') {
      setResetError('Security answer cannot be empty');
      return;
    }
    
    // Call the resetPin function from AuthContext (implement proper checks in the AuthContext)
    const success = resetPin(currentPin, newPin, securityAnswer);
    
    if (success) {
      Alert.alert('Success', 'Your PIN has been reset successfully');
      setResetPinModalVisible(false);
      clearResetForm();
    } else {
      setResetError('PIN reset failed. Please check your current PIN or security answer.');
    }
  };
  
  // Clear reset form
  const clearResetForm = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setSecurityAnswer('');
    setResetError(null);
  };
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <SectionHeader title="Settings" icon="cog" />
      
      {/* Appearance Section */}
      <Card style={{ backgroundColor: theme.cardBackground }}>
        <View style={styles.sectionTitleContainer}>
          <FontAwesome name="paint-brush" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={'#fff'}
          />
        </View>
      </Card>
      
      {/* Security Section */}
      <Card style={{ backgroundColor: theme.cardBackground }}>
        <View style={styles.sectionTitleContainer}>
          <FontAwesome name="lock" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Security</Text>
        </View>
        
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => setResetPinModalVisible(true)}
        >
          <View style={styles.settingButtonContent}>
            <FontAwesome name="key" size={18} color={theme.primary} />
            <Text style={[styles.settingButtonText, { color: theme.text }]}>Change PIN</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={theme.subtext} />
        </TouchableOpacity>
      </Card>
      
      {/* About Section */}
      <Card style={{ backgroundColor: theme.cardBackground }}>
        <View style={styles.sectionTitleContainer}>
          <FontAwesome name="info-circle" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
        </View>
        
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => setAboutModalVisible(true)}
        >
          <View style={styles.settingButtonContent}>
            <FontAwesome name="question-circle" size={18} color={theme.primary} />
            <Text style={[styles.settingButtonText, { color: theme.text }]}>
              About FinMate
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={theme.subtext} />
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Version</Text>
          <Text style={[styles.settingValue, { color: theme.subtext }]}>1.0.0</Text>
        </View>
      </Card>
      
      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.error }]}
        onPress={handleLogout}
      >
        <FontAwesome name="sign-out" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      {/* Reset PIN Modal */}
      <Modal
        visible={resetPinModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setResetPinModalVisible(false);
          clearResetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Change PIN</Text>
            
            {resetError && (
              <View style={[styles.errorContainer, { backgroundColor: theme.error + '20' }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>{resetError}</Text>
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Current PIN</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Enter current PIN"
                placeholderTextColor={theme.subtext}
                value={currentPin}
                onChangeText={setCurrentPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>New PIN</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Enter new PIN"
                placeholderTextColor={theme.subtext}
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm New PIN</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Confirm new PIN"
                placeholderTextColor={theme.subtext}
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Security Question: What was your last expense?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Enter your answer"
                placeholderTextColor={theme.subtext}
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setResetPinModalVisible(false);
                  clearResetForm();
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.primary }]}
                onPress={handleResetPin}
              >
                <Text style={styles.confirmButtonText}>Change PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* About Modal */}
      <Modal
        visible={aboutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>About FinMate</Text>
            
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: theme.primary }]}>
                <Text style={styles.logoText}>$</Text>
              </View>
              <Text style={[styles.appName, { color: theme.text }]}>FinMate</Text>
            </View>
            
            <Text style={[styles.aboutText, { color: theme.text }]}>
              FinMate is your personal finance companion, designed to help you track your income and expenses,
              manage group expenses, set savings goals, and keep useful financial tips.
            </Text>
            
            <Text style={[styles.versionText, { color: theme.subtext }]}>Version 1.0.0</Text>
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
  },
  confirmButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default SettingsScreen;