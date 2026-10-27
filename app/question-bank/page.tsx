import type {Metadata} from "next";
import QuestionBank from "@/app/components/QuestionBank";

export const metadata:Metadata={title:"CCAR-F Question Bank — 7 bilingual practice sets",description:"420 original CCAR-F multiple choice practice questions in Vietnamese and English, organised into seven sets with immediate feedback."};

export default function QuestionBankPage(){return <QuestionBank/>;}
