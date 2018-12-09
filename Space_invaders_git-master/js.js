window.onload = function(){	
	startGame();
	setCookies();
	document.getElementById("save").onclick = function(){
			guardarCookies();
	}
	document.getElementById("reset").onclick = function(){
		reseteo();
		startGame();
		document.getElementById("over").style.display = "none";
		document.getElementById("reset").style.display = "none";
	}
}
//Variables
var nave;
var probabilidad;
var teclas = [];
var balas = [];
var balasEnemigo = [];
var enemigos = [];
var powerVidas = [];
var contBalas = 0;
var contRondas = 1;
var score = 0;
var cadenciaTiro = 0.02;
var vidas = 3;
//Comienzo del juego
function startGame(){
	gameArea.start();
	nave = new ship (35, 35, 390, 462, "img/nave.png");
	crearEnemigo();
}
//Creación del canvas
var gameArea = {
	canvas : document.createElement("canvas"),
	start : function(){
		this.canvas.width = 800;
		this.canvas.height = 500;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(actualizarScreen, 10);
		window.addEventListener('keydown', function(e){
			teclas[e.keyCode] = true;
		})
		window.addEventListener('keyup', function(e){
			teclas[e.keyCode] = false;
		})
	},
	clear : function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
//Constructores
function ship(width, height, x, y, ruta) {
	ctx = gameArea.context;
	this.image = new Image();
	this.image.src = ruta;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function(){
    	if (this.x <= 0) {
    		this.x = 0;
    	}
    	if(this.x >= 800 - this.width){
    		this.x = 800 - this.width;
    	}
    	ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
function enemigo(width, height, x, y, ruta){
	ctx = gameArea.context;
	this.image = new Image();
	this.image.src = ruta;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.derecha = this.x + 260;
	this.izquierda = this.x - 90;
	this.speedX = 1;
	this.limits = function(){
		if (this.x <= 0) {
			this.x = 0;
		}
		if (this.x >= 800 - this.width) {
			this.x = 800 - this.width;
		}
	}
	this.show = function(){
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
	this.move = function(){
		this.x += this.speedX;
		if (this.x <= this.izquierda) {
			this.speedX = 1;
		}else if (this.x >= this.derecha) {
			this.speedX = -1;
		}
		probabilidad = Math.floor(Math.random()*700);
		if (probabilidad/100 < cadenciaTiro) {
			var tiroEnemigo = new disparoEnemigo(this.x + 15, this.y + 15,"red", 3, 5);
			balasEnemigo.push(tiroEnemigo);
		}
	}
	this.clear = function(){
		ctx.clearRect(this.x,this.y,this.w,this.h);
	}
}
function disparoEnemigo(x, y, color, width, height){
	ctx = gameArea.context;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.show = function(){
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	this.move = function(){
		this.y += 2;
		this.show();
	}
	this.hitMe = function(bala, nave){
		if ((bala.x < nave.x + nave.width) && (bala.x + bala.width > nave.x) && (bala.y < nave.y + nave.height) && (bala.height + bala.y > nave.y)) {
			return true;
		}
	}
}
function bala(x, y, color, width, height,contBalas){
	ctx = gameArea.context;
	this.contBalas = contBalas;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.show = function(){
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	this.move = function(){
		this.clear();
		this.y -= 4.5;
		this.show();
	}
	this.clear = function(){
		ctx.clearRect(this.x, this.y, this.width, this.height);
	}
	this.hitEnemigo = function(bala, enemigo){
		if((bala.x < enemigo.x + enemigo.width) && (bala.x + bala.width > enemigo.x) && (bala.y < enemigo.y + enemigo.height) && (bala.height + bala.y > enemigo.y)){
			return true;
		}
	}
}
function powerlife(width, height, x, y, ruta){
	ctx = gameArea.context;
	this.image = new Image();
	this.image.src = ruta;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.show = function(){
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
	this.move = function(){
		this.y += 1.5;
		this.show();
	}
	this.cogerPower = function(powerlife, nave){
		if((powerlife.x < nave.x + nave.width) && (powerlife.x + powerlife.width > nave.x) && (powerlife.y < nave.y + nave.height) && (powerlife.height + powerlife.y > nave.y)){
			return true;
		}
	}
}
//Funciones
function cogerVida(){
	for (var i = 0; i < powerVidas.length; i++) {
		if (powerVidas[i].cogerPower(powerVidas[i], nave)) {
			powerVidas.splice(i, 1);
			if (vidas < 5) {//Como máximo se podrán acumular 5 vidas
				vidas++;
			}
		}
		if (powerVidas[i].y > 500) {
			powerVidas.splice(i, 1);
		}
	}
}
function caidaVidas(){
	var rand = Math.random()*800;
	var cadenciaCaida = 0.1;
	var posibilidad = Math.floor(Math.random()*11000);
	if (posibilidad/100 < cadenciaCaida) {
		var vidaLiberada = new powerlife(20, 20, rand, 0, "img/life.png");
		powerVidas.push(vidaLiberada);
	}
}
function crearEnemigo(){
	for (var i = 0; i < 8; i++) {
			var creacion = new enemigo(30, 30, 90 + i*60, 100, "img/enemigo.png");
			enemigos.push(creacion);
		for (var j = 0; j < 1; j++) {
			var creacion = new enemigo(30, 30, 90 + i*60, 50, "img/enemigo.png");
			enemigos.push(creacion);
			if (contRondas >= 5) {
				var creacion = new enemigo(30, 30, 90 + i*60, 150, "img/enemigo.png");
				enemigos.push(creacion);
			}
			if (contRondas >= 10) {
				var creacion = new enemigo(30, 30, 90 + i*60, 200, "img/enemigo.png");
				enemigos.push(creacion);
			}
		}
	}
}
function yoMuerto(){
	for (var i = 0; i < balasEnemigo.length; i++) {
		if(balasEnemigo[i].hitMe(balasEnemigo[i], nave)){
			balasEnemigo.splice(i, 1);
			vidas--;
		}
		if (balasEnemigo[i].y > 500) {
			balasEnemigo.splice(i, 1);
		}
		if (vidas == 0) {
			document.getElementById("over").style.display = "block";
			document.getElementById("reset").style.display = "block";
            ctx.fillStyle = "#c6ff1a";
            ctx.font = "bold 20px Arial";
            ctx.fillText("BEST SCORE: " + score, 325, 430);
            ctx.fillText("SCORE: " + score, 350, 475);
			clearInterval(gameArea.interval);
            
		}
	}
}
function enemigoMuerto(){
	for (var i = 0; i < balas.length; i++) {
		var colision = false;
		for (var j = 0; j < enemigos.length; j++) {
			if (balas[i].hitEnemigo(balas[i], enemigos[j])) {
				enemigos.splice(j, 1);
				colision = true;
				score += 10;
			}
		}
		if (colision || balas[i].y < 0) {
			balas.splice(i, 1);
		}
	}
}
function gestionRondas(){
	if(enemigos == 0){
		contRondas++;
		cadenciaTiro += 0.0075;
		crearEnemigo();
	}
}
function rondasScoreVidas(){
	ctx.fillStyle = "#00ffcc";
	ctx.font = "16px Arial";
	ctx.fillText("RONDA: " + contRondas, 705, 20);
	ctx.fillText("SCORE: " + score, 20, 20);
	ctx.fillStyle = "#ff0066";
	ctx.font = "bold 18px Arial";
	if(vidas < 5){
		ctx.fillText("LIFES: " + vidas, 360, 22);
	}
	if (vidas == 5) {
		ctx.fillText("MAX-LIFES: " + vidas, 350, 22);
	}
}
function reseteo(){
	gameArea.clear();
	enemigos = [];
	balas = [];
	balasEnemigo = [];
	contRondas = 1;
	score = 0;
	cadenciaTiro = 0.02;
	vidas = 3;
	powerVidas = [];
}
//Cookies
function setCookies(){
	var array = document.cookie.split('; ');
	var cookieName;
	var cookieValue;
	var temp;
	for(var i = 0; i < array.length; i++){
		temp = array[i].split('=');
		cookieName = temp[0];
		cookieValue = temp[1];
		for(var i = 0; i < array.length; i++){
			if(cookieName == "rank"){
			document.getElementById("bestScore").innerHTML+="<span>"+"BEST SCORE: "+cookieValue+"</span>";
			}
		}
	}
}
function guardarCookies(){
	document.cookie = "rank= " + score;
	alert("BEST SCORE guardada como: "+ score);
}
//Refresca constantemente el juego para que haya movimiento
function actualizarScreen(){
	gameArea.clear();
	nave.update();
	if (teclas[39]) {
		nave.x += 3;
	}if (teclas[37]){
		nave.x -= 3;
	}if (teclas[32]){
		contBalas++;
		if (balas.length == 0 || balas[balas.length - 1].contBalas + 28 <= contBalas) {
			var balaNueva= new bala (nave.x + 16.5, nave.y, "yellow", 3, 5, contBalas);	
			balas.push(balaNueva);
		}
	}else{
		contBalas++;
	}
	for(var i = 0; i < balas.length; i++){
		balas[i].move();
	}
	for (var i = 0; i < powerVidas.length; i++) {
		powerVidas[i].move();
	}
	for(var i = 0; i < balasEnemigo.length; i++){
		balasEnemigo[i].move();
	}
	for(var i = 0; i < enemigos.length; i++){
		enemigos[i].move();
		enemigos[i].show();
	}
	enemigoMuerto();
	yoMuerto();
	gestionRondas();
	rondasScoreVidas();
	caidaVidas();
	cogerVida();
}