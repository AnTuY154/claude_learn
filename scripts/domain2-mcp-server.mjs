#!/usr/bin/env node
/**
 * LESSON 2.2 + 2.4 — REAL MCP SERVER (TypeScript MCP SDK v2 for Node.js)
 *
 * Install once, locally (this repository's website itself stays static):
 * npm install --no-save --package-lock=false @modelcontextprotocol/server @modelcontextprotocol/client zod
 *
 * Run: npm run lab:domain2:mcp
 * The server communicates over stdin/stdout with the MCP host.
 * NEVER console.log() to stdout while serving stdio — it corrupts JSON-RPC.
 * No Claude model is called in this file; MCP is a tool protocol, not an LLM.
 *
 * Exercises:
 * 2.2: customer_lookup returns 4 error categories + valid empty response.
 * 2.4: read-only resource exposes the toy customer database schema.
 */
import { customerLookup } from "./domain2-core.mjs";

let McpServer,serveStdio,z;
try {
  ({McpServer}=await import("@modelcontextprotocol/server"));
  ({serveStdio}=await import("@modelcontextprotocol/server/stdio"));
  z=await import("zod/v4");
} catch {
  console.error("MCP SDK v2 missing. Run: npm install --no-save --package-lock=false @modelcontextprotocol/server @modelcontextprotocol/client zod");
  process.exit(1);
}

function makeServer(){
  const server=new McpServer({name:"domain2-customer-demo",version:"1.0.0"});

  // Register the real MCP tool. The inputSchema is converted to JSON Schema
  // by the SDK, and shape is checked before the handler is invoked.
  server.registerTool("customer_lookup",{
    description:[
      "Lookup a demo customer by ID such as C001, returning one account or",
      "a successful empty result. Only use for checking demo customer accounts.",
      "Does not retrieve orders. failureMode is strictly for test scenarios:",
      "none/transient/business/permission. Validation errors are handled",
      "inside the handler when a non-empty ID fails C[0-9]{3} business format."
    ].join(" "),
    inputSchema:z.object({
      customerId:z.string().min(1).describe("Demo customer identifier; C001 format"),
      failureMode:z.enum(["none","transient","business","permission"]).optional()
        .describe("TEST ONLY: simulate category; never production input")
    })
  },async ({customerId,failureMode})=>customerLookup({customerId,failureMode}));

  // MCP Resource is data that the host/client may explicitly read.
  // It is NOT silently injected into every model context.
  server.registerResource(
    "customer-database-schema",
    "demo://customers/schema",
    {title:"Demo customer database schema",mimeType:"application/json"},
    async uri=>({
      contents:[{
        uri:uri.href,
        mimeType:"application/json",
        text:JSON.stringify({table:"customers",columns:[
          {name:"id",type:"string",example:"C001"},
          {name:"name",type:"string"},
          {name:"status",type:"string"}
        ]})
      }]
    })
  );
  return server;
}

// Stdio server stays alive until its host closes the stream.
void serveStdio(makeServer);
console.error("[MCP] domain2-customer-demo listening over stdio (no real customer data).");
