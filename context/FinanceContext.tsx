import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

// Types
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  expenses: GroupExpense[];
}

export interface GroupExpense {
  id: string;
  amount: number;
  description: string;
  date: string;
  paidBy: string;
  splitWith: { name: string; amount: number }[];
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description: string;
  completed: boolean;
}

export interface Tip {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface FinanceContextType {
  // Transaction management
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, transaction: Partial<Transaction>) => void;
  
  // Balance calculation
  balance: number;
  income: number;
  expenses: number;
  
  // Expense categories
  getExpensesByCategory: () => { category: string; total: number }[];

  // Group management
  groups: Group[];
  addGroup: (group: Omit<Group, 'id'>) => void;
  deleteGroup: (id: string) => void;
  editGroup: (id: string, group: Partial<Group>) => void;
  addGroupExpense: (groupId: string, expense: Omit<GroupExpense, 'id'>) => void;
  editGroupExpense: (groupId: string, expenseId: string, expense: Partial<GroupExpense>) => void;
  deleteGroupExpense: (groupId: string, expenseId: string) => void;
  
  // Saving goals
  savingGoals: SavingGoal[];
  addSavingGoal: (goal: Omit<SavingGoal, 'id'>) => void;
  deleteSavingGoal: (id: string) => void;
  editSavingGoal: (id: string, goal: Partial<SavingGoal>) => void;
  addToSavingGoal: (id: string, amount: number) => void;
  
  // Tips
  tips: Tip[];
  addTip: (tip: Omit<Tip, 'id'>) => void;
  deleteTip: (id: string) => void;
  editTip: (id: string, tip: Partial<Tip>) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateLastExpense } = useAuth();
  
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);

  // Derived state
  const balance = transactions.reduce(
    (total, tx) => (tx.type === 'income' ? total + tx.amount : total - tx.amount),
    0
  );
  
  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((total, tx) => total + tx.amount, 0);
  
  const expenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((total, tx) => total + tx.amount, 0);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem('@finance_transactions');
        const storedGroups = await AsyncStorage.getItem('@finance_groups');
        const storedSavingGoals = await AsyncStorage.getItem('@finance_saving_goals');
        const storedTips = await AsyncStorage.getItem('@finance_tips');
        
        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        }
        
        if (storedGroups) {
          setGroups(JSON.parse(storedGroups));
        }
        
        if (storedSavingGoals) {
          setSavingGoals(JSON.parse(storedSavingGoals));
        }
        
        if (storedTips) {
          setTips(JSON.parse(storedTips));
        }
      } catch (error) {
        console.error('Error loading finance data:', error);
      }
    };
    
    loadData();
  }, []);

  // Save data to storage whenever state changes
  useEffect(() => {
    AsyncStorage.setItem('@finance_transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    AsyncStorage.setItem('@finance_groups', JSON.stringify(groups));
  }, [groups]);
  
  useEffect(() => {
    AsyncStorage.setItem('@finance_saving_goals', JSON.stringify(savingGoals));
  }, [savingGoals]);
  
  useEffect(() => {
    AsyncStorage.setItem('@finance_tips', JSON.stringify(tips));
  }, [tips]);

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    
    setTransactions((prev) => [newTransaction, ...prev]);
    
    if (transaction.type === 'expense') {
      // Update last expense for PIN recovery
      updateLastExpense(transaction.amount.toString(), transaction.category);
    }
  };
  
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };
  
  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  };

  // Category analysis
  const getExpensesByCategory = () => {
    const expensesByCategory = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => {
        const existing = acc.find((item) => item.category === tx.category);
        if (existing) {
          existing.total += tx.amount;
        } else {
          acc.push({ category: tx.category, total: tx.amount });
        }
        return acc;
      }, [] as { category: string; total: number }[]);
    
    return expensesByCategory.sort((a, b) => b.total - a.total);
  };

  // Group functions
  const addGroup = (group: Omit<Group, 'id'>) => {
    const newGroup = {
      ...group,
      id: Date.now().toString(),
    };
    setGroups((prev) => [...prev, newGroup]);
  };
  
  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== id));
  };
  
  const editGroup = (id: string, updates: Partial<Group>) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === id ? { ...group, ...updates } : group))
    );
  };
  
  const addGroupExpense = (groupId: string, expense: Omit<GroupExpense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, expenses: [...group.expenses, newExpense] }
          : group
      )
    );
  };
  
  const editGroupExpense = (groupId: string, expenseId: string, updates: Partial<GroupExpense>) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              expenses: group.expenses.map((expense) =>
                expense.id === expenseId ? { ...expense, ...updates } : expense
              ),
            }
          : group
      )
    );
  };
  
  const deleteGroupExpense = (groupId: string, expenseId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              expenses: group.expenses.filter((expense) => expense.id !== expenseId),
            }
          : group
      )
    );
  };

  // Saving goals functions
  const addSavingGoal = (goal: Omit<SavingGoal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      completed: false,
    };
    setSavingGoals((prev) => [...prev, newGoal]);
  };
  
  const deleteSavingGoal = (id: string) => {
    setSavingGoals((prev) => prev.filter((goal) => goal.id !== id));
  };
  
  const editSavingGoal = (id: string, updates: Partial<SavingGoal>) => {
    setSavingGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
    );
  };
  
  const addToSavingGoal = (id: string, amount: number) => {
    setSavingGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id) {
          const newCurrentAmount = goal.currentAmount + amount;
          return {
            ...goal,
            currentAmount: newCurrentAmount,
            completed: newCurrentAmount >= goal.targetAmount,
          };
        }
        return goal;
      })
    );
  };

  // Tips functions
  const addTip = (tip: Omit<Tip, 'id'>) => {
    const newTip = {
      ...tip,
      id: Date.now().toString(),
    };
    setTips((prev) => [...prev, newTip]);
  };
  
  const deleteTip = (id: string) => {
    setTips((prev) => prev.filter((tip) => tip.id !== id));
  };
  
  const editTip = (id: string, updates: Partial<Tip>) => {
    setTips((prev) =>
      prev.map((tip) => (tip.id === id ? { ...tip, ...updates } : tip))
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        editTransaction,
        balance,
        income,
        expenses,
        getExpensesByCategory,
        groups,
        addGroup,
        deleteGroup,
        editGroup,
        addGroupExpense,
        editGroupExpense,
        deleteGroupExpense,
        savingGoals,
        addSavingGoal,
        deleteSavingGoal,
        editSavingGoal,
        addToSavingGoal,
        tips,
        addTip,
        deleteTip,
        editTip,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};