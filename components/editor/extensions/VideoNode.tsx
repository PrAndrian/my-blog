import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { VideoEmbedCard } from "../VideoEmbedCard";

interface VideoOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      /**
       * Insert an uploaded video embed
       */
      setVideo: (options: { storageId: string }) => ReturnType;
    };
  }
}

// React component that wraps the VideoEmbedCard
const VideoComponent = ({ node, deleteNode }: any) => {
  const { storageId } = node.attrs;

  return (
    <NodeViewWrapper className="video-embed-wrapper">
      <VideoEmbedCard storageId={storageId} onDelete={deleteNode} />
    </NodeViewWrapper>
  );
};

export const VideoNode = Node.create<VideoOptions>({
  name: "video",

  group: "block",

  atom: true,

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      storageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-storage-id"),
        renderHTML: (attributes) => {
          if (!attributes.storageId) {
            return {};
          }
          return {
            "data-storage-id": attributes.storageId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Add a comment inside to prevent Turndown from skipping empty div
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "video" }),
      "<!-- video-embed -->",
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },
});
