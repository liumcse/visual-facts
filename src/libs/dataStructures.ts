export enum EntityType {
  FUNCTION = "function",
  CLASS = "class",
  VARIABLE = "variable",
}

export enum RelationType {
  REFERENCE = "reference",
  CONTAIN = "contain",
  CALL = "call",
}

/**
 * Returns the inferred entity type given the name of that entity
 * @param entityName Full name of entity; e.g. org.apache.commons.csv.CSVParser.1.static {...}
 */
export function inferEntityType(entityName: string) {
  // Test if it is a function
  if (
    (entityName.includes("(") && entityName.includes(")")) ||
    entityName.includes("{...}")
  )
    return EntityType.FUNCTION;
  // Test if it is a variable
  if (entityName.includes(" : ")) return EntityType.VARIABLE;
  // TODO: Test if it is a class
  return EntityType.CLASS;
}

/**
 * Directed relation between two entities
 */
export class Relation {
  private from: Entity;
  private to: Entity;
  private relationType: RelationType;

  /**
   * Creates a new relation
   * @param from Entity starting the relation
   * @param to Entity ending the relation
   * @param relationType Type of relation
   */
  constructor(from: Entity, to: Entity, relationType: RelationType) {
    this.from = from;
    this.to = to;
    this.relationType = relationType;
  }

  /**
   * Returns the entity starting the relation
   */
  getFrom() {
    return this.from;
  }

  /**
   * Returns the entity ending the relation
   */
  getTo() {
    return this.to;
  }

  /**
   * Returns the relation type
   */
  getType() {
    return this.relationType;
  }

  /**
   * Returns whether two relations are equal by checking if the two start and end with identical entities, and have the same relation type
   * @param another Another relation to be compared with
   */
  equals(another: Relation) {
    return (
      this.from.equals(another.from) &&
      this.to.equals(another.to) &&
      this.relationType === another.relationType
    );
  }
}

/**
 * Entity that describing a program fact, which can be a class, function or variable
 */
export class Entity {
  name: string;
  entityType: EntityType;

  /**
   * Creates a new entity
   * @param name Name of the entity
   */
  constructor(name: string) {
    this.name = name;
    this.entityType = inferEntityType(name);
  }

  /**
   * Returns the name of entity
   */
  getName() {
    return this.name;
  }

  /**
   * Returns the type of entity
   */
  getEntityType() {
    return this.entityType;
  }

  /**
   * Returns whether two entities are equal by checking if the two entities have the same name
   * @param another Another relation to be compared with
   */
  equals(another: Entity) {
    return this.name === another.name;
  }
}

/**
 * Directed graph
 */
export class RelationGraph {
  private nodes: Array<Entity> = [];
  private relations: Array<Relation> = [];
  private map: Map<Entity, Array<Relation>> = new Map();
  private entityTrie: EntityTrie = new EntityTrie();

  /**
   * Finds and returns the entity that stored in the graph; returns undefined if not found
   * @param entity Entity to be searched for
   */
  private findEntity(entity: Entity) {
    for (const node of this.nodes) {
      if (entity.name === node.name) return node;
    }
    return undefined;
  }

  /**
   * Adds an entity to the graph
   * @param entity Entity to be added
   */
  private addEntity(entity: Entity) {
    // Make sure the entity doesn't already exist in the graph
    const existingEntity = this.findEntity(entity);
    if (existingEntity) return existingEntity;
    // Add to map and nodes
    // Deep copy the entity object to avoid using the old entity reference
    const newEntity = new Entity(entity.getName());
    this.map.set(newEntity, []);
    this.nodes.push(newEntity);
    this.entityTrie.addEntity(entity);
    return newEntity;
  }

  /**
   * Adds a relation to the graph
   * @param relation Relation to be added
   */
  addRelation(relation: Relation) {
    const from =
      this.findEntity(relation.getFrom()) || this.addEntity(relation.getFrom());
    const to =
      this.findEntity(relation.getTo()) || this.addEntity(relation.getTo());
    const newRelation = new Relation(from, to, relation.getType());
    // Add to map and relations
    (this.map.get(from) as Array<Relation>).push(newRelation);
    this.relations.push(newRelation);
  }

  /**
   * Returns entities with given prefix
   * @param prefix Prefix of the entity name; e.g. org.apache.commons.csv
   */
  getEntitiesByPrefix(prefix: string) {
    // TODO: refactor the method by implementing a trie-like structure to speed up filtering
    if (prefix === "") return this.nodes;
    return this.nodes.filter(node => node.getName().includes(prefix));
  }

  /**
   * Returns all relations in the graph
   */
  getAllRelations() {
    return this.relations;
  }

  /**
   * Returns all entities in the graph
   */
  getAllEntities() {
    return this.nodes;
  }

  /**
   * Returns all relations starting from that entity
   * @param entity Entity that starts the relation
   */
  getRelationsByEntity(entity: Entity): Array<Relation> {
    return this.map.get(entity) || [];
  }

  /**
   * Returns mapping in the graph
   */
  getMap() {
    return this.map;
  }

  /**
   * Returns trie in the graph
   */
  getTrie() {
    return this.entityTrie;
  }

  /**
   * Returns information about the graph
   */
  getStats() {
    return `The relation graph contains ${this.nodes.length} entities and ${this.relations.length} relations.`;
  }
}

type EntityTrieNode = {
  name: string;
  isEntity: boolean;
  entityType: EntityType | null;
  children: Map<string, EntityTrieNode>;
};

export class EntityTrie {
  root: EntityTrieNode = {
    name: "",
    isEntity: false,
    entityType: null,
    children: new Map(),
  };

  /**
   * Adds an entity to the trie
   * @param entity Entity to be added to the trie
   */
  addEntity(entity: Entity) {
    const namePath = entity.getName().split(".");
    let temp = this.root;
    for (const loc of namePath) {
      if (typeof temp.children.get(loc) !== "undefined") {
        temp = temp.children.get(loc) as EntityTrieNode;
        continue;
      }
      // Create new node
      temp.children.set(loc, {
        name: loc,
        isEntity: false,
        entityType: null,
        children: new Map(),
      });
      temp = temp.children.get(loc) as EntityTrieNode;
    }
    temp.isEntity = true;
    temp.entityType = entity.getEntityType();
  }

  /**
   * Lists entities under prefix; e.g. e.g. org.apache.commons.csv
   * @param prefix Path to be looked for
   */
  listEntitiesUnderPrefix(prefix?: string) {
    if (!prefix) {
      return Array.from(this.root.children.values()).map(entityTrieNode => ({
        name: entityTrieNode.name,
        entityType: entityTrieNode.entityType,
      }));
    }
    const splittedName = prefix.split(".");
    let temp = this.root;
    for (const loc of splittedName) {
      if (typeof temp.children.get(loc) === "undefined") {
        throw new Error("Not exist");
      }
      temp = temp.children.get(loc) as EntityTrieNode;
    }
    return Array.from(temp.children.values()).map(entityTrieNode => ({
      name: entityTrieNode.name,
      entityType: entityTrieNode.entityType,
    }));
  }
}
