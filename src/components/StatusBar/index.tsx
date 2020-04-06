import * as React from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { ReduxState } from "@root/redux/reducers";
import * as styles from "./style.scss";
import { cx } from "@root/utils";

type Props = {
  visView: boolean;
  highlightedEntityId?: string;
  handleGenerateFacts: () => void;
};

class StatusBar extends React.PureComponent<Props, any> {
  toastTest() {
    toast("🦄 Generating facts...", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  render() {
    const { visView, highlightedEntityId } = this.props;
    if (!visView) {
      return (
        <div className={cx(styles.container, styles.visView)}>
          <button
            onClick={() => {
              this.props.handleGenerateFacts();
              this.toastTest();
            }}
          >
            Generate Facts
          </button>
          <button disabled>Generate Diff</button>
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
