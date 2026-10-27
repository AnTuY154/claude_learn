import type {Metadata} from "next";
import QuestionBank from "@/app/components/QuestionBank";

export const metadata:Metadata={title:"CCAR-F Question Bank — 5 bilingual practice sets",description:"300 original CCAR-F multiple choice practice questions in Vietnamese and English, organised into five sets with immediate feedback."};

export default function QuestionBankPage(){return <QuestionBank/>;}
