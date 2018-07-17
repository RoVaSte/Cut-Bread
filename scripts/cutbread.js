var breadCanvas;
var breads = ["breads/breadSlice0.png","breads/Pizza.png"];
var bimg;
var slicing = false;
var slices = [];
var tempSlice = [];
var cHeight = 500;
var cWidth = 500;
var numOfSlices = 0;
var results = [];
var gfont;
var displayPercentages = false;
var dragging = false;
var wWidth = window.innerWidth;
function preload(){
  //Default bread slice selected for display
  bimg = loadImage(breads[0]);
  gfont = loadFont("Gaegu-Regular.ttf");
}
function setup(){
  if (wWidth >= 500){
    breadCanvas = createCanvas(500,500)
    breadCanvas.parent('cutbread');
  }
  else {
    breadCanvas = createCanvas(wWidth,wWidth)
    breadCanvas.parent('cutbread');
    cWidth = wWidth;
    //Fixing up mobile view
    var nW = 0.8*wWidth;
    var mL = (nW/2) * -1;
    $(".centerAbsoluteWidth").css("width",nW + "px");
    $(".centerAbsoluteWidth").css("margin-left",mL + "px");
    $("#displayP").css("width",nW + "px")
    $("#displayP").css("margin-left",mL + "px");
    $("#statsHead").css("width",nW + "px")
    $("#statsHead").css("margin-left",mL + "px");
    $("#statsHead").css("left","50%");
    $("#statsHead").css("position","relative");
    
    $("#cutbread").css("width",wWidth+"px");
    $("#cutbread").css("height",wWidth+"px");
    
    $("#stats").css("width",nW + "px")
    $("#stats").css("margin-left",mL + "px");
    $("#clearit").css("width",nW + "px")
    $("#clearit").css("margin-left",mL + "px");
    if (wWidth <= 470){
      $("#openingCover h1").css("font-size","30px");
      
      $("#openingCover h1").css("line-height","30px");
    }
    if (wWidth <= 420){
      $("#dashedBorder").css("display","none");
    }
  }
  
  
  textFont(gfont);
  //Resolution density d
  d = pixelDensity();
  
  //Load the current pixels
  loadPixels();
  textAlign(CENTER)
  textSize(20)
}

function draw(){
  background(255,255,255)
  image(bimg,0,0,cWidth,cWidth)

  stroke(255,255,255)
  strokeWeight(5)
  
  //Display current slice
  if (slicing == true){
    var currentSlice = extendV(tempSlice[tempSlice.length-2],tempSlice[tempSlice.length-1],mouseX,mouseY)
    dottedLine(tempSlice[tempSlice.length-2],tempSlice[tempSlice.length-1],mouseX,mouseY)
  }
  
  displaySlices(slices);
  
  if (displayPercentages == true){
    noStroke();
    for (var k=0;k<results.length;k++){
      text(results[k][0],results[k][1],results[k][2]);
    }
  }
}

function mousePressed(){
  if (mouseY <= cWidth && mouseY >=0 && mouseX >=0 && mouseX <= cWidth && started == true && dragging == false){
    //Complete the slice if done already
    if (slicing == true){
      slicing = false;
      numOfSlices++;
      tempSlice.push(mouseX,mouseY);
      var currentSlice = extendV(tempSlice[0],tempSlice[1],tempSlice[2],tempSlice[3])
      slices.push(currentSlice[0],currentSlice[1],currentSlice[2],currentSlice[3]);
      tempSlice = [];
      check();

    }
    else{
      slicing = true;
      tempSlice.push(mouseX,mouseY);
    }
  }
  
}

function keyPressed(){
  if (keyCode === 27){
    slicing = false;
    tempSlice = [];
    dragging = false;
  }
}

//Check the slices for eveness! Then output results and display a nice message :)
function check(){
  var pieces = calculateAreas(slices);
  var count = 0;
  for (hashKey in pieces){
    count ++;
  }
  $("#numpieces").text(count);
  
  var stdval = 0;
  var percentages = [];
  for (var i =0; i<results.length;i++){
    percentages.push(parseFloat(results[i][0]));
  }
  stdval = std(percentages);
  var score = 100 - stdval;
  score = score.toFixed(2);
  $("#eveness").text(score + "/100");
  if (score < 60){
    var randomNum = round(random(0,paMessages0.length-1));
    $("#messageResponse").text(paMessages0[randomNum]);
  }
  else if (score < 80){
    var randomNum = round(random(0,paMessages1.length-1));
    $("#messageResponse").text(paMessages1[randomNum]);
  }
  else if (score < 90){
    var randomNum = round(random(0,paMessages2.length-1));
    $("#messageResponse").text(paMessages2[randomNum]);
  }
  else if (score <= 95){
    var randomNum = round(random(0,paMessages3.length-1));
    $("#messageResponse").text(paMessages3[randomNum]);
  }
  else if (score <= 99.9){
    var randomNum = round(random(0,paMessages4.length-1));
    $("#messageResponse").text(paMessages4[randomNum]);
  }
  else {
    //If you got this score, you probably cheated
    if (numOfSlices <= 1){
      var randomNum = round(random(0,paMessages5_1.length-1));
      $("#messageResponse").text(paMessages5_1[randomNum]);
    }
    else {
      var randomNum = round(random(0,paMessages5.length-1));
      $("#messageResponse").text(paMessages5[randomNum]);
    }
    
  }
  
  
  
}

//quickly return the color of the pixels[] array as loaded by loadPixels() in RGBA format;
function fget(x,y){
  
  //y = parseInt(y.toFixed(0));
  var off = ((y*d*cWidth + x)*d*4);
  var components = [ pixels[off], pixels[off + 1], pixels[off + 2], pixels[off + 3] ]
  return components;
}

function calculateAreas(slices){
  //Calculate the area of the bread slices as a percentage
  //Essentially loop over the pixels array of the current canvas with the slice as displayed with a
  //White line. If a pixel is close to RGB(255,255,255), then its not a part of a piece of bread.
  results = [];
  if (slices.length < 4){
    //If no slices then its just one piece with 100%
    results.push(["100%",250,250])
    return;
  }
  var areas = {
    
  };
  var centersx = {};
  var centersy = {};
  
  loadPixels();
  for (var i = 0; i < cWidth; i++){
    for (var j = 0; j < cHeight; j++){
      colors = fget(i,j)
      if (colors[0]+colors[1]+colors[2] < 765){
        //Calculate which region it belongs to with hash function
        var zeon = [];
        for (var k = 0; k< 4*numOfSlices; k+=4){
          zeon.push(side(i,j,slices[k],slices[k+1],slices[k+2],slices[k+3]));
        }
        var hash = hashRegion(zeon);

        //If hash not initialized already, initialize it into areas object
        if (areas[hash]){
          areas[hash]++;
          centersx[hash] += i;
          centersy[hash] += j;
        }
        else{
          areas[hash] = 1;
          centersx[hash] = i;
          centersy[hash] = j;
        }
      }
      else{

      }
    }
  }

  
  var totalArea = 0;
  //console.log("Left: " + areas[0]/totalArea, "Right: " + areas[1]/totalArea);
  
  for (hashKey in areas) {
    totalArea += areas[hashKey]
  }
  for (hashKey in areas) {
    var cx = centersx[hashKey]/areas[hashKey];
    var cy = centersy[hashKey]/areas[hashKey];;
    var percentAreaText = ((areas[hashKey]/totalArea) * 100).toFixed(2) + "%"
    results.push([percentAreaText,cx,cy])
  }

  return areas;
  
}

function displaySlices(slices){
  for (var i = 0; i < slices.length; i+=4){
    line(slices[i],slices[i+1],slices[i+2],slices[i+3]);
  }
}

//Return 0 or 1 for arbitrary side given point x1,y1 and line x2,y2 x3,y3
function side(x1,y1,x2,y2,x3,y3){
  var val = Math.sign((x3 - x2) * (y1 - y2) - (y3 - y2) * (x1 - x2))
  if (val == 0 || val == 1){
    return 0;
  }
  return 1;
}

//Using the 0's and 1's for choosing a side, generate a unique number for which area it is a part of
//Uses the fact that each subset of {1,-2,4,8,-16,...} is a unique subset in terms of the sum of its terms
function hashRegion(arr){
  var finalHash = 0;
  for (var i=0; i<arr.length; i ++){
    if (i%2 == 0){
      finalHash += arr[i] * pow(2 , i);
    }
    else{
      finalHash -= arr[i] * pow(2 , i);
    }
  }
  return finalHash;
}

//returns the vertices of the line if they were on the canvas border
function extendV(x1,y1,x2,y2){
  var dx = x2-x1;
  var dy = y2-y1;
  var slope = dy/dx;
  return [x1-500,y1-500*slope,x2+500,y2+500*slope];
  
}

function std(arr){
  //Format arr = [p1,p2,p3]
  //Where pi = percent form
  var mean = 0;
  for (var i =0; i<arr.length;i++){
    mean += arr[i]
  }
  mean /= arr.length;
  var stdval = 0;
  for (var i =0; i<arr.length;i++){
    stdval += pow((arr[i]-mean),2)
  }
  return sqrt(stdval);
  
}

function dottedLine(x1,y1,x2,y2){
  var dx= x2-x1;
  var dy = y2-y1;
  var dist = sqrt(dx*dx+dy*dy);
  var sx = dx/(dist/15)
  var sy = dy/(dist/15)
  for (var i = 0; i< dist/15; i++){
    if (i%2 == 0){
      line(x1+i*sx,y1+i*sy,x1+(i+1)*sx,y1+(i+1)*sy);
    }
  }
}

function mouseDragged(){
  if (dragging == false && slicing == true){
    dragging = true;
  }
}
function mouseReleased(){
  if (dragging == true){
    if (slicing == true){
      slicing = false;
      numOfSlices++;
      tempSlice.push(mouseX,mouseY);
      var currentSlice = extendV(tempSlice[0],tempSlice[1],tempSlice[2],tempSlice[3])
      slices.push(currentSlice[0],currentSlice[1],currentSlice[2],currentSlice[3]);
      tempSlice = [];
      check();
      dragging = false;
    }
  }
}