import { View, Text, TouchableOpacity } from "react-native";
import { Patient } from "../interfaces/PatientInterface"


type PatientListProps = {
  patients: Patient[]; //array of Patient Objects
};
                                                
export default function PatientList({ patients }: PatientListProps) {

  const getPriorityColor = (priority: Patient["priority"]) => {
    if (priority === 1) return "bg-red-300"; //critical
    if (priority === 2) return "bg-red-200"; //high
     return "bg-gray-100"; //normal

  };

  return (
    <View>
      {patients.filter((patient) => patient.status !== "completed")
      .sort((a,b) => a.priority - b.priority)//sort by priority
      .map((patient) => (
        <View
          key={patient.patientId}
          className={`w-full p-2 mb-3 rounded-lg ${getPriorityColor(patient.priority)}`}
        >
          <Text className="text-lg font-semibold">{patient.firstName} {patient.lastName}</Text>
          <Text className="text-sm text-gray-700">
            Priority: {patient.priority}
          </Text>
          <Text className="text-sm text-gray-700">
            Check-in #: {patient.arrivalOrder}
          </Text>
          <TouchableOpacity onPress={() => alert('options for ' + patient.patientId)}>
      <Text className="text-xl text-gray-500 px-2">⋮ HERE</Text>
    </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
