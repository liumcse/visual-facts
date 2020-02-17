import * as fs from "fs";
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
