var socket = io();

//emit chat message when btn is clicked
$(document).ready(function() {
    $('#senmesg').click(function() {
      	if($("#chat-input").val() != ""){
			socket.emit("chat-message",$("#chat-input").val());
			$("#chat-input").val("");
		}
    });
});

//emit chat mesage when enter key is pressed
$("#chat-input").keydown(function(event){
	if (event.keyCode == 13){
		event.preventDefault();
		if($("#chat-input").val() != ""){
			socket.emit("chat-message",$("#chat-input").val());
			$("#chat-input").val("");
		}
	}
});

//receive chat messgae from server
socket.on("chat-message",function(message){
	var time = new Date();
	$('#chatlogs').append(
        "<div class='chat self'>" + "<div class='user-photo'>" + "<img src='images/person_1.jpg'>"
        +"</div>" + "<p class='chat-message'>" + message + "</p>" + "</div>" + "<span class='grey-text' style='margin-left: 100;'>" + time.getHours() + ":" + time.getMinutes() + "</span>"
    );
	// $("#chatlogs").append(message+"<br />")
});

