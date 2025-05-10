export const memeTemplates = [
  {
    id: 1,
    name: "Distracted Boyfriend",
    url: "/meme-bg/distracted_boyfriend.jpeg",
  },
  {
    id: 2,
    name: "Drake Hotline Bling",
    url: "/meme-bg/drake_hotline_bling.jpeg",
  },
  {
    id: 3,
    name: "Woman Yelling at Cat",
    url: "/meme-bg/woman_yelling_at_cat.jpeg",
  },
  {
    id: 4,
    name: "Fancy Winnie the Pooh",
    url: "/meme-bg/fancy_winnie_the_pooh.jpeg",
  },
  {
    id: 5,
    name: "Disaster Girl",
    url: "/meme-bg/disaster_girl.jpeg",
  },
  {
    id: 6,
    name: "Anakin & Padme",
    url: "/meme-bg/anakin_and_padme.jpeg",
  },
  {
    id: 7,
    name: "Sweating Button Choice",
    url: "/meme-bg/sweating_button_choice.jpeg",
  },
  {
    id: 8,
    name: "Always Has Been",
    url: "/meme-bg/always_has_been.jpeg",
  },
  {
    id: 9,
    name: "Is This a Butterfly?",
    url: "/meme-bg/is_this_a_butterfly.jpeg",
  },
  {
    id: 10,
    name: "Left Exit 12 Off Ramp",
    url: "/meme-bg/left_exit_12_off_ramp.jpeg",
  },
];

// For backwards compatibility
export const staticMemeTemplates = memeTemplates;

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
