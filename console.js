// TODO add linenr to output, now it lists the linenr inside console
{
  function contrastColor(color = "ffffff", low = "black", high = "beige") {
    color = color.replace("#", "");
    return (parseInt(color.slice(0, 2), 16) * 299 + parseInt(color.slice(2, 4), 16) * 587 + parseInt(color.slice(4, 6), 16) * 114) / 1000 >= 136 ? low : high;
  }

  // Generic console.log overload, displaying <title> name in colors, linenumbers and everything passed to it
  console.logColor =
    ((console.LOG = console.log), // on first definition save console.log
    // and return overloaded console.log function:
    (...args) => {
      let errorStack; // new  Error().stack
      let file = "";
      let linenr = ""; //! todo 2 or 3 rd parameter?
      let method = "";
      let ErrorStackLines;
      try {
        try {
          errorStack = new Error().stack; //stack
        } catch (e) {
          // catch no Stack error
        }
        ErrorStackLines = errorStack
          .split("at ") //
          .filter((line, idx) => idx > 1 && line.includes(".js")) //discard extractLineNr, console.log itself
          .map((logline, idx, lines) => {
            // console.warn(logline) // if starts with CHESS.ChessBaseElement extract method
            let [funcname, uri] = logline.split(" ");
            try {
              if (uri) {
                file = uri.split("/");
                file = file[file.length - 1];
                file = file.split(")")[0];
                file = file.split("?")[0].replace(".js", "");
              }
              // console.LOG(linenr, file, funcname);
            } catch (e) {
              // catch <anonymous>
            }
            let POEP = uri || logline;
            linenr = POEP.split("?")[POEP.includes("?") ? 1 : 0].split(":")[1];
            return {
              funcname,
              file,
              linenr,
            };
          })
          .filter((x) => x && x.file && x.funcname !== "log");
      } catch (e) {
        console.error("Overloading console error:", e, errorStack, [...args]);
      }
      // override console.log("Hello:red;color=white", "World!") //! FIRST/ONLY colon : in string marks color!

      let label = args.shift();
      let label2 = args.shift();
      let bgcolor = "gold";
      let color;
      let collapse;

      if (typeof label == "object") {
        bgcolor = label.background;
        collapse = label.stacktrace ? false : true;
        label = label.name;
        color = contrastColor(bgcolor);
        //console.warn(label, bgcolor, linenr);
      }
      if (typeof label2 == "object") {
        args.unshift(label2);
        label2 = typeof label2;
      }

      let background0 = `background:beige;color:black;font-size:90%`;
      let background1 = `background:${bgcolor};color:${color};font-weight:bold`; // app title color
      let background2 = `background:pink;color:black`; // app title color
      let background3 = `background:lightblue;color:black`; // app title color
      let consoleArray = [
        //`%c ${apptitle}` +
        `%c ${linenr} %c ${label}${method} %c ${label2} `,
        background0,
        background1,
        `background:gold;font-size:100%`, //first label color // linenr method
        //`background:${bgcolor.replaceAll("=", ":")}`, // second label color // label
        ...args, // all remaing args
      ];

      let StackLines = ErrorStackLines.slice(0, -1);
      if (StackLines.length > 0 && collapse) {
        window.console.groupCollapsed(...consoleArray);
      } else {
        window.console.group(...consoleArray);
      }
      StackLines.forEach(({ linenr, file, funcname }) => {
        console.log(`%c ${linenr} %c ${file} %c ${funcname}`, background0, background2, background3);
      });
      window.console.groupEnd();
    });
  window.console.logwc = (element, ...args) => {
    let label = typeof element != "string" ? `<${element.nodeName}>` : element;
    console.log(`%c ${label}`, "background:darkmagenta;color:white", ...args);
  };
}
