var config = {
    type: Phaser.AUTO,
    width: 3500,
    height: 2094,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var enemy;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var backgraund;
var vidas;
var ScoreLife;
var special;
var velJug=1000;
var VelPow=1400;
var vel_En=500;
var Flag_Pause=false;
var Flag_Sound_Pause=false;
var game = new Phaser.Game(config);
var sounds={
    theme:null,
    interactive:[]
};

function preload ()
{
    this.load.image('sky', 'assets/Ciudad_Dia.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/paken_flakes.jpg');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('jugador', 'assets/ludovico.png', { frameWidth: 35, frameHeight: 58 });
    this.load.spritesheet('enemy', 'assets/policia.png', { frameWidth: 35, frameHeight: 58 });
    this.load.image('life','assets/vida.png');
    this.load.image('PowUp','assets/powUp.png');
    this.load.image('pause','assets/pausa.png');
    this.load.audio('eat','assets/eat.mp3');
    this.load.audio('theme','assets/Sonidofondo.mp3');
    this.load.audio('golpe','assets/golpe.mp3');
    this.load.audio('daño','assets/Daño.mp3');
    this.load.image('Sound','assets/sound.png');
    
}

function create ()
{


    //  A simple background for our game
    backgraund=this.add.image(0, 0, 'sky').setOrigin(0,0);
    backgraund.displayWidth = 3500; // Ancho del juego
    backgraund.displayHeight =  2094; // Alto del juego

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(500, 1985, 'ground').setScale(15,6).refreshBody();

    //  Now let's create some ledges
    platforms.create(2480, 1299, 'ground').setScale(5.15,6).refreshBody();
   
    platforms.create(400, 585, 'ground').setScale(5.15,6).refreshBody();

    // The player and its settings
    player = this.physics.add.sprite(600, 1590, 'jugador').setGravityY(1000);
    player.setScale(6);
    

    //  Player physics properties. Give the little guy a slight bounce.
    //player.setBounce(0.2);
    player.setCollideWorldBounds(true);


    //Creamos boton de pausa
    let pauseButton = this.add.image(1900, 100, 'pause').setScale(0.2).setInteractive();
    pauseButton.on('pointerdown', () => {
        if (Flag_Pause) {
            this.physics.resume();  // Reanudar la física
            this.anims.resumeAll();  // Reanudar todas las animaciones
            Flag_Pause = false;
            sounds.theme.resume();
            console.log("Juego reanudado");
        } else {
            this.physics.pause();  // Pausar la física
            this.anims.pauseAll();  // Pausar todas las animaciones
            Flag_Pause = true;
            console.log("Juego pausado");
            sounds.theme.pause();
        }
    });

    let soundBoton=this.add.image(2100,100,'Sound').setScale(0.07).setInteractive();
    soundBoton.on('pointerdown', () => {
        if (Flag_Sound_Pause) {
            Flag_Sound_Pause = false;
            sounds.theme.play();
        } else {
            Flag_Sound_Pause = true;
            sounds.theme.stop();
        }
    });

    //Creamos las vidas
    ScoreLife = this.add.text(680, -550, 'Vidas:', { fontSize: '100px', fill: '#000' }); 

    vidas=this.add.group();

    for(let i=0; i<3; i++){
        let cont=this.add.image(1100+(i*150),80, 'life');
        cont.setScale(0.3);
        vidas.add(cont);
    }

    //Creamos Power Up

    

    //Creamos fisicas para el enemigo

    enemy=this.physics.add.group({
        key:'enemy',
        repeat:2,
        setXY:{x:800,y:150,stepX:600}
    });


    enemy.children.iterate(function(child){
        child.setScale(5);
        child.setCollideWorldBounds(true);
        child.setGravityY(1000);
        child.velocidad = Phaser.Math.Between(200, 600);
        child.velocidadY=Phaser.Math.Between(1000,1580);

    });

    //sonidos
    sounds.theme=this.sound.add('theme', { volume: 0.5, loop:true });

    // Esperar a que el usuario presione cualquier tecla para reproducir la música
    this.input.keyboard.once('keydown', () => {
        sounds.theme.play();
    });

    sounds.interactive.push(this.sound.add('eat',{volume:0.5}));
    sounds.interactive.push(this.sound.add('golpe',{volume:0.5}));
    sounds.interactive.push(this.sound.add('daño',{volume:4}));
    

    

    //Animacion personaje principal

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('jugador', { start: 0, end: 3 }),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('jugador', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    //Animacion para el enemigo

    this.anims.create({
        key: 'left_E',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'right_E',
        frames: this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });


    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 10,
        setXY: { x: 120, y: 0, stepX: 300 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        
        //Cambia el tamaño de la cajita de cereal
        child.setScale(0.7);

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, -550, 'score: 0', { fontSize: '100px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(enemy,platforms)

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.overlap(player, enemy, stompEnemy, null, this);

    this.physics.add.collider(player, enemy, hitEnemy, null, this);

}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-velJug);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(velJug);

        player.anims.play('right', true);
    }
    else
    {
       player.setVelocityX(0);

       player.anims.stop();
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-1580);
    }
    if(cursors.down.isDown){
        player.setVelocityY(1500);
    }
    

    enemy.children.iterate(function(enemy){
        if(player.x<enemy.x){
            enemy.setVelocityX(-enemy.velocidad);
            enemy.anims.play('left_E',true)
        }else if(player.x>enemy.x){
            enemy.setVelocityX(enemy.velocidad);
            enemy.anims.play('right_E',true);
        }
        if (player.y < enemy.y - 50 && enemy.body.touching.down) {
            enemy.setVelocityY(-enemy.velocidadY);
        }
    });
}

function collectStar (player, star)
{
    if(Flag_Sound_Pause==false){
        sounds.interactive[0].play();
    }else{
        sounds.interactive[0].stop();
    }
    
    star.disableBody(true, true);
   

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

    }
}


var flagVida = true; // Bandera para controlar si se puede perder una vida


function hitEnemy(player, enemy) {
    // Si el jugador tiene vidas restantes
    if (vidas.getChildren().length > 0 && flagVida) {
        // Establecer la bandera a falso para evitar perder más vidas inmediatamente
        flagVida = false;
        if(Flag_Sound_Pause==false){
            sounds.interactive[2].play();
        }else{
            sounds.interactive[2].stop();
        }
        player.setTint(0xff0000);

        let cont = vidas.getChildren()[vidas.getChildren().length - 1];
        cont.destroy();

        // Si no quedan vidas, termina el juego
        if (vidas.getChildren().length === 0) {
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.stop();
            gameOver = true;
        } else {
           
            if (player.x < enemy.x) {
                player.setVelocityX(600);  
                player.setVelocityY(-1000);
            } else if (player.x > enemy.x) {
                player.setVelocityX(-600); // Lanza al jugador hacia la izquierda
                player.setVelocityY(-1000); // Impulso hacia arriba
            }

            // Retroceder el enemigo
            enemy.setVelocityX(-600);
        }
        this.time.delayedCall(1000, function() {
            flagVida = true;  
            player.clearTint();   
        }, [], this);
    }
}



function stompEnemy(player, enemy) {
    if (player.body.bottom <= enemy.body.top + 40) { 
        if(Flag_Sound_Pause==false){
            sounds.interactive[1].play();
        }else{
            sounds.interactive[1].stop();
        }
        enemy.destroy(); 
        player.setVelocityY(-1000); 
    }
}