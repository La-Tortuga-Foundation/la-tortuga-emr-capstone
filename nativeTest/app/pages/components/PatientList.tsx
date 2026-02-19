import { View, Text } from "react-native";
import { Patient } from "../interfaces/PatientInterface"


type PatientListProps = {
  patients: Patient[]; //array of Patient Objects
};
                                                
export default function PatientList({ patients }: PatientListProps) {

  const getPriorityColor = (priority: Patient["priority"]) => {
    if (priority === "high") return "bg-red-200";
    if (priority === "medium") return "bg-yellow-200";
    return "";
  };

  return (
    <View>
      {patients.map((patient) => (
        <View
          key={patient.id}
          className={`w-full p-4 mb-3 rounded-lg ${getPriorityColor(patient.priority)}`}
        >
          <Text className="text-lg font-semibold">{patient.name}</Text>
          <Text className="text-sm text-gray-700">
            Priority: {patient.priority}
          </Text>
          <Text className="text-sm text-gray-700">
            Check-in #: {patient.checkInTime}
          </Text>
        </View>
      ))}
    </View>
  );
}
