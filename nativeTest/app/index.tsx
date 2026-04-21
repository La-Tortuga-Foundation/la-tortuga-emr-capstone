import { useState } from "react";
import { Pressable, Text, TextInput, View, Image, TouchableOpacity } from "react-native";
import "../global.css";
import { useRouter } from 'expo-router';
import { getUserByUsername } from "@/src/services/users";
import { query, queryOne, run } from "@/src/services/db";
export default function Login() {

  const [userName, setUserName] = useState('');
  const [pwd, setPwd] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!userName || !pwd) {
      alert("Please enter email and password");
      const users = query(`select * from users`);
      console.log(users);
      return;
    }

    // run(`INSERT OR IGNORE INTO users (firstName, lastName, username, password, role, isActive, createdAt)
    //  VALUES ('Admin', 'User', 'admin', 'admin', 'admin', 1, '2026-01-01T00:00:00.000Z');`);

    try {
      if (getUserByUsername(userName, pwd)) {
        router.replace("../pages/home");
      } else {
        alert("Invalid username or password");
        return;
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
      return;
    }



  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <View className="w-full max-w-md px-4">
        <Image
          className="mx-auto"
          source={require("../assets/images/latortuga.png")}
        />

        <Text className="text-xl font-bold text-blue-500 text-center">
          La Tortuga EMR
        </Text>
        <TextInput
          className="bg-white p-4 rounded-lg border border-gray-300 m-2"
          id="username"
          value={userName}
          onChangeText={setUserName}
          placeholder="Username"
        />
        <TextInput
          className="bg-white p-4 rounded-lg border border-gray-300 m-2"
          id="pwd"
          value={pwd}
          onChangeText={setPwd}
          placeholder="Password"
          secureTextEntry // hides passwords
        />

        <Pressable className="bg-blue-600 p-4 rounded-lg"
          onPress={handleLogin}
        >
          <Text className="text-white text-center font-bold">Log in</Text>
        </Pressable>
        <TouchableOpacity onPress={() => router.push('/db-test' as any)}>
          <Text>DB Test</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/inventoryDisplay' as any)}>
          <Text>inv access</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/logDisplay' as any)}>
          <Text>Logs Test</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          router.setParams({}); router.push({
            pathname: '/medicalFormStart',
            params: { visitId: "MOCK_VISIT_ID", patientId: query(`SELECT patientId FROM patients`)?.[0].patientId }
          })
        }}>
          <Text>med forms test</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
