import * as React from "react";
import * as styles from "./style.scss";
import { connect } from "react-redux";

import {
  RelationGraph,
  Entity,
  EntityType,
  RelationType,
} from "@root/libs/dataStructures";

const RADIUS = 36;
const FONT_SIZE = 8;

type Props = {
  showDiff: boolean;
  relationGraph: RelationGraph;
  selectedPath: string;
};

class VisBoard extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      scaleX: 1,
      scaleY: 1,
      positionMap: {},
    };
  }

  componentDidMount() {
    this.getCanvasDimension();
    window.addEventListener("resize", this.getCanvasDimension);
    const { selectedPath, relationGraph } = this.props;
    const entities = relationGraph.getEntitiesByPrefix(selectedPath);
    this.generatePositionMap(entities);
  }

  componentDidUpdate(prevProps: Props, prevState: any) {
    const { selectedPath, relationGraph } = this.props;
    const entities = relationGraph.getEntitiesByPrefix(selectedPath);
    if (
      prevProps.relationGraph !== this.props.relationGraph ||
      prevProps.selectedPath !== this.props.selectedPath ||
      prevState.width !== this.state.width ||
      prevState.height !== this.state.height
    ) {
      this.generatePositionMap(entities);
    }
    this.renderVisualizationFromGraph(entities);
  }

  getCanvasDimension = () => {
    const dom = document.querySelector("#leftPane") as Element;
    const size = dom.getBoundingClientRect();
    this.setState({
      height: size.height,
      width: size.width,
    });
  };

  generatePositionMap(entities: Entity[]) {
    const canvas = document.querySelector("#vis-board") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;
    const [width, height] = [canvas.width, canvas.height];
    const __generateRandomXY = () => {
      return [
        Math.round(Math.random() * (width - 100) + 50),
        Math.round(Math.random() * (height - 100) + 50),
      ];
    };
    // Initialize bitmap
    const bitmap: Array<Array<number>> = [];
    for (let i = 0; i < width; i++) {
      bitmap[i] = [];
      for (let j = 0; j < height; j++) {
        bitmap[i][j] = 0;
      }
    }
    const positionMap: any = {};
    for (const entity of entities) {
      // Generate random x y 10 times and choose the best one
      const candidates: Array<{ x: number; y: number; score: number }> = [];
      for (let i = 0; i < 10; i++) {
        // positionMap[entity.getName()] = __generateRandomXY();
        const [x, y] = __generateRandomXY();
        let score = 0;
        // Calculate score by counting how much bitmap is covered
        for (
          let m = Math.max(0, x - RADIUS);
          m < Math.min(x + RADIUS, width);
          m++
        ) {
          for (
            let n = Math.max(0, y - RADIUS);
            n < Math.min(y + RADIUS, height);
            n++
          ) {
            if (bitmap[m][n]) score++;
          }
        }
        candidates.push({ x, y, score });
      }
      // Find the best candidate
      const { x, y } = candidates.sort((a, b) => a.score - b.score)[0];
      // Shed bitmap
      for (
        let m = Math.max(0, x - RADIUS);
        m < Math.min(x + RADIUS, width);
        m++
      ) {
        for (
          let n = Math.max(0, y - RADIUS);
          n < Math.min(y + RADIUS, height);
          n++
        ) {
          bitmap[m][n]++;
        }
      }
      // Add into positionMap
      positionMap[entity.getName()] = [x, y];
    }
    console.log(positionMap);
    this.setState({ positionMap });
  }

  renderVisualizationFromGraph(entities: Entity[]) {
    const canvas = document.querySelector("#vis-board") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;
    const drawn = new Set<string>();
    // a set of entity names
    const entityNameSet = new Set<string>(
      entities.map(entity => entity.getName()),
    );
    const [width, height] = [canvas.width, canvas.height];
    const { selectedPath, relationGraph } = this.props;
    ctx.scale(this.state.scaleX, this.state.scaleY);

    function __drawLine(
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      lineType: RelationType,
    ) {
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      if (fromX > toX) {
        fromX -= RADIUS * Math.abs(Math.cos(angle));
        toX += RADIUS * Math.abs(Math.cos(angle));
      } else {
        fromX += RADIUS * Math.abs(Math.cos(angle));
        toX -= RADIUS * Math.abs(Math.cos(angle));
      }
      if (fromY > toY) {
        fromY -= RADIUS * Math.abs(Math.sin(angle));
        toY += RADIUS * Math.abs(Math.sin(angle));
      } else {
        fromY += RADIUS * Math.abs(Math.sin(angle));
        toY -= RADIUS * Math.abs(Math.sin(angle));
      }
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.lineTo(
        toX - 10 * Math.cos(angle - Math.PI / 6),
        toY - 10 * Math.sin(angle - Math.PI / 6),
      );
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - 10 * Math.cos(angle + Math.PI / 6),
        toY - 10 * Math.sin(angle + Math.PI / 6),
      );
      if (lineType === RelationType.CALL) {
        ctx.lineWidth = 3;
      }
      ctx.stroke();
      ctx.restore();
    }

    // function __drawRect(label: string, x: number, y: number) {
    //   ctx.strokeRect(x, y, 90, 40);
    //   // Fill text
    //   ctx.textAlign = "center";
    //   ctx.textBaseline = "middle";
    //   ctx.fillText(label, x + 45, y + 20);
    //   ctx.restore();
    // }

    function __drawCircle(
      label: string,
      entityType: EntityType,
      x: number,
      y: number,
    ) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, RADIUS, 0, 2 * Math.PI);
      ctx.stroke();
      // Fill text
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${FONT_SIZE}px Arial`;
      ctx.fillText("<<".concat(entityType).concat(">>"), x, y - 6);
      ctx.fillText(label, x, y + 6);
      ctx.restore();
    }

    // function __drawEllipse(
    //   label: string,
    //   entityType: EntityType,
    //   x: number,
    //   y: number,
    // ) {
    //   ctx.beginPath();
    //   ctx.ellipse(x, y, 43, 30, 0, 0, 2 * Math.PI);
    //   ctx.stroke();
    //   // Fill text
    //   ctx.textAlign = "center";
    //   ctx.textBaseline = "middle";
    //   ctx.fillText("<<".concat(entityType).concat(">>"), x, y - 6);
    //   ctx.fillText(label, x, y + 6);
    //   ctx.restore();
    // }

    function drawEntity(entity: Entity, x: number, y: number) {
      const name = entity.getName();
      if (drawn.has(name)) return false;
      drawn.add(name);
      // TODO: label is buggy
      let label = name.replace(selectedPath ? selectedPath + "." : "", "");
      const entityType = entity.getEntityType();
      if (label.length > 14) {
        label = label.slice(0, 14) + "...";
      }
      switch (entityType) {
        case EntityType.CLASS:
          __drawCircle(label, entityType, x, y);
          break;
        case EntityType.FUNCTION:
          __drawCircle(label, entityType, x, y);
          break;
        default:
          __drawCircle(label, entityType, x, y);
      }
      // Continue drawing adjacent entities
      for (const relation of relationGraph.getRelationsByEntity(entity)) {
        // Ignore relation that points to existing entities
        const to = relation.getTo();
        if (!entityNameSet.has(to.getName())) {
          continue;
        }
        const [_x, _y] = positionMap[to.getName()];
        if (drawEntity(to, _x, _y)) {
          __drawLine(x, y, _x, _y, relation.getType());
        }
      }
      return true;
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw entities
    const { positionMap } = this.state;
    for (const entity of entities) {
      const [x, y] = positionMap[entity.getName()];
      drawEntity(entity, x, y);
    }

    console.log("Redrawn");
  }

  render() {
    const { height, width } = this.state;
    return (
      <div className={styles.container}>
        <canvas
          id="vis-board"
          className={styles.canvas}
          height={height * this.state.scaleX || 0}
          width={width * this.state.scaleY || 0}
        />
        <button
          className={styles.zoomOut}
          onClick={() => {
            this.setState({
              scaleX: this.state.scaleX + 1,
              scaleY: this.state.scaleY + 1,
            });
          }}
        >
          +
        </button>
        <button
          className={styles.zoomIn}
          onClick={() => {
            this.setState({
              scaleX: this.state.scaleX - 1 || 1,
              scaleY: this.state.scaleY - 1 || 1,
            });
          }}
        >
          -
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  relationGraph: state.relationGraph || new RelationGraph(),
  selectedPath: state.selectedPath,
  entityTypeFilter: state.entityTypeFilter,
  showDiff: state.showDiff,
});

export default connect(mapStateToProps)(VisBoard);
