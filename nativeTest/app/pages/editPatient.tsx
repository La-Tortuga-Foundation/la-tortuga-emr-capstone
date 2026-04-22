import { useEffect, useState } from "react";
import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { createPatient, getPatientById, loadPatientInfo, updatePatient } from "../../src/services/patients";
import { createVisit, getVisitByPatientId, updateVisit } from "../../src/services/visits";
import "../../global.css";
import { useLocalSearchParams } from "expo-router";
import { queryOne, run } from "@/src/services/db";



const URGENT_QUESTIONS = [
  { key: 'chest_pain', label: 'Chest pain or pressure?' },
  { key: 'difficulty_breathing', label: 'Difficulty breathing?' },
  { key: 'severe_pain', label: 'Severe pain (8 or higher out of 10)?' },
  { key: 'confusion', label: 'Confusion or loss of consciousness?' },
  { key: 'bleeding', label: 'Active bleeding?' },
];

const REASON_OPTIONS = [
  { key: 'pain_discomfort', label: 'Pain / discomfort' },
  { key: 'general_checkup', label: 'General checkup' },
  { key: 'skin_condition', label: 'Skin condition' },
  { key: 'digestive_issue', label: 'Digestive issue' },
  { key: 'respiratory_issue', label: 'Respiratory issue' },
  { key: 'other', label: 'Other' },
];

export default function EditPatient() {
  //getID from params and use to get patient info.
  const { patientId } = useLocalSearchParams();

  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [urgentAnswers, setUrgentAnswers] = useState<Record<string, boolean>>({});
  const [visitId, setVisitId] = useState('');

  const toggleUrgent = (key: string) => {
    setUrgentAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    //     run(`DELETE FROM visits`);
    // run(`DELETE FROM patients`);

    if (patientId) //if ID exists in params.
    {

      const patient = loadPatientInfo(patientId as string);
      const visit = getVisitByPatientId(patientId as string);
      // console.log(patient);
      // console.log(visit);
      console.log("VISITS: " + JSON.stringify(queryOne('select * from visits where visitId = ?', [visitId])));

      if (patient) { //if pateint exists in DB with that ID, load their info into state.
        setFirstName(patient.firstName);
        setLastName(patient.lastName);
        setDob(patient.dateOfBirth);
      }
      //reason for visit
      if (visit) {
        setVisitId(visit.visitId);
        setSelectedReason(visit.reasonForVisit || '');
        if (visit.reasonForVisitTag) {
          setUrgentAnswers({ [visit.reasonForVisitTag]: true });
        } else {
          setUrgentAnswers({});
        }

      }


    }
  }, []);


  const handleUpdate = () => {
    updatePatient(patientId as string, firstName, lastName, dob);
    const firstActive = Object.keys(urgentAnswers).find(k => urgentAnswers[k]) || '';
    const isUrgent = !!firstActive;
    console.log('[EDIT] urgentAnswers:', JSON.stringify(urgentAnswers));
    console.log('[EDIT] firstActive:', firstActive, 'isUrgent:', isUrgent);
    updateVisit(visitId as string, selectedReason, firstActive, isUrgent);
    router.replace('/pages/home');
  }



  return (
    <ScrollView className="flex-1 bg-gray-100 p-5">
      <View className="p-4">
        <Text className="text-2xl font-bold text-center text-green-800 mb-4">
          UPDATE PATIENT INFO
        </Text>

        {/* Patient Info */}
        <Text className="text-sm font-bold text-gray-500 uppercase mb-2">Patient Information</Text>
        <TextInput
          className="bg-white p-4 rounded-lg border border-gray-300 mb-2"
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          className="bg-white p-4 rounded-lg border border-gray-300 mb-2"
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          className="bg-white p-4 rounded-lg border border-gray-300 mb-4"
          placeholder="Date of birth (YYYY-MM-DD)"
          value={dob}
          onChangeText={setDob}
        />

        {/* Reason for visit */}
        <Text className="text-sm font-bold text-gray-500 uppercase mb-2">Reason for visit</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {REASON_OPTIONS.map(r => (
            <TouchableOpacity
              key={r.key}
              onPress={() => setSelectedReason(r.key)}
              className={`p-3 rounded-lg border ${selectedReason === r.key ? 'bg-green-700 border-green-700' : 'bg-white border-gray-300'}`}
            >
              <Text className={selectedReason === r.key ? 'text-white font-bold' : 'text-gray-700'}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Urgency Screener */}
        <Text className="text-sm font-bold text-gray-500 uppercase mb-2">
          Are you experiencing any of the following right now?
        </Text>
        {URGENT_QUESTIONS.map(q => (
          <TouchableOpacity
            key={q.key}
            onPress={() => toggleUrgent(q.key)}
            className={`p-4 rounded-lg border mb-2 flex-row justify-between items-center ${urgentAnswers[q.key] ? 'bg-red-100 border-red-500' : 'bg-white border-gray-300'}`}
          >
            <Text className={urgentAnswers[q.key] ? 'text-red-800 font-bold' : 'text-gray-700'}>
              {q.label}
            </Text>
            <Text className={urgentAnswers[q.key] ? 'text-red-800 font-bold text-lg' : 'text-gray-400 text-lg'}>
              {urgentAnswers[q.key] ? 'YES' : 'NO'}
            </Text>
          </TouchableOpacity>
        ))}

        {/* UPDATE Button */}
        <TouchableOpacity
          onPress={handleUpdate}
          className="bg-green-700 p-4 rounded-lg mt-4"
        >
          <Text className="text-white text-center font-bold text-lg">Update patient</Text>
        </TouchableOpacity>

      </View>
      <View className="flex-row justify-between">
        <TouchableOpacity className="bg-green-700 p-4 rounded-lg m-4 w-3/12"
          onPress={() => {
            router.setParams({}); router.push({
              pathname: '/medicalFormStart',
              params: { visitId: visitId, patientId: patientId }
            })
          }}>
          <Text className="text-white text-center font-bold text-lg">medical forms</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-green-700 p-4 rounded-lg m-4 w-3/12"
          onPress={() => {
            router.setParams({}); router.push({
              pathname: '/dentalFormStart',
              params: { visitId: visitId, patientId: patientId }
            })
          }}>
          <Text className="text-white text-center font-bold text-lg">dental forms</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}