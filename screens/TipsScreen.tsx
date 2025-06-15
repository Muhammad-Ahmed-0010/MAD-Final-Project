import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, SectionHeader, Button } from '../components/CommonComponents';
import { InputField } from '../components/FormComponents';
import { useNavigation } from '@react-navigation/native';

// Define types
interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  pinned: boolean;
}

const TipsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // Sample tip categories
  const tipCategories = ['Budgeting', 'Savings', 'Investments', 'Debt Management', 'General'];
  
  // Initial sample data
  const [tips, setTips] = useState<Tip[]>([
    {
      id: '1',
      title: 'Create an Emergency Fund',
      content:
        'Always keep at least 3-6 months of expenses in an easily accessible account for unexpected emergencies.',
      category: 'Savings',
      createdAt: '2023-05-10',
      pinned: true,
    },
    {
      id: '2',
      title: '50/30/20 Rule',
      content:
        'Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment for a balanced budget.',
      category: 'Budgeting',
      createdAt: '2023-05-15',
      pinned: false,
    },
    {
      id: '3',
      title: 'Pay Off High-Interest Debt First',
      content:
        'Focus on paying off high-interest debts before low-interest ones to minimize the total amount you pay over time.',
      category: 'Debt Management',
      createdAt: '2023-05-20',
      pinned: true,
    },
  ]);
  
  // States for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  
  // Form states
  const [tipTitle, setTipTitle] = useState('');
  const [tipContent, setTipContent] = useState('');
  const [tipCategory, setTipCategory] = useState(tipCategories[0]);
  const [tipPinned, setTipPinned] = useState(false);
  
  // Reset form
  const resetForm = () => {
    setTipTitle('');
    setTipContent('');
    setTipCategory(tipCategories[0]);
    setTipPinned(false);
    setEditMode(false);
    setCurrentTip(null);
  };
  
  // Save tip
  const saveTip = () => {
    if (tipTitle.trim() === '') {
      Alert.alert('Error', 'Tip title cannot be empty');
      return;
    }
    
    if (tipContent.trim() === '') {
      Alert.alert('Error', 'Tip content cannot be empty');
      return;
    }
    
    const newTip: Tip = {
      id: editMode && currentTip ? currentTip.id : Date.now().toString(),
      title: tipTitle,
      content: tipContent,
      category: tipCategory,
      createdAt: editMode && currentTip ? currentTip.createdAt : new Date().toISOString().split('T')[0],
      pinned: tipPinned,
    };
    
    if (editMode && currentTip) {
      setTips(tips.map(tip => (tip.id === currentTip.id ? newTip : tip)));
    } else {
      setTips([newTip, ...tips]);
    }
    
    resetForm();
    setModalVisible(false);
  };
  
  // Edit tip
  const editTip = (tip: Tip) => {
    setCurrentTip(tip);
    setTipTitle(tip.title);
    setTipContent(tip.content);
    setTipCategory(tip.category);
    setTipPinned(tip.pinned);
    setEditMode(true);
    setModalVisible(true);
  };
  
  // Delete tip
  const deleteTip = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this tip?');
    if (confirmed) {
      setTips(tips.filter(tip => tip.id !== id));
    }
  };
  
  // Toggle pin status
  const togglePinned = (id: string) => {
    setTips(
      tips.map(tip => {
        if (tip.id === id) {
          return { ...tip, pinned: !tip.pinned };
        }
        return tip;
      })
    );
  };
  
  // View tip details
  const viewTipDetails = (tip: Tip) => {
    setSelectedTip(tip);
    setDetailsModalVisible(true);
  };
  
  // Filter tips
  const filteredTips = tips
    .filter(tip => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || tip.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by pinned first, then by creation date
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SectionHeader title="Financial Tips" icon="lightbulb" />
      
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground }]}>
          <FontAwesome name="search" size={16} color={theme.subtext} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search tips..."
            placeholderTextColor={theme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times" size={16} color={theme.subtext} />
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
          <TouchableOpacity
            style={([styles.categoryChip, {
                backgroundColor: !selectedCategory ? theme.primary : theme.inputBackground,
              }])}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[styles.categoryChipText, { color: !selectedCategory ? '#fff' : theme.text }]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {tipCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={([styles.categoryChip, {
                  backgroundColor:
                    selectedCategory === category ? theme.primary : theme.inputBackground,
                }])}
              onPress={() => {
                setSelectedCategory(selectedCategory === category ? null : category);
              }}
            >
              <Text
                style={[styles.categoryChipText, { color: selectedCategory === category ? '#fff' : theme.text }]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Tips List */}
      <FlatList
        data={filteredTips}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tipCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => viewTipDetails(item)}
          >
            <View style={styles.tipCardHeader}>
              <View style={styles.tipTitleRow}>
                <Text style={[styles.tipTitle, { color: theme.text }]}>{item.title}</Text>
                {item.pinned && (
                  <FontAwesome name="thumb-tack" size={16} color={theme.primary} />
                )}
              </View>
              <Text style={[styles.tipCategory, { color: theme.primary }]}>
                {item.category}
              </Text>
            </View>
            
            <Text
              style={[styles.tipContent, { color: theme.subtext }]}
              numberOfLines={3}
            >
              {item.content}
            </Text>
            
            <View style={styles.tipCardFooter}>
              <Text style={[styles.tipDate, { color: theme.subtext }]}>
                {item.createdAt}
              </Text>
              
              <View style={styles.tipActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                  onPress={() => togglePinned(item.id)}
                >
                  <FontAwesome
                    name={item.pinned ? 'thumb-tack' : 'thumb-tack'}
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.primary }]}
                  onPress={() => editTip(item)}
                >
                  <FontAwesome name="edit" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.error }]}
                  onPress={() => deleteTip(item.id)}
                >
                  <FontAwesome name="trash" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="lightbulb" size={50} color={theme.subtext} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No tips found. Add a new tip or adjust your filters.
            </Text>
          </View>
        }
      />
      
      {/* Add Tip Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <FontAwesome name="plus" size={20} color="#fff" />
      </TouchableOpacity>
      
      {/* Add/Edit Tip Modal */}
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
              {editMode ? 'Edit Tip' : 'Add New Tip'}
            </Text>
            
            <ScrollView>
              <InputField
                label="Title"
                value={tipTitle}
                onChangeText={setTipTitle}
                placeholder="Enter tip title"
                theme={theme}
              />
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Content</Text>
                <TextInput
                  style={[
                    styles.contentInput,
                    {
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  multiline
                  numberOfLines={6}
                  value={tipContent}
                  onChangeText={setTipContent}
                  placeholder="Enter tip content..."
                  placeholderTextColor={theme.subtext}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {tipCategories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor:
                            tipCategory === category ? theme.primary : theme.inputBackground,
                          marginRight: 8,
                        },
                      ]}
                      onPress={() => setTipCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: tipCategory === category ? '#fff' : theme.text },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <TouchableOpacity
                style={styles.pinnedContainer}
                onPress={() => setTipPinned(!tipPinned)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme.primary,
                      backgroundColor: tipPinned ? theme.primary : 'transparent',
                    },
                  ]}
                >
                  {tipPinned && <FontAwesome name="check" size={12} color="#fff" />}
                </View>
                <Text style={[styles.pinnedText, { color: theme.text }]}>Pin this tip</Text>
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
                  onPress={saveTip}
                  theme={theme}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Tip Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            {selectedTip && (
              <>
                <View style={styles.detailsHeader}>
                  <Text style={[styles.detailsTitle, { color: theme.text }]}>
                    {selectedTip.title}
                  </Text>
                  {selectedTip.pinned && (
                    <FontAwesome name="thumb-tack" size={16} color={theme.primary} />
                  )}
                </View>
                
                <View style={styles.detailsCategory}>
                  <Text style={[styles.detailsCategoryText, { color: theme.primary }]}>
                    {selectedTip.category}
                  </Text>
                </View>
                
                <ScrollView style={styles.detailsContentContainer}>
                  <Text style={[styles.detailsContent, { color: theme.text }]}>
                    {selectedTip.content}
                  </Text>
                </ScrollView>
                
                <View style={styles.detailsFooter}>
                  <Text style={[styles.detailsDate, { color: theme.subtext }]}>
                    Created: {selectedTip.createdAt}
                  </Text>
                  
                  <View style={styles.detailsActions}>
                    <Button
                      title="Edit"
                      onPress={() => {
                        setDetailsModalVisible(false);
                        editTip(selectedTip);
                      }}
                      type="secondary"
                      theme={theme}
                    />
                    <Button
                      title="Close"
                      onPress={() => setDetailsModalVisible(false)}
                      theme={theme}
                    />
                  </View>
                </View>
              </>
            )}
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
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 4,
    fontSize: 16,
  },
  categoryFilter: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tipCardHeader: {
    marginBottom: 8,
  },
  tipTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  tipCategory: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tipCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipDate: {
    fontSize: 12,
  },
  tipActions: {
    flexDirection: 'row',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  pinnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pinnedText: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  detailsCategory: {
    marginBottom: 16,
  },
  detailsCategoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailsContentContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  detailsContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  detailsDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  detailsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default TipsScreen;