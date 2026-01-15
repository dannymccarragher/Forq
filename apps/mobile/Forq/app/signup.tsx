import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';

export default function SignupScreen() {
  const router = useRouter();
  const { registerUser } = useApp();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!privacyPolicyAccepted) {
      Alert.alert('Error', 'You must accept the Privacy Policy to create an account');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        privacyPolicyAccepted,
      });

      // Navigate to main app (user is now logged in)
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/Forq-transparent.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start your nutrition journey today</Text>
            </View>

            {/* Signup Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Username <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Choose a username"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.username}
                  onChangeText={(value) => updateField('username', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="First name"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.firstName}
                    onChangeText={(value) => updateField('firstName', value)}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Last name"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.lastName}
                    onChangeText={(value) => updateField('lastName', value)}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Password <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Create a password (min. 6 characters)"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Confirm Password <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Privacy Policy Acceptance */}
              <TouchableOpacity
                style={styles.privacyContainer}
                onPress={() => setPrivacyPolicyAccepted(!privacyPolicyAccepted)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: colors.border },
                    privacyPolicyAccepted && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  {privacyPolicyAccepted && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={[styles.privacyText, { color: colors.text }]}>
                  I accept the{' '}
                  <Text
                    style={[styles.privacyLink, { color: colors.primary }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      Linking.openURL('https://dannymccarragher.github.io/');
                    }}
                  >
                    Privacy Policy
                  </Text>
                  <Text style={styles.required}> *</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signupButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
                <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
                  <Text style={[styles.loginLink, { color: colors.primary }]}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  signupButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  privacyLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
