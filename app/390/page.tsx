import type {Metadata} from "next";
import Practice390 from "@/app/components/Practice390";
import "./practice390.css";

export const metadata: Metadata = {
  title: "390 CCAR-F Practice Questions — Claude Learning Lab",
  description: "Practise the full 390-question Coding N Concepts CCAR-F bank supplied by the user. Unverified AI-proposed answer key, not an official Anthropic exam.",
};

export default function Practice390Page() {
  return <Practice390 />;
}