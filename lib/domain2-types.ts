export type Domain2Language = "vi"|"en";
export type Domain2Section = { title:string; explanation:string[]; code?:string; codeLabel?:string; keyPoint:string; pitfall?:string };
export type Domain2Quiz = { question:string; choices:[string,string,string,string]; correct:number; explanation:string };
export type Domain2LabStep = { title:string; instruction:string; why:string; expected:string };
export type Domain2Content = {
  title:string; subtitle:string; bridge:string; scenarioTitle:string; scenario:string;
  sections:Domain2Section[]; table:{ headers:[string,string,string]; rows:[string,string,string][] };
  vocabulary:[string,string,string][]; summary:string[]; quiz:Domain2Quiz[];
  lab:{title:string; duration:string; goal:string; steps:Domain2LabStep[]; commands:string; source:string; disclaimer:string};
};
export type Domain2Entry = {number:number; source:string; vi:Domain2Content; en:Domain2Content};
