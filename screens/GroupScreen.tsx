import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, SectionHeader, Button } from '../components/CommonComponents';
import { InputField } from '../components/FormComponents';
import { useNavigation } from '@react-navigation/native';

// Define the types
interface GroupMember {
  id: string;
  name: string;
  paid: number;
  shouldPay: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  members: GroupMember[];
  date: string;
}

const GroupScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // State for groups (initialized as empty)
  const [groups, setGroups] = useState<Group[]>([]);
  
  // State for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupDetailVisible, setGroupDetailVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  // Form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupAmount, setGroupAmount] = useState('');
  const [members, setMembers] = useState<GroupMember[]>([
    { id: '1', name: 'Me', paid: 0, shouldPay: 0 },
  ]);
  
  // Add member
  const addMember = () => {
    const newMember: GroupMember = {
      id: Date.now().toString(),
      name: '',
      paid: 0,
      shouldPay: 0,
    };
    setMembers([...members, newMember]);
  };
  
  // Remove member
  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };
  
  // Update member
  const updateMember = (id: string, field: 'name' | 'paid', value: string | number) => {
    setMembers(
      members.map(member => {
        if (member.id === id) {
          return { ...member, [field]: value };
        }
        return member;
      })
    );
  };
  
  // Calculate even split
  const calculateEvenSplit = (amount: number, membersList: GroupMember[]) => {
    if (!isNaN(amount) && membersList.length > 0) {
      const perPerson = Number((amount / membersList.length).toFixed(2));
      return membersList.map(member => ({
        ...member,
        shouldPay: perPerson,
      }));
    }
    return membersList;
  };
  
  // Save group
  const saveGroup = () => {
    if (groupName.trim() === '') {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }
    
    const amount = parseFloat(groupAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (members.some(m => m.name.trim() === '')) {
      Alert.alert('Error', 'All members must have names');
      return;
    }
    
    // Validate total paid does not exceed total amount
    const totalPaid = members.reduce((sum, member) => sum + member.paid, 0);
    if (totalPaid > amount) {
      Alert.alert('Error', 'Total paid amount cannot exceed the group total amount');
      return;
    }
    
    // Calculate even split for shouldPay
    const updatedMembers = calculateEvenSplit(amount, members);
    
    const newGroup: Group = {
      id: editMode && currentGroup ? currentGroup.id : Date.now().toString(),
      name: groupName,
      description: groupDescription,
      totalAmount: amount,
      members: updatedMembers,
      date: new Date().toISOString().split('T')[0],
    };
    
    if (editMode && currentGroup) {
      setGroups(
        groups.map(group => (group.id === currentGroup.id ? newGroup : group))
      );
    } else {
      setGroups([...groups, newGroup]);
    }
    
    resetForm();
    setModalVisible(false);
  };
  
  // Reset form
  const resetForm = () => {
    setGroupName('');
    setGroupDescription('');
    setGroupAmount('');
    setMembers([{ id: '1', name: 'Me', paid: 0, shouldPay: 0 }]);
    setEditMode(false);
    setCurrentGroup(null);
  };
  
  // Edit group
  const editGroup = (group: Group) => {
    setCurrentGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description);
    setGroupAmount(group.totalAmount.toString());
    setMembers(group.members);
    setEditMode(true);
    setModalVisible(true);
  };
  
  // Delete group
  const deleteGroup = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this group?');
    if (confirmed) {
      setGroups(groups.filter(group => group.id !== id));
    }
  };
  
  // View group details
  const viewGroupDetails = (group: Group) => {
    setSelectedGroup(group);
    setGroupDetailVisible(true);
  };
  
  // Calculate balances (who owes who)
  const calculateBalances = (group: Group) => {
    const members = [...group.members];
    const balances: { from: string; to: string; amount: number }[] = [];
    
    // Calculate total paid and compare with totalAmount
    const totalPaid = Number(members.reduce((sum, member) => sum + member.paid, 0).toFixed(2));
    const totalAmount = Number(group.totalAmount.toFixed(2));
    
    // If total paid doesn't match total amount, show debts
    if (Math.abs(totalPaid - totalAmount) > 0.01) {
      members.forEach(member => {
        const balance = Number((member.paid - member.shouldPay).toFixed(2));
        if (balance < -0.01) {
          balances.push({
            from: member.name,
            to: 'Group',
            amount: Math.abs(balance),
          });
        }
      });
      return balances;
    }
    
    // Calculate net amounts (paid - should pay) with precision fix
    const netAmounts = members.map(m => ({
      id: m.id,
      name: m.name,
      net: Number((m.paid - m.shouldPay).toFixed(2)),
    }));
    
    // Early exit if no members or all balances are zero
    if (netAmounts.length === 0 || netAmounts.every(m => Math.abs(m.net) < 0.01)) {
      return balances;
    }
    
    // Sort by net amount (descending)
    netAmounts.sort((a, b) => b.net - a.net);
    
    // Calculate transfers
    let i = 0; // index for creditors (positive net)
    let j = netAmounts.length - 1; // index for debtors (negative net)
    
    // Add a maximum iteration limit to prevent infinite loops
    const maxIterations = netAmounts.length * netAmounts.length;
    let iterationCount = 0;
    
    while (i < j && iterationCount < maxIterations) {
      const creditor = netAmounts[i];
      const debtor = netAmounts[j];
      
      // Skip if either has near-zero balance
      if (Math.abs(creditor.net) < 0.01) {
        i++;
        continue;
      }
      
      if (Math.abs(debtor.net) < 0.01) {
        j--;
        continue;
      }
      
      // Calculate transfer amount, ensuring precision
      const transferAmount = Number(Math.min(Math.abs(creditor.net), Math.abs(debtor.net)).toFixed(2));
      
      if (transferAmount > 0) {
        balances.push({
          from: debtor.name,
          to: creditor.name,
          amount: transferAmount,
        });
        
        // Update balances with precision
        creditor.net = Number((creditor.net - transferAmount).toFixed(2));
        debtor.net = Number((debtor.net + transferAmount).toFixed(2));
      }
      
      // Move to next member if balance is settled
      if (Math.abs(creditor.net) < 0.01) i++;
      if (Math.abs(debtor.net) < 0.01) j--;
      
      iterationCount++;
    }
    
    // Final check to ensure no infinite loop occurred
    if (iterationCount >= maxIterations) {
      console.warn('Max iterations reached in calculateBalances');
    }
    
    return balances;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SectionHeader title="Groups" icon="users" />
      
      {/* Group List */}
      <FlatList
        data={groups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.groupCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => viewGroupDetails(item)}
          >
            <View style={styles.groupCardHeader}>
              <Text style={[styles.groupName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.groupDate, { color: theme.subtext }]}>{item.date}</Text>
            </View>
            <Text style={[styles.groupDescription, { color: theme.subtext }]}>
              {item.description}
            </Text>
            <View style={styles.groupCardFooter}>
              <Text style={[styles.groupTotal, { color: theme.text }]}>
                Total: ${item.totalAmount.toFixed(2)}
              </Text>
              <Text style={[styles.groupMembers, { color: theme.subtext }]}>
                {item.members.length} members
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={() => editGroup(item)}
              >
                <FontAwesome name="edit" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.error }]}
                onPress={() => deleteGroup(item.id)}
              >
                <FontAwesome name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={50} color={theme.subtext} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No groups yet. Add a new group to get started.
            </Text>
          </View>
        }
      />
      
      {/* Add Group Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <FontAwesome name="plus" size={20} color="#fff" />
      </TouchableOpacity>
      
      {/* Add/Edit Group Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <ScrollView>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editMode ? 'Edit Group' : 'Add New Group'}
              </Text>
              
              <InputField
                label="Group Name"
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                theme={theme}
              />
              
              <InputField
                label="Description"
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="Enter description"
                theme={theme}
              />
              
              <InputField
                label="Total Amount"
                value={groupAmount}
                onChangeText={setGroupAmount}
                placeholder="0.00"
                keyboardType="numeric"
                theme={theme}
              />
              
              <View style={styles.splitButtonContainer}>
                <Button
                  title="Calculate Even Split"
                  onPress={() => setMembers(calculateEvenSplit(parseFloat(groupAmount), members))}
                  type="secondary"
                  theme={theme}
                />
              </View>
              
              <Text style={[styles.membersTitle, { color: theme.text }]}>Members</Text>
              
              {members.map((member, index) => (
                <View key={member.id} style={styles.memberRow}>
                  <View style={styles.memberInputs}>
                    <InputField
                      label={`Name ${index + 1}`}
                      value={member.name}
                      onChangeText={(text) => updateMember(member.id, 'name', text)}
                      placeholder="Enter name"
                      theme={theme}
                      containerStyle={styles.memberNameInput}
                    />
                    <InputField
                      label="Paid"
                      value={member.paid.toString()}
                      onChangeText={(text) => {
                        const value = parseFloat(text) || 0;
                        updateMember(member.id, 'paid', value);
                      }}
                      placeholder="0.00"
                      keyboardType="numeric"
                      theme={theme}
                      containerStyle={styles.memberAmountInput}
                    />
                  </View>
                  
                  {index > 0 && (
                    <TouchableOpacity
                      style={[styles.removeMemberButton, { backgroundColor: theme.error }]}
                      onPress={() => removeMember(member.id)}
                    >
                      <FontAwesome name="trash" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              <TouchableOpacity
                style={[styles.addMemberButton, { backgroundColor: theme.secondary }]}
                onPress={addMember}
              >
                <FontAwesome name="plus" size={16} color="#fff" />
                <Text style={styles.addMemberText}>Add Member</Text>
              </TouchableOpacity>
              
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
                  onPress={saveGroup}
                  theme={theme}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Group Details Modal */}
      <Modal
        visible={groupDetailVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGroupDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <ScrollView>
              {selectedGroup && (
                <>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedGroup.name}
                  </Text>
                  <Text style={[styles.groupDescription, { color: theme.subtext }]}>
                    {selectedGroup.description}
                  </Text>
                  
                  <View style={styles.detailsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Total Amount
                    </Text>
                    <Text style={[styles.totalAmount, { color: theme.primary }]}>
                      ${selectedGroup.totalAmount.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Members
                    </Text>
                    <FlatList
                      data={selectedGroup.members}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                        <View style={[styles.memberItem, { backgroundColor: theme.inputBackground }]}>
                          <Text style={[styles.memberName, { color: theme.text }]}>
                            {item.name}
                          </Text>
                          <View style={styles.memberDetails}>
                            <View style={styles.amountDetail}>
                              <Text style={[styles.amountLabel, { color: theme.subtext }]}>
                                Paid:
                              </Text>
                              <Text style={[styles.amountValue, { color: theme.incomeGreen }]}>
                                ${item.paid.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.amountDetail}>
                              <Text style={[styles.amountLabel, { color: theme.subtext }]}>
                                Should Pay:
                              </Text>
                              <Text style={[styles.amountValue, { color: theme.expenseRed }]}>
                                ${item.shouldPay.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.amountDetail}>
                              <Text style={[styles.amountLabel, { color: theme.subtext }]}>
                                Balance:
                              </Text>
                              <Text
                                style={[
                                  styles.amountValue,
                                  {
                                    color:
                                      item.paid - item.shouldPay > 0
                                        ? theme.incomeGreen
                                        : item.paid - item.shouldPay < 0
                                        ? theme.expenseRed
                                        : theme.text,
                                  },
                                ]}
                              >
                                ${(item.paid - item.shouldPay).toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    />
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Settlement Plan
                    </Text>
                    {calculateBalances(selectedGroup).map((balance, index) => (
                      <View
                        key={index}
                        style={[styles.settlementItem, { backgroundColor: theme.inputBackground }]}
                      >
                        <View style={styles.settlementParties}>
                          <Text style={[styles.settlementFrom, { color: theme.text }]}>
                            {balance.from}
                          </Text>
                          <FontAwesome
                            name="arrow-right"
                            size={16}
                            color={theme.subtext}
                            style={styles.settlementArrow}
                          />
                          <Text style={[styles.settlementTo, { color: theme.text }]}>
                            {balance.to}
                          </Text>
                        </View>
                        <Text style={[styles.settlementAmount, { color: theme.primary }]}>
                          ${balance.amount.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                    
                    {calculateBalances(selectedGroup).length === 0 && (
                      <Text style={[styles.settledText, { color: theme.success }]}>
                        All settled! No payments needed.
                      </Text>
                    )}
                  </View>
                </>
              )}
              
              <View style={styles.modalButtons}>
                <Button
                  title="Close"
                  onPress={() => setGroupDetailVisible(false)}
                  type="secondary"
                  theme={theme}
                />
              </View>
            </ScrollView>
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
  groupCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupDate: {
    fontSize: 12,
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  groupCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupMembers: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInputs: {
    flex: 1,
    flexDirection: 'row',
  },
  memberNameInput: {
    flex: 2,
    marginRight: 8,
  },
  memberAmountInput: {
    flex: 1,
  },
  removeMemberButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  addMemberText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  splitButtonContainer: {
    marginVertical: 10,
  },
  detailsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  memberItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  memberDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountDetail: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  settlementParties: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settlementFrom: {
    fontSize: 16,
  },
  settlementArrow: {
    marginHorizontal: 8,
  },
  settlementTo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settledText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default GroupScreen;