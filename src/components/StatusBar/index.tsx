import * as React from "react";
import { connect } from "react-redux";
import * as styles from "./style.scss";
import { ReduxState } from "@root/redux/reducers";

type Props = {
  highlightedEntityId?: string;
};

class StatusBar extends React.PureComponent<Props, any> {
  render() {
    const { highlightedEntityId } = this.props;
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
