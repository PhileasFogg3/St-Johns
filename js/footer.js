if (window.location.pathname == "/") {

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