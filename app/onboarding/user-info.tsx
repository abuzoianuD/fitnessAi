import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function UserInfoScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Completează datele tale</Text>
      <Button title="Finalizează" onPress={() => router.replace("/")} />
    </View>
  );
}
