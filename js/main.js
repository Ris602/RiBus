/******************
FAVORITES
******************/

var Favorites = function(key){
	this.key = key;
	this.favorites = null;
	this.error = null;
}

Favorites.prototype.getFavorites = function()
{
	try
	{
		this.favorites =  JSON.parse(window.localStorage.getItem(this.key));
	}
	catch(e)
	{
		console.log("Greška u preuzimanju favorita: " + e);
		this.error = e;
	}

	return this.favorites;
	
}

Favorites.prototype.setFavorite = function()
{
	try
	{
		window.localStorage.setItem(this.key, JSON.stringify(this.favorites));
	}
	catch(e)
	{
		console.log("Greška u dodavanju favorita: " + e);
		this.error = e;
	}
	
}

Favorites.prototype.checkFavorite = function(data)
{

	this.getFavorites();

	if(typeof(window.localStorage) != 'undefined' && this.favorites != null)
	{
		for(favorite in this.favorites)
		{
			if(this.favorites[favorite].line == data.line && this.favorites[favorite].direction == data.direction && this.favorites[favorite].station == data.station)
			{
				return true;
			}
		}
	}
	return false;
}

Favorites.prototype.addFavorite = function(data)
{

	this.getFavorites();

	if(typeof(window.localStorage) != 'undefined' && this.favorites != null)
	{
		
		var len = Object.keys(this.favorites).length;
		this.favorites[len+1] = {"line" : data.line, "direction" : data.direction, "station" : data.station};
		this.setFavorite();		
		this.checkError();
	}
	else
	{
		this.favorites = {1:{"line" : data.line, "direction" : data.direction, "station" : data.station}};
		this.setFavorite();
		this.checkError();
	}
}

Favorites.prototype.moveFavorite = function(id, move)
{	
	id = parseInt(id);
	var selectID = null;

	this.getFavorites();

	if(typeof(window.localStorage) != 'undefined' && this.favorites != null)
	{

		if(move == 'up')
		{
			if(Object.keys(this.favorites).length == 1  || id == 1)
			{
		 	 	showFavorites();
			}
			else
			{
				var newFavorites = jQuery.extend({}, this.favorites);
				newFavorites[id-1] = this.favorites[id];
				newFavorites[id] = this.favorites[id-1];
				this.favorites = newFavorites;
				this.setFavorite();
				showFavorites();
				selectID = id - 1;
			}
		}
		else
		{
			if(Object.keys(this.favorites).length == 1 || Object.keys(this.favorites).length == id)
			{
		 	 	showFavorites();
			}
			else
			{
				var newFavorites = jQuery.extend({}, this.favorites);
				newFavorites[id+1] = this.favorites[id];
				newFavorites[id] = this.favorites[id+1];
				this.favorites = newFavorites;
				this.setFavorite();
				showFavorites();
				selectID = id + 1;			
			}
		}

		$('#' + selectID).addClass('selected');

	}
	
}

Favorites.prototype.removeFavorite = function(id)
{	
	var i = 1;
	var newFavorites = new Object();

	this.getFavorites();
	

	if(typeof(window.localStorage) != 'undefined' && this.favorites != null)
	{
		if(Object.keys(this.favorites).length == 1)
		{
			window.localStorage.clear();
		}
		else
		{
			for(favorite in this.favorites)
			{
				if(favorite != id)
				{
					newFavorites[i] = this.favorites[favorite];
					i++;
				}
			}
			this.favorites = newFavorites;
			this.setFavorite();
		}
		

	}
	
}

Favorites.prototype.clearFavorites = function()
{	
	if (confirm("Da li ste sigurni?"))
	{
	  window.localStorage.clear();
	  window.location.assign("favorites.html");
	}		
}

Favorites.prototype.checkError = function()
{
	if (!this.error)
	{
		alert("Dodavanje uspješno.");
	}
	$('.save').prop('disabled', true);
}


/******************
TIMER
******************/

var Timer = function(){

	this.line = null;
	this.direction = null;
	this.station = null;

	this.element = null;

	this.output = null;
	this.noLine = null;
	this.timeout = null;
	
	this.lineSchedule = null;
}


Timer.prototype.getTime = function()
{

	var timer = new Object();
	var countdown = new Object();

	var date = new Date();
	timer.d = date.getDay();	
	timer.h = date.getHours();
	timer.m = date.getMinutes() + 1;
	timer.s = date.getSeconds();

	if (timer.m - lines[this.line][this.direction][this.station] < 0)
	{
		timer.m = (timer.m - lines[this.line][this.direction][this.station]) + 60;
		timer.h = timer.h - 1;
	}
	else
	{
		timer.m = timer.m - lines[this.line][this.direction][this.station];
	}

	try
	{
		this.getLineSchedule(timer.d);
	}
	catch(error)
	{
		this.lineSchedule = null;
	}

	if(this.lineSchedule != null)
	{
		
		try
		{
			next = this.getNext(timer.h, timer.m)
		}
		catch(error)
		{
			next = null;
		}
		
		if(next != null)
		{
			countdown.h = next[0];
			countdown.m = next[1];
			countdown.s = 59;

			if (countdown.s - timer.s < 0){
				countdown.s  = countdown.s  + 60;
				countdown.m = countdown.m - 1;
			}
			countdown.s = this.addZero(countdown.s  - timer.s);

			if (countdown.m - timer.m < 0){
				countdown.m = countdown.m + 60;
				countdown.h = countdown.h - 1;
			}
			countdown.m = this.addZero(countdown.m - timer.m);
			countdown.h = countdown.h - timer.h;

			if(countdown.h < 1)
			{
				this.output = "<h2>" + countdown.m + "<small>:" + countdown.s + "</small></h2>";
			}
			else
			{
				this.output = "<h2>" + countdown.h + "<small>:" + countdown.m + ":" + countdown.s + "</small></h2>";
			}
		}
		else
		{
			this.output = "<h2>--:--</h2>";
		}
		
	}
	else
	{
		this.output = "<h2>--:--</h2>";
	}
}

Timer.prototype.getLineSchedule = function(day)
{
	if(day == 0){
		this.lineSchedule = schedule[this.line][this.direction]["Nedjelja"];
	}
	else if(day == 6){
		this.lineSchedule = schedule[this.line][this.direction]["Subota"];
	}
	else{
		this.lineSchedule = schedule[this.line][this.direction]["Radni dan"];
	}
}

Timer.prototype.getNext = function(hour, minute)
{
	for (h in this.lineSchedule){
		for(m in this.lineSchedule[h]){
			if(h == hour && this.lineSchedule[h][m] >= minute){
				var time = new Array(h,this.lineSchedule[h][m]);
				break;
			}
			if(h > hour){
				var time = new Array(h,this.lineSchedule[h][m]);
				break;
			}
		}
		if(time != null) break;
	}
	return time;
}

Timer.prototype.addZero = function(i)
{
	if (i<10){
		i="0" + i;
	}		
	return i;
}

Timer.prototype.startCountdown = function(element, data)
{
	var _this = this;
	this.element = element;
	this.line = data.line;
	this.direction = data.direction;
	this.station = data.station;

	this.getTime();
	clearTimeout(this.timeout);
	$(element).html(this.output);
	this.timeout = setTimeout(function(){
		_this.startCountdown(element, data);
	}, 1000);
}

Timer.prototype.stopCountdown = function()
{
	this.lineSchedule = null;
	clearTimeout(this.timeout);
	$(this.element).text("");
}

Timer.prototype.showSchedule = function(data)
{
	var _this = this;
	output = [];
	this.line = data.line;
	this.direction = data.direction;


	$('.schedule tbody').text("");

	var showTime = this.lineSchedule;
	var max = 0;

	for(hour in showTime)
	{
		if(max < Object.keys(showTime[hour]).length)
		{
			max = Object.keys(showTime[hour]).length;
		}
	}

	for(hour in showTime)
	{
		var count = 0;
		$('.schedule tbody').append('<tr></tr>');
		$('.schedule tbody tr:last-child').append('<td><strong>' + hour + '</strong></td>');
		for(minute in showTime[hour])
		{
			$('.schedule tbody tr:last-child').append('<td>' + showTime[hour][minute] + '</td>');
			count++;
		}
		if (count < max)
		{
			while(count < max)
			{
				$('.schedule tbody tr:last-child').append('<td></td>');
				count++;
			}
		}
		
		
	}

}

getJSON = function(file)
{
	var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'beforeSend': function(xhr){
		    if (xhr.overrideMimeType)
		    {
		      xhr.overrideMimeType("application/json");
		    }
		},
        'url': 'json/' + file + '.json',
        'dataType': "json",
        'success': function(data) {
            json = data;
        }
    });
	return json;
}

var storage = new Favorites('favorites');
var schedule = getJSON('schedule');
var lines = getJSON('stations');


function indexPage()
{
	
	countdown = [];
	
	mainCountdown = new Timer();

	favorites = storage.getFavorites();

	if(typeof(window.localStorage) != 'undefined' && favorites != null)
	{	

		mainCountdown.startCountdown('.main-countdown', favorites[1]);
		var data = new Object();
		data.line = favorites[1]["line"];
		data.station = favorites[1]["direction"];
		data.direction = favorites[1]["station"];
		$('#timerInfo').html('<li>'+favorites[1]["line"]+'</li><li class="active">'+favorites[1]["direction"]+'</li><li class="active">'+favorites[1]["station"]+'</li>');
		mainCountdown.showSchedule(data);

		showFavorites();
		    
	}
	else
	{
		$('#timerInfo').html('<li class="active">Nema dodanih favorita...</li>');
		//$('.index').hide();
		//$('.schedule').hide();
		//$('#save-bookmark').hide();
	}

	/*******
	add-station div
	*******/


	showLine();

	$('.save, .save-button').on('click', function(){
		saveBookmark();
		showFavorites();
		$('.save-button').css('display', 'none');
	});


	////////////////////////////////

	$(".main").on("click", ".item",function(){

		var id = $(this).attr('id')
		mainCountdown.startCountdown('.main-countdown', favorites[id]);
		$('#timerInfo').html('<li>'+favorites[id]["line"]+'</li><li class="active">'+favorites[id]["direction"]+'</li><li class="active">'+favorites[id]["station"]+'</li>');
		$('.item').each(function(){
			$(this).removeClass('selected');
		});
		$(this).toggleClass('selected');
		$('.save-button').css('display', 'none');

		data.line = favorites[id]["line"];
		data.direction = favorites[id]["direction"]
		mainCountdown.showSchedule(data);

		if (!$(this).hasClass('favorites'))
		{
			$('.main .favorite-buttons').remove();
			$('.item').each(function(){
				$(this).removeClass('favorites');
			});
		}

		if (!$(this).hasClass('schedules'))
		{
			$('.main .schedule').remove();
			$('.item').each(function(){
				$(this).removeClass('schedules');
			});
		}


		
	});
	/*
	$('.schedule thead tr').on('click','#showBody',function(){
		$('.schedule tbody').toggle();
		$('.schedule thead tr th .glyphicon-chevron-up').toggle();
		$('.schedule thead tr th .glyphicon-chevron-down').toggle();
	});
	*/

	var hammertime = $(".main").hammer();

	hammertime.on("hold", ".item", function(ev) {

		if (!$(this).hasClass('favorites'))
		{
			$('.main .schedule').remove();
			$('.main .favorite-buttons').remove();

			$(this).append('<div class="favorite-buttons"><ul><li id="remove"><img src="img/remove.png"></li><li id="up"><img src="img/up.png"></li><li id="down"><img src="img/down.png"></li></ul></div>');

			var id = $(this).attr('id')
			mainCountdown.startCountdown('.main-countdown', favorites[id]);
			$('#timerInfo').html('<li>'+favorites[id]["line"]+'</li><li class="active">'+favorites[id]["direction"]+'</li><li class="active">'+favorites[id]["station"]+'</li>');
			$('.item').each(function(){
				$(this).removeClass('selected');
			});
			$(this).toggleClass('selected');
			$(this).addClass('favorites');
			$('.save-button').css('display', 'none');

			data.line = favorites[id]["line"];
			data.direction = favorites[id]["direction"]
			mainCountdown.showSchedule(data);
		}
		else
		{
			$('.main .favorite-buttons').remove();
			$('.item').each(function(){
				$(this).removeClass('favorites');
			});
		}


	});

	hammertime.on("doubletap", ".item", function(ev) {

		$('.main .favorite-buttons').remove();
		$('.main .schedule').remove();
		$('.item').each(function(){
			$(this).removeClass('favorites');
			$(this).removeClass('selected');
			$(this).removeClass('schedules');
		});

	  	$(this).after('<table class="schedule"><thead><tr><th>h</th><th colspan="9">Min</th></tr></thead><tbody></tbody></table>');

		var id = $(this).attr('id')
		mainCountdown.startCountdown('.main-countdown', favorites[id]);
		$('#timerInfo').html('<li>'+favorites[id]["line"]+'</li><li class="active">'+favorites[id]["direction"]+'</li><li class="active">'+favorites[id]["station"]+'</li>');
		
		$(this).toggleClass('selected');
		$(this).toggleClass('schedules');
		$('.save-button').css('display', 'none');

		data.line = favorites[id]["line"];
		data.direction = favorites[id]["direction"]
		mainCountdown.showSchedule(data);

		
	});

	hammertime.on("doubletap", ".schedule", function(ev) {
		$('.main .schedule').remove();
	});

	$('.main').on('click', '#up', function(){
		stopAll();
		storage.moveFavorite($('.selected').attr('id'), 'up');
	});
	$('.main').on('click', '#down', function(){
		stopAll();
		storage.moveFavorite($('.selected').attr('id'), 'down');
	});

	$('.main').on('click', '#remove', function(){
		stopAll();
		storage.removeFavorite($('.selected').attr('id'));
		showFavorites();
	});

	$('.header').on('click','.menu-area',function(){
		$('.nav').toggle();
	});

	$('body').on('click', '.add-button', function(){
		$('.main .favorite-buttons').remove();
		$('.item').each(function(){
			$(this).removeClass('favorites');
		});
		$('.add-station').toggle();
	});
	$('.add-station').on('click', '.cancel', function(){
		$('.add-station').toggle();
	});

	$('body').on('click', '.lines', function(){
		$('.lines-img').toggle();
	});

	$('body').on('click', '.nav-img', function(){
		$('.lines-img').toggle();
	});

	$('body').on('click', '.lines-img', function(){
		$('.lines-img').toggle();
	});
	
}


function stationPage()
{
	
	displayCountdown = new Timer();

	for(line in lines)
	{
		$("#line").append('<option value="' + line + '">' + line + '</option>');
	}

	$("#line").on('change',function(){
		showDirections($('#line').val());
		$('.save').prop('disabled', true);
	});

	$('.save').on('click', function(){
		saveBookmark();
	});
}

function schedulePage()
{
	for(line in lines)
	{
		$("#line").append('<option value="' + line + '">' + line + '</option>');
	}

	$("#line, #day").on('change',function(){

		showDaySchedule($('#line').val(),$('#day').val());

	});
}

function favoritesPage()
{
	
	var favorites = storage.getFavorites();

	if(typeof(window.localStorage) != 'undefined' && favorites != null)
	{		
		$('.check').hide();
		showFavorites();   
	}
	else
	{
		$('.favorites').hide();
		$('.tools').hide();
	}

	$(".favorites tbody").on("click", "tr",function(){
		$('.favorites tbody tr').each(function(){
			$(this).removeClass('danger');
		});
		$(this).toggleClass('danger');
	});

	

	$('#clear').on('click', function(){
		storage.clearFavorites();	
	});

}

function showLine()
{
	for(line in lines)
	{
		$(".select-line").append('<option value="' + line + '">' + line + '</option>');
	}

	$(".aside .select-line").on('change',function(){
		$(".overlay .select-line").val($(this).val());
		showDirections($(this).val());
		$('.save').prop('disabled', true);
		$('.save-button').css('display', 'none');
		
	});

	$(".overlay .select-line").on('change',function(){
		$(".aside .select-line").val($(this).val());
		showDirections($(this).val());
		$('.save').prop('disabled', true);
		$('.save-button').css('display', 'none');

	});

}

function showDirections(line)
{

	var directions = lines[line];

	$(".select-direction").html("<option>Smjer</option>");
	$(".select-station").html("<option>Stanica</option>");

	for(direction in directions)
	{	
		$(".select-direction").append('<option value="' + direction + '">' + direction + '</option>');
	}

	$(".aside .select-direction").on('change',function(){
		$(".overlay .select-direction").val($(this).val());
		showStations(line, $(this).val());
		$('.save').prop('disabled', true);
		$('.save-button').css('display', 'none');

	});

	$(".overlay .select-direction").on('change',function(){
		$(".aside .select-direction").val($(this).val());
		showStations(line, $(this).val());
		$('.save').prop('disabled', true);
		$('.save-button').css('display', 'none');
		
	});

	
}


function showStations(line, direction)
{
	var stations = lines[line][direction];

	
	$(".aside .select-station").html("<option>Stanica</option>");
	$(".overlay .select-station").html("<option>Stanica</option>");

	for(station in stations)
	{	
		$(".select-station").append('<option value="' + station + '">' + station + '</option>');
	}

	$(".aside .select-station").on('change',function(){

		$(".overlay .select-station").val($(this).val());

		var data = getData();

		$('#timerInfo').html('<li>'+data.line+'</li><li class="active">'+data.direction+'</li><li class="active">'+data.station+'</li>');


		mainCountdown.startCountdown('.main-countdown', data);
		mainCountdown.showSchedule(data);


		if(!storage.checkFavorite(data))
		{
			$('.save').prop('disabled', false);
			$('.save-button').css('display', 'block');
		}
		else
		{
			$('.save').prop('disabled', true);
			$('.save-button').css('display', 'none');
		}	
	});

	$(".overlay .select-station").on('change',function(){

		$(".aside .select-station").val($(this).val());

		$(".overlay .add-station").toggle();

		var data = getData();

		$('#timerInfo').html('<li>'+data.line+'</li><li class="active">'+data.direction+'</li><li class="active">'+data.station+'</li>');

		mainCountdown.startCountdown('.main-countdown', data);
		mainCountdown.showSchedule(data);

		if(!storage.checkFavorite(data))
		{
			$('.save').prop('disabled', false);
			$('.save-button').css('display', 'block');
		}
		else
		{
			$('.save').prop('disabled', true);
			$('.save-button').css('display', 'none');
		}	
	});

}





function saveBookmark(){
	var data = getData();
	storage.addFavorite(data);
}

function getData(){
	
	var data = {};
	data.line = $("#line").val();
	data.direction = $("#direction").val();
	data.station = $("#station").val();
	return data;

}

function showDaySchedule(line, day){

	i = 1;

	
	for (direction in schedule[line])
	{	
		if(schedule[line][direction][day] == null)
		{
			$('.error').text("");
			$('.select-direction1-table tbody, .select-direction2-table tbody').text("");
			$(".error").html('<div class="alert alert-danger">Nema linija na ovaj dan.</div>');
		}
		else
		{
			var showTime = schedule[line][direction][day];
			$('.error').text("");
			$('.select-direction'+ i +'-table tbody').text("");
			$('.select-direction'+ i).text(direction);
			for(hour in showTime)
			{
				$('.select-direction'+ i +'-table tbody').append('<tr></tr>');
				$('.select-direction'+ i +'-table tbody tr:last-child').append('<td><strong>' + hour + '</strong></td>');
				for(minute in showTime[hour])
				{
					$('.select-direction'+ i +'-table tbody tr:last-child').append('<td>' + showTime[hour][minute] + '</td>');
				}
			}

			i++;
		}
	}
	
}
/*
function showFavorites(){

	var i = 1;
	var countdown = [];
	displayCountdown = new Timer();

	var favorites = storage.getFavorites();

	$(".favorites tbody").text("");

	for (favorite in favorites)
	{		
		countdown[i] = new Timer();
		var lineNum = favorites[favorite].line;
		lineNum = lineNum.replace("Linija ", "");
		$(".favorites").append("<tr id='"+i+"'><td>" + lineNum + "</td><td>" +favorites[favorite].direction + "</td><td>  " + favorites[favorite].station + "  </td></tr>");
		i++;
	}
}*/

function stopAll(){
	for(i in countdown)
	{
		countdown[i].stopCountdown();
	}
}

function showFavorites(){

	favorites = storage.getFavorites();

	$(".main").text('');

	for (favorite in favorites)
	{	
		countdown[favorite] = new Timer();
		clearTimeout(countdown[favorite].timeout);	
		var lineNum = favorites[favorite].line;
		lineNum = lineNum.replace("Linija ", "");
		$(".main").append('<div class="item" id=' + favorite + '><div class="line"><h3>' + lineNum + '</h3></div><div class="direction-station"><p>' + favorites[favorite].direction + '<span class="separator"></span><br class="newline">' + favorites[favorite].station + '</p></div><div class="countdown countdown'+ favorite +'"><h3></h3><span class="next"></span></div></div>');
		countdown[favorite].startCountdown('.countdown' + favorite + ' h3', favorites[favorite]);
	} 

}

