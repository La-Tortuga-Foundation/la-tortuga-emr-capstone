import { Pressable, Text, TextInput, View } from "react-native";
import { Link } from 'expo-router';
import { useState } from 'react';
import { Button } from '@react-navigation/elements';

const dentalExam = {
    examSte: "STE:",
    examPlaque: "Plaque",
    examCalculus: "Calculus",
    examGingivitis: "Gingivitis",
    examPeriodontitis: "Periodontitis",
    examHealthy: "Healthy",

    painfulTeeth: "Painful teeth:",
    caries: "Caries:",
    fracturedTeeth: "Fractured teeth:",

    plan: "Plan:",

    procedureGeneralCleaning: "General Cleaning",
    procedureDeepCleaningScaling: "Deep Cleaning / Scaling",
    procedureSdf: "SDF",
    procedureExtraction: "Extraction:",

    anesthesiaSeptocaine: "Septocaine",

    visitRoutine: "Routine",
    visitSurgical: "Surgical",

    suture: "Suture",

    analgesics: "Analgesics",
    antibiotics: "Antibiotics",

    followUp: "Follow Up"
};


export default function dentalForm() {
    interface languageBox {
        head: string;
    }

    const en: languageBox = { head: "Test" };
    const sp: languageBox = { head: "Spanish" };
    const [textBox, ChangeTextType] = useState<languageBox>(en);
    let [languageString, changeLanguageString] = useState<string>("English");

    function switchTextTypes() {
        if (languageString === "English") {
            ChangeTextType(sp);
            changeLanguageString("Spanish");
        }
        else {
            ChangeTextType(en);
            changeLanguageString("English");
        }
    }
    return (
        <View>
            <Text>{textBox.head}</Text>

            {/* <Button onPressIn={switchTextTypes}>Switch</Button> */}
            <Pressable className="bg-blue-600 p-4 rounded-lg w-full m-2" onPressIn={switchTextTypes}>Switch Languages</Pressable>
        </View>
    );
}