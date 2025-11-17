import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { YouTubeEmbedCard } from "../YouTubeEmbedCard";

interface YouTubeOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      /**
       * Insert a YouTube video embed
       */
      setYouTubeVideo: (options: { videoId: string }) => ReturnType;
    };
  }
}

// React component that wraps the YouTubeEmbedCard
const YouTubeComponent = ({ node, deleteNode }: any) => {
  const { videoId } = node.attrs;

  return (
    <NodeViewWrapper className="youtube-embed-wrapper">
      <YouTubeEmbedCard videoId={videoId} onDelete={deleteNode} />
    </NodeViewWrapper>
  );
};

export const YouTubeNode = Node.create<YouTubeOptions>({
  name: "youtube",

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
      videoId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-video-id"),
        renderHTML: (attributes) => {
          if (!attributes.videoId) {
            return {};
          }
          return {
            "data-video-id": attributes.videoId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="youtube"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Add a comment inside to prevent Turndown from skipping empty div
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "youtube" }),
      "<!-- youtube-embed -->",
    ];
  },

  addCommands() {
    return {
      setYouTubeVideo:
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
    return ReactNodeViewRenderer(YouTubeComponent);
  },
});
