import * as React from "react";
import {useMemo, useRef} from "react";

import {Player, Utils} from "ractive-player";
const {dragHelperReact} = Utils.interactivity,
      {constrain} = Utils.misc;

import {useStore} from "./store";

export default function Output() {
  const messages = useStore(state => state.messages);

  /* refs */
  const ref = useRef<HTMLPreElement>();
  const nRef = useRef<HTMLDivElement>();
  const wRef = useRef<HTMLDivElement>();

  const dragDir = useRef(null);

  /* event handlers */
  const resizeEvents = useMemo(() => dragHelperReact((e, {x}) => {
    const div = ref.current.parentElement;
    const rect = div.getBoundingClientRect();

    div.style.setProperty("--split", constrain(0.25, (x - rect.left) / rect.width, 0.75) * 100 + "%");
  }), []);

  return (
    <pre className="rp-codebooth-output" onMouseUp={Player.preventCanvasClick} ref={ref}>
      {["ew"].map(dir => (
        <div
          key={dir}
          {...resizeEvents}
          className={`ui-resizable-handle ui-resizable-${dir}`} style={{zIndex: 90}}
        />
      ))}
      {messages.map((message, i) => {
        return (<span key={i} className={message.classNames.join(" ")}>{message.text}</span>);
      })}
    </pre>
  );
}
