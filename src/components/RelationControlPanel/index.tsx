import * as React from "react";
import * as styles from "./style.scss";
import Toggle from "react-toggle";
import { connect } from "react-redux";
import { ReduxState } from "@root/redux/reducers";
import { updateEntityTypeFilter } from "@root/redux/actions";

type Props = {
  entityTypeFilter: any;
  selectedPath: string;
  handleToggle: any;
  displayVisualization: boolean;
  updateEntityTypeFilter: Function;
};

class RelationControlPanel extends React.Component<Props> {
  handleCheckboxClick = (e: any) => {
    this.props.updateEntityTypeFilter(e.target.name.split("-")[1]);
  };

  render() {
    return (
      <div>
        <div className={styles.toggleContainer}>
          <Toggle
            checked={this.props.displayVisualization}
            onChange={this.props.handleToggle}
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
        <div className={styles.pathDisplay}>
          <div className={styles.label}>FILTER APPLIED</div>
          <div className={styles.content}>
            {this.props.selectedPath ||
              "None (all facts are included in visualization)"}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ReduxState) {
  return {
    entityTypeFilter: state.entityTypeFilter,
    selectedPath: state.selectedPath,
  };
}

function mapDispatchToProps(dispatch: Function) {
  return {
    updateEntityTypeFilter: (
      entityTypeFilter: "class" | "variable" | "function",
    ) => dispatch(updateEntityTypeFilter(entityTypeFilter)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RelationControlPanel);
