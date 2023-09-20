import { importCss } from "./functions.js";
//todo make
/* 
needs to be a chatwindow with global | party/game | private 
textbox to display info
input text for sending
button send
dropdown for selection between modes

private msging to do after working funtion
rightclick on name contextmenu for private msg
*/


class Chatbox extends HTMLElement {
    constructor(){
        super()

    }

    connectedCallback(){
        this.buildHtml();
        importCss(`chatbox.css`);
    }

    buildHtml(){
        const div = document.createElement(`div`);
        div.id = `chatwindow`;
        const input = document.createElement(`input`);
        input.type = `text`;
        input.id = `chatmsg`;
        const btn = document.createElement(`button`);
        btn.id = `sendmsgbutton`;
        this.append(...[div,input,btn]);
    }
}
customElements.define(`chat-box`,Chatbox);
export{Chatbox};