import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { Card, SectionHeader, AmountDisplay } from '../components/CommonComponents';
import { useNavigation } from '@react-navigation/native';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const {
    balance,
    income,
    expenses,
    transactions,
    getExpensesByCategory,
    savingGoals,
  } = useFinance();

  const recentTransactions = transactions.slice(0, 5);
  const categorySummary = getExpensesByCategory().slice(0, 4);
  const activeSavingGoals = savingGoals.filter(goal => !goal.completed).slice(0, 3);

  const navigateToFinance = () => {
    navigation.navigate('FinanceTab' as never);
  };

  const navigateToSavings = () => {
    navigation.navigate('SavingsTab' as never);
  };

  const navigateToGroups = () => {
    navigation.navigate('GroupTab' as never);
  };

  const navigateToTips = () => {
    navigation.navigate('TipsTab' as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header now scrollable */}
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appTitle}>FinMate</Text>
            <Card style={styles.balanceCard}>
              <Text style={[styles.balanceLabel, { color: '#FFFFFF' }]}>Balance</Text>
              <AmountDisplay amount={balance} size="large" color="#FFFFFF" />
              <View style={styles.incomeExpenseRow}>
                <View style={styles.incomeContainer}>
                  <Text style={[styles.incomeExpenseLabel, { color: '#FFFFFF' }]}>Income</Text>
                  <AmountDisplay amount={income} type="positive" color="#FFFFFF" />
                </View>
                <View style={styles.divider} />
                <View style={styles.expenseContainer}>
                  <Text style={[styles.incomeExpenseLabel, { color: '#FFFFFF' }]}>Expenses</Text>
                  <AmountDisplay amount={expenses} type="negative" color="#FFFFFF" />
                </View>
              </View>
            </Card>
          </View>
        </View>

        <SectionHeader
          title="Recent Transactions"
          actionTitle="View All"
          onActionPress={navigateToFinance}
          style={{ marginLeft: 20 }}
        />

        {recentTransactions.length > 0 ? (
          <View style={[styles.transactionsList, { marginLeft: 20 }]}>
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionRow}>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionCategory, { color: theme.text }]}>
                      {transaction.category}
                    </Text>
                    <Text style={[styles.transactionDate, { color: theme.subtext }]}>
                      {transaction.date}
                    </Text>
                  </View>
                  <AmountDisplay
                    amount={transaction.amount}
                    type={transaction.type}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={[styles.emptyStateCard, { marginLeft: 20 }]}>
            <Text style={{ color: theme.subtext }}>No recent transactions</Text>
          </Card>
        )}

        <SectionHeader
          title="Expense Breakdown"
          actionTitle="View All"
          onActionPress={navigateToFinance}
          style={{ marginLeft: 20 }}
        />

        {categorySummary.length > 0 ? (
          <Card style={[styles.categorySummaryCard, { marginLeft: 20 }]}>
            {categorySummary.map((category, index) => (
              <View key={category.category} style={styles.categoryRow}>
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {category.category}
                </Text>
                <AmountDisplay amount={category.total} type="expense" />
                {index < categorySummary.length - 1 && (
                  <View style={[styles.rowDivider, { backgroundColor: theme.divider }]} />
                )}
              </View>
            ))}
          </Card>
        ) : (
          <Card style={[styles.emptyStateCard, { marginLeft: 20 }]}>
            <Text style={{ color: theme.subtext }}>No expense data available</Text>
          </Card>
        )}

        <SectionHeader
          title="Savings Goals"
          actionTitle="View All"
          onActionPress={navigateToSavings}
          style={{ marginLeft: 20 }}
        />

        {activeSavingGoals.length > 0 ? (
          <View style={[styles.savingsGoalsList, { marginLeft: 20 }]}>
            {activeSavingGoals.map((goal) => (
              <Card key={goal.id} style={styles.savingGoalCard}>
                <Text style={[styles.savingGoalName, { color: theme.text }]}>{goal.title}</Text>
                <View style={styles.savingGoalProgress}>
                  <View
                    style={[
                      styles.savingGoalProgressBar,
                      {
                        backgroundColor: theme.primary + '30',
                        width: '100%',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.savingGoalProgressFill,
                        {
                          backgroundColor: theme.primary,
                          width: `${Math.min(
                            100,
                            (goal.savedAmount / goal.targetAmount) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.savingGoalAmount, { color: theme.subtext }]}>
                    {`${Math.round((goal.savedAmount / goal.targetAmount) * 100)}%`}
                  </Text>
                </View>
                <View style={styles.savingGoalAmounts}>
                  <AmountDisplay amount={goal.savedAmount} size="small" />
                  <Text style={{ color: theme.subtext }}> / </Text>
                  <AmountDisplay amount={goal.targetAmount} size="small" />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={[styles.emptyStateCard, { marginLeft: 20 }]}>
            <Text style={{ color: theme.subtext }}>No active saving goals</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 80,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  appTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  incomeContainer: {
    flex: 1,
  },
  expenseContainer: {
    flex: 1,
  },
  incomeExpenseLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  transactionsList: {
    marginBottom: 24,
  },
  transactionCard: {
    marginVertical: 6,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  categorySummaryCard: {
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  savingsGoalsList: {
    marginBottom: 24,
  },
  savingGoalCard: {
    marginVertical: 6,
  },
  savingGoalName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  savingGoalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingGoalProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  savingGoalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  savingGoalAmount: {
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  savingGoalAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeScreen;