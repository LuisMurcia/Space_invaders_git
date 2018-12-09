window.onload = function(){	
	startGame();
    musica.play();//enciende la música de fondo
	setCookies();//Cargamos las cookies
	document.getElementById("save").onclick = function(){//En clickar en el botón la guardamos
			guardarCookies();
	}
	document.getElementById("reset").onclick = function(){
		reseteo();
		startGame();
		document.getElementById("over").style.display = "none";
		document.getElementById("reset").style.display = "none";
        document.getElementById("save").style.display = "none";
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
//Música
var musica = document.createElement("audio"); //musica de fondo
musica.setAttribute("src", "audio/fondo.mp3"); 
musica.loop = true;
musica.volume = 0.4;
//Comienzo del juego
function startGame(){
	gameArea.start();
	nave = new ship (35, 35, 390, 462, "img/nave.png");
	crearEnemigo();
}
//Creación del canvas
var gameArea = {//Creamos el canvas
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
//Constructor de la nave
function ship(width, height, x, y, ruta) {
	ctx = gameArea.context;
	this.image = new Image();
	this.image.src = ruta;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function(){
    	if (this.x <= 0) {//Establezco los límites de la nave para que no se pinte fuera del canvas
    		this.x = 0;
    	}
    	if(this.x >= 800 - this.width){
    		this.x = 800 - this.width;
    	}
    	ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
//Constructor de enemigos
function enemigo(width, height, x, y, ruta){
	ctx = gameArea.context;
	this.image = new Image();
	this.image.src = ruta;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.derecha = this.x + 260;//límites izquierdo y derecho de los enemigos
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
	this.move = function(){//movimiento de los enemigos
		this.x += this.speedX;
		if (this.x <= this.izquierda) {
			this.speedX = 1;
		}else if (this.x >= this.derecha) {
			this.speedX = -1;
		}
		probabilidad = Math.floor(Math.random()*700);//creamos una variable random de probabilidad
		if (probabilidad/100 < cadenciaTiro) {//cuanto mayor sea la cadencia, mayor será la cantidad de disparos enemigos
			var tiroEnemigo = new disparoEnemigo(this.x + 15, this.y + 15,"red", 3, 5);
			balasEnemigo.push(tiroEnemigo);//rellenamos el array de balasEnemigo
		}
	}
	this.clear = function(){
		ctx.clearRect(this.x,this.y,this.w,this.h);
	}
}
//Constructor de los disparos enemigos
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
	this.move = function(){//Caída de las balas enemigos
		this.y += 2;
		this.show();
	}
	this.hitMe = function(bala, nave){//función que comprueba si los disparos enemigos colisionan conmigo
		if ((bala.x < nave.x + nave.width) && (bala.x + bala.width > nave.x) && (bala.y < nave.y + nave.height) && (bala.height + bala.y > nave.y)) {
			return true;
		}
	}
}
//Constructor de las balas de la nave
function bala(x, y, color, width, height,contBalas){
	ctx = gameArea.context;
	this.contBalas = contBalas;//este parámetro nos permitirá ir contando las balas para que no se disparen todas y no salgan como un chorro
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.show = function(){
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	this.move = function(){//subida de las balas de la nave
		this.clear();
		this.y -= 4.5;
		this.show();
	}
	this.clear = function(){
		ctx.clearRect(this.x, this.y, this.width, this.height);
	}
	this.hitEnemigo = function(bala, enemigo){//función que comprueba si mis balas colisionan con algún enemigo
		if((bala.x < enemigo.x + enemigo.width) && (bala.x + bala.width > enemigo.x) && (bala.y < enemigo.y + enemigo.height) && (bala.height + bala.y > enemigo.y)){
			return true;
		}
	}
}
//Constructor de las vidas que caen del cielo
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
	this.move = function(){//caída de las vidas
		this.y += 1.5;
		this.show();
	}
	this.cogerPower = function(powerlife, nave){//funcsión que comprueba cuando la nave tiene contacto con una vida
		if((powerlife.x < nave.x + nave.width) && (powerlife.x + powerlife.width > nave.x) && (powerlife.y < nave.y + nave.height) && (powerlife.height + powerlife.y > nave.y)){
			return true;
		}
	}
}
//Funciones
function cogerVida(){//cuando la nave coja una vida
	for (var i = 0; i < powerVidas.length; i++) {
		if (powerVidas[i].cogerPower(powerVidas[i], nave)) {
			powerVidas.splice(i, 1);//borramos la vida
			if (vidas < 5) {//Como máximo se podrán acumular 5 vidas
				vidas++;//sumamos 1 a la variable de vidas
			}
		}
		if (powerVidas[i].y > 500) {//si superan el límite del canvas desaparecen
			powerVidas.splice(i, 1);
		}
	}
}
function caidaVidas(){//creación aleatoria de vidas
	var rand = Math.random()*790;//x aleatoria
	var cadenciaCaida = 0.1;
	var posibilidad = Math.floor(Math.random()*11000);//probabilidad de caída de una vida, cuanto mayor sea el número que multiplica el "Math.random()" menor será la probabilidad de que se genere una vida
	if (posibilidad/100 < cadenciaCaida) {
		var vidaLiberada = new powerlife(20, 20, rand, 0, "img/life.png");
		powerVidas.push(vidaLiberada);
	}
}
function crearEnemigo(){//creación de enemigos, eh un principio se generan dos filas de 8 enemigos por fila
	for (var i = 0; i < 8; i++) {
			var creacion = new enemigo(30, 30, 90 + i*60, 100, "img/enemigo.png");
			enemigos.push(creacion);
		for (var j = 0; j < 1; j++) {
			var creacion = new enemigo(30, 30, 90 + i*60, 50, "img/enemigo.png");
			enemigos.push(creacion);
			if (contRondas >= 5) {//a partir de la ronda 5 ya se generarán 3 filas de enemigos en lugar de 2
				var creacion = new enemigo(30, 30, 90 + i*60, 150, "img/enemigo.png");
				enemigos.push(creacion);
			}
			if (contRondas >= 10) {//a partir de la ronda 10 se generan 4 filas de enemigos en vez de 3
				var creacion = new enemigo(30, 30, 90 + i*60, 200, "img/enemigo.png");
				enemigos.push(creacion);
			}
		}
	}
}
function yoMuerto(){//cuando una bala enemiga colisione con la nave
	for (var i = 0; i < balasEnemigo.length; i++) {
		if(balasEnemigo[i].hitMe(balasEnemigo[i], nave)){
			balasEnemigo.splice(i, 1);//borramos la bala
			vidas--;//se resta una vida
		}
		if (balasEnemigo[i].y > 500) {//si superan el límite del canvas se borran
			balasEnemigo.splice(i, 1);
		}
		if (vidas == 0) {//cuando la nave se quede sin vidas aparece en el centro de la pantalla
			document.getElementById("over").style.display = "block";//gif de "game over"
			document.getElementById("reset").style.display = "block";//botón de reset
            document.getElementById("save").style.display = "block";//botón para guardar best score
            ctx.fillStyle = "#c6ff1a";
            ctx.font = "bold 20px Arial";
            ctx.fillText("SCORE: " + score, 350, 430);//la puntuación obtenida en la partida
			clearInterval(gameArea.interval);//se para el juego
		}
	}
}
function enemigoMuerto(){//cuando una de las balas de la nave toque a un enemigo
	for (var i = 0; i < balas.length; i++) {
		var colision = false;//variable que guarda cuando hay una colision entre un enemigo y una bala de la nave
		for (var j = 0; j < enemigos.length; j++) {
			if (balas[i].hitEnemigo(balas[i], enemigos[j])) {
				enemigos.splice(j, 1);//se borra el enemigo que recibe la bala
				colision = true;
				score += 10;//cada vez que muera un enemigo la puntuación aumenta 10
			}
		}
		if (colision || balas[i].y < 0) {//si hay colisión o si las balas llegan al límite del canvas estas sob eliminadas
			balas.splice(i, 1);
		}
	}
}
function gestionRondas(){//para gestionar cada ronda
	if(enemigos == 0){
		contRondas++;
		cadenciaTiro += 0.0075;//por cada ronda que superemos la cadencia de disparo de los enemigos aumenta
		crearEnemigo();//cuando mueren todos los enemigos automáticamente llamamos a la función "crearEnemigos()" para que se creen de nuevos
	}
}
function rondasScoreVidas(){//arrriba del canvas en las partes izquierda, central y derecha se pintan respectivamente la puntuación, vidas, y rondas actuales
	ctx.fillStyle = "#00ffcc";
	ctx.font = "16px Arial";
	ctx.fillText("RONDA: " + contRondas, 705, 20);
	ctx.fillText("SCORE: " + score, 20, 20);
	ctx.fillStyle = "#ff0066";
	ctx.font = "bold 18px Arial";
	if(vidas < 5){
		ctx.fillText("LIFES: " + vidas, 360, 22);
	}
	if (vidas == 5) {//cuando tengas 5 vidas, aunque cojas más vidas, estas no se sumarán
		ctx.fillText("MAX-LIFES: " + vidas, 350, 22);
	}
}
function reseteo(){//cuando reseteamos el juego se ponen todas las variables y arrays como al inicio
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
function guardarCookies(){//
	document.cookie = "rank= " + score;
	alert("BEST SCORE guardada como: "+ score + " (Aparecerá debajo de la pantalla de juego en refrescar la página)");
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
		if (balas.length == 0 || balas[balas.length - 1].contBalas + 28 <= contBalas) {//evitamos el disparo a chorro mediante "contBalas"
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
    //Llamada a las funciones que deben estar activas todo el rato de juego
	enemigoMuerto();
	yoMuerto();
	gestionRondas();
	rondasScoreVidas();
	caidaVidas();
	cogerVida();
}