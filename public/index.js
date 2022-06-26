const form = $("#form");
const fileList = $("#files");

$.get("/directoryInformation").then((data) => {
  console.log(data);
  for (let i = 0; i < data.length; i++) {
    fileList.append(
      `<a class='file' href="/uploaded/${data[i]}">${data[i]}</a><br /><button class="delete" data-name="${data[i]}">Delete ${data[i]}</button><br />`
    );
  }
});

$("#files").on("click", ".delete", (e) => {
  let dataname = e.target.dataset.name;
  console.log(dataname);

  $.ajax({
    url: `/uploaded/${dataname}`,
    type: "DELETE",
    success: function (res) {
      console.log(res);
      $.get("/directoryInformation").then((data) => {
        fileList.empty();
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          fileList.append(
            `<a class='file' href="/uploaded/${data[i]}">${data[i]}</a><br /><button class="delete" data-name="${data[i]}">Delete ${data[i]}</button><br />`
          );
        }
      });
    },
  });
});

form.on("submit", (e) => {
  e.preventDefault();

  var formData = new FormData();
  formData.append("file", $("#fileInput")[0].files[0]);
  console.log(formData);

  $.ajax({
    url: "/",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      console.log(response);
      fileList.append(
        `<a class='file' href="/uploaded/${response}">${response}</a><br /><button class="delete" data-name="${response}">Delete ${response}</button><br />`
      );
    },
  });
});
