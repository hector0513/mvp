document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});
  function postContact() {
    var email = $("#email").val();
    var subject = $("#subject").val();
    var comment = $("#comment").val();

    if (email && subject && comment) {
      var formData = {
        email,
        subject,
        comment,
      };
      $.post("/contact/", formData, function (data, status) {
        console.log(data);
        console.log(status);
        alert(data.message);
        $("#email").val("");
        $("#subject").val("");
        $("#comment").val("");
      });
    } else {
      alert(
        "Debes introducir tu correo, el asunto y el comentario que deseas enviar"
      );
    }
  }
