var storage = new Model();
var schedule = storage.getJSON('schedule');
var lines = storage.getJSON('stations');

function indexPage()
{
	
	var i = 1;
	n = 3;
	z = 0;
	var countdown = [];
	stationCountdown = new Timer();

	try
	{
		var favorites = storage.getStorage('favorites');
	}
	catch(error)
	{
		var favorites = null;
	}


	if(typeof(window.localStorage) != 'undefined' && favorites != null)
	{		
		stationCountdown.startCountdowns('.clocks', favorites[1]);
		$('#mainTimer').html('<li><a href="#">'+favorites[1]["line"]+'</a></li><li class="active">'+favorites[1]["direction"]+'</li><li class="active">'+favorites[1]["station"]+'</li>');
		$('.schedule tbody').hide();
		$('.schedule thead tr th .glyphicon-chevron-up').hide();
		for (favorite in favorites)
		{		
			countdown[i] = new Timer();
			var lineNum = favorites[favorite].line;
			lineNum = lineNum.replace("Linija ", "");
			$(".index").append("<tr id='"+i+"'><td>" + lineNum + "</td><td>  " + favorites[favorite].direction + "  </td><td>  " + favorites[favorite].station + "  </td><td><span class='badge countdown"+ i +"'></span></td></tr>");
			countdown[i].startCountdown('.countdown' + i, favorites[favorite]);
			i++;
		}     
	}

	$(".clocks").on('click', ".countdown:first-child" ,function(){
		n++;
		z++;
	});
	$(".clocks").on('click', ".countdown:last-child" ,function(){
		if(n!=3 && z != 0)
		{
			n--;
			z--;
		}
	});

	$(".index tbody").on("click", "tr",function(){
		var id = $(this).attr('id')
		stationCountdown.startCountdowns('.clocks', favorites[id]);
		$('#mainTimer').html('<li><a href="#">'+favorites[id]["line"]+'</a></li><li class="active">'+favorites[id]["direction"]+'</li><li class="active">'+favorites[id]["station"]+'</li>');
		$('.index tbody tr').each(function(){
			$(this).removeClass('success');
		});
		$(this).toggleClass('success');

		var data = new Object();
		data.line = favorites[id]["line"];
		data.station = $("#station").val();
		data.direction = favorites[id]["station"]
		stationCountdown.showSchedule(data);
	});

	$('.schedule thead tr').on('click','#showBody',function(){
		$('.schedule tbody').toggle();
		$('.schedule thead tr th .glyphicon-chevron-up').toggle();
		$('.schedule thead tr th .glyphicon-chevron-down').toggle();
	});

	
}

/*
Station function
controls station.html page
*/
function stationPage()
{
	
	stationCountdown = new Timer();

	for(line in lines)
	{
		$("#line").append('<option value="' + line + '">' + line + '</option>');
	}

	$("#line").on('change',function(){
		showDirections($('#line').val());
		$('#save-bookmark').addClass('disabled');
	});

	$(".clocks").on('click', ".countdown:first-child" ,function(){
		n++;
		z++;
	});
	$(".clocks").on('click', ".countdown:last-child" ,function(){
		if(n!=3 && z != 0)
		{
			n--;
			z--;
		}
	});

	$('#save-bookmark').on('click', function(){
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
	try
	{
		var favorites = storage.getStorage('favorites');
	}
	catch(error)
	{
		var favorites = null;
	}

	if(typeof(window.localStorage) != 'undefined' && favorites != null)
	{		
		//$('#mainTimer').html('<li><a href="#">'+favorites[1]["line"]+'</a></li><li class="active">'+favorites[1]["direction"]+'</li><li class="active">'+favorites[1]["station"]+'</li>');
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

	$('#up').on('click', function(){
		storage.moveUpFavorite($('.favorites .danger').attr('id'));
	});
	$('#down').on('click', function(){
		storage.moveDownFavorite($('.favorites .danger').attr('id'));
	});

	$('#remove').on('click', function(){
		//alert($('.favorites .danger').attr('id'));
		storage.removeFavorite($('.favorites .danger').attr('id'));
	});

	$('#clear').on('click', function(){
		storage.clearFavorites();	
	});

}

function showDirections(line)
{

	var directions = lines[line];

	$("#direction").html("<option>Smjer</option>");
	$("#station").html("<option>Stanica</option>");

	for(direction in directions)
	{	
		$("#direction").append('<option value="' + direction + '">' + direction + '</option>');
	}

	$("#direction").on('change',function(){
			showStations(line,$("#direction").val());
			$('#save-bookmark').addClass('disabled');
	});

}


function showStations(line, direction)
{
	var stations = lines[line][direction];

	
	$("#station").html("<option>Stanica</option>");

	for(station in stations)
	{	
		$("#station").append('<option value="' + station + '">' + station + '</option>');
	}

	$("#station").on('change',function(){
			showStationCountdown();
	});

}

function showStationCountdown(){
	
	var data = getData();
	n = 3;
	z = 0;

	stationCountdown.startCountdowns('.clocks', data);
	stationCountdown.showSchedule(data);
	
	if(!storage.checkFavorite(data))
	{
		$('#save-bookmark').removeClass('disabled');
	}
	else
	{
		$('#save-bookmark').addClass('disabled');
	}	
}



function saveBookmark(){
	var data = getData();
	storage.addFavorite(data);
}

function getData(){
	
	var data = new Object();
	data.line = $("#line").val();
	data.station = $("#station").val();
	data.direction = $("#direction").val();
	return data;
	/*
	var data = new Object();
	data.line = $("#btn-line").text();
	data.station = $("#btn-station").text();
	data.direction = $("#btn-direction").text();
	return data;*/

}

function showDaySchedule(line, day){
	i = 1;

	
	for (direction in schedule[line])
	{	
		if(schedule[line][direction][day] == null)
		{
			$('.error').text("");
			$('#direction1-table tbody, #direction2-table tbody').text("");
			$(".error").html('<div class="alert alert-danger">Nema linija na ovaj dan.</div>');
		}
		else
		{
			var showTime = schedule[line][direction][day];
			$('.error').text("");
			$('#direction'+ i +'-table tbody').text("");
			$('#direction'+ i).text(direction);
			for(hour in showTime)
			{
				$('#direction'+ i +'-table tbody').append('<tr></tr>');
				$('#direction'+ i +'-table tbody tr:last-child').append('<td><strong>' + hour + '</strong></td>');
				for(minute in showTime[hour])
				{
					$('#direction'+ i +'-table tbody tr:last-child').append('<td>' + showTime[hour][minute] + '</td>');
				}
			}

			i++;
		}
	}
	
}

function showFavorites(){

	var i = 1;
	var countdown = [];
	stationCountdown = new Timer();

	var favorites = storage.getStorage('favorites');

	$(".favorites tbody").text("");

	for (favorite in favorites)
	{		
		countdown[i] = new Timer();
		var lineNum = favorites[favorite].line;
		lineNum = lineNum.replace("Linija ", "");
		$(".favorites").append("<tr id='"+i+"'><td>" + lineNum + "</td><td>" +favorites[favorite].direction + "</td><td>  " + favorites[favorite].station + "  </td></tr>");
		i++;
	}
}

/*
showTimer
*/
function Timer(){

	var line = null;
	var direction = null;
	var station = null;

	var element = null;

	var output = null;
	outputs = new Array();
	noLine = null;
	var timeout = null;
	var timeouts = null;
	var lineSchedule = null;

	this.getTime = function()
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
				countdown.s = this.checkTime(countdown.s  - timer.s);

				if (countdown.m - timer.m < 0){
					countdown.m = countdown.m + 60;
					countdown.h = countdown.h - 1;
					console.log(countdown.m);
					console.log(timer.m);
				}
				countdown.m = this.checkTime(countdown.m - timer.m);
				countdown.h = countdown.h - timer.h;

				if(countdown.h < 1)
				{
					this.output = countdown.m + ":" + countdown.s;
				}
				else
				{
					this.output = countdown.h + ":" + countdown.m + ":" + countdown.s;
				}
			}
			else
			{
				this.output = "--:--";
			}
			
		}
		else
		{
			this.output = "--:--";
		}
	}

	this.getTimes = function()
	{
		noLine = null;
		var i = 0;
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
				allNext = this.getAllNext(timer.h, timer.m)
			}
			catch(error)
			{
				allNext = null;
			}
			
			if(allNext != null && allNext.length != 0)
			{
				
				for(next in allNext)
				{

				
					countdown.h = allNext[next][0];
					countdown.m = allNext[next][1];
					countdown.s = 59;

					if (countdown.s - timer.s < 0){
						countdown.s  = countdown.s  + 60;
						countdown.m = countdown.m - 1;
					}
					countdown.s = this.checkTime(countdown.s  - timer.s);

					if (countdown.m - timer.m < 0){
						countdown.m = countdown.m + 60;
						countdown.h = countdown.h - 1;
					}
					countdown.m = this.checkTime(countdown.m - timer.m);
					countdown.h = countdown.h - timer.h;

					if(countdown.h < 1)
					{
						outputs[i] = "<span class='minutes'>" + countdown.m + "</span><span class='seconds'>:" + countdown.s + "</span>";
					}
					else
					{
						outputs[i] = "<span class='hours'>" + countdown.h + ":</span><span class='minutes'>" + countdown.m + "</span><span class='seconds'>:" + countdown.s + "</span>";
					}
					i++;
				}	

			}
			else
			{
				noLine = 'Nema više linija danas!';
			}
		}
		else
		{
			noLine = "Nema linija danas!";
		}
	}

	this.getLineSchedule = function(day)
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

	this.getNext = function(hour, minute)
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

	this.getAllNext = function(hour, minute)
	{
		var i = 0;
		var time = [];
		for (h in this.lineSchedule){
			for(m in this.lineSchedule[h]){
				if(h == hour && this.lineSchedule[h][m] >= minute){
					time[i] = new Array(h,this.lineSchedule[h][m]);
				}
				if(h > hour){
					time[i] = new Array(h,this.lineSchedule[h][m]);
				}
				i++;
			}
		}
		return time;
	}

	this.checkTime = function(i)
	{
		if (i<10){
			i="0" + i;
		}		
		return i;
	}

	this.startCountdown = function(element, data)
	{
		var _this = this;
		this.element = element;
		this.line = data.line;
		this.direction = data.direction;
		this.station = data.station;

		this.getTime();
		clearTimeout(this.timeout);
		$(element).text(this.output);
		this.timeout = setTimeout(function(){
			_this.startCountdown(element, data);
		}, 1000);
	}

	this.startCountdowns = function(element, data)
	{
		var _this = this;
		output = [];
		this.element = element;
		this.line = data.line;
		this.direction = data.direction;
		this.station = data.station;

		this.getTimes();

		clearTimeout(this.timeouts);
		$(element).text("");

		if(noLine != null)
		{
			$(element).append('<div class="alert alert-danger">' + noLine + '</div>');
		}
		else
		{
			for(item in outputs)
			{
				$(element).append('<span class="countdown">' + outputs[item] + '</span>');
				
				$('.countdown:nth-child(-n+'+z+')').addClass('remove');
				$('.countdown:nth-child(n+'+n+')').addClass('remove');
				
			}
		}

		

		$('.remove').remove();
		this.timeouts = setTimeout(function(){
			_this.startCountdowns(element, data);
		}, 1000);
	}

	this.stopCountdown = function()
	{
		this.lineSchedule = null;
		clearTimeout(this.timeout);
		$(this.element).text("");
	}

	this.showSchedule = function(data)
	{
		var _this = this;
		output = [];
		this.element = element;
		this.line = data.line;
		this.direction = data.direction;
		this.station = data.station;


		$('.schedule tbody').text("");

		var showTime = this.lineSchedule;

		for(hour in showTime)
		{
			$('.schedule tbody').append('<tr></tr>');
			$('.schedule tbody tr:last-child').append('<td><strong>' + hour + '</strong></td>');
			for(minute in showTime[hour])
			{
				$('.schedule tbody tr:last-child').append('<td>' + showTime[hour][minute] + '</td>');
			}
			
			
		}

	}

}

/*
Model
Retrieves data from localStorage
*/

function Model(){

	this.getStorage = function(key)
	{
		var data = JSON.parse(window.localStorage.getItem(key));
		return data;
	}

	this.setStorage = function(key, data)
	{
		window.localStorage.setItem(key, JSON.stringify(data));
	}


	this.addFavorite = function(data)
	{
		try
		{
			var favorites = this.getStorage('favorites');
		}
		catch(error)
		{
			var favorites = null;
		}

		if(typeof(window.localStorage) != 'undefined' && favorites != null)
		{
			
			var len = Object.keys(favorites).length;
			favorites[len+1] = {"line" : data.line, "direction" : data.direction, "station" : data.station};
			$('#save-bookmark').addClass('disabled');
			this.setStorage("favorites", favorites);
			alert('Dodano u favorite.');
		}
		else
		{
			var favorites = {1:{"line" : data.line, "direction" : data.direction, "station" : data.station}};
			$('#save-bookmark').addClass('disabled');
			this.setStorage("favorites", favorites);
			alert('Dodano u favorite.');
		}
	}

	this.moveUpFavorite = function(id)
	{	
		id = parseInt(id);
		var selectID = null;

		try
		{
			var favorites = this.getStorage('favorites');
		}
		catch(error)
		{
			var favorites = null;
		}

		if(typeof(window.localStorage) != 'undefined' && favorites != null)
		{
			if(Object.keys(favorites).length == 1  || id == 1)
			{
		 	 	showFavorites();
			}
			else
			{
				var newFavorites = jQuery.extend({}, favorites);
				newFavorites[id-1] = favorites[id];
				newFavorites[id] = favorites[id-1];
				this.setStorage("favorites", newFavorites);
				showFavorites();
				selectID = id - 1;
				$('#'+selectID).addClass('danger');
			}
			

		}
		
	}

	this.moveDownFavorite = function(id)
	{	
		id = parseInt(id);
		var selectID = null;

		try
		{
			var favorites = this.getStorage('favorites');
		}
		catch(error)
		{
			var favorites = null;
		}

		if(typeof(window.localStorage) != 'undefined' && favorites != null)
		{
			if(Object.keys(favorites).length == 1 || Object.keys(favorites).length == id)
			{
		 	 	showFavorites();
			}
			else
			{
				var newFavorites = jQuery.extend({}, favorites);
				newFavorites[id+1] = favorites[id];
				newFavorites[id] = favorites[id+1];
				this.setStorage("favorites", newFavorites);
				showFavorites();
				selectID = id + 1;
				$('#'+selectID).addClass('danger');
			}
			

		}
		
	}

	this.removeFavorite = function(id)
	{	
		var i = 1;
		var newFavorites = new Object();

		try
		{
			var favorites = this.getStorage('favorites');
		}
		catch(error)
		{
			var favorites = null;
		}

		if(typeof(window.localStorage) != 'undefined' && favorites != null)
		{
			if(Object.keys(favorites).length == 1)
			{
				window.localStorage.clear();
		 	 	window.location.assign("favorites.html");
			}
			else
			{
				for(favorite in favorites)
				{
					if(favorite != id)
					{
						newFavorites[i] = favorites[favorite];
						i++;
					}
				}
				this.setStorage("favorites", newFavorites);
				window.location.assign("favorites.html");
			}
			

		}
		
	}

	this.checkFavorite = function(data)
	{
		try
		{
			var favorites = this.getStorage('favorites');
		}
		catch(error)
		{
			var favorites = null;
		}

		if(typeof(window.localStorage) != 'undefined' && favorites != null)
		{
			for(favorite in favorites)
			{
				if(favorites[favorite].line == data.line && favorites[favorite].direction == data.direction && favorites[favorite].station == data.station)
				{
					return true;
					console.log(data.line + favorites[favorite].line);
				}

			}
			return false;
		}
		else
		{
			return false;
		}
	}

	this.clearFavorites = function()
	{	
		if (confirm("Da li ste sigurni?"))
		{
		  window.localStorage.clear();
		  window.location.assign("favorites.html");
		}		
	}

	this.getJSON = function(file)
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
}


/*
Templates
*/

var Templates = new Object();
