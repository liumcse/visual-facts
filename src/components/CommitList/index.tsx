import * as React from "react";
import moment from "moment";
import { Commit } from "nodegit";

import * as styles from "./style.scss";

type Props = {
  commits: Commit[];
  handleCommitTabClick: (index: number) => void;
};

export default function CommitList(props: Props) {
  const { commits, handleCommitTabClick } = props;
  return (
    <React.Fragment>
      {commits.map((commit: Commit, index: number) => (
        <div
          className={styles.commitTab}
          key={index}
          onClick={() => handleCommitTabClick(index)}
        >
          <div className={styles.message}>{commit.message().toString()}</div>
          <div className={styles.date}>{moment(commit.date()).fromNow()}</div>
        </div>
      ))}
    </React.Fragment>
  );
}
