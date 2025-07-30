if (window.location.pathname == "/" || window.location.pathname == "/St-Johns/") {

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