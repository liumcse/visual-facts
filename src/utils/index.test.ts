import { convertEntityNameToPath, cx } from "./index";

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

describe("cx", () => {
  it("should concat class names", () => {
    expect(
      cx("container-1", "container-2", "container-3", "", "container-5"),
    ).toEqual("container-1 container-2 container-3 container-5");
  });
});
