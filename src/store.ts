import create from "zustand";
import {combine} from "zustand/middleware";

export const useStore = create(
  combine(
    {
      messages: [],
      mode: "javascript",
      pane: "replay"
    }, 
    (set) => ({
      
    })
  )
);
