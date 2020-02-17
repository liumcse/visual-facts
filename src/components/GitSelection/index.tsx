import * as React from "react";
import { connect } from "react-redux";
import { switchBranch } from "../../redux/actions";
import Select, { components } from "react-select";

import * as styles from "./style.scss";

type Props = {
  branches: string[];
  loadCommitHistory: (branchName: string) => void;
  switchBranch: (branchName: string) => void;
};

class GitSelection extends React.Component<Props> {
  render() {
    const options =
      this.props.branches &&
      this.props.branches.map((branchName: string) => ({
        label: branchName,
        value: "refs/remotes/origin/" + branchName,
      }));
    return (
      <div className={styles.container}>
        <div className={styles.repoContainer}>
          <div className={styles.label}>repository</div>
          <div className={styles.content}>Common-CSV</div>
        </div>
        <div className={styles.branchContainer}>
          <div className={styles.label}>branch</div>
          <div>
            <Select
              defaultValue={options[0]}
              className={styles.select}
              components={{
                DropdownIndicator: props => (
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
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  switchBranch: (branchName: string) => dispatch(switchBranch(branchName)),
});

export default connect(null, mapDispatchToProps)(GitSelection);
