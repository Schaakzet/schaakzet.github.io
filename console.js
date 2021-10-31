// Generic console.log overload, displaying <title> name in colors, linenumbers and everything passed to it
console.log =
  ((console.LOG = console.log), // on first definition save console.log
  // and return overloaded console.log function:
  (...args) => {
    let apptitle = document.head.id || document.title.split("-")[0]; // or get title from call stack
    let errorStack; // new  Error().stack
    let file = "";
    let linenr = ""; //! todo 2 or 3 rd parameter?
    let method = "";
    try {
      try {
        errorStack = new Error().stack; //stack
      } catch (e) {
        // catch no Stack error
      }
      let lines = errorStack
        .split("at ") //
        .filter((line, idx) => idx > 1 && line.includes(".js")) //discard extractLineNr, console.log itself
        .map((logline,idx,lines) => {
          // console.warn(logline) // if starts with HTMLElement extract method
          let [funcname, uri] = logline.split(" ");
          //console.LOG(logline);
          try {
            if (uri) {
                file = uri.split("/");
                file = file[file.length - 1];
                file = file.split(")")[0];
            }
          } catch (e) {
            // catch <anonymous>
          }
          return {
            funcname,
            file,
            line: file && Number(file.split(":")[1]),
          };
        })
        .filter((x) => x && x.file);
      if (lines.length) {
        linenr = lines[0].file.split(":").slice(0,2).join(":").replace(".js","");
      } else {
        linenr = "";
      }
    } catch (e) {
      console.error("Overloading console error:", e, errorStack);
    }
    // override console.log("Hello:red;color=white", "World!") //! FIRST/ONLY colon : in string marks color!
    let /* assign label and color */ [label = "", color = "goldenrod"] = (
        typeof args[0] == "string" /* if first arg is a string */ &&
        args.length > 1 /* and more parameters */
          ? /* label = take first arg */ args.shift()
          : /* label = typeof */ typeof args[0]
      ).split(":");
    if (linenr) linenr = ` ${linenr} `;

    window.console.LOG(
      `%c ${apptitle}%c${linenr}${method} %c ${label} `,
      `background:gold;font-size:80%;font-weight:bold`, // app title color
      `background:gold;font-size:80%`, //first label color // linenr method
      `background:${color.replaceAll("=", ":")}`, // second label color // label
      ...args // all remaing args
    );
  });
window.console.logwc = (element, ...args) => {
  let label = typeof element != "string" ? `<${element.nodeName}>` : element;
  console.log(`%c ${label}`, "background:darkmagenta;color:white", ...args);
};
