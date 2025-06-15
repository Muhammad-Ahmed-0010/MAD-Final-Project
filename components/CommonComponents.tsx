import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { ThemeType, useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  type?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  theme?: ThemeType;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  type = 'primary',
  disabled = false,
  fullWidth = false,
  theme: propTheme,
}) => {
  const themeContext = useTheme();
  const theme = propTheme || themeContext.theme;
  
  const getButtonStyle = (): ViewStyle => {
    let variantStyle: ViewStyle = {};
    
    switch (type) {
      case 'primary':
        variantStyle = {
          backgroundColor: theme.primary,
        };
        break;
      case 'secondary':
        variantStyle = {
          backgroundColor: theme.secondary,
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.primary,
        };
        break;
      case 'danger':
        variantStyle = {
          backgroundColor: theme.error,
        };
        break;
    }
    
    return {
      ...variantStyle,
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };
  };
  
  const getTextStyle = (): TextStyle => {
    let variantTextStyle: TextStyle = { color: '#fff' };
    
    if (type === 'outline') {
      variantTextStyle = { color: theme.primary };
    }
    
    return variantTextStyle;
  };
  
  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

interface SectionHeaderProps {
  title: string;
  icon?: string;
  rightContent?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon, rightContent }) => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {icon && <FontAwesome5 name={icon} size={20} color={theme.primary} style={styles.sectionIcon} />}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {rightContent && <View style={styles.sectionHeaderRight}>{rightContent}</View>}
    </View>
  );
};

interface AmountDisplayProps {
  amount: number;
  label: string;
  type?: 'positive' | 'negative' | 'neutral';
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  label,
  type = 'neutral',
  showIcon = true,
  size = 'medium',
  color,
}) => {
  const { theme } = useTheme();
  
  const getAmountColor = () => {
    if (color) return color;
    switch (type) {
      case 'positive':
        return theme.incomeGreen;
      case 'negative':
        return theme.expenseRed;
      default:
        return theme.text;
    }
  };
  
  const getIconName = () => {
    switch (type) {
      case 'positive':
        return 'arrow-up';
      case 'negative':
        return 'arrow-down';
      default:
        return 'dot-circle-o';
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return { amount: 16, label: 12 };
      case 'large':
        return { amount: 28, label: 16 };
      default:
        return { amount: 20, label: 14 };
    }
  };
  
  const fontSizes = getFontSize();
  
  return (
    <View style={styles.amountDisplayContainer}>
      <Text style={[styles.amountLabel, { color: theme.subtext, fontSize: fontSizes.label }]}>
        {label}
      </Text>
      <View style={styles.amountRow}>
        {showIcon && (
          <FontAwesome
            name={getIconName()}
            size={fontSizes.amount * 0.8}
            color={getAmountColor()}
            style={styles.amountIcon}
          />
        )}
        <Text
          style={[
            styles.amountValue,
            { color: getAmountColor(), fontSize: fontSizes.amount },
          ]}
        >
          ${Math.abs(amount).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = '#4CAF50',
  backgroundColor = '#E0E0E0',
}) => {
  const progressValue = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View style={[styles.progressBarContainer, { height, backgroundColor }]}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${progressValue}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
    marginTop:20,
    marginLeft:20,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderRight: {},
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  amountDisplayContainer: {
    minWidth: 100,
  },
  amountLabel: {
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountIcon: {
    marginRight: 4,
  },
  amountValue: {
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});