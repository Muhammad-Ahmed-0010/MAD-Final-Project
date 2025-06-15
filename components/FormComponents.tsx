import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// --- InputField (unchanged) ---
export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  error,
  style,
  containerStyle,
  labelStyle,
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  maxLength,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: theme.text }, labelStyle]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? theme.error : theme.border,
            color: theme.text,
            backgroundColor: theme.inputBackground,
          },
          multiline && { height: 100, textAlignVertical: 'top' },
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.subtext}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
      />
      {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
    </View>
  );
};

// --- Updated SelectField (with modal dropdown) ---
export const SelectField = ({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Select an option',
  error,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val) => {
    onValueChange(val);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <TouchableOpacity
        style={[
          styles.selectContainer,
          {
            borderColor: error ? theme.error : theme.border,
            backgroundColor: theme.inputBackground,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: value ? theme.text : theme.subtext, flex: 1 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <FontAwesome name="chevron-down" size={16} color={theme.subtext} />
      </TouchableOpacity>

      {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.inputBackground }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={{ color: theme.text, fontSize: 16 }}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- Optional: unchanged Checkbox and RadioButton if needed later ---

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  selectContainer: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 8,
    padding: 16,
    maxHeight: 300,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});
