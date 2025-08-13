import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, AppColors } from '@/src/shared/constants/AppColors';
import { CoachMessage } from '@/src/domain/entities/AICoach';

interface ChatMessageProps {
  message: CoachMessage;
  onQuickReply?: (reply: string) => void;
}

export function ChatMessage({ message, onQuickReply }: ChatMessageProps) {
  const isAI = message.coachId !== 'user';

  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      {isAI && (
        <View style={styles.aiAvatar}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      )}
      
      <View style={[styles.messageBubble, isAI ? styles.aiBubble : styles.userBubble]}>
        {message.content.title && (
          <Text style={[styles.messageTitle, isAI ? styles.aiTitle : styles.userTitle]}>
            {message.content.title}
          </Text>
        )}
        
        <Text style={[styles.messageText, isAI ? styles.aiText : styles.userText]}>
          {message.content.text}
        </Text>
        
        {message.content.tips && message.content.tips.length > 0 && (
          <View style={styles.tipsContainer}>
            {message.content.tips.map((tip, index) => (
              <Text key={index} style={styles.tip}>
                💡 {tip}
              </Text>
            ))}
          </View>
        )}
        
        {message.content.workoutSuggestion && (
          <View style={styles.workoutSuggestion}>
            <Text style={styles.suggestionTitle}>🏋️ Workout Suggestion</Text>
            <Text style={styles.suggestionText}>
              {message.content.workoutSuggestion.reason}
            </Text>
            <Text style={styles.suggestionDetails}>
              Duration: {message.content.workoutSuggestion.estimatedDuration} minutes
            </Text>
            <Text style={styles.suggestionDetails}>
              Difficulty: {message.content.workoutSuggestion.difficulty}
            </Text>
          </View>
        )}
        
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      
      {!isAI && (
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      )}
      
      {isAI && message.content.quickReplies && message.content.quickReplies.length > 0 && (
        <View style={styles.quickRepliesContainer}>
          {message.content.quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickReplyButton}
              onPress={() => onQuickReply?.(reply)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.gray600,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  aiBubble: {
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  aiTitle: {
    color: Colors.primary,
  },
  userTitle: {
    color: AppColors.white,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: {
    color: AppColors.white,
  },
  userText: {
    color: AppColors.white,
  },
  timestamp: {
    fontSize: 12,
    color: AppColors.gray400,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  tipsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.gray700,
  },
  tip: {
    fontSize: 14,
    color: Colors.primarySoft,
    marginBottom: 4,
    lineHeight: 20,
  },
  workoutSuggestion: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: AppColors.white,
    marginBottom: 8,
    lineHeight: 20,
  },
  suggestionDetails: {
    fontSize: 12,
    color: Colors.primarySoft,
    marginBottom: 2,
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginLeft: 40,
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickReplyText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});