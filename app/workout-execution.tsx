import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import WorkoutExecutionScreen from '@/src/presentation/components/workout/WorkoutExecutionScreen';
import { CustomWorkout } from '@/src/domain/entities/AICoach';

export default function WorkoutExecutionRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // In a real app, you would get the workout from a store or API
  // For now, we'll use a mock workout or get it from params
  const mockWorkout: CustomWorkout = {
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

  const handleWorkoutComplete = (completedSets: number, totalTime: number) => {
    // TODO: Save workout to history/progress tracking
    console.log(`Workout completed: ${completedSets} sets in ${totalTime} minutes`);
    
    // Navigate back to AI coach with success message
    router.replace('/(tabs)/ai-coach');
  };

  const handleWorkoutExit = () => {
    // Navigate back without saving
    router.back();
  };

  return (
    <WorkoutExecutionScreen
      workout={mockWorkout}
      onWorkoutComplete={handleWorkoutComplete}
      onWorkoutExit={handleWorkoutExit}
    />
  );
}