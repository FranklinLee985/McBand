//show warning messages whenever there is error message appear in back end
$(document).ready(function(){
  var err = $('#error').text();
  if(err !== ''){
    alert(err);
  }
});
