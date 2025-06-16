import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home', headerShown: false  }} />
      <Tabs.Screen name="cards" options={{ title: 'Cards', headerShown: false  }} />
      <Tabs.Screen name="addCard" options={{ href: null, headerShown: false }}/>
    </Tabs>
  );
}
