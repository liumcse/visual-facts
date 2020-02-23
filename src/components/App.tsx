import * as React from "react";
import Toggle from "react-toggle";
import Visualization from "./Visualization";
import GitSelection from "@root/components/GitSelection/index";
import CommitList from "./CommitList";
import CommitInfoBox from "./CommitInfoBox";
import { updateRelationGraph } from "../redux/actions";

import {
  RelationGraph,
  Relation,
  Entity,
  EntityTrie,
} from "@root/libs/dataStructures";
import * as parser from "@root/libs/parser";

import "normalize.css";
import "./react-toggle.style.scss";
import * as styles from "./style.scss";

import {
  loadRepo,
  loadBranches,
  loadCommitsOfBranch,
} from "@root/libs/gitOperations";
import PathTree from "./PathTree";
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

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      repo: null,
      commitHistory: [],
      remoteBranches: [],
      selectedCommitIndex: null,
      displayVisualization: false,
    };
  }

  // TODO: this method is AWFUL!!! Rewrite it
  loadCommitHistory = async (branchName: string) => {
    const { repo } = this.state;
    const commitHistory = await loadCommitsOfBranch(repo, branchName);
    await this.setStateAsync({ commitHistory });
  };

  setStateAsync = (state: any) => {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  };

  async componentDidMount() {
    const repo = await loadRepo("/Users/ming/Desktop/FYP/commons-csv/.git");
    const remoteBranches = await loadBranches(repo);
    await this.setStateAsync({ repo, remoteBranches });
    await this.loadCommitHistory(remoteBranches[0]);
    this.props.updateRelationGraph(createRelationGraph());
    console.log("Graph is created and stored in redux");
  }

  handleButtonClick = () => {
    this.setState({ displayVisualization: true });
  };

  handleCommitTabClick = (index: number) => {
    this.setState({ selectedCommitIndex: index });
  };

  render() {
    const {
      commitHistory,
      remoteBranches,
      selectedCommitIndex,
      displayVisualization,
    } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.upperContainer}>
          <GitSelection
            branches={remoteBranches}
            loadCommitHistory={this.loadCommitHistory}
          />
        </div>
        <div className={styles.lowerContainer}>
          <div className={styles.leftPane}>
            {displayVisualization ? (
              <Visualization />
            ) : (
              <CommitList
                commits={commitHistory}
                handleCommitTabClick={this.handleCommitTabClick}
              />
            )}
          </div>
          <div className={styles.rightPane}>
            <CommitInfoBox
              commit={
                selectedCommitIndex !== null
                  ? commitHistory[selectedCommitIndex]
                  : null
              }
            />
            <Toggle
              className={styles.tempButton}
              checked={displayVisualization}
              onChange={e => {
                this.setState({ displayVisualization: e.target.checked });
              }}
            />
            <PathTree />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: any) {
  return {};
}

function mapDispatchToProps(dispatch: Function) {
  return {
    updateRelationGraph: (graph: RelationGraph) =>
      dispatch(updateRelationGraph(graph)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
