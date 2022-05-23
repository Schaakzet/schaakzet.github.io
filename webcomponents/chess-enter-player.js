// Here users get a WP_user_id and enter their screenname. Then a new ChessPlayer is created with these arguments.
let body = new FormData();
body.append("function", "selectAll");
body.append("table", "users");

fetch("https://schaakzet.nl/api/rt/index.php", {
  method: "POST",
  body,
})
  .then((response) => {
    console.warn(response);
    return response.json();
  })
  .then((res) => {
    console.log(res);
  });

const { id, name } = res[5];
new ChessPlayer(id, name);
