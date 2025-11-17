import { Node, mergeAttributes } from "@tiptap/core";

export interface IframeOptions {
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string }) => ReturnType;
    };
  }
}

export const Iframe = Node.create<IframeOptions>({
  name: "iframe",

  group: "block",

  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: "iframe-wrapper",
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        class: "iframe-wrapper",
        style:
          "position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;",
      },
      [
        "iframe",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          style:
            "position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
