import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinance, Transaction } from '../context/FinanceContext';
import { FontAwesome } from '@expo/vector-icons';
import { Button, AmountDisplay } from '../components/CommonComponents';
import { InputField, SelectField } from '../components/FormComponents';

const FinanceScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    balance,
    income,
    expenses,
  } = useFinance();

  const [selectedTab, setSelectedTab] = useState<'all' | 'income' | 'expense'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const expenseCategories = [
    { label: 'Food', value: 'Food' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Rent', value: 'Rent' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Others', value: 'Others' },
  ];

  useEffect(() => {
    if (type === 'income') {
      setCategory('Income');
    } else {
      setCategory(expenseCategories[0].value);
    }
  }, [type]);

  const filteredTransactions = transactions.filter(tx => {
    if (selectedTab === 'all') return true;
    return tx.type === selectedTab;
  });

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setCurrentTransactionId(transaction.id);
    setType(transaction.type);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setDate(transaction.date);
    setDescription(transaction.description);
    setIsEditing(true);
    setModalVisible(true);
  };

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setCategory(expenseCategories[0].value);
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setCurrentTransactionId(null);
  };

  const handleSubmit = () => {
    if (!amount) return;
    const transactionData = {
      amount: parseFloat(amount),
      category: type === 'income' ? 'Income' : category,
      description,
      date,
      type,
    };

    if (isEditing && currentTransactionId) {
      editTransaction(currentTransactionId, transactionData);
    } else {
      addTransaction(transactionData);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDeleteTransaction = (id: string) => {
    if (Platform.OS === 'web') {
      deleteTransaction(id);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        deleteTransaction(id);
        fadeAnim.setValue(1);
      });
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[styles.transactionCard, { backgroundColor: theme.cardBackground }]}
        onPress={() => openEditModal(item)}
      >
        <View style={styles.transactionContent}>
          <View style={styles.transactionInfo}>
            <Text style={[styles.categoryText, { color: theme.text }]}>{item.category}</Text>
            <Text style={[styles.descriptionText, { color: theme.subtext }]}>
              {item.description || 'No description'}
            </Text>
            <Text style={[styles.dateText, { color: theme.subtext }]}>{item.date}</Text>
          </View>
          <View style={styles.transactionAmount}>
            <AmountDisplay amount={item.amount} type={item.type} />
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTransaction(item.id)}>
              <FontAwesome name="trash" size={18} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* --- HEADER --- */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Finance</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <AmountDisplay amount={balance} size="medium" color="#FFFFFF"/>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <AmountDisplay amount={income} type="income" size="small" color="#FFFFFF"/>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <AmountDisplay amount={expenses} type="expense" size="small" color="#FFFFFF"/>
          </View>
        </View>
      </View>

      {/* --- TABS --- */}
      <View style={styles.tabContainer}>
        {['all', 'income', 'expense'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && [styles.selectedTab, { borderColor: theme.primary }],
            ]}
            onPress={() => setSelectedTab(tab as 'all' | 'income' | 'expense')}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === tab ? theme.primary : theme.subtext },
              ]}
            >
              {tab === 'expense' ? 'Expenses' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- LIST --- */}
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            No transactions found. Add a new transaction to get started.
          </Text>
        </View>
      )}

      {/* --- ADD BUTTON --- */}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={openAddModal}>
        <FontAwesome name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* --- MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {isEditing ? 'Edit Transaction' : 'Add Transaction'}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <FontAwesome name="times" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentButton,
                      type === 'expense' && [styles.selectedSegment, { backgroundColor: theme.expenseRed }],
                    ]}
                    onPress={() => setType('expense')}
                  >
                    <Text style={[styles.segmentText, { color: type === 'expense' ? '#FFF' : theme.subtext }]}>
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.segmentButton,
                      type === 'income' && [styles.selectedSegment, { backgroundColor: theme.incomeGreen }],
                    ]}
                    onPress={() => setType('income')}
                  >
                    <Text style={[styles.segmentText, { color: type === 'income' ? '#FFF' : theme.subtext }]}>
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>

                <InputField label="Amount" value={amount} onChangeText={setAmount} placeholder="Enter amount" keyboardType="numeric" />
                {type === 'expense' && (
                  <SelectField label="Category" value={category} options={expenseCategories} onValueChange={setCategory} placeholder="Select a category" />
                )}
                <InputField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
                <InputField label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Add a description" multiline />
                <Button title={isEditing ? 'Update' : 'Add Transaction'} onPress={handleSubmit} fullWidth />
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 40, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 4 },
  tabContainer: { flexDirection: 'row', marginTop: 16, marginHorizontal: 20, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  selectedTab: { borderBottomWidth: 2 },
  tabText: { fontSize: 16, fontWeight: '500' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  transactionCard: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  transactionContent: { flexDirection: 'row', justifyContent: 'space-between' },
  transactionInfo: { flex: 1 },
  categoryText: { fontSize: 16, fontWeight: '500' },
  descriptionText: { fontSize: 14, marginTop: 2 },
  dateText: { fontSize: 12, marginTop: 4 },
  transactionAmount: { alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' },
  deleteButton: { padding: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  addButton: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, maxHeight: '90%' },
  modalContent: { padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeButton: { padding: 5 },
  formContainer: { width: '100%' },
  segmentedControl: { flexDirection: 'row', marginBottom: 20, borderRadius: 8, overflow: 'hidden' },
  segmentButton: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  selectedSegment: { borderColor: 'transparent' },
  segmentText: { fontSize: 14, fontWeight: '500' },
});

export default FinanceScreen;