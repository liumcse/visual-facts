import * as React from "react";
import TreeUI from "react-ui-tree";

type Props = {
  data?: object;
};

type Node = {
  label: string;
  path: string;
  children: Node[];
};

const dummyData: Node = {
  label: "org",
  path: "org",
  children: [
    {
      label: "apache",
      path: "org.apache",
      children: [
        {
          label: "commons",
          path: "org.apache.commons",
          children: [
            {
              label: "csv",
              path: "org.apache.commons.csv",
              children: [
                {
                  label: "CSVFormat",
                  path: "org.apache.commons.csv.CSVFormat",
                  children: [],
                },
                {
                  label: "CSVPrinter",
                  path: "org.apache.commons.csv.CSVPrinter",
                  children: [],
                },
                {
                  label: "Predefined",
                  path: "org.apache.commons.csv.Predefined",
                  children: [],
                },
                {
                  label: "Tokens",
                  path: "org.apache.commons.csv.Tokens",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function Tab(node: Node) {
  return <span>{node.label}</span>;
}

export function PathTree(props: Props) {
  // const { data } = props;
  return (
    <div>
      <TreeUI tree={dummyData} renderNode={Tab} />
    </div>
  );
}
