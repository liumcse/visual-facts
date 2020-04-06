import * as React from "react";
import moment from "moment";
import { Commit } from "nodegit";

import * as styles from "./style.scss";
import { cx } from "@root/utils";

type Props = {
  commits: Commit[];
  handleCommitTabClick: (index: number) => void;
  selected: Array<number | undefined>;
};

export default function CommitList(props: Props) {
  const { commits, handleCommitTabClick, selected } = props;
  return (
    <React.Fragment>
      {commits.map((commit: Commit, index: number) => {
        return (
          <div
            className={cx(
              styles.commitTab,
              selected.includes(index) ? styles.selected : "",
            )}
            key={index}
            onClick={() => handleCommitTabClick(index)}
          >
            <div className={styles.message}>{commit.message().toString()}</div>
            <div className={styles.date}>{moment(commit.date()).fromNow()}</div>
          </div>
        );
      })}
    </React.Fragment>
  );
}
