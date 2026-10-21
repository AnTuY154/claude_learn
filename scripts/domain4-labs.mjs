/**
 * Domain 4 learning scaffolds: deterministic, no API key and no Claude calls.
 * Refuses to overwrite existing student work. Run from repo root:
 *   npm run lab:domain4 -- 1
 * Each lesson creates domain4-workspaces/lesson4N with its own check.mjs.
 */
import {existsSync,mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
const fixture={
  "1": {
    "description": "Explicit review criteria, severity examples and per-category precision.",
    "files": {
      "review-policy.md": "# Review policy\nReport: functional bugs, security vulnerabilities, misleading behaviour comments.\nSkip: naming, formatting, unsupported speculation.\nCritical: untrusted input concatenated into a SQL query.\n",
      "findings.json": "[\n  {\n    \"category\": \"style\",\n    \"accepted\": false\n  },\n  {\n    \"category\": \"style\",\n    \"accepted\": false\n  },\n  {\n    \"category\": \"style\",\n    \"accepted\": true\n  },\n  {\n    \"category\": \"security\",\n    \"accepted\": true\n  }\n]",
      "check.mjs": "import {readFileSync} from \"node:fs\";\nconst results=JSON.parse(readFileSync(\"findings.json\",\"utf8\"));\nconst byCategory={};\nfor(const f of results){const x=byCategory[f.category]??={reported:0,accepted:0};x.reported++;x.accepted+=Number(f.accepted);}\nconst stats=Object.entries(byCategory).map(([category,s])=>({category,precision:Number((s.accepted/s.reported).toFixed(2))}));\nif(!stats.some(x=>x.category===\"style\"&&x.precision<0.5))throw Error(\"Expected noisy style category\");\nconsole.log(JSON.stringify({disabledCategory:\"style\",stats},null,2));"
    }
  },
  "2": {
    "description": "Few-shot routing demonstrations, with independent hold-out queries.",
    "files": {
      "examples.json": "[\n  {\n    \"input\": \"Where is order #10?\",\n    \"output\": \"lookup_order\",\n    \"why\": \"Specific order ID indicates order-level lookup.\"\n  },\n  {\n    \"input\": \"Change my billing email\",\n    \"output\": \"get_customer\",\n    \"why\": \"Account field update is not an order lookup.\"\n  },\n  {\n    \"input\": \"Customer 7 asks about order #4\",\n    \"output\": \"lookup_order\",\n    \"why\": \"Order ID is the decisive identifier.\"\n  }\n]",
      "holdout.json": "[\n  {\n    \"input\": \"Has order #77 shipped?\",\n    \"output\": \"lookup_order\"\n  },\n  {\n    \"input\": \"What is my account email?\",\n    \"output\": \"get_customer\"\n  }\n]",
      "check.mjs": "import {readFileSync} from \"node:fs\";\nconst examples=JSON.parse(readFileSync(\"examples.json\",\"utf8\"));\nconst holdout=JSON.parse(readFileSync(\"holdout.json\",\"utf8\"));\nif(examples.length<2||examples.length>4||examples.some(x=>!x.input||!x.output||!x.why))throw Error(\"Need 2–4 examples with input, output and why\");\nif(holdout.some(x=>examples.some(y=>x.input===y.input)))throw Error(\"Hold-out overlaps few-shot prompt\");\nconsole.log(JSON.stringify({examples:examples.length,unseenCases:holdout.length,status:\"ready for real evaluation\"},null,2));"
    }
  },
  "3": {
    "description": "Nullable invoice fields, unclear/other categories and semantic limitations.",
    "files": {
      "schema.json": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"invoice_number\": {\n      \"type\": \"string\"\n    },\n    \"vendor\": {\n      \"type\": \"string\"\n    },\n    \"category\": {\n      \"type\": \"string\",\n      \"enum\": [\n        \"invoice\",\n        \"receipt\",\n        \"contract\",\n        \"unclear\",\n        \"other\"\n      ]\n    },\n    \"category_detail\": {\n      \"type\": [\n        \"string\",\n        \"null\"\n      ]\n    },\n    \"purchase_order\": {\n      \"type\": [\n        \"string\",\n        \"null\"\n      ]\n    },\n    \"payment_terms\": {\n      \"type\": [\n        \"string\",\n        \"null\"\n      ]\n    }\n  },\n  \"required\": [\n    \"invoice_number\",\n    \"vendor\",\n    \"category\",\n    \"category_detail\",\n    \"purchase_order\",\n    \"payment_terms\"\n  ],\n  \"additionalProperties\": false\n}",
      "receipt.json": "{\n  \"invoice_number\": \"R-12\",\n  \"vendor\": \"Sample vendor\",\n  \"category\": \"receipt\",\n  \"category_detail\": null,\n  \"purchase_order\": null,\n  \"payment_terms\": null\n}",
      "check.mjs": "import {readFileSync} from \"node:fs\";\nconst schema=JSON.parse(readFileSync(\"schema.json\",\"utf8\"));\nconst receipt=JSON.parse(readFileSync(\"receipt.json\",\"utf8\"));\nconst type=schema.properties.purchase_order.type;\nif(!Array.isArray(type)||!type.includes(\"null\"))throw Error(\"purchase_order must be nullable\");\nif(receipt.purchase_order!==null)throw Error(\"Missing purchase order must be null\");\nfor(const k of [\"unclear\",\"other\"])if(!schema.properties.category.enum.includes(k))throw Error(\"Missing category \"+k);\nconsole.log(JSON.stringify({validShape:true,purchaseOrder:receipt.purchase_order,needsSemanticValidation:true},null,2));"
    }
  },
  "4": {
    "description": "Recoverable arithmetic mismatch versus truly absent source evidence.",
    "files": {
      "original.json": "{\n  \"text\": \"Invoice: A £150, B £300, C £50; total £500.\",\n  \"line_items\": [\n    {\n      \"description\": \"A\",\n      \"amount\": 150\n    },\n    {\n      \"description\": \"B\",\n      \"amount\": 300\n    },\n    {\n      \"description\": \"C\",\n      \"amount\": 50\n    }\n  ],\n  \"stated_total\": 500\n}",
      "failed-extraction.json": "{\n  \"line_items\": [\n    {\n      \"description\": \"A\",\n      \"amount\": 150\n    },\n    {\n      \"description\": \"B\",\n      \"amount\": 300\n    }\n  ],\n  \"stated_total\": 500\n}",
      "missing-reference.json": "{\n  \"text\": \"No project reference is shown\",\n  \"project_reference\": null\n}",
      "check.mjs": "import {readFileSync} from \"node:fs\";\nconst source=JSON.parse(readFileSync(\"original.json\",\"utf8\"));\nconst failed=JSON.parse(readFileSync(\"failed-extraction.json\",\"utf8\"));\nconst sum=failed.line_items.reduce((a,b)=>a+b.amount,0);\nconst error=\"line items sum to \"+sum+\" but stated_total is \"+failed.stated_total;\nif(sum===failed.stated_total)throw Error(\"Fixture must show a recoverable discrepancy\");\nconst retry={original_document:source,failed_extraction:failed,validation_error:error};\nconst missing=JSON.parse(readFileSync(\"missing-reference.json\",\"utf8\"));\nif(missing.project_reference!==null)throw Error(\"Absent reference must remain null\");\nconsole.log(JSON.stringify({retry,mustEscalateMissingReference:true},null,2));"
    }
  },
  "5": {
    "description": "Blocking classification, unique batch result IDs, SLA and selective resubmission.",
    "files": {
      "workloads.json": "[\n  {\n    \"id\": \"pre-merge\",\n    \"blocking\": true\n  },\n  {\n    \"id\": \"nightly-audit\",\n    \"blocking\": false\n  }\n]",
      "results.json": "[\n  {\n    \"custom_id\": \"policy-1\",\n    \"result\": {\n      \"type\": \"succeeded\"\n    }\n  },\n  {\n    \"custom_id\": \"policy-2\",\n    \"result\": {\n      \"type\": \"errored\"\n    }\n  },\n  {\n    \"custom_id\": \"policy-3\",\n    \"result\": {\n      \"type\": \"expired\"\n    }\n  }\n]",
      "check.mjs": "import {readFileSync} from \"node:fs\";\nconst tasks=JSON.parse(readFileSync(\"workloads.json\",\"utf8\"));\nconst results=JSON.parse(readFileSync(\"results.json\",\"utf8\"));\nconst mode=tasks.map(x=>({id:x.id,api:x.blocking?\"synchronous\":\"batch\"}));\nconst retry=results.filter(x=>[\"errored\",\"expired\"].includes(x.result.type)).map(x=>x.custom_id);\nif(new Set(results.map(x=>x.custom_id)).size!==results.length)throw Error(\"custom_id must be unique\");\nif(retry.includes(\"policy-1\"))throw Error(\"Never resubmit a success\");\nconst buffer=30-24-4;\nif(buffer!==2)throw Error(\"Wrong SLA buffer\");\nconsole.log(JSON.stringify({mode,retry,bufferHours:buffer},null,2));"
    }
  },
  "6": {
    "description": "Independent local findings and integration-contract verification.",
    "files": {
      "contracts.json": "{\n  \"clientExpects\": \"chargePayment\",\n  \"serviceExports\": \"reservePayment\"\n}",
      "per-file-findings.json": "[\n  {\n    \"file\": \"checkout.js\",\n    \"finding\": \"Local input validation is missing\",\n    \"confidence\": 0.78\n  },\n  {\n    \"file\": \"payment-service.js\",\n    \"finding\": \"Function export matches local implementation\",\n    \"confidence\": 0.9\n  }\n]",
      "check.mjs": "import {readFileSync} from \"node:fs\";\nconst contracts=JSON.parse(readFileSync(\"contracts.json\",\"utf8\"));\nconst findings=JSON.parse(readFileSync(\"per-file-findings.json\",\"utf8\"));\nconst mismatch=contracts.clientExpects!==contracts.serviceExports;\nif(!mismatch)throw Error(\"Fixture must exhibit a cross-file contract violation\");\nif(findings.length<2)throw Error(\"Need local findings from at least two files\");\nconsole.log(JSON.stringify({localReviewUnits:findings.length,integrationFinding:mismatch?\"Client calls \"+contracts.clientExpects+\" but service exports \"+contracts.serviceExports:null,requiresIndependentReviewer:true},null,2));"
    }
  }
};
const number=Number(process.argv[2]);
if(!Number.isInteger(number)||number<1||number>6){
 console.error("Usage: npm run lab:domain4 -- <1..6>");process.exit(2);
}
const output=path.resolve("domain4-workspaces","lesson4"+number);
if(existsSync(output)){console.error("Refusing to overwrite existing work:",output);process.exit(1);}
const unit=fixture[number];
mkdirSync(output,{recursive:true});
const readme="# Domain 4."+number+" learning workspace\n\n"+unit.description+"\n\nRun `node check.mjs` in this folder. Checks are deterministic examples, not Claude model results.\nDo not put API keys into these files.\n";
writeFileSync(path.join(output,"README.md"),readme,"utf8");
for(const [name,value] of Object.entries(unit.files))writeFileSync(path.join(output,name),value,"utf8");
console.log("Created",output,"\nRun: cd",output,"&& node check.mjs");
