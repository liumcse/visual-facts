import { spawn, exec, ExecException } from "child_process";
import * as path from "path";

const MAVEN_BIN = path.join(__dirname, "../vendors/apache-maven-3.6.3/bin/mvn");
const CSLICER_JAR = path.join(
  __dirname,
  "../vendors/cslicer/cslicer-1.0.0-jar-with-dependencies.jar",
);
const JAVA = "java";

export function build(pathToSource: string) {
  const mvnCompile = spawn(MAVEN_BIN, ["compiler:compile"], {
    cwd: pathToSource,
  });
  return new Promise((resolve, reject) => {
    // Detect error
    mvnCompile.stderr.on("data", data => {
      reject(data);
    });
    // On close
    mvnCompile.on("close", code => {
      if (code !== 0) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

export function generateFactTuple(pathToClassRoot: string) {
  // TODO: generate config
  const pathToConfig = "/Users/ming/Desktop/FYP/definer/config.properties";
  const cmd = [
    "JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_231.jdk/Contents/Home",
    "M2_HOME=/Users/ming/Desktop/FYP/app/src/vendors/apache-maven-3.6.3/bin",
    JAVA,
    "-jar",
    CSLICER_JAR,
    "-c",
    pathToConfig,
    "-p",
    "-e",
    "fact",
    "-ext=dep",
  ];
  // Run command
  console.log("Running command", cmd.join(" "));
  // Read fact tuple
  exec(cmd.join(" "), (err: ExecException) => {
    if (err) {
      console.log("error!", err);
    } else {
      console.log("Succeed");
    }
  });
}

function test() {
  const pathToSource = "/Users/ming/Desktop/FYP/commons-csv/target";
  generateFactTuple(pathToSource);
}

test();
