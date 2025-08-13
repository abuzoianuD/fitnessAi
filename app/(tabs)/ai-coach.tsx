import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { ChatMessage } from '@/src/presentation/components/chat/ChatMessage';
import { ChatInput } from '@/src/presentation/components/chat/ChatInput';
import { TypingIndicator } from '@/src/presentation/components/chat/TypingIndicator';
import { MockAIService } from '@/src/infrastructure/services/MockAIService';
import { CoachMessage } from '@/src/domain/entities/AICoach';

interface UserMessage extends Omit<CoachMessage, 'coachId' | 'type' | 'trigger' | 'content' | 'sentiment' | 'priority'> {
  coachId: 'user';
  type: 'user_message';
  trigger: 'user_question';
  content: {
    text: string;
  };
  sentiment: 'neutral';
  priority: 'medium';
}

export default function AICoachScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [messages, setMessages] = useState<(CoachMessage | UserMessage)[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      // Simulate getting user name from profile - in real app would come from auth store
      const welcomeMessage = await MockAIService.generateWelcomeMessage('user_1', 'Alex');
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      Alert.alert('Error', 'Failed to connect to AI coach. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    // Add user message immediately
    const userMessage: UserMessage = {
      id: `user_msg_${Date.now()}`,
      coachId: 'user',
      userId: 'user_1',
      type: 'user_message',
      trigger: 'user_question',
      content: {
        text: messageText,
      },
      context: 'User message',
      sentiment: 'neutral',
      priority: 'medium',
      isRead: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Generate AI response
      const response = await MockAIService.generateResponse(
        messageText,
        { userId: 'user_1' }
      );
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      // Add error message
      const errorMessage: CoachMessage = {
        id: `error_${Date.now()}`,
        coachId: 'ai_coach_1',
        userId: 'user_1',
        type: 'education',
        trigger: 'user_question',
        content: {
          text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment!",
        },
        context: 'Error response',
        sentiment: 'constructive',
        priority: 'medium',
        isRead: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleSpecialAction = async (action: string) => {
    setIsTyping(true);
    
    try {
      let response: CoachMessage;
      
      switch (action.toLowerCase()) {
        case 'generate my first workout':
        case 'generate my workout':
        case 'start this workout':
          response = await MockAIService.generateFirstWorkout({ userId: 'user_1' });
          break;
        case 'i need motivation':
        case 'motivate me':
          response = await MockAIService.generateMotivationalMessage({ userId: 'user_1' });
          break;
        case 'i have questions about nutrition':
        case 'help me meal prep':
          response = await MockAIService.generateNutritionAdvice(action, { userId: 'user_1' });
          break;
        default:
          response = await MockAIService.generateResponse(action, { userId: 'user_1' });
      }
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to handle special action:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: CoachMessage | UserMessage }) => (
    <ChatMessage 
      message={item as CoachMessage} 
      onQuickReply={(reply) => {
        // Handle quick replies that might be special actions
        if (reply.toLowerCase().includes('workout') && reply.toLowerCase().includes('first')) {
          handleSpecialAction('generate my first workout');
        } else if (reply.toLowerCase() === 'start this workout') {
          // Navigate to workout execution
          router.push('/workout-execution');
        } else if (reply.toLowerCase().includes('motivation')) {
          handleSpecialAction('i need motivation');
        } else if (reply.toLowerCase().includes('nutrition')) {
          handleSpecialAction('i have questions about nutrition');
        } else {
          handleQuickReply(reply);
        }
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.coachInfo}>
        <Text style={styles.coachAvatar}>🤖</Text>
        <View>
          <Text style={styles.coachName}>Alex - AI Coach</Text>
          <Text style={styles.coachStatus}>
            {isTyping ? 'Typing...' : 'Online • Ready to help'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.infoButton}
        onPress={() => Alert.alert('AI Coach', 'This is your personal AI fitness coach, powered by advanced AI to provide personalized guidance!')}
      >
        <Text style={styles.infoButtonText}>ℹ️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🤖💪</Text>
      <Text style={styles.emptyStateTitle}>Welcome to AI Coaching!</Text>
      <Text style={styles.emptyStateText}>
        Your personal AI coach is getting ready to help you achieve your fitness goals.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? <TypingIndicator visible={true} /> : null}
      />
      
      <ChatInput
        onSendMessage={handleSendMessage}
        placeholder="Ask me anything about fitness..."
        disabled={isTyping}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray800,
    backgroundColor: '#0A0A0A',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
  },
  coachStatus: {
    fontSize: 14,
    color: AppColors.gray400,
    marginTop: 2,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: AppColors.gray400,
    textAlign: 'center',
    lineHeight: 24,
  },
});