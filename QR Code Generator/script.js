let imgBox = document.getElementById("imgBox");
let qrImage = document.getElementById("qrImage");
let qrInput = document.getElementById("text-input");
let downloadBtn = document.getElementById("downloadBtn");

function generateQR() {
  if (qrInput.value.trim().length === 0) {
    qrInput.classList.add("error");
    setTimeout(() => qrInput.classList.remove("error"), 500);
    return;
  }

  qrImage.style.display = "block";
  qrImage.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" +
    encodeURIComponent(qrInput.value);

  imgBox.classList.add("show-img");
  downloadBtn.style.display = "block";
}

function downloadQR() {
  let link = document.createElement("a");
  link.href = qrImage.src;
  link.download = "qr-code.png";
  link.click();
}
