import * as React from "react";

// @ts-ignore
import DagreD3 from "./DagreD3.jsx";
import {
  XYPlot,
  LineSeries,
  MarkSeries,
  LineSeriesCanvas,
  MarkSeriesCanvas,
} from "react-vis";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
} from "d3-force";
import lesMisData from "@root/dummyData/les-mis-data.ts";

import * as styles from "./style.scss";

import {
  RelationGraph,
  EntityTrie,
  Relation,
  RelationType,
  EntityType,
} from "@root/libs/dataStructures";
import { connect } from "react-redux";

function relationGraphToD3Data(graph: RelationGraph, selectedPath?: string) {
  const data: any = {
    nodes: [],
    links: [],
  };
  const entities = graph.getEntitiesByPrefix(selectedPath);
  const nodeIds = new Set();
  for (const entity of entities) {
    data.nodes.push({
      id: entity.getName(),
      color:
        entity.getEntityType() === EntityType.CLASS
          ? 0
          : entity.getEntityType() === EntityType.VARIABLE
          ? 1
          : 2,
    });
    nodeIds.add(entity.getName());
  }
  for (const entity of entities) {
    const relations = graph.getRelationsByEntity(entity);
    for (const relation of relations) {
      const [from, to, relationType] = [
        entity.getName(),
        relation.getTo().getName(),
        relation.getType(),
      ];
      // Make sure both entities are present in data.nodes
      if (!nodeIds.has(from) || !nodeIds.has(to)) {
        continue;
      }
      // TODO: handle relationType
      data.links.push({
        source: from,
        target: to,
      });
    }
  }
  return data;
}

/**
 * Create the list of nodes to render.
 * @returns Array of nodes.
 */
function generateSimulation(
  data: any,
  height: number,
  width: number,
  maxSteps: number,
  strength: number,
) {
  // copy the data
  // @ts-ignore
  const nodes = data.nodes.map(d => ({ ...d }));
  // @ts-ignore
  const links = data.links.map(d => ({ ...d }));
  console.log("Pre-simulation", {
    nodes: nodes.map(x => ({ ...x })),
    links: links.map(x => ({ ...x })),
  });
  // build the simulation
  const simulation = forceSimulation(nodes).force(
    "link",
    // @ts-ignore
    forceLink().id(d => d.id),
  );
  // .force("charge", forceManyBody().strength(strength))
  // .force("center", forceCenter(width * 2, height * 2))
  // .stop();

  console.log({ simulation });

  // @ts-ignore
  simulation.force("link").links(links);

  // const upperBound = Math.ceil(
  //   Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
  // );
  // for (let i = 0; i < Math.min(maxSteps, upperBound); ++i) {
  //   simulation.tick();
  // }

  return { nodes, links };
}

type Props = {
  relationGraph: any;
  selectedPath?: string;
};

class Visualization extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: null,
      height: null,
    };
  }

  componentDidMount() {
    this.getCanvasDimension();
    window.addEventListener("resize", this.getCanvasDimension);
  }

  getCanvasDimension = () => {
    const dom = document.querySelector("#leftPane");
    const size = dom?.getBoundingClientRect();
    this.setState({
      height: size?.height,
      width: size?.width,
    });
  };

  render() {
    const { relationGraph, selectedPath } = this.props;
    const _data = relationGraphToD3Data(relationGraph, selectedPath);

    const data = generateSimulation(
      _data,
      this.state.height,
      this.state.width,
      50,
      2,
    );

    const { nodes, links } = data;

    return (
      <XYPlot height={this.state.height || 0} width={this.state.width || 0}>
        // @ts-ignore
        {links.map(({ source, target }, index) => {
          return (
            <LineSeries
              // animation={animation}
              color={"#B3AD9E"}
              key={`link-${index}`}
              opacity={0.3}
              data={[
                { ...source, color: null },
                { ...target, color: null },
              ]}
            />
          );
        })}
        <MarkSeries
          data={nodes}
          // animation={animation}
          colorType={"category"}
          stroke={"#ddd"}
          strokeWidth={2}
          colorRange={[
            "#19CDD7",
            "#DDB27C",
            "#88572C",
            "#FF991F",
            "#F15C17",
            "#223F9A",
            "#DA70BF",
            "#4DC19C",
            "#12939A",
            "#B7885E",
            "#FFCB99",
            "#F89570",
            "#E79FD5",
            "#89DAC1",
          ]}
        />
      </XYPlot>
    );
  }
}

// TODO: fix the type
const mapStateToProps = (state: any) => ({
  relationGraph: state.relationGraph || new RelationGraph(),
  selectedPath: state.selectedPath,
});

export default connect(mapStateToProps)(Visualization);
