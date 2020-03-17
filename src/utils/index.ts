export const ENTITY_TYPE = {
  FUNCTION: "function",
  CLASS: "class",
  VARIABLE: "variable",
};

export function cx(...classNames: string[]) {
  classNames = classNames.filter(className => !!className); // filter out empty string
  return classNames.join(" ");
}

/**
 * Infer entity type from entity name
 * @param entity Entity name from which to infer type
 */
export function inferEntityType(entity: string): string {
  // Test if it is a function
  if (
    (entity.includes("(") && entity.includes(")")) ||
    entity.includes("{...}")
  )
    return ENTITY_TYPE.FUNCTION;
  // Test if it is a variable
  if (entity.includes(" : ")) return ENTITY_TYPE.VARIABLE;
  // Test if it is a class
  return ENTITY_TYPE.CLASS;
}

/**
 * Convert entity name into name path
 * @param entityName Entity name
 */
export function convertEntityNameToPath(entityName: string) {
  // TODO: this function has problems in detecting patterns like
  // org.apache.commons.csv.TokenMatchers.hasType(Token.Type)
  if (entityName.includes("static {...}")) {
    return entityName
      .slice(0, entityName.length - 13)
      .split(".")
      .concat(["static {...}"]);
  } else if (entityName.includes("1.{...}")) {
    return entityName
      .slice(0, entityName.length - 8)
      .split(".")
      .concat(["1.{...}"]);
  } else if (entityName.includes("2.{...}")) {
    return entityName
      .slice(0, entityName.length - 8)
      .split(".")
      .concat(["2.{...}"]);
  } else if (entityName.includes("3.{...}")) {
    return entityName
      .slice(0, entityName.length - 8)
      .split(".")
      .concat(["3.{...}"]);
  } else if (entityName.includes("4.{...}")) {
    return entityName
      .slice(0, entityName.length - 8)
      .split(".")
      .concat(["4.{...}"]);
  }
  return entityName.split(".");
}
