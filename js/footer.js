fetch("https://github.com/PhileasFogg3/St-Johns/html/footer.html")
.then(response => response.text())
.then(data => {
  document.getElementById("footer-placeholder").innerHTML = data;
});