import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { SlashCommandMenu, CommandItem } from "../SlashCommandMenu";
import { Image, Video, Youtube } from "lucide-react";

export interface SlashCommandsOptions {
  onImageUpload: () => void;
  onVideoUpload: () => void;
  onYoutubeEmbed: () => void;
}

export const SlashCommands = Extension.create<SlashCommandsOptions>({
  name: "slashCommands",

  addOptions() {
    return {
      onImageUpload: () => {},
      onVideoUpload: () => {},
      onYoutubeEmbed: () => {},
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: false,

        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },

        items: ({ query }) => {
          const items: CommandItem[] = [
            {
              title: "Image",
              description: "Upload an image from your computer",
              icon: Image,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run();
                this.options.onImageUpload();
              },
            },
            {
              title: "Video",
              description: "Upload a video file",
              icon: Video,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run();
                this.options.onVideoUpload();
              },
            },
            {
              title: "YouTube",
              description: "Embed a YouTube video",
              icon: Youtube,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run();
                this.options.onYoutubeEmbed();
              },
            },
          ];

          // Filter items based on query
          return items.filter((item) =>
            item.title.toLowerCase().startsWith(query.toLowerCase())
          );
        },

        render: () => {
          let component: ReactRenderer | null = null;
          let popup: TippyInstance[] = [];

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(props) {
              component?.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },

            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup[0]?.hide();
                return true;
              }

              return (component?.ref as any)?.onKeyDown(props.event) ?? false;
            },

            onExit() {
              popup[0]?.destroy();
              component?.destroy();
            },
          };
        },
      } as SuggestionOptions),
    ];
  },
});
