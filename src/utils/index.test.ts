import { convertEntityNameToPath } from "./index";

describe("convertEntityNameToPath", () => {
  it("should convert entity name to path", () => {
    const entityNames = [
      "org.apache.commons.csv.Token.Type.values()",
      "org.apache.commons.csv.CSVParser.1.static {...}",
    ];
    const goals = [
      ["org", "apache", "commons", "csv", "Token", "Type", "values()"],
      ["org", "apache", "commons", "csv", "CSVParser", "1", "static {...}"],
    ];
    expect(
      entityNames.map(entityName => convertEntityNameToPath(entityName)),
    ).toEqual(goals);
  });
});
