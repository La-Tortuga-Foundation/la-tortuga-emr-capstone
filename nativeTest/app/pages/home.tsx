import { useState } from "react";
import { Text, View } from "react-native";
import "../../global.css";
import PatientList from "./components/PatientList";
import { Patient } from "../pages/interfaces/PatientInterface";


export default function Home() {
    
    const [patients2] = useState<Patient[]>([
        { id: "1", name: "John Smith", priority: "high", checkInTime: 1 },
        { id: "2", name: "Maria Lopez", priority: "high", checkInTime: 2 },
        { id: "3", name: "Adam Brown", priority: "low", checkInTime: 3 },
        { id: "4", name: "Lisa Wong", priority: "medium", checkInTime: 4 },
    ]);

    return (
        <View className="flex-1 bg-gray-100">
            <Text> TEST</Text>
            <View className="flex-1 bg-gray-100 items-center justify-center">
                <View className="w-full max-w-md px-4 bg-white rounded-lg">
                <Text className="text-2xl font-bold mb-1 p-2 text-center">
                    Waiting Room
                </Text>

                <PatientList patients={patients2}/>
            </View>
            </View>
            
        </View>
    );
}

//  <Pressable className="bg-blue-200 p-4 rounded-lg m-2 w-full" onPress={addPatient}>
//                 <Text className="text-center text-lg font-semibold">Add Patient</Text>
//             </Pressable>
//             <Pressable className="bg-green-200 p-4 rounded-lg m-2 w-full" onPress={searchPatient}>
//                 <Text className="text-center text-lg font-semibold">Search Patient</Text>
//             </Pressable>
//             <Pressable className="bg-yellow-200 p-4 rounded-lg m-2 w-full">
//                 <Text className="text-center text-lg font-semibold">Update Patient</Text>
//             </Pressable>
//             <Pressable className="bg-red-200 p-4 rounded-lg m-2 w-full" onPress={deletePatient}>
//                 <Text className="text-center text-lg font-semibold">Delete Patient</Text>
//             </Pressable>
