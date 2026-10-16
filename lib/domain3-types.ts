import type { Domain2Content } from "./domain2-types.ts";
export type Domain3Entry={number:number;source:string;vi:Domain2Content;en:Domain2Content};
export function makeDomain3(number:number,slug:string,vi:Domain2Content,en:Domain2Content):Domain3Entry{
 return {number,source:"https://claudecertificationguide.com/learn/3-claude-code-config/3-"+number+"-"+slug,vi,en};
}
