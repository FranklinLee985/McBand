var socket = io();

//emit chat message when btn is clicked
$(document).ready(function() {
	var usericon = document.getElementById('usericon').innerHTML;
    $('#senmesg').click(function() {
      	if($("#chat-input").val() != ""){
			socket.emit("chat-message",{
				msg: $("#chat-input").val(), 
				usericonp: usericon
			});
			$("#chat-input").val("");
		}
    });
});

//emit chat mesage when enter key is pressed
$("#chat-input").keydown(function(event){
	var usericon = document.getElementById('usericon').innerHTML;
	//alert(usericon);
	if (event.keyCode == 13){
		event.preventDefault();
		if($("#chat-input").val() != ""){
			socket.emit("chat-message",{
				msg: $("#chat-input").val(), 
				usericonp: usericon
			});
			$("#chat-input").val("");
		}
	}
});

//receive chat messgae from server
socket.on("chat-message",function(data){
	var time = new Date();
	$('#chatlogs').append(                                        
        "<div class='chat self'>" + "<div class='user-photo'>" + "<img src="+ data.usericonp +">"
        +"</div>" + "<p class='chat-message'>" + data.msg + "</p>" + "</div>" + "<span class='grey-text' style='margin-left: 100;'>" + time.getHours() + ":" + time.getMinutes() + "</span>"
    );
	// $("#chatlogs").append(message+"<br />")
});

