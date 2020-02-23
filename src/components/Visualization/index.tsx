import * as React from "react";

// @ts-ignore
import DagreD3 from "./DagreD3.jsx";

import * as styles from "./style.scss";

import { RelationGraph, EntityTrie } from "@root/libs/dataStructures";
import { connect } from "react-redux";

function relationGraphToDagre(graph: RelationGraph, selectedPath?: string) {
  const dagre: any = {
    nodes: {},
    edges: [],
  };
  // const entities = graph.getAllEntities();
  const trie = graph.getTrie();
  const entities = graph.getEntitiesByPrefix(selectedPath);
  console.log("trie root", trie.root);
  console.log("names", trie.listEntitiesUnderPrefix(selectedPath));
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

type Props = {
  relationGraph: any;
  selectedPath?: string;
};

function Visualization(props: Props) {
  // const relationGraph = createRelationGraph();
  // console.log(relationGraph.getStats());
  const { relationGraph, selectedPath } = props;
  const dagre = relationGraphToDagre(relationGraph, selectedPath);
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
  selectedPath: state.selectedPath,
});

export default connect(mapStateToProps)(Visualization);
