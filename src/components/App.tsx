import * as React from "react";
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
import { ReduxState } from "@root/redux/reducers";
import RelationControlPanel from "./RelationControlPanel";

type Props = {
  pathToRepo: string;
  relationGraph: RelationGraph;
  entityTypeFilter: {
    class: boolean;
    variable: boolean;
    function: boolean;
  };
  showDiff: boolean;
  selectedPath: string;
  diff: Diff;
  updateRelationGraph: (graph: RelationGraph) => void;
  updateEntityTypeFilter: (
    entityTypeFilter: "class" | "variable" | "function",
  ) => void;
  toggleShowDiff: (toggle: boolean) => void;
  updateDiff: (diff: Diff) => void;
};

class App extends React.Component<Props, any> {
  constructor(props: Props) {
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
    await this.setStateAsync({ commitHistory: [] });
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
    const { pathToRepo } = this.props;
    const repo = await loadRepo(
      pathToRepo || "/Users/ming/Desktop/MOBLIMA/.git",
    );
    const remoteBranches = await loadBranches(repo);
    await this.setStateAsync({ repo, remoteBranches });
    await this.loadCommitHistory(remoteBranches[0]);
    this.props.updateRelationGraph(
      RelationGraph.createGraphFromFactsTupleFile(
        "/Users/ming/Desktop/FYP/app/src/dummyData/dep-moblima.ta",
      ),
    );
    // TODO: delete later
    document.addEventListener("keydown", event => {
      if (event.keyCode === 68) {
        this.__handleShowDiff();
      }
    });
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.selectedPath !== this.props.selectedPath) {
      // If selectedPath changed, clear diff
      // this.props.updateDiff({});
    }
    if (prevProps.pathToRepo !== this.props.pathToRepo) {
      // If repo changed, pull branches and load commit history
      const { pathToRepo } = this.props;
      const repo = await loadRepo(pathToRepo);
      const remoteBranches = await loadBranches(repo);
      await this.setStateAsync({ repo, remoteBranches });
      await this.loadCommitHistory(remoteBranches[0]);
    }
  }

  handleCommitTabClick = (index: number) => {
    this.setState({ selectedCommitIndex: index });
  };

  handleToggle = (e: any) => {
    this.setState({ displayVisualization: e.target.checked });
  };

  __handleShowDiff() {
    // delete this function later
    // Toggle showDiff
    this.props.toggleShowDiff(!this.props.showDiff);
    if (this.props.diff) return;
    // Create and update diff
    const oldGraph = RelationGraph.createGraphFromFactsTupleFile(
      "/Users/ming/Desktop/FYP/app/src/dummyData/dep-moblima-old.ta",
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
            <div className={styles.leftLower}>
              <StatusBar visView={displayVisualization} />
            </div>
          </div>
          <div className={styles.rightPane}>
            <CommitInfoBox
              commit={
                selectedCommitIndex !== null
                  ? commitHistory[selectedCommitIndex]
                  : null
              }
            />
            <RelationControlPanel
              handleToggle={this.handleToggle}
              displayVisualization={displayVisualization}
            />
            <div className={styles.pathTreeContainer}>
              <PathTree />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ReduxState) {
  return {
    pathToRepo: state.pathToRepo,
    relationGraph: state.relationGraph,
    entityTypeFilter: state.entityTypeFilter,
    showDiff: state.showDiff,
    selectedPath: state.selectedPath,
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
