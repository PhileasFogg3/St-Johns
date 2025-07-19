if (window.location.pathname == "/") {

  fetch("html/rightSideBar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("sidebar-placeholder").innerHTML = data;
});

} else {

  fetch("../html/rightSideBar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("sidebar-placeholder").innerHTML = data;
  });

}