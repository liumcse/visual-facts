import * as React from "react";
import { connect } from "react-redux";
import { ReduxState } from "@root/redux/reducers";
import * as styles from "./style.scss";
import { cx } from "@root/utils";

type Props = {
  visView: boolean;
  highlightedEntityId?: string;
};

class StatusBar extends React.PureComponent<Props, any> {
  render() {
    const { visView, highlightedEntityId } = this.props;
    if (!visView) {
      return (
        <div className={cx(styles.container, styles.visView)}>
          <button>Generate Facts</button>
          <button>Generate Diff</button>
        </div>
      );
    }
    return (
      <div className={styles.container}>
        <span className={styles.text}>{highlightedEntityId}</span>
      </div>
    );
  }
}

const mapStatesToProps = (state: ReduxState) => ({
  highlightedEntityId: state.highlightedEntityId,
});

export default connect(mapStatesToProps, null)(StatusBar);
