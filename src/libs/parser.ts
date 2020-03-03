import * as fs from "fs";
import * as utils from "../utils";
import { RelationType } from "./dataStructures";

export function loadFactTuple(absolutePath: string) {
  process.noAsar = true; // This must be set in order to use 'fs'
  const deps = fs
    .readFileSync(absolutePath)
    .toString()
    .split("\n")
    .slice(1); // Ignore the first line
  return deps;
}

export function parseFactTuple(
  line: string,
): { relationType: RelationType; from: string; to: string } {
  const regex = /(.+)\s"(.+)"\s"(.+)"/g;
  const match = regex.exec(line);
  if (!match) throw new Error("Invalid fact tuple");
  const relationType =
    match[1] === "reference"
      ? RelationType.REFERENCE
      : match[1] === "call"
      ? RelationType.CALL
      : RelationType.CONTAIN;
  const from = match[2];
  const to = match[3];
  return { relationType, from, to };
}

function __analyzeRelations() {
  const output = {
    class: {
      class: [],
      function: [],
      variable: [],
    },
    function: {
      class: [],
      function: [],
      variable: [],
    },
    variable: {
      class: [],
      function: [],
      variable: [],
    },
  };
  const deps = loadFactTuple(
    "/Users/ming/Desktop/FYP/app/src/dummyData/dep-moblima.ta",
  );
  for (const line of deps) {
    if (!line) continue;
    const parsed = parseFactTuple(line);
    const fromType = utils.inferEntityType(parsed.from);
    const toType = utils.inferEntityType(parsed.to);
    // @ts-ignore
    if (output[fromType][toType].includes(parsed.relationType)) continue;
    // @ts-ignore
    output[fromType][toType].push(parsed.relationType);
  }
  console.log(output);
}
