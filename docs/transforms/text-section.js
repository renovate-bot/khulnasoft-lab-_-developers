const fs = require("fs");
const path = require("path");

/**
 * Reads a file and extracts the text between
 * TEXT_SECTION:<id>:START
 * ...text...
 * TEXT_SECTION:<id>:END
 *
 * @param {object} content - Markdown content
 * @param {object} options - Plugin options
 * @param {object} config - Plugin config
 *
 * @returns {string} - Extracted text
 */
module.exports = function TEXT_SECTION(content, options, config) {
  let text;
  let syntax = options.syntax;
  if (!options.id || !options.src) {
    // If no id or src is provided, return nothing
    return false;
  }

  const fileDir = path.dirname(config.originalPath);
  const filePath = path.join(fileDir, options.src);

  try {
    // Read the file
    text = fs.readFileSync(filePath, "utf8", (err, contents) => {
      if (err) {
        console.log(`FILE NOT FOUND ${filePath}`);
        console.log(err);
        throw err;
      }
      return contents;
    });
  } catch (e) {
    console.log(`FILE NOT FOUND ${filePath}`);
    throw e;
  }

  if (!syntax) {
    // Determine the syntax of the file based on its extension
    syntax = path.extname(filePath).replace(/^./, "");
  }

  // Split the text into lines
  const lines = text.split("\n");

  // Find the start and end line numbers
  const startLine = lines.findIndex(line => line.includes(`TEXT_SECTION:${options.id}:START`)) ?? 0;
  const endLine = lines.findIndex(line => line.includes(`TEXT_SECTION:${options.id}:END`)) ?? lines.length - 1;

  // Extract the lines between the start and end
  const selectedLines = lines.slice(startLine + 1, endLine);

  // Trim the lines to remove leading and trailing whitespace
  const trimBy = selectedLines[0]?.match(/^(\s*)/)?.[1]?.length;
  const trimmedLines = selectedLines.map(line => line.substring(trimBy));

  // Join the lines back together
  return trimmedLines.join("\n");
};
