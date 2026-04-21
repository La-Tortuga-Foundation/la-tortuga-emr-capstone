import { useState } from "react";
import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { createPatient, getPatientById } from "../../src/services/patients";
import { createVisit } from "../../src/services/visits";
import { initDB } from "../../src/services/db";
import "../../global.css";

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

export default function CheckIn() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [urgentAnswers, setUrgentAnswers] = useState<Record<string, boolean>>({});

  const toggleUrgent = (key: string) => {
    setUrgentAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getUrgentTrigger = (): string | undefined => {
    return Object.keys(urgentAnswers).find(k => urgentAnswers[k]);
  };

  const handleRegister = () => {
    if (!firstName || !lastName || !dob) {
      Alert.alert('Missing info', 'Please enter first name, last name, and date of birth.');
      return;
    }
    if (!selectedReason) {
      Alert.alert('Missing info', 'Please select a reason for visit.');
      return;
    }

    try {
      //no need to call initDB here since it's called in the root layout.
      initDB();
      const urgentTrigger = getUrgentTrigger();
      const isUrgent = !!urgentTrigger;

      const patientId = createPatient(firstName, lastName, dob);
      console.log('[CHECKIN] Patient ID:', patientId);
      console.log('[TEST] Patient from DB:', getPatientById(patientId));

      

      createVisit(patientId, selectedReason, selectedReason, isUrgent, urgentTrigger);

      Alert.alert(
        isUrgent ? '🚨 Patient flagged as URGENT' : '✅ Patient registered',
        isUrgent ? `Trigger: ${urgentTrigger}` : 'Added to waiting room',
        [{ text: 'OK', onPress: () => router.replace('../pages/home') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-5">
      <View className="p-4">
        <Text className="text-2xl font-bold text-center text-green-800 mb-4">
          New Patient Check-In
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

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          className="bg-green-700 p-4 rounded-lg mt-4"
        >
          <Text className="text-white text-center font-bold text-lg">Register patient</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}