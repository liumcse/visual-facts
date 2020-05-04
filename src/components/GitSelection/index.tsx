import * as React from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import { switchBranch, updatePathToRepo } from "../../redux/actions";
import Select, { components } from "react-select";

import * as styles from "./style.scss";

type Props = {
  branches: string[];
  loadCommitHistory: (branchName: string) => void;
  switchBranch: (branchName: string) => void;
  updatePathToRepo: (repoName: string) => void;
};

class GitSelection extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
      repoName: null,
    };
  }
  handleGitFolderSelection = () => {
    const selectedPathArr = remote.dialog.showOpenDialogSync({
      properties: ["openDirectory"],
    });
    if (selectedPathArr) {
      const selectedPath = selectedPathArr[0];
      const splitPath = selectedPath.split("/");
      const repoName = splitPath[splitPath.length - 1];
      this.props.updatePathToRepo(selectedPath);
      // this.props.switchBranch("master");
      // this.props.loadCommitHistory("master");
      this.setState({ repoName });
    }
  };
  render() {
    const { repoName } = this.state;
    const options =
      this.props.branches &&
      this.props.branches.map((branchName: string) => ({
        label: branchName,
        value: "refs/remotes/origin/" + branchName,
      }));
    console.log("Default value", options && options[0]);
    return (
      <div className={styles.container}>
        <div className={styles.repoContainer}>
          <div className={styles.label}>repository</div>
          <div
            className={styles.content}
            style={{ cursor: "pointer" }}
            onClick={this.handleGitFolderSelection}
          >
            {repoName || "Select Repo"}
          </div>
        </div>
        {options.length > 0 && (
          <div className={styles.branchContainer}>
            <div className={styles.label}>branch</div>
            <div>
              <Select
                defaultValue={options[0]}
                className={styles.select}
                components={{
                  DropdownIndicator: (props) => (
                    <components.DropdownIndicator {...props}>
                      <span>↓</span>
                    </components.DropdownIndicator>
                  ),
                }}
                onChange={(newValue?: { value: string; label: string }) => {
                  if (newValue) this.props.loadCommitHistory(newValue.value);
                }}
                options={options}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  updatePathToRepo: (pathToRepo: string) =>
    dispatch(updatePathToRepo(pathToRepo)),
  switchBranch: (branchName: string) => dispatch(switchBranch(branchName)),
});

export default connect(null, mapDispatchToProps)(GitSelection);
