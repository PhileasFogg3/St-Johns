if (window.location.pathname == "/" || window.location.pathname == "/St-Johns/") {

  fetch("html/footer.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("footer-placeholder").innerHTML = data;

});

} else {

  fetch("../html/footer.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("footer-placeholder").innerHTML = data;

  });

}