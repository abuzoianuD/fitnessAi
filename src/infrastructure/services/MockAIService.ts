import { 
  CoachMessage, 
  MessageType, 
  InteractionTrigger, 
  CoachingContext,
  CoachPersonality,
  MessageContent,
  WorkoutSuggestion,
  CustomWorkout,
  NutritionAdvice
} from '@/src/domain/entities/AICoach';
import { DifficultyLevel } from '@/src/domain/entities/Exercise';

export class MockAIService {
  private static readonly RESPONSE_DELAY = 1500; // Realistic typing delay
  
  private static readonly COACH_PERSONALITIES: CoachPersonality[] = [
    {
      enthusiasm: 9,
      patience: 7,
      directness: 6,
      empathy: 8,
      humor: 7,
      strictness: 4,
      supportiveness: 9,
      technicalDepth: 6,
    },
    {
      enthusiasm: 6,
      patience: 9,
      directness: 8,
      empathy: 7,
      humor: 4,
      strictness: 7,
      supportiveness: 8,
      technicalDepth: 9,
    }
  ];

  static async generateWelcomeMessage(userId: string, userName?: string): Promise<CoachMessage> {
    await this.delay(this.RESPONSE_DELAY);
    
    const personality = this.COACH_PERSONALITIES[0]; // Use enthusiastic coach
    const greeting = userName ? `Hi ${userName}!` : "Hello there!";
    
    return {
      id: `msg_${Date.now()}`,
      coachId: 'ai_coach_1',
      userId,
      type: 'motivation',
      trigger: 'user_question',
      content: {
        text: `${greeting} 🎉 I'm Alex, your personal AI fitness coach! I'm here to help you achieve your fitness goals with personalized workouts, nutrition guidance, and motivation.\n\nI've reviewed your profile and I'm excited to work with you! Based on your goals and fitness level, I think we can make some amazing progress together.\n\nWhat would you like to start with today?`,
        quickReplies: [
          "Generate my first workout",
          "I have questions about nutrition",
          "Tell me about my fitness plan",
          "I need motivation"
        ]
      },
      context: 'Initial welcome message after onboarding',
      sentiment: 'celebratory',
      priority: 'high',
      isRead: false,
      timestamp: new Date(),
    };
  }

  static async generateResponse(
    userMessage: string,
    context: Partial<CoachingContext>,
    trigger: InteractionTrigger = 'user_question'
  ): Promise<CoachMessage> {
    await this.delay(this.RESPONSE_DELAY);
    
    const personality = this.COACH_PERSONALITIES[0];
    const messageContent = this.getResponseContent(userMessage, context, personality);
    
    return {
      id: `msg_${Date.now()}`,
      coachId: 'ai_coach_1',
      userId: context.userId || 'user_1',
      type: this.getMessageType(userMessage),
      trigger,
      content: messageContent,
      context: `Response to: "${userMessage}"`,
      sentiment: this.getSentiment(userMessage),
      priority: 'medium',
      isRead: false,
      timestamp: new Date(),
    };
  }

  static async generateFirstWorkout(
    context: Partial<CoachingContext>
  ): Promise<CoachMessage> {
    await this.delay(2000); // Longer delay for workout generation
    
    const workout = this.createMockWorkout(context);
    
    return {
      id: `msg_${Date.now()}`,
      coachId: 'ai_coach_1',
      userId: context.userId || 'user_1',
      type: 'workout_suggestion',
      trigger: 'user_question',
      content: {
        title: "🏋️ Your First Personalized Workout",
        text: "Great! I've created a perfect starter workout based on your fitness level and goals. This workout focuses on building a strong foundation with compound movements that will help you build strength and confidence.",
        workoutSuggestion: workout,
        tips: [
          "Focus on proper form over heavy weight",
          "Rest 60-90 seconds between sets",
          "Listen to your body - stop if you feel pain",
          "Track your performance for next time"
        ],
        quickReplies: [
          "Start this workout",
          "Modify the workout",
          "I need exercise instructions",
          "Save for later"
        ]
      },
      context: 'First workout generation',
      sentiment: 'positive',
      priority: 'high',
      isRead: false,
      timestamp: new Date(),
    };
  }

  static async generateNutritionAdvice(
    question: string,
    context: Partial<CoachingContext>
  ): Promise<CoachMessage> {
    await this.delay(this.RESPONSE_DELAY);
    
    const advice = this.getNutritionAdvice(question);
    
    return {
      id: `msg_${Date.now()}`,
      coachId: 'ai_coach_1',
      userId: context.userId || 'user_1',
      type: 'nutrition_advice',
      trigger: 'user_question',
      content: {
        title: "🍎 Nutrition Guidance",
        text: advice.advice,
        nutritionAdvice: advice,
        tips: advice.implementationTips,
        quickReplies: [
          "Tell me more",
          "Create a meal plan",
          "Track my calories",
          "Got it, thanks!"
        ]
      },
      context: `Nutrition question: "${question}"`,
      sentiment: 'positive',
      priority: 'medium',
      isRead: false,
      timestamp: new Date(),
    };
  }

  static async generateMotivationalMessage(
    context: Partial<CoachingContext>
  ): Promise<CoachMessage> {
    await this.delay(this.RESPONSE_DELAY);
    
    const motivationalMessages = [
      "Remember, every expert was once a beginner! 💪 The fact that you're here shows you're already committed to change. Small consistent actions lead to big results!",
      "You've got this! 🔥 Fitness isn't about being perfect - it's about being consistent. Even 10 minutes of movement today is better than zero!",
      "Your future self will thank you for the work you put in today! 🌟 Every workout, every healthy choice, every step forward matters.",
      "Progress isn't always visible, but it's always happening! 📈 Trust the process, stay consistent, and celebrate the small wins along the way."
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    return {
      id: `msg_${Date.now()}`,
      coachId: 'ai_coach_1',
      userId: context.userId || 'user_1',
      type: 'motivation',
      trigger: 'user_question',
      content: {
        text: randomMessage,
        quickReplies: [
          "I needed that!",
          "Let's workout!",
          "Set a goal for me",
          "Thanks coach!"
        ]
      },
      context: 'Motivational message request',
      sentiment: 'celebratory',
      priority: 'medium',
      isRead: false,
      timestamp: new Date(),
    };
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static getResponseContent(
    userMessage: string,
    context: Partial<CoachingContext>,
    personality: CoachPersonality
  ): MessageContent {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return {
        text: "Perfect! I love your enthusiasm for working out! 💪 Let me create a personalized workout that matches your current fitness level and goals. This will be specifically designed to challenge you while keeping you safe.",
        quickReplies: [
          "Generate my workout",
          "I prefer specific muscle groups",
          "I have limited time",
          "I want something challenging"
        ]
      };
    }
    
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food')) {
      return {
        text: "Nutrition is such a crucial part of your fitness journey! 🍎 I'm here to help you make smart choices that fuel your workouts and support your goals. What specific nutrition questions do you have?",
        quickReplies: [
          "How many calories should I eat?",
          "What should I eat before/after workouts?",
          "Help me meal prep",
          "I have dietary restrictions"
        ]
      };
    }
    
    if (lowerMessage.includes('plan') || lowerMessage.includes('program')) {
      return {
        text: "Great question! 📋 Based on your profile, I'm developing a comprehensive fitness plan that evolves with your progress. It includes structured workouts, nutrition guidance, and recovery strategies tailored just for you.",
        tips: [
          "Your plan adapts as you get stronger",
          "We'll track progress and adjust weekly",
          "Rest days are just as important as workout days"
        ],
        quickReplies: [
          "Show me my plan",
          "When do we start?",
          "Can I customize it?",
          "How long until I see results?"
        ]
      };
    }
    
    if (lowerMessage.includes('motivation') || lowerMessage.includes('encourage')) {
      return {
        text: "I'm so glad you asked! 🌟 Motivation comes and goes, but building habits and systems is what creates lasting change. You've already taken the hardest step by starting!",
        quickReplies: [
          "Set a challenge for me",
          "Remind me why I started",
          "Help me stay consistent",
          "I'm ready to push harder"
        ]
      };
    }
    
    // Default response
    const responses = [
      "That's a great point! Tell me more about what you're thinking.",
      "I understand! Let me help you with that. Can you be more specific?",
      "Absolutely! I'm here to support you however I can.",
      "I hear you! Let's work through this together."
    ];
    
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      quickReplies: [
        "Let's start a workout",
        "I need nutrition help",
        "Motivate me",
        "Tell me about my progress"
      ]
    };
  }

  private static createMockWorkout(context: Partial<CoachingContext>): WorkoutSuggestion {
    // Mock workout based on user preferences - in real app this would use AI
    const beginnerWorkout: CustomWorkout = {
      name: "Foundation Builder",
      exercises: [
        {
          exerciseId: "ex_1",
          name: "Bodyweight Squats",
          sets: 3,
          reps: 12,
          rest: 60,
          notes: "Focus on depth and control"
        },
        {
          exerciseId: "ex_2", 
          name: "Push-ups (Modified if needed)",
          sets: 3,
          reps: 8,
          rest: 60,
          notes: "Knee push-ups are perfectly fine!"
        },
        {
          exerciseId: "ex_3",
          name: "Plank",
          sets: 3,
          reps: 30, // seconds
          rest: 60,
          notes: "Hold steady, breathe normally"
        },
        {
          exerciseId: "ex_4",
          name: "Glute Bridges",
          sets: 3,
          reps: 15,
          rest: 60,
          notes: "Squeeze at the top"
        }
      ],
      warmup: [
        "5 minutes light walking or marching in place",
        "Arm circles and leg swings",
        "Joint mobility movements"
      ],
      cooldown: [
        "5 minutes gentle stretching",
        "Deep breathing exercises",
        "Hydrate and celebrate your effort!"
      ]
    };

    return {
      customWorkout: beginnerWorkout,
      reason: "This workout builds fundamental movement patterns and strength. Perfect for establishing a solid foundation!",
      difficulty: "beginner",
      estimatedDuration: 25,
      focus: ["quadriceps", "chest", "abs", "glutes"],
      alternatives: ["Upper body focus", "Cardio emphasis", "Flexibility focused"]
    };
  }

  private static getNutritionAdvice(question: string): NutritionAdvice {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('calorie') || lowerQuestion.includes('how much')) {
      return {
        type: 'macro_adjustment',
        advice: "Based on your goals and activity level, I recommend starting with a balanced approach. Focus on whole foods, adequate protein (0.8-1g per lb bodyweight), and listening to your hunger cues rather than strict calorie counting initially.",
        implementationTips: [
          "Start by tracking for a few days to understand your baseline",
          "Focus on protein at each meal",
          "Include vegetables with most meals",
          "Stay hydrated - often thirst feels like hunger"
        ]
      };
    }
    
    if (lowerQuestion.includes('before') || lowerQuestion.includes('after') || lowerQuestion.includes('workout')) {
      return {
        type: 'timing',
        advice: "Pre-workout: Light carbs 30-60 minutes before (banana, oats). Post-workout: Protein and carbs within 2 hours (smoothie, chicken and rice). The most important thing is your overall daily nutrition!",
        implementationTips: [
          "Pre: Easy to digest carbs for energy",
          "Post: Protein to support muscle recovery", 
          "Don't stress if timing isn't perfect",
          "Consistency matters more than perfect timing"
        ]
      };
    }
    
    return {
      type: 'meal_suggestion',
      advice: "Great nutrition question! The key is building sustainable habits around whole foods. Focus on adequate protein, colorful vegetables, and foods you actually enjoy eating.",
      implementationTips: [
        "Make small changes gradually",
        "Plan and prep when possible",
        "Don't aim for perfection",
        "Include foods you love in moderation"
      ]
    };
  }

  private static getMessageType(message: string): MessageType {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return 'workout_suggestion';
    }
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('food')) {
      return 'nutrition_advice';
    }
    if (lowerMessage.includes('motivat') || lowerMessage.includes('encourage')) {
      return 'motivation';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return 'education';
    }
    
    return 'education';
  }

  private static getSentiment(message: string): 'positive' | 'neutral' | 'constructive' | 'celebratory' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('excited') || lowerMessage.includes('ready') || lowerMessage.includes('great')) {
      return 'celebratory';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('need')) {
      return 'constructive';
    }
    
    return 'positive';
  }
}