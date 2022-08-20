// ********************************************************** Generic Helper Functions
// Generic App(plication) Base Helper Functions that can be used in any project

// ---------------------------------------------------------- isString
// global isString function: if( isString(param) ) { ... }
if (window.isString) console.error("conflict: isString() is already defined");
window.isString = (value) => typeof value === "string" || value instanceof String;

// ---------------------------------------------------------- console.todo
// extend existing console with a .todo function, coloring the output in red
console.todo = function (...args) {
  console.log("%c TODO: ", "background:red;color:yellow", ...args);
};
