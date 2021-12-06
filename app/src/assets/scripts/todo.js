var isTodo = $("#checktodo").val()
function displayDateInput(){

  var today = new Date();

  var year = today.getFullYear();
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

var fullDate = displayDateInput();

if ( $('#deadline')[0].type != 'date' ) {
  $('#deadline').datepicker();

}
if (String(isTodo)=="true"){ $("#radio3").click()}

  $( "#todo" ).sortable({
    cursor: 'grabbing',
    update: function( event, ui ) {
      var sortedList = $( "#todo" ).sortable( "toArray" );
      var arr = sortedList.filter(function(x){
       return x.length>2;
      });
      console.log(arr);
      postSort(arr)
    }

  }).disableSelection();

  function postSort(sortedList){

    $.post("/partner/todo/sort",
    {
      list:sortedList
    },
    function(data,status){
        console.log(data)
        console.log(status);
    });

  }

    function checkTask(task){

      var reqInfo = {
        task
      }
      $.post("/partner/todo/check",
          reqInfo,
          function (data, status) {
              console.log(data)
              console.log(status);
              window.location.href="/partner?check=todo"
          });
    }

    $("#search").on('change keydown paste input focus', function(){
      var partner= $("#partnerID").val()
      var search = $("#search").val()
      if (search.length>2){
        $("#todoDIV").hide()
        $("#searchDIV").show()
        var reqInfo = {
          search,
          partner
        }
        $.post("/partner/todo/search",
        reqInfo,
        function (data, status) {
          loadSearch(data);
        });
      } else {
        $("#todoDIV").show()
        $("#searchDIV").hide()
      }

    })


    function createTask(partner){
      var description= $("#description").val()
      var requirement = $("#requirement").val()
      var priority= $("#priority").val()
      var deadline = $("#deadline").val()
      var tags_string = $("#tags").val()
      var tags = tags_string.split(" ");
      var reqInfo = {
          description,
          requirement,
          priority,
          deadline,
          tags,
          partner
      }
      $.post("/partner/todo/create",
          reqInfo,
          function (data, status) {
              console.log(data)
              console.log(status);
              $("#Modal-task").modal('hide');
              window.location.href="/partner?check=todo"
          });
    }


    function editTask(){
      var description= $("#description").val()
      var requirement = $("#requirement").val()
      var priority= $("#priority").val()
      var deadline = $("#deadline").val()
      var tags_string = $("#tags").val()
      var tags = tags_string.split(" ");
      var task = $("#task_id").val()
      var reqInfo = {
          description,
          requirement,
          priority,
          deadline,
          tags,
          task
      }
      $.post("/partner/todo/edit",
          reqInfo,
          function (data, status) {
              console.log(data)
              console.log(status);
              $("#Modal-task").modal('hide');
              window.location.href="/partner?check=todo"
          });
    }

    function deleteTask(){
      var task = $("#task_id").val()
      var reqInfo = {
          task
      }
      $.post("/partner/todo/delete",
          reqInfo,
          function (data, status) {
              console.log(data)
              console.log(status);
              $("#Modal-task").modal('hide');
              window.location.href="/partner?check=todo"
          });
    }


    function editTaskModal(id,description,deadline,task_requirement,task_priority,tags){
      console.log("here");
      console.log(id);
      console.log(description);
      console.log(deadline);
      console.log(task_requirement);
      console.log(task_priority);
      var arr = tags.split(",") ;
      var fullDate = displayDateInput();

      // Pone el limite al calendario
      document.getElementById("deadline").setAttribute("min", fullDate);
      if ( $('#deadline')[0].type != 'date' ) {
        $('#deadline').datepicker();

      }
      var deadlineDate = new Date(deadline);
      $('#deadline').datepicker('setDate', deadlineDate);
      $("#description").val(description)
      $("#opp_"+task_requirement).attr("selected",true);
      $("#requirement").val()
      $("#p_"+task_priority).attr("selected",true);
      $("#deadline").val(deadline)
      $("#tags").val(arr.join(" "));
      $("#task_id").val(id)
      $("#addDiv").attr("hidden",true)
      $("#editDiv").attr("hidden",false)
      $("#Modal-task").modal('show');

      // console.log(task.description);
      // console.log(moment(task.deadline).format("DD/MM/YYYY"));
    }


    function addTaskModal(){
      $("#description").val("")
      $("#deadline").val("")
      $("#tags").val("");
      $("#task_id").val("")
      $("#addDiv").attr("hidden",false)
      $("#editDiv").attr("hidden",true)
    }


    function loadSearch(todo){

      $("#searchDIV").html("");
      var div_container = $("<div>").attr("class","container").appendTo('#searchDIV');

      todo.forEach((task, i) => {
        var div_row = $("<div>").attr("class","row").appendTo(div_container);
        var div_col = $("<div>").attr("class","col-11").appendTo(div_row);
        var p = $("<p>").appendTo(div_col);

        var class_description = "description"
        if (task.status!= "Pending") {class_description += " checked line"}
        var circle = $("<i>").attr("class","fa fa-circle white cursor-default").appendTo(p);
        var description = $("<label>").attr("class",class_description).append(task.description).appendTo(p);
        $("<br>").appendTo(p)
        var priority_color =  "fa fa-circle priority_"+ task.priority;
        var priority = $("<i>").attr("class",priority_color).appendTo(p);

        if (task.requirement){
          var short_id = String(task.requirement)
          short_id = short_id.substr(short_id.length-6);
          var a_link = "Oportunidad #"+short_id+"&nbsp; ";
          var a = $("<a>").attr("class","link-req").attr("href","/partner/opportunity/inProgress/"+task.requirement).append(a_link).appendTo(p);
        }

        task.tags.forEach((tag, t) => {
          var span =  $("<span>").attr("class","tag").appendTo(p);
          var label = $("<label>").attr("class","tag-label").append(" &nbsp; "+tag+" &nbsp; ").appendTo(span)
          p.append(" ")
        })

        $("<br>").appendTo(p)
        var white = $("<i>").attr("class","fa fa-circle white").appendTo(p)
        var date = $("<label>").attr("class","date").append(moment(task.deadline).format("DD/MM/YYYY")).appendTo(p);
        $("<p>").attr("class","separator").appendTo(div_col)
        var div_col_1 = $("<div>").attr("class","col-1").appendTo(div_row);
        var class_status ="row empty-check vertical";
        if (task.status=="Done") {class_status += " green vertical"} else {class_status += " red vertical"}
        var div_row_check = $("<div>").attr("class",class_status).appendTo(div_col_1);
        var img = $("<img>").attr("class","tick").attr("src","/assets/images/tick.svg").appendTo(div_row_check);

      })

    }
