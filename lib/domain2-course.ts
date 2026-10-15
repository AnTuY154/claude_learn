import { lesson21 } from "./domain2/lesson21.ts";
import { lesson22 } from "./domain2/lesson22.ts";
import { lesson23 } from "./domain2/lesson23.ts";
import { lesson24 } from "./domain2/lesson24.ts";
import { lesson25 } from "./domain2/lesson25.ts";
import type { Domain2Entry } from "./domain2-types.ts";

const BASE="https://claudecertificationguide.com/learn/2-tool-design-mcp/";
export const domain2:Record<number,Domain2Entry>={
  1:{number:1,source:BASE+"2-1-tool-schema-design",...lesson21},
  2:{number:2,source:BASE+"2-2-structured-error-responses",...lesson22},
  3:{number:3,source:BASE+"2-3-tool-distribution-choice",...lesson23},
  4:{number:4,source:BASE+"2-4-mcp-server-integration",...lesson24},
  5:{number:5,source:BASE+"2-5-built-in-tools",...lesson25}
};
