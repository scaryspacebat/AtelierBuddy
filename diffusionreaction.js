let world = new Array;

let stepCounter = 0;

let dt=0.5;

let b_rad = 3; //Math.floor(diam/2);
let blur;

let h_rad = 5;
let highpass;

let colGradient;

let worldSizeX = 200;
let worldSizeY = 200;

let whirls = new Array;


function initBackground(){
  /*colGradient = [ [0.0, 0.0, 0.0, 0.4],
                  [0.25, 0.2, 0.2, 0.2],
                  [0.5, 0, 0, 0],
                  [0.75, 0.21, 0.26, 0.73],
                  [1.0, 0.21, 0.26, 1.0]];*/

  /*colGradient = [ [0.0, 1.0, 0.0, 0.0],
                  [0.5, 0, 1, 0],
                  [1.0, 0.0, 0.0, 1.0]];*/

  colGradient = [ [0.0, 1.0, 1.0, 0.0],
                  [0.5, 0.0, 0.5, 0.5],
                  [1.0, 0.3, 0.3, 0.3]];

  for(var i=0; i<50; i++){
    var dir = Math.random()*2*Math.PI;
    var vel = 1+Math.random();
    whirls.push({posX:Math.random()*worldSizeX, posY:Math.random()*worldSizeY, velX:Math.sin(dir)*vel, velY:Math.cos(dir)*vel, rad:20+Math.random()*20, force:-0.25-Math.random()*0.5});
  }

  blur = new Array(b_rad*2+1);
  for(var i=0; i<blur.length; i++){
    blur[i] = new Array(b_rad*2+1).fill(0);
  }

  highpass = new Array(h_rad*2+1);
  for(var i=0; i<highpass.length; i++){
    highpass[i] = new Array(h_rad*2+1).fill(0);
  }

  precalculate_blur();
  precalculate_highpass();
  randomizeWorld(worldSizeX, worldSizeY);
  //google.script.run.withSuccessHandler(setWorldState).getSavedState();
  
  step();
}

function randomizeWorld( sizeX, sizeY){
  world = new Array(sizeY);
  for(var i=0; i<world.length; i++) world[i] = new Array(sizeX).fill(0);

  for(var y=0; y<world.length; y++){
    for(var x=0; x<world[y].length; x++){
      world[y][x]= Math.random();
    }
  }
}

function precalculate_highpass(){
  var sum = 0; 
  for(var x=-h_rad; x<=h_rad; x++){
    for(var y=-h_rad; y<=h_rad; y++){
      var h = 0;
      var d = Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2));
      if(d<=h_rad && d>0) h = 1;
      if(d>h_rad && Math.floor(d)==h_rad){
        h = 1-(d-h_rad);
      }
      highpass[x+h_rad][y+h_rad]=h;
      sum+=h;
    }
  }

  for(var x=-h_rad; x<=h_rad; x++){
    for(var y=-h_rad; y<=h_rad; y++){
      highpass[x+h_rad][y+h_rad]/=sum;
    }
  }
}

function precalculate_blur(){
  var sum = 0;
  for(var x=-b_rad; x<=b_rad; x++){
    for(var y=-b_rad; y<=b_rad; y++){
      var b = 0;
      var d = Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2));
      if(d<=b_rad && d>0) b = 1;
      if(d>b_rad && Math.floor(d)==b_rad){
        b = 1-(d-b_rad);
      }
      blur[x+b_rad][y+b_rad]=b;
      sum+=b;
    }
  }

  for(var x=-b_rad; x<=b_rad; x++){
    for(var y=-b_rad; y<=b_rad; y++){
      blur[x+b_rad][y+b_rad]/=sum;
    }
  }
}

function setWorldState(data){
  world = data;
  step();
}

function step(){
  //turbulenceAdd();
  //turbulenceMove();
  //addNoise();
  applyBlur();
  applyHighpass();
  applyTreshold();
  
  stepCounter++;

  display();
  //setTimeout(step, 1000);
}

function updateState(newWorld){
  for(var y=0; y<world.length; y++){
    for(var x=0; x<world[y].length; x++){
      world[y][x]=newWorld[y][x];
    }
  }
}

function addNoise(){
  for(var d=0; d<30; d++){
    if(Math.random()<0.10){
      var sX = Math.floor(Math.random()*(worldSizeX-5));
      var sY = Math.floor(Math.random()*(worldSizeY-5));
      var val = Math.random();
      for(var y=0; y<5; y++){
        for(var x=0; x<5; x++){
          world[sY+y][sX+x]=val;
        }
      }
    }
  }
}


function applyHighpass(){
  var newWorld = new Array;
  for(var y=0; y<world.length; y++) newWorld.push(new Array(world[y].length).fill(0));
  // highpass filter
  for(var y=0; y<world.length; y++){
    for(var x=0; x<world[y].length; x++){
      var avg=0;

      for(var dx=-h_rad; dx<=h_rad; dx++){
        for(var dy=-h_rad; dy<=h_rad; dy++){
          avg+=getStateAt(x+dx, y+dy)*highpass[dx+h_rad][dy+h_rad];
        }
      }

      newWorld[y][x]=0.5+(world[y][x]-avg)*0.5;
    }
  }
  updateState(newWorld);
}

function applyTreshold(){
  var a = 1;
  var b = 2;
  for(var y=0; y<world.length; y++){
    for(var x=0; x<world[y].length; x++){
      var d = world[y][x];

      //if(d>=0.5) d=1;
      //else d=0;
        
      d=1/(1+Math.pow(2.71828,-20*(d-0.5)));
        
      world[y][x]=(a*world[y][x]+b*d)/(a+b);
    }
  }
}

function applyBlur(){
  var newWorld = new Array;
  for(var y=0; y<world.length; y++) newWorld.push(new Array(world[y].length).fill(0));
  // blur it
  for(var y=0; y<world.length; y++){
    for(var x=0; x<world[y].length; x++){
      var avg=0;

      for(var dx=-b_rad; dx<=b_rad; dx++){
        for(var dy=-b_rad; dy<=b_rad; dy++){
           avg+=getStateAt(x+dx, y+dy)*blur[dx+b_rad][dy+b_rad];
        }
      }

      newWorld[y][x]=world[y][x]*(1-dt)+avg*dt;
    }
  }
  updateState(newWorld);
}

function turbulenceMove(){
  var newWorld = new Array;
  for(var y=0; y<world.length; y++) newWorld.push(new Array(world[y].length).fill(0));

  var mvmt = new Array(worldSizeY);
  for(var y=0; y<world.length; y++){
    mvmt[y]= new Array;
    for(var x=0; x<worldSizeX; x++) mvmt[y].push({x:0, y:0});
  }
  
  for(var i=0; i<whirls.length; i++){
    //alert("i: "+i);
    //alert(whirls[i].posX+" / "+whirls[i].posY+" - "+whirls[i].velX+" / "+whirls[i].velY+" - r:"+whirls[i].rad+" - "+whirls[i].force);
    var rad = whirls[i].rad;
    for(var y=-rad; y<=rad; y++){
      for(var x=-rad; x<=rad; x++){
        var px=whirls[i].posX+x;
        var py=whirls[i].posY+y;
        if(px<0) px+=worldSizeX;
        if(px>=worldSizeX) px-=worldSizeX;
        if(py<0) py+=worldSizeY;
        if(py>=worldSizeY) py-=worldSizeY;
        px=Math.floor(px);
        py=Math.floor(py);
        //alert(px+" - "+py);
        if(!(x==0 && y==0)){
          var dstnc = Math.sqrt(x*x+y*y);
          if(dstnc<=rad){
            mvmt[py][px].x+=x/dstnc*(1-dstnc/rad)*whirls[i].force;
            mvmt[py][px].y+=y/dstnc*(1-dstnc/rad)*whirls[i].force;
          }
        }
      }
    }
    whirls[i].posX+=whirls[i].velX;
    whirls[i].posY+=whirls[i].velY;
    if(whirls[i].posX<0) whirls[i].posX+=worldSizeX;
    if(whirls[i].posY<0) whirls[i].posY+=worldSizeY;
    if(whirls[i].posX>=worldSizeX) whirls[i].posX-=worldSizeX;
    if(whirls[i].posY>=worldSizeY) whirls[i].posY-=worldSizeY;
  }

  for(var y=0; y<world.length; y++){
    for(var x=0; x<world[0].length; x++){
      if(mvmt[y][x].x!=0 || mvmt[y][x].y!=0) {
        //alert(mvmt[y][x].x+" - "+mvmt[y][x].y);
        newWorld[y][x]=getInterpolatedStateAt(x+mvmt[y][x].x, y+mvmt[y][x].y);
      }
      else newWorld[y][x]=world[y][x];
    }
  }

  updateState(newWorld);
}

function turbulenceAdd(){
  var newWorld = new Array;
  for(var y=0; y<world.length; y++) newWorld.push(new Array(world[y].length).fill(0));

  var strength = 0.25;
  
  var target = 0.0;

  var startY = (stepCounter%50)/50*150;
  var endY = startY+5;

  var startX = (stepCounter%110)/110*150;
  var endX = startX+5;

  for(var y=0; y<world.length; y++){
    for(var x=0; x<world[0].length; x++){
      if(y>=startY && y<=endY && x>=startX && x<=endX) {
        newWorld[y][x]=((1-strength)*world[y][x]+strength*target);
      }
      else newWorld[y][x]=world[y][x];
    }
  }

  updateState(newWorld);
}

function getStateAt(x, y){
  while(x<0) x+=world[0].length;
  while(y<0) y+=world.length;
  while(x>=world[0].length) x-=world[0].length;
  while(y>=world.length) y-=world.length;

  return world[y][x];
}

function getInterpolatedStateAt(x, y){
  var x1 = Math.floor(x);
  var y1 = Math.floor(y);
  var fX = x-x1;
  var fY = y-y1;

  if(fX==0 && fY==0) return getStateAt(x1, y1);
  else if(fX==0){
    return getStateAt(x1, y1)*(1-fY)+getStateAt(x1, y1+1)*fY;
  }
  else if(fY==0){
    return getStateAt(x1, y1)*(1-fX)+getStateAt(x1+1, y1)*fX;
  }
  else{
    var xVal1 = getStateAt(x1, y1)*(1-fX)+getStateAt(x1+1, y1)*fX; 
    var xVal2 = getStateAt(x1, y1+1)*(1-fX)+getStateAt(x1+1, y1+1)*fX; 
    return xVal1*(1-fY)+xVal2*fY;
  }
}

function altgetStateAt(x, y){
  while(x<0 || x>=worldSizeX ||  y<0 || y>=worldSizeY){
    if(x<0) x=-x;
    if(x>=worldSizeX) x=2*worldSizeX-x-1;
    if(y<0) y=-y;
    if(y>=worldSizeY) y=2*worldSizeY-y-1;
  }
  return world[y][x];
}

function display(){
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  for(var y=0; y<world.length; y++){
    for(var x=0; x<world[y].length; x++){
      ctx.fillStyle=calculateColor(x, y);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  /*for(var i=0; i<whirls.length; i++){
    ctx.fillStyle="#ff0000";
    ctx.fillRect(whirls[i].posX-1, whirls[i].posY-1, 3, 3);
  }*/

  document.body.style.backgroundImage = "url('"+canvas.toDataURL("image/png")+"')";

  if(stepCounter<50) setTimeout(step, 100);
}

function count_neighbours(px, py){
  var sum = 0;
  for(var x=px-1; x<=px+1; x++)
    for(var y=py-1; y<=py+1; y++)
      if(!(x==px && y==py))
        sum+=getStateAt(x, y);
    //write_log("neighbours "+sum+" at "+x+" - "+y, 3);
  return sum;
}

function calculateColor(x, y){
  var val = getStateAt(x, y);
  //var valH = getStateAt(x, y-1)-getStateAt(x, y+1);
  //var valV = getStateAt(x-1, y)-getStateAt(x+1, y);

  //var colors = ["#4653FF", "#3643BA", "#000000" ,"#313131"];
  //var colors = ["#36ef43", "#26AA33", "#000000" ,"#434343"];
  //var colors = ["#00a080", "#008080", "#410000" ,"#313131"];
  var colors = ["#404040", "#303030", "#101010" ,"#000000"];
  //var colors = ["#ff00ff", "#ffffff", "#00ff00" ,"#000000"];

  /*if(val<=0.5){
    if(getStateAt(x, y-1)>=0.5) return "#000000";
    else return "#313131";
  }
  else return "hsl("+(180+valH*180)+" 100 "+(20+valV*60*val)+" / 100%)";*/

  /*if(val>=0.5){
    return "hsl("+(180+(valH+valV)*180)+" 100 "+(10+valV*90*val)+" / 100%)";
  }
  else {
    if(getStateAt(x, y-1)>=0.5) return "#000000";
    else return "#313131";
  }*/

  /*if(val>=0.5){
    return colorgradientRGB(count_neighbours(x, y)/8, colGradient);
  }
  else {
    if(getStateAt(x, y-1)>=0.5) return "#000000";
    else return "#313131";
  }*/

  if(val>=0.5){
    if(getStateAt(x, y-1)<=0.5) return colors[0];
    else return colors[1];
  }
  else {
    if(getStateAt(x, y-1)>=0.5) return colors[2];
    else return colors[3];
  }

  //if(val<=0.5) return "#000000";
  //return "hsl("+(160+(valH+valV)*120)+" 100 "+(10+valV*80*val)+" / 100%)";

  //return "hsl("+(val*360+stepCounter)+" 100 90 / 100%)";
  //return "hsl(243 "+(val*55)+" "+(19+val*28)+" / 100%)"; // official decathlon colors
  //return "hsl("+(0+(val*365)+(x/worldSizeX)*360+(y/worldSizeY)*360+stepCounter)+" 100 "+(10+val*80)+" / 100%)";

  /*if(val<=0.5) return "#3643BA";
  else return "#313131";*/

  /*if(val<0.66 && val>0.33) return "#000000";
  else if(val>0.5) return "#3643BA";
  else return "#313131";*/

  return colorgradientRGB(0.5+valH-valV, colGradient);
}

function colorgradientRGB(val, gradient){
  var red = 0;
  var green = 0;
  var blue = 0;

  if(val<0) val=0;
  if(val>1) val=1;

  if(gradient.length==1){
    red=gradient[0][1];
    green=gradient[0][2];
    blue=gradient[0][3];
  }
  else{
    var firstIndex = 0;
    var secondIndex = 1;

    while(firstIndex<(gradient.length-2) && gradient[firstIndex+1][0]<=val){
      firstIndex++;
    }
    while(secondIndex<(gradient.length-1) && gradient[secondIndex][0]<val) secondIndex++;

    var dist = gradient[secondIndex][0]-gradient[secondIndex-1][0];
    
    var mix = (gradient[secondIndex][0]-val)/dist;

    //return "val"+val+" si"+secondIndex+" dist"+dist+" mix"+mix;

    red=  gradient[secondIndex-1][1]*mix + gradient[secondIndex][1]*(1-mix);
    green=gradient[secondIndex-1][2]*mix + gradient[secondIndex][2]*(1-mix);
    blue= gradient[secondIndex-1][3]*mix + gradient[secondIndex][3]*(1-mix);
  }

  var r=Math.floor(red*255).toString(16);
  var g=Math.floor(green*255).toString(16);
  var b=Math.floor(blue*255).toString(16);
  //return val+" - "+gradient.length;
  if(r.length==1) r="0"+r;
  if(g.length==1) g="0"+g;
  if(b.length==1) b="0"+b;
  //return "r:"+r+" g:"+g+" b:"+b;
  return "#"+r+g+b;
}
