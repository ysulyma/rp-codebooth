import * as CodeMirror from "codemirror";
import * as React from "react";
import {ReplayData} from "ractive-player";
import {Recorder} from "rp-recording";
import {CaptureData} from "rp-codemirror";

export function CodeBooth(props: {
  interpreter: Interpreter;
  mode: string;
  recorder?: Recorder;
  replay?: CaptureData;
  start: string | number;
  theme?: string;
}): JSX.Element;

export interface Interpreter {
  run(code: string): Promise<string[]>;
  runSync(code: string): string[];
}
