export const ENTITY_TYPE = {
  FUNCTION: "function",
  CLASS: "class",
  VARIABLE: "variable",
};

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
