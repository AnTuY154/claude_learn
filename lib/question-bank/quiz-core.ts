export type ChoiceKey="A"|"B"|"C"|"D"|"E";
export type QuestionKind="single_answer"|"multiple_response";
export type Question={
 id:string;domain_code:string;domain_name:string;question:string;
 options:{key:ChoiceKey;text:string}[];
 answer:ChoiceKey[];
 explanation:string;sources:string[];
 question_type:QuestionKind;select_count:number;selection_instruction:string;
 difficulty?:string;
};
export type ExamSet={set_id:string;questions:Question[];difficulty?:string};
export type ExamData={title:string;note:string;language:string;exam_sets:ExamSet[];total_questions:number;questions_per_set:number};
export type AnswerStore=Record<string,Record<string,ChoiceKey[]>>;

export function sameAnswers(chosen:readonly ChoiceKey[]|undefined,expected:readonly ChoiceKey[]):boolean{
 return !!chosen&&chosen.length===expected.length&&new Set(chosen).size===chosen.length&&expected.every(key=>chosen.includes(key));
}

// Strictly validate persisted selections against this edition's question schema.
export function validSelection(raw:unknown,question:Question,completed:boolean):ChoiceKey[]|null{
 if(!Array.isArray(raw))return null;
 if(raw.some(key=>typeof key!=="string"||!question.options.some(option=>option.key===key)))return null;
 const keys=raw as ChoiceKey[];
 if(new Set(keys).size!==keys.length)return null;
 if(completed&&keys.length!==question.select_count)return null;
 if(!completed&&(keys.length===0||keys.length>question.select_count||question.question_type!=="multiple_response"))return null;
 return [...keys];
}
export function summariseSet(set:ExamSet,answers:Record<string,ChoiceKey[]>={}){
 const answered=set.questions.filter(q=>answers[q.id]!==undefined).length;
 const correct=set.questions.filter(q=>sameAnswers(answers[q.id],q.answer)).length;
 return {id:set.set_id,total:set.questions.length,answered,correct};
}
