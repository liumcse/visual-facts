import * as React from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { ReduxState } from "@root/redux/reducers";
import * as styles from "./style.scss";
import { cx } from "@root/utils";

type Props = {
  visView: boolean;
  highlightedEntityId?: string;
  handleGenerateFacts: () => Promise<void>;
  handleGenerateDiff: () => Promise<void>;
  enableGenerateFactsButton: boolean;
  enableGenerateDiffButton: boolean;
};

class StatusBar extends React.PureComponent<Props, any> {
  // toastTest() {
  //   toast("🦄 Generating facts...", {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //   });
  // }

  handleGenerateFacts = async () => {
    toast("Generating facts...");
    try {
      await this.props.handleGenerateFacts();
      toast("Done");
    } catch (e) {
      toast("Some error occurred");
    }
  };

  handleGenerateDiff = async () => {
    toast("Generating diff...");
    try {
      await this.props.handleGenerateDiff();
      toast("Done");
    } catch (e) {
      toast("Some error occurred");
    }
  };

  render() {
    const {
      visView,
      highlightedEntityId,
      enableGenerateDiffButton,
      enableGenerateFactsButton,
    } = this.props;
    if (!visView) {
      return (
        <div className={cx(styles.container, styles.visView)}>
          <button
            disabled={!enableGenerateFactsButton}
            onClick={this.handleGenerateFacts}
          >
            Generate Facts
          </button>
          <button
            disabled={!enableGenerateDiffButton}
            onClick={this.handleGenerateDiff}
          >
            Generate Diff
          </button>
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
