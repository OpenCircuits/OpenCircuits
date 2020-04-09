function toggleMac() {
  var x = document.getElementById("toggle");
  if (x.innerHTML === "CTRL") {
    x.innerHTML = "CMD";
  } else {
    x.innerHTML = "CTRL";
  }
}
function toggleWindows() {
    var x = document.getElementById("toggle");
    if (x.innerHTML === "CMD") {
      x.innerHTML = "CTRL";
    } else {
      x.innerHTML = "CMD";
    }
  }