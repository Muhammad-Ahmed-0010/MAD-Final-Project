# FinMate: Finance Tracker, Expense Splitter, and Savings Manager

## Overview
FinMate is a mobile application designed to help users track their finances, split group expenses, and manage savings effectively. Built with React Native and Expo, this app provides an intuitive interface for personal and group financial management. Whether you're managing your budget or splitting a dinner bill with friends, FinMate simplifies it all.

## Features
- **Finance Tracker**: Monitor income, expenses, and budget in real-time.
- **Group Expense Splitter**: Easily divide costs among multiple people with calculated shares.
- **Savings Tracker**: Set savings goals and track progress over time.
- **Secure Authentication**: Set and manage a 4-digit password for app access.
- **Offline Support**: Basic functionality works without internet using local storage.

## Technologies Used
- **Frontend**: React Native (cross-platform mobile development).
- **Navigation**: @react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs.
- **State Management**: React Context API for authentication and data.
- **Storage**: @react-native-async-storage/async-storage (for persisting data).
- **Security**: Crypto-JS (SHA256 for password hashing).
- **UI Components**: @expo/vector-icons, react-native-chart-kit, react-native-svg, @react-native-picker/picker.
- **Development Environment**: Expo (with Snack for prototyping).

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/FinMate.git
   cd FinMate
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
   Or, if using Yarn:
   ```bash
   yarn install
   ```
3. **Install Expo CLI** (if not already installed):
   ```bash
   npm install -g expo-cli
   ```
4. **Install Required Libraries**:
   ```bash
   npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-native-async-storage/async-storage crypto-js @expo/vector-icons react-native-chart-kit react-native-svg @react-native-picker/picker
   ```
5. **Run the App**:
   ```bash
   npx expo start
   ```
   - Use the Expo Go app on your mobile device or an emulator to scan the QR code and run the app.

## Usage
- **Initial Setup**: On first launch, set a 4-digit password via the PasswordSetupScreen.
- **Login**: Enter the 4-digit password on the LoginScreen to access the app.
- **Main Features**: Navigate through tabs to track finances, split expenses, and monitor savings.
- **Offline Mode**: Data persists locally; sync is not required but limited to device storage.

## System Architecture
- **User Interface Layer**: React Native screens (PasswordSetupScreen, LoginScreen, FinanceTracker, etc.).
- **Context Layer**: AuthContext and DataContext for state management.
- **Business Logic Layer**: Handles finance calculations, expense splitting, and savings tracking.
- **Storage Layer**: AsyncStorage for persisting password hash and financial data.
- **Navigation Layer**: Stack and Bottom Tab navigators for seamless screen transitions.
- **Flow**: User input → Context updates → Storage → Display updated data.

## Faced Challenges and Solutions
- **Challenge 1: Context Initialization Error**
  - Issue: `Cannot read properties of undefined` due to undefined AuthContext in Expo Snack.
  - Solution: Implemented default context values and `isLoading` checks to delay rendering.
- **Challenge 2: Expo Snack Limitations**
  - Issue: `postMessage` errors and unreliable AsyncStorage in Snack.
  - Solution: Added conditional AsyncStorage checks and recommended local testing.
- **Challenge 3: Dark Mode Instability**
  - Issue: ThemeContext errors affecting render.
  - Solution: Removed dark mode to stabilize the app.
- **Challenge 4: Navigation Timing**
  - Issue: Screens rendering before context load.
  - Solution: Ensured proper provider wrapping and loading states.

## Future Scope
- **Enhancement 1**: Add biometric authentication (Face ID, fingerprint).
- **Enhancement 2**: Implement cloud backup with encryption for data recovery.
- **Enhancement 3**: Support multi-user profiles for family or team use.
- **Enhancement 4**: Integrate advanced financial analytics and visualizations.
- **Deployment**: Release on iOS App Store and Google Play Store.

## Contributing
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes and commit: `git commit -m "Add feature-name"`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request with a clear description of your changes.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
- Thanks to the Expo and React Native communities for their support.
- Inspired by the need for simple financial management tools.

## Contact
For questions or suggestions, please open an issue or contact on github.
