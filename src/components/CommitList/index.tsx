import * as React from "react";
import moment from "moment";
import { Commit } from "nodegit";

import * as styles from "./style.scss";
import { cx } from "@root/utils";

type Props = {
  commits: Commit[];
  handleCommitTabClick: (event: any, index: number) => void;
  selected: number | undefined;
  selectedSecondary: number | undefined;
};

export default function CommitList(props: Props) {
  const { commits, handleCommitTabClick, selected, selectedSecondary } = props;
  return (
    <React.Fragment>
      {commits.map((commit: Commit, index: number) => {
        return (
          <div
            className={cx(
              "noSelect",
              styles.commitTab,
              selected === index ? styles.selected : "",
              selectedSecondary === index ? styles.selectedSecondary : "",
            )}
            key={index}
            onClick={(event) => handleCommitTabClick(event, index)}
          >
            <div className={styles.message}>{commit.message().toString()}</div>
            <div className={styles.date}>{moment(commit.date()).fromNow()}</div>
          </div>
        );
      })}
    </React.Fragment>
  );
}
