import * as React from "react";
import moment from "moment";
import Popup from "reactjs-popup";
import { Commit } from "nodegit";

import * as styles from "./style.scss";

export default function CommitInfoBox({ commit }: { commit: Commit | null }) {
  return (
    <div className={styles.container}>
      <span className={styles.noNewLine}>
        <strong>commit:</strong>{" "}
        {commit ? commit.id().toString() : "None selected"}
      </span>
      <span className={styles.noNewLine}>
        {commit ? commit.message().toString() : "X"}
      </span>
      <span className={styles.noNewLine}>
        <strong>{commit ? commit.author().name() : "X"}</strong> on{" "}
        {commit ? moment(commit.date()).format("MMM D, YYYY @ LT") : "X"}
      </span>
    </div>
  );
}
