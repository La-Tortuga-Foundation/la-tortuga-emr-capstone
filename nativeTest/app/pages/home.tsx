import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import "../../global.css";
import PatientList from "./components/PatientList";
import { Patient } from "../pages/interfaces/PatientInterface";


export default function Home() {

    const addPatient = () => {
        const newPatient: Patient = {
            id: Date.now().toString(), // random id
            name: "New Patient",
            priority: "high",
            checkInTime: patients.length + 1,
            status: "waiting"
        };
        setPatients([...patients, newPatient])
    }

    //      list,   function to update patients
    const [patients, setPatients] = useState<Patient[]>([
        { id: "1", name: "John Smith", priority: "high", checkInTime: 1, status: "waiting" },
        { id: "2", name: "Maria Lopez", priority: "high", checkInTime: 2, status: "waiting" },
        { id: "3", name: "Adam Brown", priority: "low", checkInTime: 3, status: "waiting" },
        { id: "4", name: "Lisa Wong", priority: "medium", checkInTime: 4, status: "waiting" },
    ]);


    return (
        <View className="flex-1 bg-gray-100">
            <Text
                className="bg-blue-300 p-3 m-2 rounded-lg text-center"
                onPress={addPatient}
            >
                Add New Patient
            </Text>
            <View className="flex-1 bg-gray-100 items-center justify-center">
                <View className="h-5/6 w-full max-w-md px-4 bg-white rounded-lg">
                    <Text className="text-2xl font-bold mb-1 p-2 text-center">
                        Waiting Room
                    </Text>
                    <ScrollView>
                    <PatientList patients={patients} />
                    </ScrollView>
                </View>
            </View>

        </View>
    );
}

