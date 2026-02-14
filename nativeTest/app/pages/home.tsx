import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import "../../global.css";
export default function home() {


    interface Patient {
        id: string,
        name: string,
        priority: "high" | "normal" | "low",
        checkInTime: number
    }

    const [patients] = useState <Patient[]>([
        { id: "1", name: "John Smith", priority: "high", checkInTime: 1 },
        { id: "2", name: "Maria Lopez", priority: "high", checkInTime: 2 },
        { id: "3", name: "Adam Brown", priority: "normal", checkInTime: 3 },
        { id: "4", name: "Lisa Wong", priority: "normal", checkInTime: 4 },
    ])

    const addPatient = () => {
    alert("Add Patient");
}
const searchPatient = () => {
    alert("Search Patient");
}
const deletePatient = () => {
    alert("Delete Patient");
}
return (
    <View className="flex-1 bg-gray-100 items-center justify-center">
        <View className="w-full max-w-md px-4">
            <Pressable className="bg-blue-200 p-4 rounded-lg m-2 w-full" onPress={addPatient}>
                <Text className="text-center text-lg font-semibold">Add Patient</Text>
            </Pressable>
            <Pressable className="bg-green-200 p-4 rounded-lg m-2 w-full" onPress={searchPatient}>
                <Text className="text-center text-lg font-semibold">Search Patient</Text>
            </Pressable>
            <Pressable className="bg-yellow-200 p-4 rounded-lg m-2 w-full">
                <Text className="text-center text-lg font-semibold">Update Patient</Text>
            </Pressable>
            <Pressable className="bg-red-200 p-4 rounded-lg m-2 w-full" onPress={deletePatient}>
                <Text className="text-center text-lg font-semibold">Delete Patient</Text>
            </Pressable>
        </View>
    </View>

)
}
