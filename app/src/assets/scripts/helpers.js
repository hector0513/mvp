
// PROBAR MOVIENDO ESTA FUNCION A UN SITIO QUE SEA ACCESIBLE POR TODO
// SE PUEDE USAR PARA BUSCAR TODAS LAS RESPUESTAS Y ENVIARLAS EN EL FORM
// PARA CUANDO QUERAMOS MANEJAR LA RESPUESTA DEL SERVIDOR MEJOR
function getFormInfo(){

  var allInputs = $(".form-input")
  var objectInfo = {};

  for (var i = 0; i < allInputs.length; i++){
    objectInfo[allInputs[i].id] = allInputs[i].value;
  }

  return objectInfo;
}

// Para metodos de pago. Pueden agregarlo lo que quieran
function checkoutMethod(method){

  if ( method.search("paypal") > 1 )
    return "PayPal";
  else
    return "WireTransfer"

}

function stringLetters(text, id){

  var letterRegex = /[A-Za-z]+/;

  if ( !text.match(letterRegex) ){

    $('#' + id).addClass("invalid-input")
    $('#' + id)[0].setCustomValidity("El campo no puede contener números ni símbolos")
    return false;

  }

  $('#' + id).removeClass("invalid-input")
  return true;

}

function getBackDate(minYear){

  var today = new Date();

  var year = today.getFullYear() - minYear
  var month = today.getMonth() + 1
  var day = today.getDate()

  if(day<10)
    day='0'+day

  if(month<10)
    month='0'+month

  year = year.toString();
  month = month.toString();
  day = day.toString();

  return year +'-'+ month +'-'+ day

}

// Agrega los meses si 5 meses hacia atras es negativo
function previousYear(lastMonths, allMonths, minusX){

  var reverseMonths = allMonths.reverse();
  var count = 0;

  // Si se quiere cambiar el limite de meses se cambia la condicion del length y el minusX mas abajo
  while (minusX != 0 && lastMonths.length < 5){

      lastMonths.push(allMonths[count]);
      count++;
      minusX++;

  }

  return lastMonths;

}

// Selecciona los ultimos meses para mostrar en la grafica
function lastMonths(){

  var allMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  var date = new Date();
  var lastMonths = [];

  var month = date.getMonth();

  // Si se quiere cambiar el limite de meses se cambia la condicion del length y el minusX mas abajo
  while (month >= 0 && lastMonths.length < 5){

      lastMonths.push(allMonths[month]);
      month--;

  }

  // Para ver si se necesitan agregar meses del año pasado. 
  // Como se incluye el mismo mes, es (meses al pasado + 1), ej. 5 meses es  (mes actual) - 4
  var minusX = month - 4;
  if ( minusX < 0)
      lastMonths = previousYear(lastMonths, allMonths, minusX);

  console.log(lastMonths)
  return lastMonths;
  
}