import {
  RelationGraph,
  Relation,
  Entity,
  inferEntityType,
  EntityType,
  RelationType,
} from "./dataStructures";

describe("inferEntityType", () => {
  it("should infer as function", () => {
    const entityNames = [
      "org.apache.commons.csv.Token.Type.values()",
      "org.apache.commons.csv.CSVParser.1.static {...}",
      "org.apache.commons.csv.CSVFormat.Predefined.Predefined(String,int)",
    ];
    for (const name of entityNames) {
      expect(inferEntityType(name)).toBe(EntityType.FUNCTION);
    }
  });

  it("should infer as class", () => {
    const entityNames = [
      "org.apache.commons.csv.CSVFormat",
      "org.apache.commons.csv.CSVParser.1",
      "int[]",
    ];
    for (const name of entityNames) {
      expect(inferEntityType(name)).toBe(EntityType.CLASS);
    }
  });

  it("should infer as variable", () => {
    const entityNames = [
      "org.apache.commons.csv.Token.Type.TOKEN : Type",
      "org.apache.commons.csv.QuoteMode.ALL : QuoteMode",
      "org.apache.commons.csv.QuoteMode.$VALUES : QuoteMode[]",
    ];
    for (const name of entityNames) {
      expect(inferEntityType(name)).toBe(EntityType.VARIABLE);
    }
  });
});

describe("RelationGraph", () => {
  const graph = new RelationGraph();
  const relations = [
    new Relation(
      new Entity("org.apache.commons.csv.Token.Type.values()"),
      new Entity("org.apache.commons.csv.QuoteMode.ALL : QuoteMode"),
      RelationType.CONTAIN,
    ),
    new Relation(
      new Entity("org.apache.commons.csv.Token.Type.values()"),
      new Entity("org.apache.commons.csv.CSVFormat"),
      RelationType.REFERENCE,
    ),
    new Relation(
      new Entity("org.apache.commons.csv.Token.Type.values()"),
      new Entity("org.apache.commons.csv.CSVParser.1.static {...}"),
      RelationType.CALL,
    ),
  ];

  it("should be able to initialize RelationGraph", () => {
    expect(new RelationGraph()).toBeInstanceOf(RelationGraph);
  });

  it("should be able to add and maintain relations", () => {
    for (const relation of relations) {
      graph.addRelation(relation);
    }
    const newRelations = graph.getAllRelations();
    expect(newRelations.length).toEqual(relations.length);
    for (let i = 0; i < relations.length; i++) {
      relations[i].equals(newRelations[i]);
    }
  });

  it("should be able to find all entities in map", () => {
    for (const relation of relations) {
      graph.addRelation(relation);
    }
    const allEntities = graph.getAllEntities();
    const map = graph.getMap();
    for (const entity of allEntities) {
      expect(map.get(entity)).toBeDefined();
    }
  });
});
