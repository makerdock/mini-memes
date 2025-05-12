import { MemeTemplate } from '@/components/meme-generator';

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: "1",
    templateId: "distracted-boyfriend",
    userId: "system",
    textOverlays: [
      {
        areaId: "boyfriend",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 350,
        y: 100
      },
      {
        areaId: "girlfriend",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 150,
        y: 100
      },
      {
        areaId: "other-girl",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 550,
        y: 100
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/distracted_boyfriend.jpeg"
  },
  {
    id: "2",
    templateId: "drake-hotline-bling",
    userId: "system",
    textOverlays: [
      {
        areaId: "top-text",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 350,
        y: 100
      },
      {
        areaId: "bottom-text",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 350,
        y: 350
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/drake_hotline_bling.jpeg"
  },
  {
    id: "3",
    templateId: "woman-yelling-at-cat",
    userId: "system",
    textOverlays: [
      {
        areaId: "woman",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 200,
        y: 100
      },
      {
        areaId: "cat",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 500,
        y: 100
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/woman_yelling_at_cat.jpeg"
  },
  {
    id: "4",
    templateId: "fancy-winnie-the-pooh",
    userId: "system",
    textOverlays: [
      {
        areaId: "regular",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 350,
        y: 100
      },
      {
        areaId: "fancy",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 350,
        y: 300
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/fancy_winnie_the_pooh.jpeg"
  },
  {
    id: "5",
    templateId: "disaster-girl",
    userId: "system",
    textOverlays: [
      {
        areaId: "caption",
        text: "",
        font: "Impact",
        size: 40,
        color: "#ffffff",
        x: 250,
        y: 50
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/disaster_girl.jpeg"
  },
  {
    id: "6",
    templateId: "anakin-and-padme",
    userId: "system",
    textOverlays: [
      {
        areaId: "anakin-line1",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 200,
        y: 50
      },
      {
        areaId: "padme-line1",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 200,
        y: 200
      },
      {
        areaId: "padme-line2",
        text: "Right?",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 200,
        y: 350
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/anakin_and_padme.jpeg"
  },
  {
    id: "7",
    templateId: "sweating-button-choice",
    userId: "system",
    textOverlays: [
      {
        areaId: "left-button",
        text: "",
        font: "Impact",
        size: 24,
        color: "#ffffff",
        x: 150,
        y: 100
      },
      {
        areaId: "right-button",
        text: "",
        font: "Impact",
        size: 24,
        color: "#ffffff",
        x: 450,
        y: 100
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/sweating_button_choice.jpeg"
  },
  {
    id: "8",
    templateId: "always-has-been",
    userId: "system",
    textOverlays: [
      {
        areaId: "astronaut1",
        text: "Wait, it's all...",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 200,
        y: 100
      },
      {
        areaId: "astronaut2",
        text: "Always has been",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 400,
        y: 300
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/always_has_been.jpeg"
  },
  {
    id: "9",
    templateId: "is-this-a-butterfly",
    userId: "system",
    textOverlays: [
      {
        areaId: "butterfly",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 450,
        y: 100
      },
      {
        areaId: "caption",
        text: "Is this...",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 200,
        y: 300
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/is_this_a_butterfly.jpeg"
  },
  {
    id: "10",
    templateId: "left-exit-12-off-ramp",
    userId: "system",
    textOverlays: [
      {
        areaId: "car",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 250,
        y: 250
      },
      {
        areaId: "left-sign",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 150,
        y: 100
      },
      {
        areaId: "right-sign",
        text: "",
        font: "Impact",
        size: 32,
        color: "#ffffff",
        x: 400,
        y: 100
      }
    ],
    createdAt: new Date(),
    imageUrl: "/meme-bg/left_exit_12_off_ramp.jpeg"
  }
];

// For backwards compatibility
export const staticMemeTemplates = MEME_TEMPLATES;

/**
 * Converts a filename to a title case string
 * Example: "distracted-boyfriend.jpg" -> "Distracted Boyfriend"
 */
export function filenameToTitle(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  // Replace hyphens and underscores with spaces
  const nameWithSpaces = nameWithoutExt.replace(/[-_]/g, " ");

  // Convert to title case (capitalize first letter of each word)
  return nameWithSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
