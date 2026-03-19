import { useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, TextInput, View, Image, TouchableOpacity} from "react-native";
import "../global.css";
import { useRouter } from 'expo-router';
export default function Login() {

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!email || !pwd){
      alert("Please enter email and password");
      return;
    }

      router.replace("../pages/home");
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
          id="email"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
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
      </View>

    </View>
  );
}
