import * as React from "react";
import { Provider } from "react-redux";
import store from "../redux/store";
import Toggle from "react-toggle";
import Visualization from "./Visualization";
import GitSelection from "@root/components/GitSelection/index";
import { CommitList } from "./CommitList";
import { CommitInfoBox } from "./CommitInfoBox";

import "normalize.css";
import "./react-toggle.style.scss";
import * as styles from "./style.scss";

import {
  loadRepo,
  loadBranches,
  loadCommitsOfBranch,
} from "@root/libs/gitOperations";
import { PathTree } from "./PathTree";

export class App extends React.Component<any, any> {
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
      <Provider store={store}>
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
      </Provider>
    );
  }
}
