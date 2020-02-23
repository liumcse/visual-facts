import * as React from "react";
import moment from "moment";
import { Commit } from "nodegit";

import * as styles from "./style.scss";

export default function CommitInfoBox({ commit }: { commit: Commit | null }) {
  if (!commit) {
    return (
      <div className={styles.container}>
        <p>No commit selected</p>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <p>
        <strong>commit:</strong> {commit.id().toString()}
        <br />
        <br />
        {commit.message().toString()}
        <br />
        <br />
        <strong>{commit.author().name()}</strong> on{" "}
        {moment(commit.date()).format("MMM D, YYYY @ LT")}
      </p>
    </div>
  );
}
