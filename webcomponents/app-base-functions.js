// ********************************************************** Generic Helper Functions
window.isString = (value) => typeof value === "string" || value instanceof String;

console.todo = function(...args){
    console.log("%c TODO: ", "background:red;color:yellow", ...args);
}