customElements.define("schaak-bord",class extends HTMLElement{
	connectedCallback(){
  	let templ = document.querySelector('template[id="SCHAAKBORD_ROB"]').content;
  	this.append(templ.cloneNode(true));
  }
} )

