import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import "../global.css";

export default function Login() {

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

    return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
       La Tortuga EMR!
      </Text>
      <TextInput
      className="bg-white p-4 rounded-lg border border-gray-300 m-2"
      id = "email"
      value={email}
      onChangeText={setEmail}
      placeholder="Email"
      />
      <TextInput
      className="bg-white p-4 rounded-lg border border-gray-300 m-2"
      id = "pwd"
      value={pwd}
      onChangeText={setPwd}
      placeholder="Password"
      />

      <Pressable className="bg-blue-600 p-4 rounded-lg">
        <Text className="text-white text-center font-bold">Log in</Text>
      </Pressable>
      
    </View>
  );
}
