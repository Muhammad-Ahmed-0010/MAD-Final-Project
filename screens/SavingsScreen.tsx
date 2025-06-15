import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, SectionHeader, Button, ProgressBar } from '../components/CommonComponents';
import { InputField } from '../components/FormComponents';
import { useNavigation } from '@react-navigation/native';

// Define types
interface SavingGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  completed: boolean;
}

const SavingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // Initial sample data
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([
    
  ]);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<SavingGoal | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');
  
  // Form states
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalSaved, setGoalSaved] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  
  // Reset form
  const resetForm = () => {
    setGoalTitle('');
    setGoalDescription('');
    setGoalAmount('');
    setGoalSaved('');
    setGoalDeadline('');
    setEditMode(false);
    setCurrentGoal(null);
  };
  
  // Save goal
  const saveGoal = () => {
    if (goalTitle.trim() === '') {
      window.confirm('Error: Goal title cannot be empty');
      return;
    }
    
    const targetAmount = parseFloat(goalAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      window.confirm('Error: Please enter a valid target amount');
      return;
    }
    
    const savedAmount = parseFloat(goalSaved || '0');
    if (isNaN(savedAmount) || savedAmount < 0) {
      window.confirm('Error: Please enter a valid saved amount');
      return;
    }
    
    if (savedAmount > targetAmount) {
      window.confirm('Error: Saved amount cannot exceed target amount');
      return;
    }
    
    if (goalDeadline.trim() === '') {
      window.confirm('Error: Please select a deadline');
      return;
    }
    
    const newGoal: SavingGoal = {
      id: editMode && currentGoal ? currentGoal.id : Date.now().toString(),
      title: goalTitle,
      description: goalDescription,
      targetAmount: targetAmount,
      savedAmount: savedAmount,
      deadline: goalDeadline,
      completed: savedAmount >= targetAmount,
    };
    
    if (editMode && currentGoal) {
      setSavingGoals(
        savingGoals.map(goal => (goal.id === currentGoal.id ? newGoal : goal))
      );
    } else {
      setSavingGoals([...savingGoals, newGoal]);
    }
    
    resetForm();
    setModalVisible(false);
  };
  
  // Edit goal
  const editGoal = (goal: SavingGoal) => {
    setCurrentGoal(goal);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description);
    setGoalAmount(goal.targetAmount.toString());
    setGoalSaved(goal.savedAmount.toString());
    setGoalDeadline(goal.deadline);
    setEditMode(true);
    setModalVisible(true);
  };
  
  // Delete goal
  const deleteGoal = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this savings goal?');
    if (confirmed) {
      setSavingGoals(savingGoals.filter(goal => goal.id !== id));
    }
  };
  
  const openUpdateModal = (id: string) => {
    const goal = savingGoals.find(g => g.id === id);
    if (goal) {
      setSelectedGoalId(id);
      setUpdateAmount('');
      setUpdateModalVisible(true);
    }
  };
  
  const updateSavedAmount = () => {
    if (!selectedGoalId) return;
    
    const amount = parseFloat(updateAmount);
    if (isNaN(amount) || amount <= 0) {
      window.confirm('Error: Please enter a valid amount');
      return;
    }
    
    setSavingGoals(
      savingGoals.map(goal => {
        if (goal.id === selectedGoalId) {
          const newAmount = goal.savedAmount + amount;
          const completed = newAmount >= goal.targetAmount;
          
          return {
            ...goal,
            savedAmount: completed ? goal.targetAmount : newAmount,
            completed,
          };
        }
        return goal;
      })
    );
    
    setUpdateModalVisible(false);
    setSelectedGoalId(null);
    setUpdateAmount('');
  };
  
  // Calculate progress percentage
  const calculateProgress = (saved: number, target: number) => {
    return Math.min((saved / target) * 100, 100);
  };
  
  // Format date to display remaining days
  const formatDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    
    // If deadline is in the past, return "Expired"
    if (deadlineDate < today) {
      return 'Expired';
    }
    
    // Calculate days remaining
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} days left`;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SectionHeader title="Savings Goals" icon="piggy-bank" />
      
      {/* Goals List */}
      <FlatList
        data={savingGoals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.goalCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleRow}>
                <Text style={[styles.goalTitle, { color: theme.text }]}>{item.title}</Text>
                {item.completed && (
                  <View style={[styles.completedBadge, { backgroundColor: theme.success }]}>
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.goalDescription, { color: theme.subtext }]}>
                {item.description}
              </Text>
            </View>
            
            <View style={styles.goalProgress}>
              <View style={styles.goalAmounts}>
                <Text style={[styles.savedAmount, { color: theme.primary }]}>
                  ${item.savedAmount.toFixed(2)}
                </Text>
                <Text style={[styles.targetAmount, { color: theme.subtext }]}>
                  of ${item.targetAmount.toFixed(2)}
                </Text>
              </View>
              
              <ProgressBar
                progress={calculateProgress(item.savedAmount, item.targetAmount)}
                color={item.completed ? theme.success : theme.primary}
                backgroundColor={theme.border}
              />
              
              <View style={styles.goalFooter}>
                <Text style={[styles.deadline, { color: theme.subtext }]}>
                  {formatDeadline(item.deadline)}
                </Text>
                <Text style={[styles.progressText, { color: theme.text }]}>
                  {Math.round(calculateProgress(item.savedAmount, item.targetAmount))}%
                </Text>
              </View>
            </View>
            
            <View style={styles.goalActions}>
              {!item.completed && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.primary }]}
                  onPress={() => openUpdateModal(item.id)}
                >
                  <FontAwesome name="plus" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Update</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                onPress={() => editGoal(item)}
              >
                <FontAwesome name="edit" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.error }]}
                onPress={() => deleteGoal(item.id)}
              >
                <FontAwesome name="trash" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="piggy-bank" size={50} color={theme.subtext} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No savings goals yet. Add a new goal to get started.
            </Text>
          </View>
        }
      />
      
      {/* Add Goal Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <FontAwesome name="plus" size={20} color="#fff" />
      </TouchableOpacity>
      
      {/* Add/Edit Goal Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editMode ? 'Edit Savings Goal' : 'Add New Savings Goal'}
            </Text>
            
            <ScrollView>
              <InputField
                label="Goal Title"
                value={goalTitle}
                onChangeText={setGoalTitle}
                placeholder="Enter goal title"
                theme={theme}
              />
              
              <InputField
                label="Description (optional)"
                value={goalDescription}
                onChangeText={setGoalDescription}
                placeholder="Enter description"
                theme={theme}
              />
              
              <InputField
                label="Target Amount"
                value={goalAmount}
                onChangeText={setGoalAmount}
                placeholder="0.00"
                keyboardType="numeric"
                theme={theme}
              />
              
              <InputField
                label="Amount Already Saved"
                value={goalSaved}
                onChangeText={setGoalSaved}
                placeholder="0.00"
                keyboardType="numeric"
                theme={theme}
              />
              
              <InputField
                label="Target Date"
                value={goalDeadline}
                onChangeText={setGoalDeadline}
                placeholder="YYYY-MM-DD"
                theme={theme}
              />
              
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  type="secondary"
                  theme={theme}
                />
                <Button
                  title={editMode ? 'Update' : 'Save'}
                  onPress={saveGoal}
                  theme={theme}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Update Amount Modal */}
      <Modal
        visible={updateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setUpdateModalVisible(false);
          setSelectedGoalId(null);
          setUpdateAmount('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.updateModalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Update Savings</Text>
            
            <InputField
              label="Amount to Add"
              value={updateAmount}
              onChangeText={setUpdateAmount}
              placeholder="0.00"
              keyboardType="numeric"
              theme={theme}
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setUpdateModalVisible(false);
                  setSelectedGoalId(null);
                  setUpdateAmount('');
                }}
                type="secondary"
                theme={theme}
              />
              <Button title="Add" onPress={updateSavedAmount} theme={theme} />
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
    padding: 16,
  },
  goalCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  goalHeader: {
    marginBottom: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalDescription: {
    fontSize: 14,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalProgress: {
    marginBottom: 16,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  savedAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  targetAmount: {
    fontSize: 14,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  deadline: {
    fontSize: 14,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
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
    maxHeight: '80%',
  },
  updateModalContent: {
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default SavingsScreen;