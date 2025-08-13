import { Redirect } from "expo-router";

export default function TabsIndex() {
  // Redirect to home tab when accessing /(tabs) directly
  return <Redirect href="/(tabs)/home" />;
}
