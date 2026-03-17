import { View, Text } from "react-native";
import { Patient } from "../interfaces/PatientInterface"


type PatientListProps = {
  patients: Patient[]; //array of Patient Objects
};
                                                
export default function PatientList({ patients }: PatientListProps) {

  const getPriorityColor = (priority: Patient["priority"]) => {
    if (priority === "high") return "bg-red-200";
    if (priority === "medium") return "bg-yellow-200";
    if (priority === "low") return "bg-gray-100";

  };

  //sorting needs a map
  const priorityOrder = {
    high:1,
    medium:2,
    low: 3
  }

  return (
    <View>
      {patients.filter((patient) => patient.status !== "completed")
      .sort((a,b) => priorityOrder[a.priority] - priorityOrder[b.priority])//sort by priority
      .map((patient) => (
        <View
          key={patient.id}
          className={`w-full p-2 mb-3 rounded-lg ${getPriorityColor(patient.priority)}`}
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
