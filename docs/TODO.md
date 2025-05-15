# One-Day MVP Todo List for Meme Generator

## Project Setup (Hour 0-2)
- [x] Create JSON file with 10-15 popular meme templates
- [x] Define text areas and positions for each template
- [x] Prepare default text content for templates

## Meme Editor 
 - [x] Implement when an text box is active then, it should update in the useEditorState
 - [x] When a text box is active then, user should see a toolbox with stick bottom
 - [x] the toolbox should have input to change the text and up and down arrow to change the font size
 - [x] the text inside should always in be capital
 - [x] as the user type more, it should update the font size, like writing more shoukd decrease the font size and wrap the text to the next line. this is similar code to achive the same effect
```
 function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    isBottom = false,
  ) {
    if (!text) return

    const words = text.split(" ")
    let line = ""
    const lines: string[] = []

    // Break into lines
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " "
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        lines.push(line)
        line = words[n] + " "
      } else {
        line = testLine
      }
    }

    if (line.trim()) {
      lines.push(line)
    }

    // Adjust y position for bottom text to start from bottom
    if (isBottom && lines.length > 1) {
      y -= lineHeight * (lines.length - 1)
    }

    // Draw each line
    for (let i = 0; i < lines.length; i++) {
      const lineY = isBottom ? y + i * lineHeight : y + i * lineHeight
      ctx.strokeText(lines[i], x, lineY)
      ctx.fillText(lines[i], x, lineY)
    }
  }
  ```

 - [ ] it should by default active the first text box
 