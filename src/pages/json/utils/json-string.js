/**
 * Minify a Json string
 */
export const minifyJsonString = (jsonString) => {
  try {
    return JSON.stringify(JSON.parse(jsonString), null);
  } catch (err) {
    return jsonString;
  }
};

/**
 * Prettify/Format Json string
 */
export const prettifyJsonString = (jsonString) => {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, "\t");
  } catch (err) {
    return jsonString;
  }
};

export const parseJsonSchemaString = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    // try to throw a more detailed error message using validate
    // validateString(jsonString);
    // rethrow the original error
    return {};
  }
};
