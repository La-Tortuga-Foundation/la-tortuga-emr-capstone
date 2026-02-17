import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Button } from '@react-navigation/elements';

// interface MedicalHistorySchema {
//   title: string;
//   name: string;

//   familyHistory: {
//     description: string;
//     asthma: string;
//     diabetes: string;
//     cancer: string;
//     hypertension: string;
//     allergies: string;
//     otherCondition: string;
//   };

//   personalProblems: {
//     description: string;

//     neurological: {
//       sectionTitle: string;
//       headache: string;
//       blurredVision: string;
//       depressedFeelings: string;
//       difficultySleeping: string;
//     };

//     digestive: {
//       sectionTitle: string;
//       nausea: string;
//       vomiting: string;
//       diarrhea: string;
//       constipation: string;
//       stomachPain: string;
//       heartburn: string;
//     };

//     genitourinary: {
//       sectionTitle: string;
//       frequency: string;
//       urgency: string;
//       burning: string;
//       pain: string;
//       sores: string;
//       discharge: string;
//     };

//     musculoskeletal: {
//       sectionTitle: string;
//       arthritis: string;
//       brokenBones: string;
//       sprains: string;
//     };

//     ent: {
//       sectionTitle: string;
//       soreThroat: string;
//       allergies: string;
//       itching: string;
//       earPain: string;
//     };

//     cardiopulmonary: {
//       sectionTitle: string;
//       difficultyBreathing: string;
//       chestPain: string;
//       highBloodPressurePalpitations: string;
//       coughingBlood: string;
//     };

//     skin: {
//       sectionTitle: string;
//       sores: string;
//       rashes: string;
//       unusualSpots: string;
//       itching: string;
//     };

//     other: {
//       sectionTitle: string;
//     };
//   };

//   medications: {
//     question: string;
//   };

//   assessment: {
//     sectionTitle: string;
//     date: string;
//     heightWeight: string;
//     temperature: string;
//     pulseOxygen: string;
//     respiration: string;
//     bloodPressure: string;
//     glucoseLevel: string;
//   };

//   additionalExams: {
//     documentation: string;
//   };

//   carePlan: {
//     goals: string;
//   };
// };


// type Language = "en" | "sp";

const medicalHistory:MedicalHistorySchema = {
  title: "Medical History",
  name: "Name",

//   familyHistory: {
//     description:
//       "Family health history (Check the illnesses that someone in your family has and indicate next to the illness which family member had it)",
//     asthma: "Asthma (difficulty breathing)",
//     diabetes: "Diabetes (blood sugar levels)",
//     cancer: "Cancer (tumors)",
//     hypertension: "Hypertension (high blood pressure)",
//     allergies: "Allergies (food, seasonal, medications)",
//     otherCondition: "Other condition:"
//   },

//   personalProblems: {
//     description:
//       "Personal problems (Check all that apply and explain below)",

//     neurological: {
//       sectionTitle: "Neurological",
//       headache: "Headaches",
//       blurredVision: "Blurred vision",
//       depressedFeelings: "Depressed feelings",
//       difficultySleeping: "Difficulty sleeping"
//     },

//     digestive: {
//       sectionTitle: "Digestive",
//       nausea: "Nausea",
//       vomiting: "Vomiting",
//       diarrhea: "Diarrhea",
//       constipation: "Constipation",
//       stomachPain: "Stomach pain",
//       heartburn: "Heartburn"
//     },

//     genitourinary: {
//       sectionTitle: "Genitourinary",
//       frequency: "Frequency",
//       urgency: "Urgency",
//       burning: "Burning",
//       pain: "Pain",
//       sores: "Sores",
//       discharge:
//         "Discharge (Does it have a specific color? Does it have an odor?)"
//     },

//     musculoskeletal: {
//       sectionTitle: "Musculoskeletal",
//       arthritis: "Arthritis",
//       brokenBones: "Broken bones",
//       sprains: "Sprains"
//     },

//     ent: {
//       sectionTitle: "Eyes, ears, nose, and throat",
//       soreThroat: "Sore throat",
//       allergies: "Allergies",
//       itching: "Itching of eyes/nose/throat",
//       earPain: "Ear pain"
//     },

//     cardiopulmonary: {
//       sectionTitle: "Cardiopulmonary",
//       difficultyBreathing: "Difficulty breathing",
//       chestPain: "Chest pain",
//       highBloodPressurePalpitations:
//         "High blood pressure, palpitations (when the heart beats rapidly)",
//       coughingBlood: "Coughing up blood"
//     },

//     skin: {
//       sectionTitle: "Skin",
//       sores: "Sores",
//       rashes: "Rashes",
//       unusualSpots: "Unusual spots",
//       itching: "Itching"
//     },

//     other: {
//       sectionTitle: "Other"
//     }
//   },

//   medications: {
//     question:
//       "Are you taking medications? (including herbs and supplements)"
//   },

//   assessment: {
//     sectionTitle: "Assessment",
//     date: "Date",
//     heightWeight: "Height & Weight",
//     temperature: "Temperature",
//     pulseOxygen: "Pulse & O2 Pulse",
//     respiration: "Respiration",
//     bloodPressure: "Blood Pressure",
//     glucoseLevel: "Glucose Level"
//   },

//   additionalExams: {
//     documentation:
//       "Include documentation of other examinations:"
//   },

  carePlan: {
    goals:
      "Health goals and care plan:"
  }
};
const medicalHistoryEs:MedicalHistorySchema = {
  title: "Historia Médica",
  name: "Nombre",

//   familyHistory: {
//     description:
//       "Historia de salud familiar (Marque las enfermedades que alguien en su familia tiene e indique al lado de la enfermedad el miembro de la familia que lo tuvo)",
//     asthma: "Asma (dificultades para respirar)",
//     diabetes: "Diabetes (niveles de azúcar en la sangre)",
//     cancer: "Cáncer (tumores)",
//     hypertension: "Hipertensión (presión arterial alta)",
//     allergies: "Alergias (de comida, de las estaciones, de medicamentos)",
//     otherCondition: "Otra condición:"
//   },

//   personalProblems: {
//     description:
//       "Problemas personales (Marque las que correspondan y explique debajo)",

//     neurological: {
//       sectionTitle: "Neurológico",
//       headache: "Dolor de cabeza",
//       blurredVision: "Visión borrosa",
//       depressedFeelings: "Sentimientos deprimidos",
//       difficultySleeping: "Dificultades para dormir"
//     },

//     digestive: {
//       sectionTitle: "Digestivo",
//       nausea: "Náuseas",
//       vomiting: "Vómitos",
//       diarrhea: "Diarrea",
//       constipation: "Estreñimiento",
//       stomachPain: "Dolor del estómago",
//       heartburn: "Ardor del estómago"
//     },

//     genitourinary: {
//       sectionTitle: "Genitourinario",
//       frequency: "Frecuencia",
//       urgency: "Urgencia",
//       burning: "Ardor",
//       pain: "Dolor",
//       sores: "Llagas",
//       discharge:
//         "Secreciones (¿Tiene un color específico? ¿Huele?)"
//     },

//     musculoskeletal: {
//       sectionTitle: "Musculoesquelético",
//       arthritis: "Artritis",
//       brokenBones: "Huesos rotos",
//       sprains: "Torceduras"
//     },

//     ent: {
//       sectionTitle: "Ojos, oídos, nariz y garganta",
//       soreThroat: "Dolor de garganta",
//       allergies: "Alergias",
//       itching: "Picazón de ojos/nariz/garganta",
//       earPain: "Dolor de oídos"
//     },

//     cardiopulmonary: {
//       sectionTitle: "Cardiopulmonar",
//       difficultyBreathing: "Dificultad para respirar",
//       chestPain: "Dolor del pecho",
//       highBloodPressurePalpitations:
//         "Presión alta, palpitaciones (cuando el corazón late rápidamente)",
//       coughingBlood: "Sangre al toser"
//     },

//     skin: {
//       sectionTitle: "Piel",
//       sores: "Llagas",
//       rashes: "Erupciones",
//       unusualSpots: "Manchas peculiares",
//       itching: "Picazón"
//     },

//     other: {
//       sectionTitle: "Otros"
//     }
//   },

//   medications: {
//     question:
//       "¿Está tomando medicamentos? (incluidas las hierbas y suplementos)"
//   },

//   assessment: {
//     sectionTitle: "Evaluación",
//     date: "Fecha",
//     heightWeight: "Altura y peso",
//     temperature: "Temperatura",
//     pulseOxygen: "Pulso y O₂",
//     respiration: "Respiración",
//     bloodPressure: "Presión arterial",
//     glucoseLevel: "Nivel de glucosa"
//   },

//   additionalExams: {
//     documentation:
//       "Incluir documentación de otras examinaciones:"
//   },

//   carePlan: {
//     goals:
//       "Objetivo para la salud y el plan de cuidado:"
//   }
// };

// const languages: Record<Language, MedicalHistorySchema> = {
//   en: medicalHistory,
//   sp: medicalHistoryEs,
// };

// export default function medicalForm() {

  const [language, setLanguage] = useState<Language>("en");

//   const switchLanguage = () => {
//     setLanguage((prev) => (prev === "en" ? "sp" : "en"));
//   };

  const textBox = languages[language];
  return (
    <>
    <ThemedText>{textBox.name}</ThemedText>
    <ThemedText>{textBox.title}</ThemedText>

    <Button onPressIn={switchLanguage}>Switch Languages</Button>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
