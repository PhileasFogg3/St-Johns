fetch("https://github.com/PhileasFogg3/St-Johns/html/rightSideBar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("sidebar-placeholder").innerHTML = html;
  });