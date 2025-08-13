import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function GoalScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Selectează obiectivul tău</Text>
      <Button
        title="Slăbire"
        onPress={() => router.push("/onboarding/user-info")}
      />
      <Button
        title="Masă musculară"
        onPress={() => router.push("/onboarding/user-info")}
      />
    </View>
  );
}
