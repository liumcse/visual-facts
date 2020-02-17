import { parseFactTuple } from "./parser";
import { RelationType } from "./dataStructures";

describe("parseFactTuple", () => {
  it("should parse valid fact tuple", () => {
    const factTuples = [
      'reference "org.apache.commons.csv.CSVParser.1" "org.apache.commons.csv.Token.Type"',
      'call "org.apache.commons.csv.CSVParser.1.static {...}" "org.apache.commons.csv.Token.Type.values()"',
      'contain "org.apache.commons.csv.CSVParser.1" "org.apache.commons.csv.CSVParser.1.static {...}"',
    ];
    const goals = [
      {
        relationType: RelationType.REFERENCE,
        from: "org.apache.commons.csv.CSVParser.1",
        to: "org.apache.commons.csv.Token.Type",
      },
      {
        relationType: RelationType.CALL,
        from: "org.apache.commons.csv.CSVParser.1.static {...}",
        to: "org.apache.commons.csv.Token.Type.values()",
      },
      {
        relationType: RelationType.CONTAIN,
        from: "org.apache.commons.csv.CSVParser.1",
        to: "org.apache.commons.csv.CSVParser.1.static {...}",
      },
    ];
    for (let i = 0; i < factTuples.length; i++) {
      expect(parseFactTuple(factTuples[i])).toEqual(goals[i]);
    }
  });
});
