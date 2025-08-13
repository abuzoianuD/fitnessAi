import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  placeholder = "Type your message...",
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, disabled && styles.disabledInput]}
          placeholder={placeholder}
          placeholderTextColor={AppColors.gray400}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          autoCorrect={true}
          textContentType="none"
          editable={!disabled}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.disabledSendButton
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.sendButtonText,
            (!message.trim() || disabled) && styles.disabledSendButtonText
          ]}>
            ➤
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: AppColors.gray800,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: AppColors.gray700,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: AppColors.white,
    maxHeight: 120,
    minHeight: 44,
  },
  disabledInput: {
    backgroundColor: AppColors.gray800,
    borderColor: AppColors.gray600,
    color: AppColors.gray500,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledSendButton: {
    backgroundColor: AppColors.gray700,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  disabledSendButtonText: {
    color: AppColors.gray500,
  },
});