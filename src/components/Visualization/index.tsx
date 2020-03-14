import * as React from "react";

// @ts-ignore
import {
  XYPlot,
  LineSeries,
  MarkSeries,
  LineSeriesCanvas,
  MarkSeriesCanvas,
  LabelSeries,
  LabelSeriesCanvas,
} from "react-vis";
import { forceSimulation, forceLink } from "d3-force";

import {
  RelationGraph,
  EntityTrie,
  Relation,
  RelationType,
  EntityType,
} from "@root/libs/dataStructures";
import { connect } from "react-redux";

const mapEntityTypeToColor = {
  [EntityType.CLASS]: "#0377fc",
  [EntityType.VARIABLE]: "#32a852",
  [EntityType.FUNCTION]: "#FF0000",
};

const mapEntityTypeToSize = {
  [EntityType.CLASS]: 5,
  [EntityType.VARIABLE]: 5,
  [EntityType.FUNCTION]: 5,
};

function relationGraphToD3Data(graph: RelationGraph, selectedPath?: string) {
  const data: any = {
    nodes: [],
    links: [],
  };
  const entities = graph.getEntitiesByPrefix(selectedPath);
  const nodeIds = new Set();
  // Filter entities by entityTypeFilter
  for (const entity of entities) {
    data.nodes.push({
      id: entity.getName(),
      entityType: entity.getEntityType(),
      label: entity
        .getName()
        .replace(selectedPath ? selectedPath + "." : "", ""),
      color: mapEntityTypeToColor[entity.getEntityType()],
      size: mapEntityTypeToSize[entity.getEntityType()],
      style: { fontSize: 8 },
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
        relationType: relationType,
      });
    }
  }
  return data;
}

function generateRandomPosition(data) {
  // FUCKING REWRITE THIS FUNCTION
  function bindLinksToNodes(nodes, links) {
    const nodeMap = {};
    for (const node of nodes) {
      nodeMap[node.id] = node;
    }
    for (const link of links) {
      link.source = nodeMap[link.source];
      link.target = nodeMap[link.target];
    }
  }
  const newData = { nodes: [], links: [] };
  newData.nodes = data.nodes.map((node: any) => ({
    ...node,
    x: 1000 * Math.random(),
    y: 1000 * Math.random(),
  }));
  newData.links = data.links.map((link: any) => ({ ...link }));
  bindLinksToNodes(newData.nodes, newData.links);
  return newData;
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
  console.log("Generating simulated positions!!!");
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

function applyFilterOnD3Data(data: any, entityTypeFilter: object) {
  const newData = { nodes: [], links: [] };
  // Filter entities
  newData.nodes = data.nodes.filter(
    (node: any) => entityTypeFilter[node.entityType],
  );
  const nodeNameSet = new Set(newData.nodes.map(node => node.id));
  // Filter links
  newData.links = data.links.filter(
    (link: any) =>
      nodeNameSet.has(link.source.id) && nodeNameSet.has(link.target.id),
  );
  return newData;
}

type Props = {
  relationGraph: any;
  entityTypeFilter: object;
  selectedPath?: string;
};

class Visualization extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: null,
      height: null,
      hoverValue: null,
      x: 0,
      y: 0,
      label: null,
      dataImmutable: null,
    };
  }

  componentDidMount() {
    this.getCanvasDimension();
    window.addEventListener("resize", this.getCanvasDimension);

    const { relationGraph, selectedPath } = this.props;
    const data = relationGraphToD3Data(relationGraph, selectedPath);
    // const data = generateSimulation(
    //   _data,
    //   this.state.height,
    //   this.state.width,
    //   50,
    //   2,
    // );

    console.log(
      "simulation",
      generateSimulation(data, this.state.height, this.state.width, 50, 2),
    );

    this.setState({
      dataImmutable: generateRandomPosition(data),
    });
  }

  componentDidUpdate(prevProps: Props, prevState: any) {
    if (prevProps.selectedPath !== this.props.selectedPath) {
      console.log("Triggering component did update");
      const { relationGraph, selectedPath } = this.props;
      const data = relationGraphToD3Data(relationGraph, selectedPath);
      // const data = generateSimulation(
      //   _data,
      //   this.state.height,
      //   this.state.width,
      //   50,
      //   2,
      // );

      this.setState({
        dataImmutable: generateRandomPosition(data),
      });
    }
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
    if (!this.state.dataImmutable) return <div>Loading</div>;
    const { nodes, links } = applyFilterOnD3Data(
      this.state.dataImmutable,
      this.props.entityTypeFilter,
    );
    console.log("updated nodes and links", { nodes, links });
    return (
      <React.Fragment>
        <XYPlot height={this.state.height || 0} width={this.state.width || 0}>
          {links.map(({ source, target, relationType }, index) => {
            const relationTypeMapping = {
              [RelationType.CALL]: "#FF0000",
              [RelationType.CONTAIN]: "#00FF00",
              [RelationType.REFERENCE]: "#ffe100",
            };
            // @ts-ignore
            const color = relationTypeMapping[relationType];
            return (
              <LineSeries
                // animation={animation}
                color={color}
                key={`link-${index}`}
                opacity={0.3}
                data={[{ ...source }, { ...target }]}
              />
            );
          })}
          <MarkSeries
            data={nodes}
            colorType="literal"
            sizeType="literal"
            onSeriesMouseOver={({ event }) => {
              console.log(event);
              this.setState({
                x: event.clientX,
                y: event.clientY,
              });
            }}
            onValueMouseOver={hoverValue => {
              this.setState({ label: hoverValue.label });
            }}
            stroke={"#ddd"}
            strokeWidth={1}
          />
        </XYPlot>
        <div
          style={{
            position: "absolute",
            left: this.state.x,
            top: this.state.y,
          }}
        >
          {this.state.label}
        </div>
      </React.Fragment>
    );
  }
}

// TODO: fix the type
const mapStateToProps = (state: any) => ({
  relationGraph: state.relationGraph || new RelationGraph(),
  selectedPath: state.selectedPath,
  entityTypeFilter: state.entityTypeFilter,
});

export default connect(mapStateToProps)(Visualization);
