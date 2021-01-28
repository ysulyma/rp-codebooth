import * as React from "react";
import {useCallback, useEffect, useMemo, useRef} from "react";

import {Player, Utils, usePlayer} from "ractive-player";
const {during} = Utils.authoring,
      {dragHelperReact} = Utils.interactivity,
      {constrain} = Utils.misc,
      {onClick} = Utils.mobile;
import type {Recorder} from "rp-recording";

import {CodeEditor, CodeReplay} from "rp-codemirror";
import type {CaptureData} from "rp-codemirror";

import Output from "./Output";

import {useStore} from "./store";

export interface Interpreter {
  run(code: string): Promise<string[]>;
  runSync(code: string): string[];
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  interpreter: Interpreter;
  mode: string;
  recorder?: Recorder;
  replay?: CaptureData;
  start: string | number;
  theme?: string;
}

export function CodeBooth(props: Props) {
  const {interpreter, mode, recorder, replay, start, theme, ...attrs} = props;

  /* refs */
  const codeReplay = useRef<CodeReplay>();
  const codeEditor = useRef<CodeEditor>(); 

  const pane = useStore(state => state.pane);

  // recording
  if (recorder) {
    useEffect(() => {
      codeEditor.current.ready.then(() => {
        recorder.connect(codeEditor.current);
      });
    }, []);
  }

  /* methods */
  // active tab
  const tabToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const pane = e.currentTarget.classList.contains("button-replay") ? "replay" : "playground";

    useStore.setState({pane})
  }, []);

  // copy
  const copy = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    codeEditor.current.editor.setValue(codeReplay.current.codeEditor.editor.getValue());
  }, []);

  // replay
  const replayCommand = useCallback((dir: "fwd" | "back", sequence: string, state) => {
    if (dir === "fwd") {
      if (sequence === "Cmd-Enter" || sequence === "Ctrl-Enter") {
        const code = state.value.join("\n");

        let messages;
        try {
          const output = interpreter.runSync(code);
          messages = output.map(text => ({classNames: ["replay"], text}));
        } catch(e) {
          // XXX fix this
          if (e.args) {
            messages = [{
              classNames: ["replay", "error"],
              text: e.args.v[0].v + "\n"
            }];
          } else {
            messages = [{
              classNames: ["replay", "error"],
              text: e + "\n"
            }]
          }
        }

        useStore.setState(prev => ({messages: prev.messages.concat(messages)}));
      } else if (sequence === "Cmd-K") {
        useStore.setState(prev => ({
          messages: prev.messages.filter(message => !message.classNames.includes("replay"))
        }));
      }
    } else {
      // don't worry too much about undoing these messages
    }
  }, []);

  // run
  const run = useCallback(async e => {
    const pane = useStore.getState().pane;
    const cm = pane === "replay" ? codeReplay.current.codeEditor.editor : codeEditor.current.editor;

    let messages;
    try {
      const output = await interpreter.run(cm.getValue());
      messages = output.map(text => ({classNames: ["user"], text}));
    } catch (e) {
      console.log(e);
      // XXX fix this
      if (e.args) {
        messages = [{
          classNames: ["user", "error"],
          text: e.args.v[0].v + "\n"
        }];
      } else {
        messages = [{
          classNames: ["user", "error"],
          text: e + "\n"
        }]
      }
    }
    useStore.setState(prev => ({messages: prev.messages.concat(messages)}));
  }, []);

  // clear
  const clear = useCallback(() => useStore.setState({messages: []}), []);

  /* buttons */
  const toggleEvents = useMemo(() => onClick(tabToggle), []);
  const copyEvents = useMemo(() => onClick(copy), []);
  const runEvents = useMemo(() => onClick(run), []);
  const clearEvents = useMemo(() => onClick(clear), []);

  /* render */
  // run shortcuts
  const keyMap = useMemo(() => ({
    "Cmd-Enter": run,
    "Ctrl-Enter": run,
    "Cmd-K": clear
  }), []);

  if (!attrs.className) {
    attrs.className =  "";
  }
  attrs.className += ` rp-codebooth active-${pane}`;

  return (
    <div {...attrs}>
      {recorder ? <CodeEditor
        className="code-playground"
        keyMap={keyMap}
        mode={mode}
        recorder={recorder}
        ref={codeEditor}
        theme={theme}
      /> : <>
      <CodeReplay
        className="code-replay"
        command={replayCommand}
        keyMap={keyMap}
        mode={mode}
        ref={codeReplay}
        replay={replay}
        start="codemirror/"
        theme={theme}
      />
      <CodeEditor
        className="code-playground"
        keyMap={keyMap}
        mode={mode}
        ref={codeEditor}
        theme={theme}
      /></>}
      <div onMouseUp={Player.preventCanvasClick}>
        <button className="button-replay" {...toggleEvents}>Code</button>
        <button className="button-playground" {...toggleEvents}>Playground</button>
        <button className="button-copy" {...copyEvents}>Copy</button>
        <button className="button-run" {...runEvents} title="Cmd+Enter">Run</button>
        <button className="button-clear" {...clearEvents} title="Cmd+K">Clear</button>
      </div>
      <Output/>
    </div>
  );
}
