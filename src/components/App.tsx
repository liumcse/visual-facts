import * as React from "react";
import Toggle from "react-toggle";
import GitSelection from "@root/components/GitSelection/index";
import CommitList from "./CommitList";
import CommitInfoBox from "./CommitInfoBox";
import {
  updateRelationGraph,
  updateEntityTypeFilter,
  toggleShowDiff,
  updateDiff,
} from "../redux/actions";

import { RelationGraph, Diff } from "@root/libs/dataStructures";

import "normalize.css";
import "./react-vis.style.scss";
import "./react-toggle.style.scss";
import * as styles from "./style.scss";

import {
  loadRepo,
  loadBranches,
  loadCommitsOfBranch,
} from "@root/libs/gitOperations";
import PathTree from "./PathTree";
import { connect } from "react-redux";
import VisBoard from "./VisBoard";
import StatusBar from "./StatusBar";

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
    const repo = await loadRepo("/Users/ming/Desktop/MOBLIMA/.git");
    const remoteBranches = await loadBranches(repo);
    await this.setStateAsync({ repo, remoteBranches });
    await this.loadCommitHistory(remoteBranches[0]);
    this.props.updateRelationGraph(
      RelationGraph.createGraphFromFactsTupleFile(
        "/Users/ming/Desktop/FYP/app/src/dummyData/dep-csv.ta",
      ),
    );
    // TODO: delete later
    document.addEventListener("keydown", event => {
      if (event.keyCode === 68) {
        console.log("Pressed D");
        this.__handleShowDiff();
      }
    });
  }

  componentDidUpdate() {
    console.log(this.props.entityTypeFilter);
  }

  handleButtonClick = () => {
    this.setState({ displayVisualization: true });
  };

  handleCommitTabClick = (index: number) => {
    this.setState({ selectedCommitIndex: index });
  };

  handleCheckboxClick = (e: any) => {
    this.props.updateEntityTypeFilter(e.target.name.split("-")[1]);
  };

  __handleShowDiff() {
    // delete this function later
    // Toggle showDiff
    this.props.toggleShowDiff(!this.props.showDiff);
    if (this.props.diff) return;
    // Create and update diff
    const oldGraph = RelationGraph.createGraphFromFactsTupleFile(
      "/Users/ming/Desktop/FYP/app/src/dummyData/dep-csv-old.ta",
    );
    const diff = RelationGraph.diff(oldGraph, this.props.relationGraph);
    // Update relation graph
    const newGraph: RelationGraph = Object.assign(
      new RelationGraph(),
      this.props.relationGraph,
    );
    newGraph.applyDiff(diff, oldGraph);
    this.props.updateRelationGraph(newGraph);
    this.props.updateDiff(diff);
  }

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
            <div className={styles.leftUpper} id="left-upper">
              {displayVisualization ? (
                <VisBoard />
              ) : (
                <CommitList
                  commits={commitHistory}
                  handleCommitTabClick={this.handleCommitTabClick}
                />
              )}
            </div>
            {displayVisualization && (
              <div className={styles.leftLower}>
                <StatusBar />
              </div>
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
            <div className={styles.toggleContainer}>
              <Toggle
                checked={displayVisualization}
                onChange={e => {
                  this.setState({ displayVisualization: e.target.checked });
                }}
              />
              <div className={styles.toggleLabel}>Display relation</div>
            </div>
            <div className={styles.filterContainer}>
              <input
                type="checkbox"
                value="class"
                name="checkbox-class"
                checked={this.props.entityTypeFilter["class"]}
                onChange={this.handleCheckboxClick}
              />
              <label htmlFor="checkbox-class">class</label>
              <input
                type="checkbox"
                value="function"
                name="checkbox-function"
                checked={this.props.entityTypeFilter["function"]}
                onChange={this.handleCheckboxClick}
              />
              <label htmlFor="checkbox-function">function</label>
              <input
                type="checkbox"
                value="variable"
                name="checkbox-variable"
                checked={this.props.entityTypeFilter["variable"]}
                onChange={this.handleCheckboxClick}
              />
              <label htmlFor="checkbox-variable">variable</label>
            </div>
            <PathTree />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: any) {
  return {
    relationGraph: state.relationGraph,
    entityTypeFilter: state.entityTypeFilter,
    showDiff: state.showDiff,
    diff: state.diff,
  };
}

function mapDispatchToProps(dispatch: Function) {
  return {
    updateRelationGraph: (graph: RelationGraph) =>
      dispatch(updateRelationGraph(graph)),
    updateEntityTypeFilter: (
      entityTypeFilter: "class" | "variable" | "function",
    ) => dispatch(updateEntityTypeFilter(entityTypeFilter)),
    toggleShowDiff: (toggle: boolean) => dispatch(toggleShowDiff(toggle)),
    updateDiff: (diff: Diff) => dispatch(updateDiff(diff)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
