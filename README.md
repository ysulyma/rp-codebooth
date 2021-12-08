# rp-codebooth

A [Liqvid](https://liqvidjs.org) plugin providing a replay/playground/output interface for interactive coding demos. This is built on top of [rp-codemirror](https://www.npmjs.com/package/rp-codemirror), and you should use that package directly if you need more customization.

## Installation

    $ npm install rp-codemirror rp-codebooth

## Usage

To record:

```tsx
import {Player, Script} from "liqvid";

import {CodeBooth} from "rp-codebooth";
import CodeRecorderPlugin from "rp-codemirror/recorder";

const controls = (<>
  {Player.defaultControlsLeft}

  <div className="rp-controls-right">
    <RecordingControl plugins={[CodeRecorderPlugin]}/>

    {Player.defaultControlsRight}
  </div>
</>);

<Player controls={controls} script={script}>
  <CodeBooth
    mode="javascript"
    recorder={CodeRecorderPlugin.recorder}
    theme="monokai"
  />
</Player>
```

To replay:

```tsx
import {CodeBooth} from "rp-codebooth";

import {codeRecording} from "./recordings";

<CodeBooth
  mode="javascript"
  replay={codeRecording}
  start="demo/"
  theme="monokai"
/>
```
