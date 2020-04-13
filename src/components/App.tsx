import * as React from "react";
import { ToastContainer, toast } from "react-toastify";
import { Repository, Commit } from "nodegit";
import GitSelection from "@root/components/GitSelection";
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
import "./react-toastify.scss";
import * as styles from "./style.scss";

import {
  loadRepo,
  loadBranches,
  loadCommitsOfBranch,
  getRepoURL,
} from "@root/libs/gitOperations";
import PathTree from "./PathTree";
import { connect } from "react-redux";
import VisBoard from "./VisBoard";
import StatusBar from "./StatusBar";
import { ReduxState } from "@root/redux/reducers";
import RelationControlPanel from "./RelationControlPanel";
import { getFacts } from "@root/apis";

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

type State = {
  repo?: Repository;
  commitHistory: Commit[];
  remoteBranches: string[];
  selectedCommitIndex?: number;
  selectedCommitIndexToCompare?: number;
  displayVisualization: boolean;
};

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      repo: undefined,
      commitHistory: [],
      remoteBranches: [],
      selectedCommitIndex: undefined,
      selectedCommitIndexToCompare: undefined,
      displayVisualization: false,
    };
  }

  // TODO: this method is AWFUL!!! Rewrite it
  loadCommitHistory = async (branchName: string) => {
    await this.setStateAsync({ commitHistory: [] });
    const { repo } = this.state;
    if (!repo) return;
    const commitHistory = await loadCommitsOfBranch(repo, branchName);
    await this.setStateAsync({ commitHistory });
  };

  setStateAsync = (state: any) => {
    return new Promise((resolve) => {
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
    await this.loadCommitHistory("refs/remotes/origin/" + remoteBranches[0]);
    this.props.updateRelationGraph(
      RelationGraph.createGraphFromFactsTupleFile(
        "/Users/ming/Desktop/FYP/app/src/dummyData/dep-moblima.ta",
      ),
    );
    // TODO: delete later
    document.addEventListener("keydown", (event) => {
      if (event.keyCode === 68) {
        this.__handleShowDiff();
      }
    });
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.pathToRepo !== this.props.pathToRepo) {
      // If repo changed, pull branches and load commit history, clear state
      const { pathToRepo } = this.props;
      const repo = await loadRepo(pathToRepo);
      const remoteBranches = await loadBranches(repo);
      await this.setStateAsync({
        repo,
        remoteBranches,
        selectedPath: null,
        diff: null,
        showDiff: false,
      });
      // Clear graph
      this.props.updateRelationGraph(new RelationGraph());
      await this.loadCommitHistory("refs/remotes/origin/" + remoteBranches[0]);
    }
  }

  handleGenerateFacts = async () => {
    if (this.state.selectedCommitIndex === undefined) return;
    const repoUrl = await getRepoURL(this.props.pathToRepo);
    const commitHash = this.state.commitHistory[this.state.selectedCommitIndex]
      .id()
      .toString();
    const facts = await getFacts(repoUrl, commitHash);
    const newGraph = RelationGraph.createGraphFromFacts(facts);
    this.props.updateRelationGraph(newGraph);
  };

  handleGenerateDiff = async () => {
    if (
      this.state.selectedCommitIndex === undefined ||
      this.state.selectedCommitIndexToCompare === undefined
    ) {
      return;
    }
    const repoUrl = await getRepoURL(this.props.pathToRepo);
    const commitHashNew = this.state.commitHistory[
      this.state.selectedCommitIndex
    ]
      .id()
      .toString();
    const commitHashOld = this.state.commitHistory[
      this.state.selectedCommitIndexToCompare
    ]
      .id()
      .toString();
    const oldFacts = await getFacts(repoUrl, commitHashOld);
    const newFacts = await getFacts(repoUrl, commitHashNew);
    const oldGraph = RelationGraph.createGraphFromFacts(oldFacts);
    const newGraph = RelationGraph.createGraphFromFacts(newFacts);
    const diff = RelationGraph.diff(oldGraph, newGraph);
    newGraph.applyDiff(diff, oldGraph);
    this.props.updateRelationGraph(newGraph);
    this.props.updateDiff(diff);
  };

  handleCommitTabClick = (e: any, index: number) => {
    console.log(e.shiftKey);
    if (
      e.shiftKey &&
      this.state.selectedCommitIndex !== undefined &&
      this.state.selectedCommitIndex !== index
    ) {
      if (index < this.state.selectedCommitIndex) {
        toast("Please select an older commit");
      } else {
        this.setState({ selectedCommitIndexToCompare: index });
      }
    } else if (index !== this.state.selectedCommitIndex) {
      this.setState({
        selectedCommitIndex: index,
        selectedCommitIndexToCompare: undefined,
      });
    } else {
      this.setState({
        selectedCommitIndex: undefined,
        selectedCommitIndexToCompare: undefined,
      });
    }
  };

  handleToggle = (e: any) => {
    this.setState({ displayVisualization: e.target.checked });
  };

  __handleShowDiff() {
    // Refactor this function later
    // Toggle showDiff
    this.props.toggleShowDiff(!this.props.showDiff);
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
        <ToastContainer autoClose={3000} closeOnClick hideProgressBar={false} />
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
                  selected={this.state.selectedCommitIndex}
                  selectedSecondary={this.state.selectedCommitIndexToCompare}
                  handleCommitTabClick={this.handleCommitTabClick}
                />
              )}
            </div>
            <div className={styles.leftLower}>
              <StatusBar
                enableGenerateFactsButton={
                  this.state.selectedCommitIndex !== undefined
                }
                enableGenerateDiffButton={
                  this.state.selectedCommitIndex !== undefined &&
                  this.state.selectedCommitIndexToCompare !== undefined
                }
                visView={displayVisualization}
                handleGenerateFacts={this.handleGenerateFacts}
                handleGenerateDiff={this.handleGenerateDiff}
              />
            </div>
          </div>
          <div className={styles.rightPane}>
            <CommitInfoBox
              commit={
                selectedCommitIndex !== undefined
                  ? commitHistory[selectedCommitIndex]
                  : undefined
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
