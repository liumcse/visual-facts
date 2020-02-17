import * as React from "react";

// @ts-ignore
import DagreD3 from "./DagreD3.jsx";

import * as styles from "./style.scss";

import {
  RelationGraph,
  Relation,
  Entity,
  EntityTrie,
} from "@root/libs/dataStructures";
import * as parser from "@root/libs/parser";
import { connect } from "react-redux";

function createRelationGraph() {
  const graph = new RelationGraph();
  // TODO: get path from parameter
  const factTuples = parser.loadFactTuple(
    "/Users/ming/Desktop/FYP/app/src/dummyData/dep-csv.ta",
  );
  for (const factTuple of factTuples) {
    if (!factTuple) continue;
    const parsed = parser.parseFactTuple(factTuple);
    // Add to graph
    graph.addRelation(
      new Relation(
        new Entity(parsed.from),
        new Entity(parsed.to),
        parsed.relationType,
      ),
    );
  }
  return graph;
}

function relationGraphToDagre(graph: RelationGraph) {
  const dagre: any = {
    nodes: {},
    edges: [],
  };
  const entities = graph.getAllEntities();
  // Add to trie
  const trie = new EntityTrie();
  for (const entity of entities) {
    trie.addEntity(entity);
  }
  console.log("trie root", trie.root);
  console.log(
    "names",
    trie.listEntitiesUnderPrefix(/* "org.apache.commons.csv" */),
  );
  // const map = graph.getMap();
  const entityToNumber: any = {};
  let counter = 1;
  for (const entity of entities) {
    entityToNumber[entity.getName()] = String(counter);
    dagre.nodes[String(counter)] = { label: entity.getName() };
    counter++;
  }
  for (const entity of entities) {
    const relations = graph.getRelationsByEntity(entity);
    for (const relation of relations) {
      const [from, to, relationType] = [
        entity.getName(),
        relation.getTo().getName(),
        relation.getType(),
      ];
      // Make sure both entities are present in Dagre
      if (typeof entityToNumber[to] === "undefined") continue;
      dagre.edges.push([
        entityToNumber[from],
        entityToNumber[to],
        {
          label: relationType,
        },
      ]);
    }
  }
  return dagre;
}

function Visualization(props) {
  // const relationGraph = createRelationGraph();
  // console.log(relationGraph.getStats());
  const { relationGraph } = props;
  const dagre = relationGraphToDagre(relationGraph);
  return (
    <div className={styles.canvas}>
      <DagreD3
        nodes={dagre.nodes}
        edges={dagre.edges}
        height="2400"
        interactive
      />
    </div>
  );
}

// TODO: fix the type
const mapStateToProps = (state: any) => ({
  relationGraph: state.relationGraph || new RelationGraph(),
});

export default connect(mapStateToProps)(Visualization);
