import { MemeTemplate } from '@/components/MemeBuilder';

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: "1",
    templateId: "distracted-boyfriend",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/distracted_boyfriend.jpeg"
  },
  {
    id: "2",
    templateId: "drake-hotline-bling",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/drake_hotline_bling.jpeg"
  },
  {
    id: "3",
    templateId: "woman-yelling-at-cat",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/woman_yelling_at_cat.jpeg"
  },
  {
    id: "4",
    templateId: "fancy-winnie-the-pooh",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/fancy_winnie_the_pooh.jpeg"
  },
  {
    id: "6",
    templateId: "anakin-and-padme",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/anakin_and_padme.jpeg"
  },
  {
    id: "7",
    templateId: "sweating-button-choice",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/sweating_button_choice.jpeg"
  },
  {
    id: "8",
    templateId: "always-has-been",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/always_has_been.jpeg"
  },
  {
    id: "9",
    templateId: "is-this-a-butterfly",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/is_this_a_butterfly.jpeg"
  },
  {
    id: "10",
    templateId: "left-exit-12-off-ramp",
    data: {},
    createdAt: new Date(),
    imageUrl: "https://minimemes.vercel.app/meme-bg/left_exit_12_off_ramp.jpeg"
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
